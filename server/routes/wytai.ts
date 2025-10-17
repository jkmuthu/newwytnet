import { Router } from "express";
import { adminAuthMiddleware } from "../customAuth";
import { aiService } from "../services/aiService";
import { db } from "../db";
import { platformModules, apps, platformHubs, wytaiUsage, users, wytaiConversations, wytaiMessages, insertWytaiConversationSchema, insertWytaiMessageSchema } from "@shared/schema";
import { eq, and, gte, sql, desc } from "drizzle-orm";

const router = Router();

// Rate limits configuration
const RATE_LIMITS = {
  daily: 100,   // 100 requests per day
  monthly: 2000 // 2000 requests per month
};

// Check if user has exceeded rate limits
async function checkRateLimits(userId: string): Promise<{ allowed: boolean; message?: string; stats?: any }> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get daily usage count
  const dailyUsage = await db.select({
    count: sql<number>`cast(count(*) as int)`,
  })
    .from(wytaiUsage)
    .where(and(
      eq(wytaiUsage.userId, userId),
      gte(wytaiUsage.createdAt, today)
    ));

  // Get monthly usage count
  const monthlyUsage = await db.select({
    count: sql<number>`cast(count(*) as int)`,
  })
    .from(wytaiUsage)
    .where(and(
      eq(wytaiUsage.userId, userId),
      gte(wytaiUsage.createdAt, thisMonth)
    ));

  const dailyCount = dailyUsage[0]?.count || 0;
  const monthlyCount = monthlyUsage[0]?.count || 0;

  const stats = {
    daily: { used: dailyCount, limit: RATE_LIMITS.daily, remaining: RATE_LIMITS.daily - dailyCount },
    monthly: { used: monthlyCount, limit: RATE_LIMITS.monthly, remaining: RATE_LIMITS.monthly - monthlyCount },
  };

  if (dailyCount >= RATE_LIMITS.daily) {
    return {
      allowed: false,
      message: `Daily limit of ${RATE_LIMITS.daily} requests exceeded. Try again tomorrow.`,
      stats,
    };
  }

  if (monthlyCount >= RATE_LIMITS.monthly) {
    return {
      allowed: false,
      message: `Monthly limit of ${RATE_LIMITS.monthly} requests exceeded. Limit resets next month.`,
      stats,
    };
  }

  return { allowed: true, stats };
}

// Track usage in database and return fresh stats
async function trackUsage(userId: string, model: string, provider: string, usage: any, ipAddress?: string) {
  try {
    await db.insert(wytaiUsage).values({
      userId,
      model,
      provider,
      promptTokens: usage?.prompt_tokens || 0,
      completionTokens: usage?.completion_tokens || 0,
      totalTokens: usage?.total_tokens || 0,
      requestData: {},
      responseData: { usage },
      ipAddress,
    });

    // Return fresh stats after tracking
    const rateLimitCheck = await checkRateLimits(userId);
    return rateLimitCheck.stats;
  } catch (error) {
    console.error("Failed to track WytAI usage:", error);
    return null;
  }
}

// Check if user has access to WytAI (Super Admin or Admin only)
async function checkWytAIAccess(userId: string): Promise<boolean> {
  const user = await db.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  if (!user || user.length === 0) return false;
  
  const userRole = user[0].role;
  const isSuperAdmin = user[0].isSuperAdmin;
  
  return isSuperAdmin || userRole === 'super_admin' || userRole === 'admin';
}

// System prompt for WytAI Agent with Engine context
const getEngineContextPrompt = (engineData: any) => `You are WytAI Agent, an intelligent assistant built into the WytNet Engine Admin Panel. You help administrators improve and manage their platform.

**Your Capabilities:**
- Suggest improvements to modules, apps, and hubs
- Generate code snippets for React components and Express APIs
- Help with UI/UX enhancements
- Provide guidance on WytNet architecture

**Engine Context:**
- **Modules**: ${engineData.modulesCount} modules available (${engineData.modules.slice(0, 5).map((m: any) => m.name).join(', ')}${engineData.modules.length > 5 ? '...' : ''})
- **Apps**: ${engineData.appsCount} apps created
- **Hubs**: ${engineData.hubsCount} hubs configured (${engineData.hubs.map((h: any) => h.name).join(', ')})

**WytNet Tech Stack:**
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- Backend: Express.js, TypeScript, PostgreSQL, Drizzle ORM
- Features: Multi-tenancy, RBAC, OAuth authentication, Module system

**Communication Style:**
- Be concise and action-oriented
- When suggesting code changes, always ask for confirmation first
- Support Tamil language queries naturally
- Focus on practical, implementable suggestions

**Important Rules:**
1. For destructive changes, ALWAYS ask: "இப்படி செய்யவா?" (Should I do it like this?)
2. Only suggest frontend changes (React components, styling, UI/UX)
3. Do NOT suggest backend/database schema changes
4. Provide code snippets when helpful`;

