---
requiredLevel: developer
---

# WytAI Agent முழு பக்க கட்டமைப்பு

**பதிப்பு**: 1.0  
**கடைசி புதுப்பிப்பு**: அக்டோபர் 2025  
**நிலை**: வடிவமைப்பு கட்டம்

---

## மேலோட்டம்

**WytAI Agent** என்பது WytNet Engine Admin Panel-இல் ஆழமாக ஒருங்கிணைக்கப்பட்ட ஒரு நுண்ணறிவு AI உதவியாளராகும், இது context-aware உதவி, code generation, மற்றும் இயற்கை மொழி interaction மூலம் தன்னாட்சி அம்ச உருவாக்கத்தை வழங்குகிறது.

### Evolution

**தற்போதைய நிலை** (கட்டம் 1):
- Floating chat widget
- அடிப்படை chat செயல்பாடு
- வரம்புபடுத்தப்பட்ட context விழிப்புணர்வு
- எளிய Q&A interactions

**இலக்கு நிலை** (கட்டம் 2):
- முழு-பக்க dedicated interface
- மேம்பட்ட chat அம்சங்கள் (voice, files, code execution)
- ஆழமான Engine context ஒருங்கிணைப்பு
- Conversation management system
- Multi-model AI support

### முக்கிய திறன்கள்

1. **Context-Aware உதவி**: தற்போதைய page, user action, platform state புரிந்துகொள்ளுதல்
2. **Code Generation**: இயற்கை மொழியிலிருந்து production-ready code உருவாக்குதல்
3. **Multi-Modal Input**: Text, voice, files, screen capture
4. **Interactive Execution**: Code இயக்குதல், மாற்றங்களை preview செய்தல், அம்சங்களை deploy செய்தல்
5. **Conversation Management**: History, search, sharing, templates

---

## System கட்டமைப்பு

### முக்கிய Component Layers

**Frontend Layer**:
- Full Page UI
- Conversations Sidebar
- Chat Interface
- Multi-Modal Input
- Live Preview Pane

**Context Layer**:
- Page Context
- Platform Context
- User Context
- Conversation History

**AI Layer**:
- Model Router
- OpenAI GPT-4o
- Claude 3.5 Sonnet
- Gemini 2.0 Flash
- Prompt Engine

**Processing Layer**:
- Response Parser
- Code Executor
- Code Validator
- Action Handler

**Storage Layer**:
- Conversations DB
- Messages DB
- Usage Tracking
- Response Cache

---

## Frontend கட்டமைப்பு

### Page Layout Structure

```typescript
interface WytAIPageLayout {
  header: HeaderSection;
  sidebar: ConversationsSidebar;
  main: ChatArea;
  inspector?: InspectorPanel;
}
```

### Layout அமைப்பு

```
┌─────────────────────────────────────────────────────┐
│ Header: [WytAI Agent] [Model ▼] [Voice 🎤] [•••]  │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│ Conversations│  Chat Area                          │
│ Sidebar      │  Messages + Input                   │
│              │                                      │
│ 📝 New Chat  │  AI chat interface                  │
│              │  with streaming                     │
│ Today        │                                      │
│  • Module    │  [Code blocks]                      │
│  • Fix Bug   │  [File uploads]                     │
│              │  [Voice input]                       │
│ Yesterday    │                                      │
│  • API       │  Input Area                         │
│              │  [Type message...] [Send]           │
└──────────────┴──────────────────────────────────────┘
```

---

## Context Management System

### Context Aggregation

```typescript
interface FullContext {
  page: PageContext;        // தற்போதைய page info
  platform: PlatformContext; // Platform statistics
  user: UserContext;         // User permissions
  conversation: ConversationContext; // Chat history
}

interface PageContext {
  path: string;
  pageName: string;
  entity?: string;
  action?: 'create' | 'edit' | 'view' | 'list';
  formData?: Record<string, any>;
}
```

### Context Provider

**Context Sources**:
1. Current page context (router-based)
2. Platform state (modules, apps, hubs)
3. User context (roles, permissions)
4. Conversation context (history, mode)

**Context Usage**:
- AI prompts-இல் சேர்க்கப்படுகிறது
- Relevant suggestions வழங்குகிறது
- Form auto-fill செயல்படுத்துகிறது
- Error detection & fixes

---

## AI Integration Layer

### Model Router

