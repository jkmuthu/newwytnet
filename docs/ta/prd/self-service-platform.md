---
requiredLevel: internal
---

# திட்ட தேவைகள் ஆவணம் (PRD): WytNet சுய-சேவை தளம்

**ஆவண பதிப்பு**: 1.0  
**கடைசி புதுப்பிப்பு**: அக்டோபர் 2025  
**நிலை**: திட்டமிடல் கட்டம்  
**முன்னுரிமை**: P0 (முக்கியமான - மூலோபாய முன்முயற்சி)

---

## சுருக்கம்

**WytNet சுய-சேவை தளம்** என்பது WytNet-ஐ developer-சார்ந்த தளத்திலிருந்து **முழுமையாக தன்னாட்சி, AI-சக்திவாய்ந்த, நோ-கோட் தளமாக** மாற்றும் ஒரு மூலோபாய முன்முயற்சியாகும், இதில் Super Admins வெளிப்புற developer உதவி இல்லாமல் (Replit Agent/Assistant) அனைத்து அம்சங்களையும் உருவாக்கி நிர்வகிக்க முடியும்.

**நோக்கம்**: இயற்கை மொழி AI chat மற்றும் visual drag-drop builders மூலம் தள வளர்ச்சி மற்றும் அம்ச மேம்பாட்டை செயல்படுத்துதல், development resources-இல் சார்புநிலையை நீக்குதல்.

**தாக்கம்**: அம்ச மேம்பாட்டு நேரத்தை நாட்கள்/வாரங்களிலிருந்து நிமிடங்கள்/மணிநேரங்களுக்கு குறைத்தல், விரைவான iteration மற்றும் வணிக சுறுசுறுப்பை செயல்படுத்துதல்.

---

## சிக்கல் அறிக்கை

### தற்போதைய நிலை சவால்கள்

**Developers-இல் சார்புநிலை**:
- எல்லா புதிய அம்சங்களுக்கும் Replit Agent அல்லது developer தலையீடு தேவை
- அம்ச கோரிக்கைகள் நீண்ட lead times கொண்டவை
- மாற்றங்களுக்கு தொழில்நுட்ப நிபுணத்துவம் தேவை
- தள evolution development capacity-ஆல் தடுக்கப்படுகிறது

**வரம்புபடுத்தப்பட்ட சுய-சேவை திறன்கள்**:
- ஏற்கனவே உள்ள builders (Module, App, Hub, CMS) முழுமையடையவில்லை
- drag-drop CRUD செயல்பாடு இல்லை
- pages உருவாக்க visual interface இல்லை
- AI-assisted அம்ச உருவாக்கம் இல்லை

**துண்டாடப்பட்ட Admin அனுபவம்**:
- Engine Admin Panel 53+ API endpoints கொண்டுள்ளது ஆனால் சீரற்ற UI
- Navigation அமைப்பு role-based ஆனால் சிறந்த முறையில் ஒழுங்கமைக்கப்படவில்லை
- WytAI Agent floating widget, வரம்புபடுத்தப்பட்ட செயல்பாடு
- அம்ச உருவாக்கலுக்கு ஒருங்கிணைந்த workflow இல்லை

---

## தீர்வு மேலோட்டம்

### மூன்று-கட்ட மாற்றம்

#### **கட்டம் 1: Engine Panel ஒருங்கிணைப்பு** (அடித்தளம்)
சுய-சேவை திறன்களுக்கு உறுதியான அடித்தளத்தை உருவாக்க ஏற்கனவே உள்ள Engine Admin செயல்பாடுகளை ஒழுங்கமைத்து தரப்படுத்துதல்.

#### **கட்டம் 2: WytAI Agent முழு பக்கம்** (நுண்ணறிவு)
AI உதவியாளரை floating widget-இலிருந்து மேம்பட்ட திறன்களுடன் கூடிய முழுமையான முழு-பக்க interface-ஆக மாற்றுதல்.

#### **கட்டம் 3: WytBuilder சுய-சேவை தளம்** (தன்னாட்சி)
Super Admins code இல்லாமல் அம்சங்களை உருவாக்க செயல்படுத்தும் முழுமையான visual drag-drop CRUD builders உருவாக்குதல்.

### இறுதி இலக்கு

**Super Admin சுய-போதுமை**: கட்டம் 3 முடிந்த பிறகு, Super Admins-ஆல்:
- Visual builders மூலம் புதிய modules, apps, pages, hubs உருவாக்க முடியும்
- இயற்கை மொழி AI chat பயன்படுத்தி அம்சங்களை உருவாக்க முடியும்
- Developer சார்புநிலை இல்லாமல் அனைத்து தள அம்சங்களையும் நிர்வகிக்க முடியும்
- Built-in validation மற்றும் testing உடன் உடனடியாக மாற்றங்களை deploy செய்ய முடியும்