// POST /api/admin/wytai/chat - Chat with WytAI Agent
router.post("/admin/wytai/chat", adminAuthMiddleware, async (req, res) => {
  try {
    const { messages, model } = req.body;
    const userId = (req as any).principal?.userId || (req as any).user?.id;
    const ipAddress = req.ip || req.socket.remoteAddress;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    // Check if user has access to WytAI (Super Admin or Admin only)
    const hasAccess = await checkWytAIAccess(userId);
    if (!hasAccess) {
      return res.status(403).json({ 
        error: "Access denied. WytAI is only available for Super Admins and Admins.",
        code: "ACCESS_DENIED"
      });
    }

    // Check rate limits
    const rateLimitCheck = await checkRateLimits(userId);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({ 
        error: rateLimitCheck.message,
        stats: rateLimitCheck.stats,
        code: "RATE_LIMIT_EXCEEDED"
      });
    }

    if (!aiService.isReady()) {
      return res.status(503).json({ error: "AI service is not available. Please contact the administrator to configure API keys." });
    }

    // Fetch engine context data
    const [allModules, allApps, allHubs] = await Promise.all([
      db.select().from(platformModules).where(eq(platformModules.status, 'enabled')).limit(20),
      db.select().from(apps).limit(10),
      db.select().from(platformHubs).limit(10),
    ]);

    const engineData = {
      modules: allModules,
      modulesCount: allModules.length,
      apps: allApps,
      appsCount: allApps.length,
      hubs: allHubs,
      hubsCount: allHubs.length,
    };

    // Prepare messages with system context
    const systemPrompt = getEngineContextPrompt(engineData);
    const fullMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages,
    ];

    // Get AI response
    const response = await aiService.chat(fullMessages, {
      model: model || "gpt-4o",
      temperature: 0.7,
      maxTokens: 2000,
    });

    const aiMessage = response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    // Track usage in database and get fresh stats
    const provider = model?.includes('gpt') ? 'openai' : model?.includes('claude') ? 'claude' : 'gemini';
    const freshStats = await trackUsage(userId, response.model || model || "gpt-4o", provider, response.usage, ipAddress);

    // Return response with fresh usage stats
    res.json({
      success: true,
      message: aiMessage,
      model: response.model,
      usage: response.usage,
      stats: freshStats || rateLimitCheck.stats, // Include fresh usage stats in response
    });
  } catch (error: any) {
    console.error("WytAI chat error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to process chat request",
    });
  }
});

// POST /api/admin/wytai/chat/stream - Streaming chat with WytAI Agent
router.post("/admin/wytai/chat/stream", adminAuthMiddleware, async (req, res) => {
  try {
    const { messages, model } = req.body;
    const userId = (req as any).principal?.userId || (req as any).user?.id;
    const ipAddress = req.ip || req.socket.remoteAddress;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    // Check if user has access to WytAI (Super Admin or Admin only)
    const hasAccess = await checkWytAIAccess(userId);
    if (!hasAccess) {
      return res.status(403).json({ 
        error: "Access denied. WytAI is only available for Super Admins and Admins.",
        code: "ACCESS_DENIED"
      });
    }

    // Check rate limits
    const rateLimitCheck = await checkRateLimits(userId);
    if (!rateLimitCheck.allowed) {
      return res.status(429).json({ 
        error: rateLimitCheck.message,
        stats: rateLimitCheck.stats,
        code: "RATE_LIMIT_EXCEEDED"
      });
    }

    if (!aiService.isReady()) {
      return res.status(503).json({ error: "AI service is not available. Please contact the administrator to configure API keys." });
    }

    // Fetch engine context data
    const [allModules, allApps, allHubs] = await Promise.all([
      db.select().from(platformModules).where(eq(platformModules.status, 'enabled')).limit(20),
      db.select().from(apps).limit(10),
      db.select().from(platformHubs).limit(10),
    ]);

    const engineData = {
      modules: allModules,
      modulesCount: allModules.length,
      apps: allApps,
      appsCount: allApps.length,
      hubs: allHubs,
      hubsCount: allHubs.length,
    };

    // Prepare messages with system context
    const systemPrompt = getEngineContextPrompt(engineData);
    const fullMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages,
    ];

    // Set up SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Stream AI response
    try {
      for await (const chunk of aiService.chatStream(fullMessages, {
        model: model || "gpt-4o",
        temperature: 0.7,
        maxTokens: 2000,
      })) {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }

      // Track usage after streaming completes (token counts not available for streaming)
      const provider = model?.includes('gpt') ? 'openai' : model?.includes('claude') ? 'claude' : 'gemini';
      const freshStats = await trackUsage(userId, model || "gpt-4o", provider, { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }, ipAddress);

      res.write(`data: ${JSON.stringify({ done: true, stats: freshStats || rateLimitCheck.stats })}\n\n`);
      res.end();
    } catch (streamError: any) {
      res.write(`data: ${JSON.stringify({ error: streamError.message })}\n\n`);
      res.end();
    }
  } catch (error: any) {
    console.error("WytAI stream error:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error.message || "Failed to process stream request",
      });
    }
  }
});