```typescript
class ModelRouter {
  async chat(
    model: string,
    messages: ChatMessage[],
    context: FullContext
  ): Promise<AIResponse>
  
  async streamChat(
    model: string,
    messages: ChatMessage[],
    context: FullContext,
    onChunk: (chunk: string) => void
  ): Promise<void>
}
```

**Supported Models**:
- OpenAI: GPT-4o, GPT-4o-mini
- Anthropic: Claude 3.5 Sonnet
- Google: Gemini 2.0 Flash

### Prompt Engineering

System message-இல் context சேர்க்கப்படுகிறது:
- Current page & entity
- User roles & permissions
- Platform statistics
- Available components
- Coding conventions

---

## மேம்பட்ட அம்சங்கள்

### Voice Input/Output

```typescript
class VoiceService {
  startListening(onTranscript: (text: string) => void): void
  stopListening(): void
  speak(text: string, options?: SpeechOptions): void
}
```

**Features**:
- Speech-to-text (continuous)
- Interim results
- Multi-language support
- Text-to-speech output

### File Upload & Processing

**Supported Types**:
- Images (PNG, JPEG, GIF, WebP)
- Code files (TypeScript, JavaScript, JSON)
- Documents (PDF, Markdown)

**Processing**:
- OCR for images
- Code analysis
- Document parsing

### Code Execution Sandbox

```typescript
class CodeExecutor {
  async execute(code: string): Promise<ExecutionResult>
}
```

**Safety**:
- Sandboxed VM
- Timeout enforcement (5s)
- Whitelisted APIs only
- Resource limits

---

## Conversation Management

### Data Model

```typescript
interface Conversation {
  id: string;
  userId: string;
  title: string;
  model: string;
  messagesCount: number;
  createdAt: Date;
  lastMessageAt: Date;
}

interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: MessageMetadata;
}
```

### Conversation Search

**Full-text Search**:
- Title மற்றும் content-இல் தேடல்
- Date filters
- Model filters
- Folder filters

**Semantic Search**:
- AI embeddings பயன்படுத்துதல்
- Vector similarity
- Related conversations கண்டறிதல்

---

## Performance Optimization

### Lazy Loading

```typescript
// Lazy load AI providers
const OpenAIProvider = lazy(() => import('./providers/OpenAIProvider'));
const ClaudeProvider = lazy(() => import('./providers/ClaudeProvider'));
```

### Response Streaming

Server-Sent Events (SSE) பயன்படுத்தி real-time streaming.

### Caching Strategy

- AI responses caching (1 hour)
- Platform context caching (5 minutes)
- User context session cache
- Conversation list cache

---

## Security

### Rate Limiting

```typescript
interface RateLimits {
  daily: 100;       // requests per day
  monthly: 2000;    // requests per month
  perMinute: 10;    // requests per minute
}
```

### Input Sanitization

```typescript
class InputSanitizer {
  sanitize(input: string): string
  validateCodeInput(code: string): ValidationResult
}
```

**Forbidden Patterns**:
- eval()
- Function()
- process.env access
- require() / import()

---

## Testing Strategy

### Unit Tests

```typescript
describe('ContextManager', () => {
  it('should aggregate all context sources', async () => {
    const context = await manager.getFullContext();
    expect(context.page).toBeDefined();
    expect(context.platform).toBeDefined();
  });
});
```

### Integration Tests

```typescript
describe('WytAI Full Flow', () => {
  it('should handle complete chat interaction', async () => {
    const conv = await createConversation();
    await sendMessage(conv.id, 'Create a blog module');
    const response = await waitForResponse(conv.id);
    expect(response.content).toContain('blog');
  });
});
```

---

## எதிர்கால மேம்பாடுகள்

### Phase 3+ அம்சங்கள்

1. **Multi-Agent Collaboration**:
   - பல AI agents ஒன்றாக வேலை செய்தல்
   - Specialized agents
   - Agent orchestration

2. **Visual Context**:
   - Screenshot analysis
   - UI mockup to code
   - Diagram understanding

3. **Code Repository Integration**:
   - GitHub/GitLab integration
   - Pull request generation
   - Code review assistance

4. **Advanced Analytics**:
   - Conversation insights
   - Usage patterns
   - Success metrics

---

## குறிப்புகள்

- [PRD: சுய-சேவை தளம்](/ta/prd/self-service-platform)
- [WytBuilder கட்டமைப்பு](/ta/architecture/wytbuilder)
- [AI Service செயல்படுத்தல்](/ta/implementation/ai-service)
- [Context Management](/ta/implementation/context-management)
