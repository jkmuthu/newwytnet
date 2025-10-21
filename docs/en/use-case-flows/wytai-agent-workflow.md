# WytAI Agent Workflow

## Overview

**WytAI Agent** is an intelligent AI assistant embedded in the Engine Admin portal, offering conversational platform management with multi-model AI support, voice interaction, and comprehensive usage tracking.

**Key Features:**
- Multiple AI models (GPT-4o, Claude 3.5 Sonnet, Gemini 2.0 Flash)
- Voice input/output in Tamil and English
- Streaming responses for real-time interaction
- Context-aware platform management
- Rate limiting and usage tracking
- Floating chat widget UI

---

## WytAI Architecture

### Complete AI Workflow

```mermaid
flowchart TD
    Start([User Opens Engine Admin]) --> Widget[WytAI Floating Widget]
    Widget --> UserInput{Input Method}
    
    UserInput -->|Text| TypeMessage[Type Message]
    UserInput -->|Voice| VoiceInput[Click Microphone]
    
    VoiceInput --> Capture[Capture Audio]
    Capture --> STT[Speech-to-Text<br/>Web Speech API]
    STT --> TypeMessage
    
    TypeMessage --> SelectModel{AI Model?}
    SelectModel -->|GPT-4o| OpenAI[OpenAI API]
    SelectModel -->|Claude 3.5| Anthropic[Anthropic API]
    SelectModel -->|Gemini 2.0| Google[Google AI API]
    
    OpenAI --> ProcessQuery[Process User Query]
    Anthropic --> ProcessQuery
    Google --> ProcessQuery
    
    ProcessQuery --> Context["Add Context:<br/>- User Role<br/>- Current Page<br/>- Platform State<br/>- Recent Actions"]
    
    Context --> APICall[Call AI API]
    APICall --> StreamResponse[Streaming Response]
    
    StreamResponse --> DisplayText[Display Text Response]
    DisplayText --> CheckVoice{Voice Output Enabled?}
    
    CheckVoice -->|Yes| TTS[Text-to-Speech<br/>Web Speech API]
    CheckVoice -->|No| Complete[Response Complete]
    
    TTS --> PlayAudio[Play Audio Response]
    PlayAudio --> Complete
    
    Complete --> LogUsage[Log Usage Data]
    LogUsage --> UpdateStats[Update Statistics]
    UpdateStats --> Ready[Ready for Next Query]
    
    Ready --> UserInput
    
    style ProcessQuery fill:#90EE90
    style StreamResponse fill:#FFD700
    style LogUsage fill:#87CEEB
```

---

## User Interaction Flow

### Chat Session Lifecycle

```mermaid
sequenceDiagram
    participant U as User
    participant W as WytAI Widget
    participant F as Frontend
    participant B as Backend
    participant AI as AI API (OpenAI/Claude/Gemini)
    participant DB as Database
    
    Note over U,DB: Phase 1: Initialize Session
    U->>W: Click WytAI Widget
    W->>F: Open Chat Interface
    F->>B: GET /api/wytai/session
    B->>DB: Check existing session
    alt Session Exists
        DB-->>B: Return session_id
    else New Session
        B->>DB: CREATE new session
        DB-->>B: New session_id
    end
    B-->>F: {sessionId, messageHistory}
    F-->>W: Display Chat UI
    
    Note over U,DB: Phase 2: User Query
    U->>W: Type: "Show me all users"
    W->>F: Submit Message
    F->>F: Add to chat history
    F->>B: POST /api/wytai/chat
    Note right of B: Body: {<br/>  message: "Show me all users",<br/>  model: "gpt-4o",<br/>  sessionId: "sess_123"<br/>}
    
    Note over U,DB: Phase 3: AI Processing
    B->>B: Build Context Prompt
    Note right of B: System Context:<br/>- User role: Super Admin<br/>- Current page: /engine/users<br/>- Platform: WytNet Engine
    
    B->>B: Check Rate Limit (10 req/min)
    B->>AI: POST /chat/completions (streaming)
    Note right of AI: Model: gpt-4o<br/>Stream: true
    
    AI-->>B: Stream chunk 1: "Here are"
    B-->>F: SSE: data: {"delta": "Here are"}
    F-->>W: Display "Here are"
    
    AI-->>B: Stream chunk 2: " all the users"
    B-->>F: SSE: data: {"delta": " all the users"}
    F-->>W: Display "Here are all the users"
    
    AI-->>B: Stream chunk 3: " in the platform..."
    B-->>F: SSE: data: {"delta": " in the platform..."}
    F-->>W: Display full response
    
    AI-->>B: Stream complete
    B-->>F: SSE: data: [DONE]
    
    Note over U,DB: Phase 4: Log & Store
    B->>DB: INSERT INTO wytai_messages
    Note right of DB: Save:<br/>- User message<br/>- AI response<br/>- Model used<br/>- Tokens consumed<br/>- Response time
    
    B->>DB: UPDATE usage_statistics
    DB-->>B: Stats updated
    
    F-->>W: Response Complete
    W-->>U: Show full AI response
```

