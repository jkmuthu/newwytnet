# WytAI Agent

:::info IMPLEMENTATION STATUS
**Core Features**: ✅ Fully implemented and available in Engine Admin Portal

**Advanced Features**: 🔄 DevDoc integration, visual builder support, and learning system are planned enhancements documented below.

See "Planned Enhancements" section for upcoming capabilities.
:::

## Overview

**WytAI Agent** is an intelligent AI assistant embedded directly into the WytNet Engine Admin Portal, providing conversational platform management capabilities through a floating chat widget. It enables Super Admins to interact with the platform using natural language, get recommendations, access documentation, and receive intelligent assistance for administrative tasks.

**Access**: Engine Admin Portal → Floating chat widget (bottom-right corner)

---

## Vision

Transform platform administration from manual navigation and configuration to natural conversation-driven workflows, where administrators can simply ask "What needs my attention?" or "How do I configure SSO?" and receive contextual, actionable guidance.

---

## Core Capabilities

### 1. Conversational Platform Management

- **Natural Language Interface**: Ask questions in plain English or Tamil
- **Context-Aware Responses**: Understanding of current admin session, permissions, and platform state
- **Multi-Turn Conversations**: Maintains conversation history for follow-up questions
- **Voice Interaction**: Speech-to-text input and text-to-speech output in English and Tamil

### 2. Multi-Model AI Support

WytAI supports multiple leading AI models, allowing users to choose based on their preferences:

**Available Models**:
- **GPT-4o** (OpenAI) - Excellent general-purpose reasoning and coding
- **Claude 3.5 Sonnet** (Anthropic) - Superior long-form writing and analysis
- **Gemini 2.0 Flash** (Google) - Fast, efficient responses
- **Gemini 1.5 Pro** (Google) - Advanced multimodal capabilities

**Model Selection**:
- Users can switch models mid-conversation via dropdown
- Model preference persisted across sessions
- Different models for different task types (e.g., GPT for coding, Claude for documentation)

### 3. Intelligent Recommendations

- **Platform Insights**: Analyzes platform usage patterns and suggests improvements
- **Configuration Guidance**: Helps configure complex features (RBAC, multi-tenancy, integrations)
- **Best Practices**: Recommends security, performance, and UX optimizations
- **Proactive Alerts**: Identifies potential issues before they become problems

---

## Technical Architecture

### Frontend Components

**Chat Widget** (`client/src/components/admin/WytAIChat.tsx`):
- Floating bubble interface with expand/collapse animation
- Message history with user/AI message styling
- Model selector dropdown (4 AI models)
- Voice input button with speech recognition
- Text-to-speech playback controls
- Typing indicators and loading states
- Markdown rendering for AI responses

**Key Features**:
- Draggable widget position (saved to localStorage)
- Unread message badge
- Minimized/maximized states
- Responsive design (mobile-optimized)
- Real-time streaming responses (future enhancement)

### Backend Architecture

**Main Router** (`server/routes/wytai.ts`):
- 558 lines of integrated logic
- Session-based authentication
- Rate limiting (20 requests per 15 minutes per user)
- Usage tracking and analytics
- Multi-model routing

**API Endpoints**:
```typescript
POST   /api/wytai/chat              // Send message to AI
GET    /api/wytai/conversations     // List user's conversations
GET    /api/wytai/conversations/:id // Get conversation details
POST   /api/wytai/conversations     // Create new conversation
DELETE /api/wytai/conversations/:id // Delete conversation
GET    /api/wytai/usage             // Get usage statistics
POST   /api/wytai/voice-input       // Voice-to-text transcription
POST   /api/wytai/voice-output      // Text-to-speech generation
```

### Database Schema

**Conversations Table**:
```typescript
{
  id: UUID
  userId: UUID
  title: string              // Auto-generated from first message
  model: string              // gpt-4o | claude-3.5-sonnet | gemini-2.0-flash | gemini-1.5-pro
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Messages Table**:
```typescript
{
  id: UUID
  conversationId: UUID
  role: enum                 // user | assistant | system
  content: text             // Message content
  model: string             // AI model used for this response
  tokens: number            // Token count (approximate)
  createdAt: timestamp
}
```

**Usage Tracking Table**:
```typescript
{
  id: UUID
  userId: UUID
  conversationId: UUID
  model: string
  tokensUsed: number
  responseTime: number      // milliseconds
  success: boolean
  error: text              // Error message if failed
  createdAt: timestamp
}
```

---

## AI Model Integration

### OpenAI (GPT-4o)

**API**: `@anthropic-ai/sdk` package
**Endpoint**: Chat completions API
**Capabilities**:
- Excellent code generation and debugging
- Strong reasoning and problem-solving
- Function calling support (planned)
- Structured output generation

**Configuration**:
```typescript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: conversationHistory,
  temperature: 0.7,
  max_tokens: 1000
});
```

### Anthropic (Claude 3.5 Sonnet)

**API**: `@anthropic-ai/sdk` package
**Endpoint**: Messages API
**Capabilities**:
- Superior long-form writing
- Excellent analysis and synthesis
- Strong safety and ethics alignment
- Extended context window (200K tokens)

**Configuration**:
```typescript
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const response = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1024,
  messages: conversationHistory
});
```

### Google AI (Gemini)

**API**: `@google/generative-ai` package
**Models**: Gemini 2.0 Flash, Gemini 1.5 Pro
**Capabilities**:
- Fast, efficient responses (Flash)
- Advanced multimodal support (Pro)
- Strong multilingual capabilities
- Cost-effective at scale

**Configuration**:
```typescript
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

