import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { adminAuthMiddleware } from "../customAuth";
import { requirePermission } from "../permission-middleware";

const router = Router();

async function generateDisplayId(prefix: string): Promise<string> {
  const sequenceName = `${prefix.toLowerCase()}_seq`;
  const result = await db.execute(sql`
    SELECT nextval('${sql.raw(sequenceName)}') as next_id
  `);
  const nextId = Number(result.rows[0]?.next_id || 1);
  return `${prefix}${String(nextId).padStart(7, '0')}`;
}

// ============================================
// SUPPORT TICKETS
// ============================================

// GET /api/admin/support/tickets - Get all tickets
router.get("/admin/support/tickets", adminAuthMiddleware, requirePermission('help-support', 'view'), async (req, res) => {
  try {
    const { status, priority, category } = req.query;
    
    let query = sql`
      SELECT 
        st.*,
        u.name as user_name,
        u.email as user_email,
        a.name as assigned_to_name
      FROM support_tickets st
      LEFT JOIN users u ON st.user_id = u.id
      LEFT JOIN users a ON st.assigned_to = a.id
      WHERE 1=1
    `;

    if (status && status !== 'all') {
      query = sql`${query} AND st.status = ${status}`;
    }
    if (priority && priority !== 'all') {
      query = sql`${query} AND st.priority = ${priority}`;
    }
    if (category && category !== 'all') {
      query = sql`${query} AND st.category = ${category}`;
    }

    query = sql`${query} ORDER BY st.created_at DESC`;

    const result = await db.execute(query);
    res.json({ success: true, tickets: result.rows });
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    res.status(500).json({ success: false, error: "Failed to fetch support tickets" });
  }
});

// GET /api/admin/support/tickets/:id - Get ticket by ID
router.get("/admin/support/tickets/:id", adminAuthMiddleware, requirePermission('help-support', 'view'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const ticketResult = await db.execute(sql`
      SELECT 
        st.*,
        u.name as user_name,
        u.email as user_email,
        a.name as assigned_to_name
      FROM support_tickets st
      LEFT JOIN users u ON st.user_id = u.id
      LEFT JOIN users a ON st.assigned_to = a.id
      WHERE st.id = ${id}
    `);

    if (!ticketResult.rows[0]) {
      return res.status(404).json({ success: false, error: "Ticket not found" });
    }

    const responsesResult = await db.execute(sql`
      SELECT 
        sr.*,
        u.name as user_name,
        u.email as user_email
      FROM support_responses sr
      LEFT JOIN users u ON sr.user_id = u.id
      WHERE sr.ticket_id = ${id}
      ORDER BY sr.created_at ASC
    `);

    res.json({ 
      success: true, 
      ticket: ticketResult.rows[0],
      responses: responsesResult.rows
    });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ success: false, error: "Failed to fetch ticket" });
  }
});