---

## AI Model Selection

### Multi-Model Support

```mermaid
flowchart TD
    UserQuery([User Sends Message]) --> CheckModel{Which Model?}
    
    CheckModel -->|GPT-4o| GPTConfig["OpenAI GPT-4o<br/>- Speed: ⚡⚡⚡⚡<br/>- Cost: $$<br/>- Context: 128k tokens<br/>- Best for: General queries"]
    
    CheckModel -->|Claude 3.5| ClaudeConfig["Anthropic Claude 3.5 Sonnet<br/>- Speed: ⚡⚡⚡<br/>- Cost: $$$<br/>- Context: 200k tokens<br/>- Best for: Long context"]
    
    CheckModel -->|Gemini 2.0| GeminiConfig["Google Gemini 2.0 Flash<br/>- Speed: ⚡⚡⚡⚡⚡<br/>- Cost: $<br/>- Context: 1M tokens<br/>- Best for: Large data"]
    
    GPTConfig --> BuildPrompt[Build Prompt with Context]
    ClaudeConfig --> BuildPrompt
    GeminiConfig --> BuildPrompt
    
    BuildPrompt --> SystemPrompt["System Prompt:<br/>You are WytAI, an AI assistant for WytNet platform.<br/>User Role: {role}<br/>Current Page: {page}<br/>Available Actions: {actions}"]
    
    SystemPrompt --> APICall[Call AI API]
    APICall --> StreamResponse[Stream Response]
    StreamResponse --> DisplayUI[Display in Chat]
    
    style GPTConfig fill:#90EE90
    style ClaudeConfig fill:#87CEEB
    style GeminiConfig fill:#FFD700
```

---

## Voice Interaction Flow

### Speech-to-Text & Text-to-Speech

```mermaid
flowchart TD
    Start([User Interaction]) --> InputChoice{Input Method}
    
    InputChoice -->|Voice| StartRecording[Click Microphone Icon]
    InputChoice -->|Text| TypeText[Type in Chat Box]
    
    StartRecording --> CheckPermission{Microphone Permission?}
    CheckPermission -->|Denied| ShowError[Show: Enable microphone access]
    CheckPermission -->|Granted| CaptureAudio[Start Audio Capture]
    
    CaptureAudio --> Recording["Recording...<br/>(Max 60 seconds)"]
    Recording --> StopRecording[User Stops or Timeout]
    
    StopRecording --> WebSpeechSTT[Web Speech API<br/>SpeechRecognition]
    WebSpeechSTT --> SelectLang{Language?}
    
    SelectLang -->|Tamil| TranscribeTamil[Transcribe Tamil Audio]
    SelectLang -->|English| TranscribeEnglish[Transcribe English Audio]
    
    TranscribeTamil --> TextResult[Text Result]
    TranscribeEnglish --> TextResult
    TypeText --> TextResult
    
    TextResult --> SendToAI[Send to AI]
    SendToAI --> AIResponse[Get AI Response]
    
    AIResponse --> DisplayText[Display Text Response]
    DisplayText --> CheckVoiceOut{Voice Output Enabled?}
    
    CheckVoiceOut -->|Yes| WebSpeechTTS[Web Speech API<br/>SpeechSynthesis]
    CheckVoiceOut -->|No| Complete[Response Complete]
    
    WebSpeechTTS --> SelectVoice{Voice Language?}
    SelectVoice -->|Tamil| TamilVoice[Tamil Voice Output]
    SelectVoice -->|English| EnglishVoice[English Voice Output]
    
    TamilVoice --> PlayAudio[Play Audio]
    EnglishVoice --> PlayAudio
    PlayAudio --> Complete
    
    ShowError --> End([End])
    Complete --> End
    
    style CaptureAudio fill:#90EE90
    style AIResponse fill:#FFD700
    style PlayAudio fill:#87CEEB
```