const chat = model.startChat({ history: conversationHistory });
const result = await chat.sendMessage(userMessage);
```

---

## Features in Detail

### Voice Interaction

**Input (Speech-to-Text)**:
- Web Speech API for browser-based speech recognition
- Supports English and Tamil languages
- Real-time transcription with visual feedback
- Fallback to manual text input

**Output (Text-to-Speech)**:
- Web Speech Synthesis API
- Natural-sounding voice in English and Tamil
- Adjustable speech rate and pitch
- Play/pause/stop controls

**Implementation**:
```typescript
// Voice input
const recognition = new webkitSpeechRecognition();
recognition.lang = 'en-US'; // or 'ta-IN' for Tamil
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  sendMessage(transcript);
};

// Voice output
const utterance = new SpeechSynthesisUtterance(text);
utterance.lang = 'en-US';
speechSynthesis.speak(utterance);
```

### Rate Limiting

**Rules**:
- **20 requests per 15 minutes** per user
- Sliding window rate limit (not fixed intervals)
- 429 status code when exceeded
- Clear error message with retry timing

**Purpose**:
- Prevent API cost overruns
- Ensure fair usage across admins
- Protect against accidental infinite loops

**Implementation**:
- In-memory rate limiter (MemoryStore)
- Keyed by user ID
- Automatically resets after window expires

### Usage Analytics

**Tracked Metrics**:
- Total conversations per user
- Messages sent/received counts
- Token usage by model
- Average response time
- Success/error rates
- Cost estimation (tokens × model pricing)

**Dashboard** (Planned):
- Usage trends over time
- Model popularity comparison
- Per-user cost breakdown
- Performance metrics (response time, error rate)

---

## Use Cases

### Platform Configuration

**Example Conversation**:
```
User: "How do I configure Google OAuth for WytPass?"

WytAI: "To configure Google OAuth in WytPass:

1. Get OAuth Credentials from Google Cloud Console:
   - Create a project at console.cloud.google.com
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: https://your-domain.com/auth/google/callback

2. Set Environment Variables:
   - GOOGLE_CLIENT_ID=your_client_id
   - GOOGLE_CLIENT_SECRET=your_client_secret

3. WytPass will automatically enable Google login once credentials are set

The OAuth flow is already implemented. See DevDoc → WytPass for details."
```

### Troubleshooting

**Example Conversation**:
```
User: "Users are getting 403 errors when trying to access Hub Admin"

WytAI: "403 errors in Hub Admin usually indicate a permissions issue. Let me help:

1. Check the user's role assignment:
   - Go to Engine Admin → Users & Permissions
   - Find the user and verify they have a Hub Admin role

2. Verify RBAC configuration:
   - Hub Admin requires `hub.manage` permission
   - Check if the role has this permission enabled

3. Check Row Level Security:
   - Ensure the user's tenant_id matches the hub they're trying to access
   - RLS policies might be blocking cross-tenant access

Would you like me to check the specific user's permissions?"
```

### Development Guidance

**Example Conversation**:
```
User: "How should I structure a new module?"

WytAI: "New modules should follow the Module Manifest Specification:

1. Create directory: modules/your-module/
2. Add manifest.json:
   {
     "id": "your-module",
     "version": "1.0.0",
     "name": "Your Module",
     "description": "...",
     "context": ["platform", "hub", "app"],
     "dependencies": [],
     "routes": [...]
   }

3. Implement module logic in index.ts
4. The manifest scanner will auto-discover it on server restart