// POST /api/admin/support/tickets - Create ticket
router.post("/admin/support/tickets", adminAuthMiddleware, requirePermission('help-support', 'create'), async (req, res) => {
  try {
    const validationSchema = z.object({
      subject: z.string().min(1),
      description: z.string().min(1),
      category: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
      userId: z.string().optional(),
    });

    const ticketData = validationSchema.parse(req.body);
    const displayId = await generateDisplayId('TK');
    const ticketNumber = `TK-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    const result = await db.execute(sql`
      INSERT INTO support_tickets (
        display_id, ticket_number, subject, description, category, priority, user_id, status
      ) VALUES (
        ${displayId}, ${ticketNumber}, ${ticketData.subject}, ${ticketData.description}, 
        ${ticketData.category || null}, ${ticketData.priority}, ${ticketData.userId || null}, 'open'
      )
      RETURNING *
    `);

    res.status(201).json({ success: true, ticket: result.rows[0] });
  } catch (error: any) {
    console.error("Error creating ticket:", error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: "Invalid ticket data", details: error.errors });
    }
    res.status(500).json({ success: false, error: "Failed to create ticket" });
  }
});

// PUT /api/admin/support/tickets/:id - Update ticket
router.put("/admin/support/tickets/:id", adminAuthMiddleware, requirePermission('help-support', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const validationSchema = z.object({
      subject: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      status: z.enum(['open', 'in_progress', 'waiting', 'resolved', 'closed']).optional(),
      assignedTo: z.string().nullable().optional(),
    });

    const updateData = validationSchema.parse(req.body);
    
    const setClauses = [];
    const values = [];

    if (updateData.subject !== undefined) {
      setClauses.push(`subject = $${setClauses.length + 1}`);
      values.push(updateData.subject);
    }
    if (updateData.description !== undefined) {
      setClauses.push(`description = $${setClauses.length + 1}`);
      values.push(updateData.description);
    }
    if (updateData.category !== undefined) {
      setClauses.push(`category = $${setClauses.length + 1}`);
      values.push(updateData.category);
    }
    if (updateData.priority !== undefined) {
      setClauses.push(`priority = $${setClauses.length + 1}`);
      values.push(updateData.priority);
    }
    if (updateData.status !== undefined) {
      setClauses.push(`status = $${setClauses.length + 1}`);
      values.push(updateData.status);
      
      if (updateData.status === 'resolved' || updateData.status === 'closed') {
        setClauses.push(updateData.status === 'resolved' ? 'resolved_at = NOW()' : 'closed_at = NOW()');
      }
    }
    if (updateData.assignedTo !== undefined) {
      setClauses.push(`assigned_to = $${setClauses.length + 1}`);
      values.push(updateData.assignedTo);
    }

    setClauses.push('updated_at = NOW()');

    if (setClauses.length === 1) {
      // No updates besides updated_at
      return res.json({ success: true, message: "No changes to apply" });
    }

    const result = await db.execute(sql.raw(`
      UPDATE support_tickets 
      SET ${setClauses.join(', ')}
      WHERE id = '${id}'
      RETURNING *
    `));

    if (!result.rows[0]) {
      return res.status(404).json({ success: false, error: "Ticket not found" });
    }

    res.json({ success: true, ticket: result.rows[0] });
  } catch (error: any) {
    console.error("Error updating ticket:", error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: "Invalid ticket data", details: error.errors });
    }
    res.status(500).json({ success: false, error: "Failed to update ticket" });
  }
});

// POST /api/admin/support/tickets/:id/responses - Add response to ticket
router.post("/admin/support/tickets/:id/responses", adminAuthMiddleware, requirePermission('help-support', 'create'), async (req, res) => {
  try {
    const { id } = req.params;
    const validationSchema = z.object({
      message: z.string().min(1),
      isInternal: z.boolean().default(false),
      userId: z.string(),
    });

    const responseData = validationSchema.parse(req.body);

    const result = await db.execute(sql`
      INSERT INTO support_responses (ticket_id, user_id, message, is_internal)
      VALUES (${id}, ${responseData.userId}, ${responseData.message}, ${responseData.isInternal})
      RETURNING *
    `);

    // Update ticket status if needed
    await db.execute(sql`
      UPDATE support_tickets 
      SET status = 'in_progress', updated_at = NOW()
      WHERE id = ${id} AND status = 'open'
    `);

    res.status(201).json({ success: true, response: result.rows[0] });
  } catch (error: any) {
    console.error("Error creating response:", error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: "Invalid response data", details: error.errors });
    }
    res.status(500).json({ success: false, error: "Failed to create response" });
  }
});

// GET /api/admin/support/stats - Get support statistics
router.get("/admin/support/stats", adminAuthMiddleware, requirePermission('help-support', 'view'), async (req, res) => {
  try {
    const statsResult = await db.execute(sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'open') as open_count,
        COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_count,
        COUNT(*) FILTER (WHERE status = 'waiting') as waiting_count,
        COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
        COUNT(*) FILTER (WHERE status = 'closed') as closed_count,
        COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_count,
        COUNT(*) as total_count
      FROM support_tickets
      WHERE created_at >= NOW() - INTERVAL '30 days'
    `);

    res.json({ success: true, stats: statsResult.rows[0] });
  } catch (error) {
    console.error("Error fetching support stats:", error);
    res.status(500).json({ success: false, error: "Failed to fetch support stats" });
  }
});

// ============================================
// KNOWLEDGE BASE
// ============================================

