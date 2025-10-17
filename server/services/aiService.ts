import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

type AIProvider = 'openai' | 'claude' | 'gemini';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class AIService {
  private openaiClient: OpenAI | null = null;
  private anthropicClient: Anthropic | null = null;
  private geminiClient: GoogleGenerativeAI | null = null;
  private availableProviders: Set<AIProvider> = new Set();

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Initialize OpenAI
    try {
      const openaiKey = process.env.OPENAI_API_KEY;
      if (openaiKey) {
        this.openaiClient = new OpenAI({ apiKey: openaiKey });
        this.availableProviders.add('openai');
        console.log('✅ AI Service (OpenAI) initialized successfully');
      } else {
        console.warn('⚠️ OPENAI_API_KEY not found in environment variables');
      }
    } catch (error) {
      console.error('❌ Failed to initialize OpenAI:', error);
    }

    // Initialize Anthropic Claude
    try {
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      if (anthropicKey) {
        this.anthropicClient = new Anthropic({ apiKey: anthropicKey });
        this.availableProviders.add('claude');
        console.log('✅ AI Service (Claude) initialized successfully');
      } else {
        console.warn('⚠️ ANTHROPIC_API_KEY not found in environment variables');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Anthropic:', error);
    }

    // Initialize Google Gemini
    try {
      const geminiKey = process.env.GOOGLE_AI_API_KEY;
      if (geminiKey) {
        this.geminiClient = new GoogleGenerativeAI(geminiKey);
        this.availableProviders.add('gemini');
        console.log('✅ AI Service (Gemini) initialized successfully');
      } else {
        console.warn('⚠️ GOOGLE_AI_API_KEY not found in environment variables');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Gemini:', error);
    }

    if (this.availableProviders.size === 0) {
      console.error('❌ No AI providers available. Please configure at least one API key.');
    }
  }

  isReady(provider?: AIProvider): boolean {
    if (provider) {
      return this.availableProviders.has(provider);
    }
    return this.availableProviders.size > 0;
  }

  getAvailableProviders(): AIProvider[] {
    return Array.from(this.availableProviders);
  }

  private detectProvider(model: string): AIProvider {
    if (model.startsWith('gpt-') || model.startsWith('o1-')) {
      return 'openai';
    } else if (model.startsWith('claude-')) {
      return 'claude';
    } else if (model.startsWith('gemini-')) {
      return 'gemini';
    }
    // Default to first available provider
    return this.getAvailableProviders()[0] || 'openai';
  }

  async chat(
    messages: ChatMessage[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ) {
    const model = options?.model || 'gpt-4o';
    const provider = this.detectProvider(model);

    if (!this.isReady(provider)) {
      throw new Error(`AI provider ${provider} is not available. Please check API keys.`);
    }

    try {
      if (provider === 'openai') {
        return await this.chatOpenAI(messages, options);
      } else if (provider === 'claude') {
        return await this.chatClaude(messages, options);
      } else if (provider === 'gemini') {
        return await this.chatGemini(messages, options);
      }
      throw new Error(`Unsupported provider: ${provider}`);
    } catch (error) {
      console.error(`AI Service chat error (${provider}):`, error);
      throw error;
    }
  }

  private async chatOpenAI(
    messages: ChatMessage[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ) {
    const response = await this.openaiClient!.chat.completions.create({
      model: options?.model || 'gpt-4o',
      messages: messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens,
      stream: false,
    });
    return response;
  }

  private async chatClaude(
    messages: ChatMessage[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ) {
    // Separate system message from conversation
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const conversationMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const response = await this.anthropicClient!.messages.create({
      model: options?.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options?.maxTokens || 2000,
      temperature: options?.temperature ?? 0.7,
      system: systemMessage,
      messages: conversationMessages,
    });

    // Format response to match OpenAI structure
    return {
      choices: [{
        message: {
          role: 'assistant' as const,
          content: response.content[0].type === 'text' ? response.content[0].text : '',
        },
      }],
      model: response.model,
      usage: {
        prompt_tokens: response.usage.input_tokens,
        completion_tokens: response.usage.output_tokens,
        total_tokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  }

  private async chatGemini(
    messages: ChatMessage[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ) {
    const modelName = options?.model || 'gemini-2.0-flash-exp';
    const model = this.geminiClient!.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens || 2000,
      },
    });

    // Separate system message and build chat history
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const conversationMessages = messages.filter(m => m.role !== 'system');

    // Build chat history for Gemini
    const history = conversationMessages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: m.content }],
    }));

    const lastMessage = conversationMessages[conversationMessages.length - 1];
    const userPrompt = systemMessage 
      ? `${systemMessage}\n\n${lastMessage.content}` 
      : lastMessage.content;

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(userPrompt);
    const response = result.response;

    // Format response to match OpenAI structure
    return {
      choices: [{
        message: {
          role: 'assistant' as const,
          content: response.text(),
        },
      }],
      model: modelName,
      usage: {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    };
  }

  async *chatStream(
    messages: ChatMessage[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ) {
    const model = options?.model || 'gpt-4o';
    const provider = this.detectProvider(model);

    if (!this.isReady(provider)) {
      throw new Error(`AI provider ${provider} is not available. Please check API keys.`);
    }

    try {
      if (provider === 'openai') {
        yield* this.chatStreamOpenAI(messages, options);
      } else if (provider === 'claude') {
        yield* this.chatStreamClaude(messages, options);
      } else if (provider === 'gemini') {
        yield* this.chatStreamGemini(messages, options);
      }
    } catch (error) {
      console.error(`AI Service stream error (${provider}):`, error);
      throw error;
    }
  }

  private async *chatStreamOpenAI(
    messages: ChatMessage[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ) {
    const stream = await this.openaiClient!.chat.completions.create({
      model: options?.model || 'gpt-4o',
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
  }

  private async *chatStreamClaude(
    messages: ChatMessage[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ) {
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const conversationMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const stream = await this.anthropicClient!.messages.stream({
      model: options?.model || 'claude-3-5-sonnet-20241022',
      max_tokens: options?.maxTokens || 2000,
      temperature: options?.temperature ?? 0.7,
      system: systemMessage,
      messages: conversationMessages,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield chunk.delta.text;
      }
    }
  }

  private async *chatStreamGemini(
    messages: ChatMessage[],
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
    }
  ) {
    const modelName = options?.model || 'gemini-2.0-flash-exp';
    const model = this.geminiClient!.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens || 2000,
      },
    });

    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const history = conversationMessages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: m.content }],
    }));

    const lastMessage = conversationMessages[conversationMessages.length - 1];
    const userPrompt = systemMessage 
      ? `${systemMessage}\n\n${lastMessage.content}` 
      : lastMessage.content;

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(userPrompt);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) {
        yield text;
      }
    }
  }

  async generateCode(
    prompt: string,
    context?: string
  ): Promise<string> {
    if (!this.isReady()) {
      throw new Error('AI Service is not initialized. Please configure at least one API key.');
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
        model: 'gpt-4o',
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
