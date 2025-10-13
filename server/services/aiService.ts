import OpenAI from 'openai';

class AIService {
  private client: OpenAI | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      
      if (!apiKey) {
        console.warn('⚠️ OPENAI_API_KEY not found in environment variables');
        return;
      }

      this.client = new OpenAI({
        apiKey: apiKey,
      });

      this.isInitialized = true;
      console.log('✅ AI Service (OpenAI) initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize AI Service:', error);
    }
  }

  isReady(): boolean {
    return this.isInitialized && this.client !== null;
  }

  async chat(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ) {
    if (!this.isReady()) {
      throw new Error('AI Service is not initialized. Please check OPENAI_API_KEY.');
    }

    try {
      const response = await this.client!.chat.completions.create({
        model: options?.model || 'gpt-4',
        messages: messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
        stream: false,
      });

      return response;
    } catch (error) {
      console.error('AI Service chat error:', error);
      throw error;
    }
  }

  async *chatStream(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ) {
    if (!this.isReady()) {
      throw new Error('AI Service is not initialized. Please check OPENAI_API_KEY.');
    }

    try {
      const stream = await this.client!.chat.completions.create({
        model: options?.model || 'gpt-4',
        messages: messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      console.error('AI Service stream error:', error);
      throw error;
    }
  }

  async generateCode(
    prompt: string,
    context?: string
  ): Promise<string> {
    if (!this.isReady()) {
      throw new Error('AI Service is not initialized. Please check OPENAI_API_KEY.');
    }

    const systemPrompt = `You are an expert full-stack developer building apps within the WytNet ecosystem.

WytNet Framework Constraints:
- Database: PostgreSQL with Drizzle ORM only
- Backend: Express.js with TypeScript
- Frontend: React 18 + Vite + TypeScript
- UI: shadcn/ui components + Tailwind CSS only
- Auth: WytPass authentication system (already exists)
- Structure: Follow existing WytNet file patterns
- Domain: All apps run on wytnet.com

You MUST follow these patterns:
1. Database schema in shared/schema.ts using Drizzle
2. API routes in server/routes.ts
3. Frontend pages in client/src/pages/
4. Use existing UI components from @/components/ui/
5. Use existing utilities and patterns

${context ? `\nAdditional Context:\n${context}` : ''}

Generate clean, production-ready code following WytNet patterns.`;

    try {
      const response = await this.chat([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ], {
        model: 'gpt-4',
        temperature: 0.3,
        maxTokens: 4000,
      });

      const content = response.choices[0]?.message?.content || '';
      return content;
    } catch (error) {
      console.error('Code generation error:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();
export default aiService;