---

## Rate Limiting System

### Request Throttling

```mermaid
flowchart TD
    Request([User Sends Message]) --> CheckUser[Identify User]
    CheckUser --> GetLimits[Get Rate Limit Config]
    
    GetLimits --> Limits["Rate Limits:<br/>- 10 requests per minute<br/>- 100 requests per hour<br/>- 1000 requests per day"]
    
    Limits --> CheckMinute{Requests in last minute?}
    CheckMinute -->|< 10| CheckHour{Requests in last hour?}
    CheckMinute -->|>= 10| Block1[Block: Too many requests per minute]
    
    CheckHour -->|< 100| CheckDay{Requests in last day?}
    CheckHour -->|>= 100| Block2[Block: Too many requests per hour]
    
    CheckDay -->|< 1000| AllowRequest[Allow Request]
    CheckDay -->|>= 1000| Block3[Block: Daily limit exceeded]
    
    AllowRequest --> IncrementCounter[Increment Request Counter]
    IncrementCounter --> ProcessAI[Process AI Query]
    
    Block1 --> ReturnError[Return 429: Rate Limit Exceeded]
    Block2 --> ReturnError
    Block3 --> ReturnError
    
    ReturnError --> ShowMessage["Show User:<br/>'Rate limit reached. Please wait.'"]
    ProcessAI --> Success[AI Response Delivered]
    
    ShowMessage --> End([End])
    Success --> End
    
    style AllowRequest fill:#90EE90
    style ProcessAI fill:#90EE90
    style ReturnError fill:#FF6B6B
```

---

## Database Schema

### WytAI Tables

```sql
-- WytAI Sessions
CREATE TABLE wytai_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);
CREATE INDEX idx_wytai_session_user ON wytai_sessions(user_id);

-- WytAI Messages
CREATE TABLE wytai_messages (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100) NOT NULL REFERENCES wytai_sessions(session_id),
  role VARCHAR(20) NOT NULL,  -- 'user' or 'assistant'
  content TEXT NOT NULL,
  model VARCHAR(50),  -- 'gpt-4o', 'claude-3.5-sonnet', 'gemini-2.0-flash'
  tokens_used INTEGER,
  response_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_wytai_messages_session ON wytai_messages(session_id);
CREATE INDEX idx_wytai_messages_created ON wytai_messages(created_at DESC);

-- Usage Statistics
CREATE TABLE wytai_usage_stats (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  model VARCHAR(50) NOT NULL,
  total_requests INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost_usd DECIMAL(10,4) DEFAULT 0,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL
);
CREATE INDEX idx_wytai_usage_user ON wytai_usage_stats(user_id);
CREATE INDEX idx_wytai_usage_period ON wytai_usage_stats(period_start, period_end);
```

---

## Backend Implementation

### AI Chat Endpoint