// ======================
// Chat History API Routes
// ======================

// Get all conversations for the authenticated admin
router.get("/api/admin/wytai/conversations", adminAuthMiddleware, async (req, res) => {
  try {
    const userId = req.session.adminUserId as string;

    const conversations = await db.query.wytaiConversations.findMany({
      where: eq(wytaiConversations.userId, userId),
      orderBy: [desc(wytaiConversations.updatedAt)],
    });

    res.json({ success: true, conversations });
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch conversations",
    });
  }
});

// Create a new conversation
router.post("/api/admin/wytai/conversations", adminAuthMiddleware, async (req, res) => {
  try {
    const userId = req.session.adminUserId as string;
    const { title, model } = insertWytaiConversationSchema.parse(req.body);

    // Generate Display ID (CN prefix for Conversations)
    const count = await db.select({ count: sql<number>`cast(count(*) as int)` })
      .from(wytaiConversations);
    const displayId = `CN${String((count[0]?.count || 0) + 1).padStart(7, '0')}`;

    const [conversation] = await db.insert(wytaiConversations).values({
      displayId,
      userId,
      title: title || 'New Conversation',
      model: model || 'gpt-4o',
    }).returning();

    res.json({ success: true, conversation });
  } catch (error: any) {
    console.error("Error creating conversation:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create conversation",
    });
  }
});

// Get messages for a specific conversation
router.get("/api/admin/wytai/conversations/:id/messages", adminAuthMiddleware, async (req, res) => {
  try {
    const userId = req.session.adminUserId as string;
    const conversationId = req.params.id;

    // Verify conversation belongs to user
    const conversation = await db.query.wytaiConversations.findFirst({
      where: and(
        eq(wytaiConversations.id, conversationId),
        eq(wytaiConversations.userId, userId)
      ),
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
    }

    const messages = await db.query.wytaiMessages.findMany({
      where: eq(wytaiMessages.conversationId, conversationId),
      orderBy: [wytaiMessages.createdAt],
    });

    res.json({ success: true, messages });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch messages",
    });
  }
});

// Add a message to a conversation
router.post("/api/admin/wytai/conversations/:id/messages", adminAuthMiddleware, async (req, res) => {
  try {
    const userId = req.session.adminUserId as string;
    const conversationId = req.params.id;
    const { role, content, attachments } = insertWytaiMessageSchema.parse(req.body);

    // Verify conversation belongs to user
    const conversation = await db.query.wytaiConversations.findFirst({
      where: and(
        eq(wytaiConversations.id, conversationId),
        eq(wytaiConversations.userId, userId)
      ),
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
    }

    // Insert message
    const [message] = await db.insert(wytaiMessages).values({
      conversationId,
      role,
      content,
      attachments: attachments || [],
    }).returning();

    // Update conversation updatedAt
    await db.update(wytaiConversations)
      .set({ updatedAt: new Date() })
      .where(eq(wytaiConversations.id, conversationId));

    res.json({ success: true, message });
  } catch (error: any) {
    console.error("Error adding message:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to add message",
    });
  }
});

// Update conversation (title, model)
router.patch("/api/admin/wytai/conversations/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const userId = req.session.adminUserId as string;
    const conversationId = req.params.id;
    const { title, model, isArchived } = req.body;

    // Verify conversation belongs to user
    const conversation = await db.query.wytaiConversations.findFirst({
      where: and(
        eq(wytaiConversations.id, conversationId),
        eq(wytaiConversations.userId, userId)
      ),
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
    }

    // Update conversation
    const updateData: any = { updatedAt: new Date() };
    if (title !== undefined) updateData.title = title;
    if (model !== undefined) updateData.model = model;
    if (isArchived !== undefined) updateData.isArchived = isArchived;

    const [updated] = await db.update(wytaiConversations)
      .set(updateData)
      .where(eq(wytaiConversations.id, conversationId))
      .returning();

    res.json({ success: true, conversation: updated });
  } catch (error: any) {
    console.error("Error updating conversation:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to update conversation",
    });
  }
});

// Delete conversation
router.delete("/api/admin/wytai/conversations/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const userId = req.session.adminUserId as string;
    const conversationId = req.params.id;

    // Verify conversation belongs to user
    const conversation = await db.query.wytaiConversations.findFirst({
      where: and(
        eq(wytaiConversations.id, conversationId),
        eq(wytaiConversations.userId, userId)
      ),
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: "Conversation not found",
      });
    }

    // Delete conversation (messages will cascade delete)
    await db.delete(wytaiConversations)
      .where(eq(wytaiConversations.id, conversationId));

    res.json({ success: true, message: "Conversation deleted" });
  } catch (error: any) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete conversation",
    });
  }
});

export default router;