---

## கட்டம் 1: Engine Panel ஒருங்கிணைப்பு

**காலவரிசை**: 1-2 வாரங்கள்  
**முன்னுரிமை**: P0 (கட்டம் 2க்கு முன் முடிக்க வேண்டும்)

### நோக்கங்கள்

1. **Navigation தரப்படுத்துதல்**: சீரான, உள்ளுணர்வு menu அமைப்பை உருவாக்குதல்
2. **APIs ஒழுங்கமைத்தல்**: அனைத்து 53+ endpoints-ஐ குழுவாக்கி ஆவணப்படுத்துதல்
3. **Routing மேம்படுத்துதல்**: திறமையான page routing மற்றும் lazy loading செயல்படுத்துதல்
4. **Patterns நிறுவுதல்**: அனைத்து entities-க்கும் நிலையான CRUD patterns வரையறுத்தல்

### தேவைகள்

#### FR1.1: Navigation மறுகட்டமைப்பு

Engine Admin sidebar-ஐ தர்க்கரீதியான, task-சார்ந்த பிரிவுகளாக மறுஒழுங்கமைத்தல்.

**புதிய அமைப்பு**:
```
📊 Dashboard & மேலோட்டம்
  - Platform Dashboard
  - System Health
  - Real-time Analytics
  - Quick Actions

🏗️ தள மேலாண்மை
  - Tenants & Organizations
  - User Management
  - WytPass Authentication
  - Roles & Permissions
  - Hubs Management

🔨 உள்ளடக்கம் & Builders
  - Module Builder
  - App Builder
  - CMS Builder
  - Page Builder
  - Hub Builder
  - DataSets Management

💰 வணிகம் & வர்த்தகம்
  - Pricing Plans
  - Subscriptions
  - Payment Methods
  - Revenue Analytics
  - WytPoints Management

🎨 வடிவமைப்பு & Themes
  - Theme Manager
  - Branding Settings
  - Media Library
  - UI Customization

🔌 Integrations & APIs
  - Third-party Integrations
  - API Management
  - Webhooks
  - Custom Connectors

🤖 AI & தன்னியக்கம்
  - WytAI Agent
  - AI Models Configuration
  - Automation Rules
  - Workflow Builder

⚙️ System & அமைப்புகள்
  - Global Settings
  - Platform Settings
  - Security & Compliance
  - Audit Logs
  - Trash Management
  - Database Tools
```

---

## கட்டம் 2: WytAI Agent முழு பக்கம்

**காலவரிசை**: 2-3 வாரங்கள்  
**முன்னுரிமை**: P0 (கட்டம் 3-ஐ செயல்படுத்துகிறது)

### நோக்கங்கள்

1. **முழு பக்க Interface**: Floating widget-ஐ முழுமையான பக்கமாக மாற்றுதல்
2. **மேம்பட்ட அம்சங்கள்**: Code execution, file uploads, multi-modal input சேர்த்தல்
3. **Context விழிப்புணர்வு**: Engine Admin state உடன் ஆழமான ஒருங்கிணைப்பு
4. **Conversation மேலாண்மை**: மேம்பட்ட history, bookmarks, sharing

### முக்கிய அம்சங்கள்

**Multi-Modal Input**:
- Text input markdown support உடன்
- Voice input (speech-to-text)
- File uploads (images, documents, code files)
- Screen capture
- URL/link parsing

**Rich Message Formatting**:
- Code syntax highlighting (100+ languages)
- Mermaid diagrams rendering
- Table formatting
- LaTeX math equations
- Embedded media

**Context-Aware AI**:
- தற்போதைய page context அறிதல்
- Platform state அடிப்படையில் பரிந்துரைகள்
- Form errors கண்டறிந்து fixes பரிந்துரைத்தல்
- அடுத்த actions பரிந்துரைத்தல்

---

## கட்டம் 3: WytBuilder சுய-சேவை தளம்

**காலவரிசை**: 4-6 வாரங்கள்  
**முன்னுரிமை**: P0 (இறுதி இலக்கு)

### நோக்கங்கள்

1. **Visual Drag-Drop Builders**: முழுமையான no-code interface
2. **AI-Powered Generation**: இயற்கை மொழியிலிருந்து அம்சங்களாக
3. **Full CRUD Automation**: Zero-code database operations
4. **Instant Deployment**: Validation உடன் live மாற்றங்கள்

### தேவைகள்

#### FR3.1: Module Builder (Drag-Drop CRUD)

entities, fields, relationships உடன் modules உருவாக்க visual interface.

**Builder Interface இயல்புகள்**:
- Component palette-இலிருந்து entities-ஐ canvas-க்கு drag செய்தல்
- 20+ field types (text, number, date, relation, file, etc.)
- Visual relationship lines
- Real-time preview
- AI-powered generation
- One-click deployment