See DevDoc → Architecture → Module Manifest for full spec."
```

---

## Security & Privacy

### Access Control

- **Super Admin Only**: WytAI is restricted to Engine Admin users
- **Session-Based Auth**: Uses existing WytPass authentication
- **Permission Checking**: Verifies `wytai.access` permission
- **Tenant Isolation**: Cannot access data from other tenants

### Data Privacy

- **Conversation Privacy**: Each user sees only their own conversations
- **No Sensitive Data Logging**: API keys, passwords are never logged
- **Ephemeral Processing**: AI providers don't store conversation data long-term
- **GDPR Compliance**: Users can delete their conversation history

### API Key Management

- All AI provider API keys stored in environment variables
- Never exposed to frontend
- Separate keys for dev/staging/production
- Rotation supported without code changes

---

## Planned Enhancements

### Phase 1: Modular Refactoring (In Progress)

**Goal**: Split monolithic `wytai.ts` into organized modules

**New Structure**:
```
server/services/wytai/
├── validator/        # Access control, rate limiting
├── recommender/      # Suggestion engine, insights
├── logger/           # Usage tracking, analytics
└── trainer/          # Learning system, feedback loop
```

**Benefits**:
- Easier maintenance and testing
- Separate concerns (auth vs AI vs logging)
- Enable team collaboration (different modules)
- Prepare for advanced features

### Phase 2: DevDoc Integration

**Goal**: Enable WytAI to read DevDoc for context-aware help

**Features**:
- Search DevDoc pages based on user questions
- Quote relevant documentation in responses
- Link to specific sections for further reading
- Keep documentation as single source of truth

**Technical Approach**:
- Index DevDoc markdown files
- Semantic search using embeddings
- Retrieve relevant docs before AI query
- Inject docs into AI context window

### Phase 3: Visual Builder Support

**Goal**: Enable WytAI to assist with visual drag-drop building

**Features**:
- Natural language → visual components
- "Add a user profile card here"
- Real-time suggestions during building
- AI-powered layout recommendations
- Component property auto-fill

**Use Case**:
```
User: [Dragging a card component]
WytAI: "I see you're adding a card. Would you like to:
1. Connect it to user data?
2. Add an action button?
3. Apply the standard spacing?"
```

### Phase 4: Advanced Intelligence

**Features**:
- **Function Calling**: WytAI can execute platform actions
- **Proactive Monitoring**: Alert admins to issues
- **Learning System**: Improve from feedback
- **Multi-Agent Workflows**: Coordinate multiple AI agents
- **Predictive Analytics**: Forecast platform needs

---

## Best Practices

### For Users

1. **Be Specific**: Ask clear, detailed questions
   - ✅ "How do I add a new Hub Admin role with limited permissions?"
   - ❌ "Help with roles"

2. **Provide Context**: Include relevant details
   - ✅ "User john@example.com gets 403 on /hub/dashboard"
   - ❌ "Something's broken"

3. **Try Different Models**: Each has strengths
   - GPT-4o for code and debugging
   - Claude for documentation and analysis
   - Gemini for quick answers and multilingual

4. **Use Follow-Ups**: Build on previous messages
   - "What about Tamil support?"
   - "Can you show an example?"

### For Developers

1. **System Prompts**: Define WytAI's personality and capabilities
2. **Context Injection**: Provide relevant platform state
3. **Error Handling**: Graceful fallbacks when AI fails
4. **Cost Monitoring**: Track token usage and set budgets
5. **Feedback Loops**: Learn from user ratings

---

## API Reference

### POST /api/wytai/chat

Send a message to WytAI and get AI response.

**Request Body**:
```typescript
{
  conversationId?: string,  // Optional: existing conversation
  message: string,          // User's message
  model: string            // AI model to use
}
```

**Response**:
```typescript
{
  conversationId: string,
  message: {
    id: string,
    role: "assistant",
    content: string,
    model: string,
    tokens: number,
    createdAt: string
  }
}
```

### GET /api/wytai/conversations

List all conversations for current user.

**Response**:
```typescript
{
  conversations: [
    {
      id: string,
      title: string,
      model: string,
      messageCount: number,
      lastMessageAt: string,
      createdAt: string
    }
  ]
}
```

### GET /api/wytai/usage

Get usage statistics for current user.

**Response**:
```typescript
{
  totalConversations: number,
  totalMessages: number,
  tokensByModel: {
    "gpt-4o": number,
    "claude-3.5-sonnet": number,
    "gemini-2.0-flash": number,
    "gemini-1.5-pro": number
  },
  estimatedCost: number,  // USD
  period: string          // "last 30 days"
}
```

---

## Related Documentation

- [Engine Admin Panel](/en/admin/engine-admin)
- [RBAC System](/en/architecture/rbac)
- [Module Manifest Specification](/en/architecture/module-manifest)
- [AI App Builder](/en/features/ai-app-builder)

---

## Environment Variables

```bash
# Required for WytAI Agent
OPENAI_API_KEY=sk-...           # OpenAI GPT-4o
ANTHROPIC_API_KEY=sk-ant-...    # Anthropic Claude
GOOGLE_AI_API_KEY=...           # Google Gemini

# Optional: Rate limiting
WYTAI_RATE_LIMIT=20            # Requests per window (default: 20)
WYTAI_RATE_WINDOW=900000       # Window in ms (default: 15 min)
```

---

## Troubleshooting

**Problem**: "Rate limit exceeded" error

**Solution**: Wait 15 minutes or ask admin to increase `WYTAI_RATE_LIMIT`

---

**Problem**: Voice input not working

**Solution**: 
- Grant microphone permission in browser
- Use Chrome/Edge (Safari has limited support)
- Check language setting matches your speech

---

**Problem**: AI responses seem outdated

**Solution**: WytAI will be updated with DevDoc integration (Phase 2) to always reference latest documentation

---

## Access Control

**Required Permission**: `wytai.access` (Super Admin only)

Only Engine Admin users with Super Admin role can access WytAI Agent.
