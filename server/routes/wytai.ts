import { Router } from "express";
import { adminAuthMiddleware } from "../customAuth";
import { aiService } from "../services/aiService";
import { db } from "../db";
import { platformModules, apps, platformHubs } from "@shared/schema";
import { eq } from "drizzle-orm";

const router = Router();

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

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    if (!aiService.isReady()) {
      return res.status(503).json({ error: "AI service is not available" });
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

    res.json({
      success: true,
      message: aiMessage,
      model: response.model,
      usage: response.usage,
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

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required" });
    }

    if (!aiService.isReady()) {
      return res.status(503).json({ error: "AI service is not available" });
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

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
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

export default router;