**AI Integration உதாரணம்:
```
User: "Product reviews-க்கான ஒரு module உருவாக்கு ratings மற்றும் comments உடன்"

AI பதில்:
✅ நான் Product Reviews module உருவாக்குகிறேன்:

Entities:
• Review (முதன்மை entity)
  - title (text)
  - content (long text)
  - rating (number, 1-5 stars)
  - userId (User க்கு relation)
  - productId (Product க்கு relation)

நீங்கள் விரும்புகிறீர்களா:
1. இந்த module-ஐ உருவாக்க?
2. Schema முதலில் காண?
3. Fields-ஐ customize செய்ய?

[இப்போது உருவாக்கு] [Customize] [Schema காண்பி]
```

#### FR3.2: App Builder (Multi-Module Composition)

பல modules-ஐ முழுமையான applications-ஆக compose செய்தல்.

**இயல்புகள்**:
- சேர்க்க modules தேர்வுசெய்தல்
- Navigation structure வரையறுத்தல்
- Module integration configure செய்தல்
- Custom pages சேர்த்தல்
- App-level permissions அமைத்தல்
- Pricing/subscription configure செய்தல்

#### FR3.3: Page Builder (No-Code UI Designer)

Custom admin pages மற்றும் public pages-க்கான visual page designer.

**இயல்புகள்**:
- 50+ pre-built components
- Responsive design (mobile, tablet, desktop)
- Live preview
- Data binding to modules
- Form builder with validation
- Conditional rendering

#### FR3.4: Hub Builder (Multi-Domain Platform Creation)

Custom domains உடன் முழுமையான white-label platforms உருவாக்குதல்.

**இயல்புகள்**:
- Hub configuration (name, logo, branding)
- Multi-domain support
- App selection மற்றும் installation
- Theme selection/customization
- Role மற்றும் permission management
- SEO optimization

---

## வெற்றி அளவுகோல்கள்

### ஒட்டுமொத்த வெற்றி metrics

**அளவீடு**:
- ✅ 90% புதிய அம்சங்கள் developer உதவி இல்லாமல் உருவாக்கப்படுதல்
- ✅ அம்ச உருவாக்க நேரம் 90% குறைதல்
- ✅ Super Admin திருப்தி: 4.5+ stars
- ✅ உருவாக்கப்பட்ட code-இல் zero critical bugs
- ✅ Super Admins மத்தியில் 80% adoption rate

**தரமான**:
- ✅ தள evolution வேகம் 10x அதிகரித்தல்
- ✅ வணிக சுறுசுறுப்பு வியத்தகு முறையில் மேம்படுதல்
- ✅ Developer team புதுமையில் கவனம், maintenance இல்லை
- ✅ WytNet உண்மையிலேயே சுய-சேவை தளமாகிறது

---

## தொழில்நுட்ப கட்டமைப்பு

### System கூறுகள்

**Frontend**:
- React 18 TypeScript உடன்
- TanStack Query server state-க்கு
- @dnd-kit/core drag-drop-க்கு
- Monaco Editor code editing-க்கு
- shadcn/ui components

**Backend**:
- Express.js TypeScript உடன்
- Drizzle ORM database-க்கு
- Code generation templates
- Safe execution sandbox

**AI Integration**:
- OpenAI GPT-4o code generation-க்கு
- Claude 3.5 Sonnet சிக்கலான logic-க்கு
- Gemini 2.0 Flash விரைவான பதில்களுக்கு

---

## அடுத்த படிகள்

1. **PRD-ஐ அங்கீகரித்தல்**: Stakeholder sign-off பெறுதல்
2. **விரிவான Design Docs உருவாக்குதல்**: Architecture மற்றும் implementation guides
3. **Development Environment அமைத்தல்**: Tools மற்றும் frameworks
4. **கட்டம் 1 செயல்படுத்தல் தொடங்குதல்**: Engine Panel ஒருங்கிணைப்பு
5. **வாராந்திர Progress Reviews**: காலவரிசைக்கு எதிராக கண்காணித்தல்

---

## குறிப்புகள்

- [WytNet தள மேலோட்டம்](/ta/overview)
- [Engine Admin கட்டமைப்பு](/ta/architecture/backend)
- [RBAC System](/ta/architecture/rbac)
- [Module System](/ta/core-concepts)
- [WytAI Agent தற்போதைய நிலை](/ta/features/wytai-agent)

---

**ஆவணக் கட்டுப்பாடு**:
- உருவாக்கப்பட்டது: அக்டோபர் 2025
- ஆசிரியர்: JK Muthu (தள நிறுவனர்)
- மதிப்பாய்வாளர்கள்: Development Team, Product Team
- ஒப்புதல் நிலை: நிலுவையில்
- அடுத்த மதிப்பாய்வு: கட்டம் 1 முடிந்த பிறகு