// GET /api/admin/knowledge-base - Get all KB articles
router.get("/admin/knowledge-base", adminAuthMiddleware, requirePermission('help-support', 'view'), async (req, res) => {
  try {
    const { category, published } = req.query;
    
    let query = sql`
      SELECT 
        kb.*,
        u.name as author_name
      FROM knowledge_base_articles kb
      LEFT JOIN users u ON kb.author_id = u.id
      WHERE 1=1
    `;

    if (category && category !== 'all') {
      query = sql`${query} AND kb.category = ${category}`;
    }
    if (published !== undefined) {
      query = sql`${query} AND kb.is_published = ${published === 'true'}`;
    }

    query = sql`${query} ORDER BY kb.created_at DESC`;

    const result = await db.execute(query);
    res.json({ success: true, articles: result.rows });
  } catch (error) {
    console.error("Error fetching KB articles:", error);
    res.status(500).json({ success: false, error: "Failed to fetch KB articles" });
  }
});

// POST /api/admin/knowledge-base - Create KB article
router.post("/admin/knowledge-base", adminAuthMiddleware, requirePermission('help-support', 'create'), async (req, res) => {
  try {
    const validationSchema = z.object({
      title: z.string().min(1),
      slug: z.string().min(1),
      content: z.string().min(1),
      category: z.string().optional(),
      tags: z.array(z.string()).default([]),
      isPublished: z.boolean().default(false),
      authorId: z.string(),
    });

    const articleData = validationSchema.parse(req.body);
    const displayId = await generateDisplayId('KB');

    const result = await db.execute(sql`
      INSERT INTO knowledge_base_articles (
        display_id, title, slug, content, category, tags, is_published, author_id
      ) VALUES (
        ${displayId}, ${articleData.title}, ${articleData.slug}, ${articleData.content},
        ${articleData.category || null}, ${JSON.stringify(articleData.tags)}, 
        ${articleData.isPublished}, ${articleData.authorId}
      )
      RETURNING *
    `);

    res.status(201).json({ success: true, article: result.rows[0] });
  } catch (error: any) {
    console.error("Error creating KB article:", error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: "Invalid article data", details: error.errors });
    }
    res.status(500).json({ success: false, error: "Failed to create KB article" });
  }
});

// PUT /api/admin/knowledge-base/:id - Update KB article
router.put("/admin/knowledge-base/:id", adminAuthMiddleware, requirePermission('help-support', 'edit'), async (req, res) => {
  try {
    const { id } = req.params;
    const validationSchema = z.object({
      title: z.string().optional(),
      content: z.string().optional(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      isPublished: z.boolean().optional(),
    });

    const updateData = validationSchema.parse(req.body);
    
    const setClauses = [];
    const values = [];

    if (updateData.title !== undefined) {
      setClauses.push(`title = $${setClauses.length + 1}`);
      values.push(updateData.title);
    }
    if (updateData.content !== undefined) {
      setClauses.push(`content = $${setClauses.length + 1}`);
      values.push(updateData.content);
    }
    if (updateData.category !== undefined) {
      setClauses.push(`category = $${setClauses.length + 1}`);
      values.push(updateData.category);
    }
    if (updateData.tags !== undefined) {
      setClauses.push(`tags = $${setClauses.length + 1}`);
      values.push(JSON.stringify(updateData.tags));
    }
    if (updateData.isPublished !== undefined) {
      setClauses.push(`is_published = $${setClauses.length + 1}`);
      values.push(updateData.isPublished);
    }

    setClauses.push('updated_at = NOW()');

    if (setClauses.length === 1) {
      // No updates besides updated_at
      return res.json({ success: true, message: "No changes to apply" });
    }

    const result = await db.execute(sql.raw(`
      UPDATE knowledge_base_articles 
      SET ${setClauses.join(', ')}
      WHERE id = '${id}'
      RETURNING *
    `));

    if (!result.rows[0]) {
      return res.status(404).json({ success: false, error: "Article not found" });
    }

    res.json({ success: true, article: result.rows[0] });
  } catch (error: any) {
    console.error("Error updating KB article:", error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, error: "Invalid article data", details: error.errors });
    }
    res.status(500).json({ success: false, error: "Failed to update KB article" });
  }
});

// DELETE /api/admin/knowledge-base/:id - Delete KB article
router.delete("/admin/knowledge-base/:id", adminAuthMiddleware, requirePermission('help-support', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.execute(sql`
      DELETE FROM knowledge_base_articles WHERE id = ${id} RETURNING *
    `);

    if (!result.rows[0]) {
      return res.status(404).json({ success: false, error: "Article not found" });
    }

    res.json({ success: true, message: "Article deleted successfully" });
  } catch (error) {
    console.error("Error deleting KB article:", error);
    res.status(500).json({ success: false, error: "Failed to delete KB article" });
  }
});

export default router;