```typescript
// routes/wytai.ts
app.post('/api/wytai/chat', async (req, res) => {
  const { message, model = 'gpt-4o', sessionId } = req.body;
  const userId = req.session.userId;
  
  // Check rate limit
  const rateLimitOk = await checkRateLimit(userId);
  if (!rateLimitOk) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }
  
  // Build context
  const systemPrompt = buildSystemPrompt(req.session);
  
  // Select AI provider
  const aiProvider = getAIProvider(model);
  
  // Set up streaming response
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  let fullResponse = '';
  let tokensUsed = 0;
  const startTime = Date.now();
  
  try {
    // Stream AI response
    const stream = await aiProvider.chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      stream: true
    });
    
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      fullResponse += delta;
      
      // Send to client
      res.write(`data: ${JSON.stringify({ delta })}\n\n`);
    }
    
    // Complete
    res.write('data: [DONE]\n\n');
    res.end();
    
    tokensUsed = estimateTokens(message + fullResponse);
    const responseTime = Date.now() - startTime;
    
    // Log to database
    await logAIMessage({
      sessionId,
      userMessage: message,
      aiResponse: fullResponse,
      model,
      tokensUsed,
      responseTime
    });
    
  } catch (error) {
    console.error('AI chat error:', error);
    res.write(`data: ${JSON.stringify({ error: 'AI error occurred' })}\n\n`);
    res.end();
  }
});
```

---

## Frontend Implementation

### WytAI Chat Widget

```typescript
// components/WytAIWidget.tsx
export function WytAIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gpt-4o' | 'claude-3.5-sonnet' | 'gemini-2.0-flash'>('gpt-4o');
  
  async function sendMessage() {
    if (!input.trim()) return;
    
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    try {
      const response = await fetch('/api/wytai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          model: selectedModel,
          sessionId: sessionStorage.getItem('wytai_session')
        })
      });
      
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            
            const parsed = JSON.parse(data);
            aiResponse += parsed.delta;
            
            // Update UI in real-time
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant') {
                return [...prev.slice(0, -1), { ...last, content: aiResponse }];
              } else {
                return [...prev, { role: 'assistant', content: aiResponse }];
              }
            });
          }
        }
      }
      
      // Optional: Text-to-speech
      if (voiceOutputEnabled) {
        speak(aiResponse);
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to get AI response');
    }
  }
  
  function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Voice input not supported');
      return;
    }
    
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';  // or 'ta-IN' for Tamil
    recognition.continuous = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    
    recognition.start();
  }
  
  return (
    <>
      <FloatingButton onClick={() => setIsOpen(true)}>
        <Bot /> WytAI
      </FloatingButton>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl h-[600px]">
          <DialogHeader>
            <DialogTitle>WytAI Assistant</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto">
            {messages.map((msg, i) => (
              <ChatMessage key={i} role={msg.role} content={msg.content} />
            ))}
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="claude-3.5-sonnet">Claude 3.5</SelectItem>
              <SelectItem value="gemini-2.0-flash">Gemini 2.0</SelectItem>
            </Select>
            
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask WytAI anything..."
            />
            
            <Button onClick={startVoiceInput} variant="outline">
              <Mic className={isListening ? 'text-red-500' : ''} />
            </Button>
            
            <Button onClick={sendMessage}>
              <Send />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

---

## Cost Tracking

### AI Model Pricing

| Model | Cost per 1K Tokens | Avg Response Cost |
|-------|-------------------|-------------------|
| GPT-4o | $0.005 (input) / $0.015 (output) | $0.02 |
| Claude 3.5 Sonnet | $0.003 (input) / $0.015 (output) | $0.018 |
| Gemini 2.0 Flash | $0.0001 (input) / $0.0004 (output) | $0.0005 |

---

## Related Flows

- [Super Admin Panel Switching](/en/use-case-flows/admin-panel-switching) - Admin context
- [Audit Logs System](/en/use-case-flows/audit-logs-system) - Usage tracking
- [RBAC Role-Based Access Control](/en/use-case-flows/rbac-permissions) - Access control

---

**Next:** Explore [Module Installation & Activation](/en/use-case-flows/module-installation) for platform extensibility.
