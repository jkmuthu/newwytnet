import PptxGenJSModule from "pptxgenjs";
import * as fs from "fs";
import * as path from "path";

const PptxGenJS = (PptxGenJSModule as any).default || PptxGenJSModule;
const pptx = new PptxGenJS();

pptx.author = "WytNet | JK Muthu";
pptx.company = "WytNet Platform";
pptx.subject = "Investor Presentation 2025 - Revolutionizing the Human Experience";
pptx.title = "WytLife × WytGlass × WytNet - Investor Presentation";

const COLORS = {
  primary: "1D8BD1",
  wytlife: "1D8BD1",
  secondary: "7C3AED",
  accent: "EC4899",
  success: "10B981",
  warning: "F59E0B",
  dark: "1F2937",
  light: "F9FAFB",
  white: "FFFFFF",
  blue: "3B82F6",
  purple: "8B5CF6",
  pink: "EC4899",
  green: "10B981",
  orange: "F97316",
  teal: "14B8A6",
  cyan: "06B6D4",
  indigo: "6366F1",
  gradient1: "4F46E5",
  gradient2: "7C3AED"
};

const WYTLIFE_LOGO_PATH = path.join(process.cwd(), "attached_assets", "logo_1764073078385.jpg");

function createTitleSlide() {
  const slide = pptx.addSlide();
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { type: "solid", color: COLORS.wytlife }
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: 0.15,
    fill: { type: "solid", color: COLORS.white }
  });
  
  if (fs.existsSync(WYTLIFE_LOGO_PATH)) {
    slide.addImage({
      path: WYTLIFE_LOGO_PATH,
      x: 3.5, y: 1.2, w: 3, h: 1.2
    });
  }
  
  slide.addText("REVOLUTIONIZING THE HUMAN EXPERIENCE", {
    x: 0.5, y: 2.6, w: 9, h: 0.5,
    fontSize: 20, bold: true, color: COLORS.white,
    align: "center"
  });
  
  slide.addText("The Next Human Interface", {
    x: 0.5, y: 3.2, w: 9, h: 0.4,
    fontSize: 18, color: COLORS.white,
    align: "center"
  });
  
  slide.addText("WytLife  ×  WytGlass  ×  WytNet", {
    x: 0.5, y: 3.8, w: 9, h: 0.5,
    fontSize: 24, bold: true, color: COLORS.white,
    align: "center"
  });
  
  slide.addText("Investor Presentation 2025", {
    x: 0.5, y: 4.8, w: 9, h: 0.3,
    fontSize: 14, color: COLORS.white,
    align: "center"
  });
}

function createProblemSlide() {
  const slide = pptx.addSlide();
  
  slide.addText("Technology Evolved, Human Experience Didn't", {
    x: 0.5, y: 0.3, w: 9, h: 0.6,
    fontSize: 28, bold: true, color: COLORS.dark
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.1, w: 4.2, h: 3.4,
    fill: { color: "FEE2E2" },
    line: { color: "EF4444", width: 2 }
  });
  
  slide.addText("Digital Fragmentation Crisis", {
    x: 0.7, y: 1.2, w: 4, h: 0.5,
    fontSize: 16, bold: true, color: "DC2626"
  });
  
  slide.addText([
    "• Juggling countless apps, passwords, platforms\n\n",
    "• Overload leads to burnout, lost productivity\n\n",
    "• No unified platform for life's essentials\n\n",
    "• Death ends legacy & knowledge transfer\n\n",
    "• Multi-platform subscription fatigue"
  ].join(""), {
    x: 0.7, y: 1.8, w: 4, h: 2.5,
    fontSize: 11, color: COLORS.dark, valign: "top"
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.2, y: 1.1, w: 4.2, h: 3.4,
    fill: { color: "FEF3C7" },
    line: { color: COLORS.warning, width: 2 }
  });
  
  slide.addText("AI Exists, Not for Humans", {
    x: 5.4, y: 1.2, w: 4, h: 0.5,
    fontSize: 16, bold: true, color: "D97706"
  });
  
  slide.addText([
    "• AI is disconnected from our lives\n\n",
    "• We adapt to technology, not vice-versa\n\n",
    "• No system truly understands people\n\n",
    "• Digital immortality remains science fiction\n\n",
    "• Data silos limit business intelligence"
  ].join(""), {
    x: 5.4, y: 1.8, w: 4, h: 2.5,
    fontSize: 11, color: COLORS.dark, valign: "top"
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 4.7, w: 8.9, h: 0.6,
    fill: { color: COLORS.wytlife }
  });
  
  slide.addText("We need a system that understands people — where technology adapts to humans.", {
    x: 0.7, y: 4.8, w: 8.5, h: 0.4,
    fontSize: 14, bold: true, color: COLORS.white, align: "center"
  });
}

function createWytLifeIntroSlide() {
  const slide = pptx.addSlide();
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { type: "solid", color: COLORS.wytlife }
  });
  
  if (fs.existsSync(WYTLIFE_LOGO_PATH)) {
    slide.addImage({
      path: WYTLIFE_LOGO_PATH,
      x: 3.5, y: 0.8, w: 3, h: 1.2
    });
  }
  
  slide.addText("Your Life... Reimagined", {
    x: 0.5, y: 2.2, w: 9, h: 0.6,
    fontSize: 32, bold: true, color: COLORS.white, align: "center"
  });
  
  const features = [
    { icon: "🧠", title: "Unified Intelligence", desc: "Integrates AI, personal data, habits, goals & relationships for a seamless experience." },
    { icon: "🌐", title: "One Ecosystem", desc: "Unifies health, work, social, and daily routines into a single intelligent platform." },
    { icon: "❤️", title: "Human-First Design", desc: "Technology built to understand you, anticipate needs, and amplify your potential." }
  ];
  
  features.forEach((f, i) => {
    const y = 3 + i * 0.85;
    slide.addShape(pptx.ShapeType.rect, {
      x: 1, y, w: 8, h: 0.75,
      fill: { color: COLORS.white }
    });
    slide.addText(f.icon + "  " + f.title, {
      x: 1.2, y: y + 0.05, w: 7.6, h: 0.35,
      fontSize: 14, bold: true, color: COLORS.wytlife
    });
    slide.addText(f.desc, {
      x: 1.2, y: y + 0.4, w: 7.6, h: 0.3,
      fontSize: 10, color: COLORS.dark
    });
  });
}

function createWytGlassSlide() {
  const slide = pptx.addSlide();
  
  slide.addText("WytGlass: The Next Human Interface", {
    x: 0.5, y: 0.3, w: 9, h: 0.5,
    fontSize: 28, bold: true, color: COLORS.dark
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 0.9, w: 9, h: 0.6,
    fill: { color: COLORS.wytlife }
  });
  
  slide.addText("Human + AI + Reality = New Interface", {
    x: 0.7, y: 1, w: 8.6, h: 0.4,
    fontSize: 18, bold: true, color: COLORS.white, align: "center"
  });
  
  slide.addText("WytGlass transforms interaction with information. Lightweight smart eyewear projects your digital life — tasks, messages, reminders, and AI guidance — seamlessly onto the real world.", {
    x: 0.5, y: 1.65, w: 9, h: 0.6,
    fontSize: 12, color: COLORS.dark, align: "center"
  });
  
  const features = [
    { title: "Heads-Up Intelligence", desc: "Real-time information appears when and where needed, maintaining focus without extra devices.", color: "DBEAFE" },
    { title: "Contextual Awareness", desc: "Navigation, meeting reminders, and insights guide your day with perfect timing.", color: "EDE9FE" },
    { title: "Personal AI Companion", desc: "Your AI assistant in your vision provides contextual insights, reminders, and daily guidance.", color: "D1FAE5" }
  ];
  
  features.forEach((f, i) => {
    const x = 0.5 + i * 3.1;
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 2.4, w: 3, h: 1.8,
      fill: { color: f.color },
      line: { color: COLORS.wytlife, width: 1 }
    });
    slide.addText(f.title, {
      x: x + 0.1, y: 2.5, w: 2.8, h: 0.4,
      fontSize: 12, bold: true, color: COLORS.dark, align: "center"
    });
    slide.addText(f.desc, {
      x: x + 0.1, y: 2.95, w: 2.8, h: 1.1,
      fontSize: 10, color: COLORS.dark, valign: "top", align: "center"
    });
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 4.4, w: 9, h: 0.8,
    fill: { color: "F3F4F6" }
  });
  
  slide.addText("Productivity Layer", {
    x: 0.7, y: 4.5, w: 8.6, h: 0.3,
    fontSize: 14, bold: true, color: COLORS.dark, align: "center"
  });
  
  slide.addText("A transparent interface enhancing reality, perfect for professionals, students, and knowledge workers.", {
    x: 0.7, y: 4.8, w: 8.6, h: 0.3,
    fontSize: 11, color: COLORS.dark, align: "center"
  });
}

function createWytLifeGlassCombinationSlide() {
  const slide = pptx.addSlide();
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "50%", h: "100%",
    fill: { type: "solid", color: COLORS.wytlife }
  });
  
  slide.addText("Your Life.", {
    x: 0.3, y: 1.2, w: 4.5, h: 0.5,
    fontSize: 32, bold: true, color: COLORS.white
  });
  
  slide.addText("Your Vision.", {
    x: 0.3, y: 1.7, w: 4.5, h: 0.5,
    fontSize: 32, bold: true, color: COLORS.white
  });
  
  slide.addText("Your Flow.", {
    x: 0.3, y: 2.2, w: 4.5, h: 0.5,
    fontSize: 32, bold: true, color: COLORS.white
  });
  
  slide.addText("WytLife × WytGlass", {
    x: 0.3, y: 3, w: 4.5, h: 0.4,
    fontSize: 16, color: COLORS.white
  });
  
  slide.addText("The Unbeatable Combination", {
    x: 0.3, y: 3.4, w: 4.5, h: 0.4,
    fontSize: 14, italic: true, color: COLORS.white
  });
  
  const features = [
    { icon: "👁️", title: "Routines Visible", desc: "Daily habits, schedules, and priorities appear in your line of sight." },
    { icon: "🎤", title: "Instant Capture", desc: "Capture tasks, ideas, and reminders with voice and gesture controls." },
    { icon: "🧭", title: "Contextual Guidance", desc: "Navigation, meeting reminders, and insights guide your day." },
    { icon: "🤖", title: "AI Life Coach", desc: "AI monitors behaviors, optimizing productivity with personalized recommendations." }
  ];
  
  features.forEach((f, i) => {
    const y = 1 + i * 1.05;
    slide.addShape(pptx.ShapeType.rect, {
      x: 5.2, y, w: 4.5, h: 0.95,
      fill: { color: "F9FAFB" }
    });
    slide.addText(f.icon + "  " + f.title, {
      x: 5.4, y: y + 0.1, w: 4.1, h: 0.35,
      fontSize: 12, bold: true, color: COLORS.wytlife
    });
    slide.addText(f.desc, {
      x: 5.4, y: y + 0.45, w: 4.1, h: 0.4,
      fontSize: 9, color: COLORS.dark
    });
  });
}

function createWytNetInfraSlide() {
  const slide = pptx.addSlide();
  
  slide.addText("WytNet: The Infrastructure Behind Everything", {
    x: 0.5, y: 0.3, w: 9, h: 0.5,
    fontSize: 26, bold: true, color: COLORS.dark
  });
  
  slide.addText("A Multi-SaaS Engine for a Billion Lives", {
    x: 0.5, y: 0.8, w: 9, h: 0.3,
    fontSize: 16, color: COLORS.wytlife
  });
  
  slide.addText("WytNet is the powerful backbone enabling WytLife and WytGlass, providing unified digital infrastructure across identity, communication, commerce, and connectivity.", {
    x: 0.5, y: 1.2, w: 9, h: 0.5,
    fontSize: 11, color: COLORS.dark, align: "center"
  });
  
  const pillars = [
    { title: "Digital Identity", desc: "WytPass: secure, unified authentication across all platforms.", color: "DBEAFE", icon: "🔐" },
    { title: "Social & CRM", desc: "WytCircle, Streams, Pages: connect people, businesses, communities.", color: "EDE9FE", icon: "👥" },
    { title: "Business Tools", desc: "Full-stack SaaS: CRM, ERP, billing, payments, no-code websites.", color: "D1FAE5", icon: "💼" }
  ];
  
  pillars.forEach((p, i) => {
    const x = 0.5 + i * 3.1;
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 1.85, w: 3, h: 1.5,
      fill: { color: p.color },
      line: { color: COLORS.wytlife, width: 1 }
    });
    slide.addText(p.icon + " " + p.title, {
      x: x + 0.1, y: 1.95, w: 2.8, h: 0.4,
      fontSize: 11, bold: true, color: COLORS.dark, align: "center"
    });
    slide.addText(p.desc, {
      x: x + 0.1, y: 2.35, w: 2.8, h: 0.9,
      fontSize: 9, color: COLORS.dark, valign: "top", align: "center"
    });
  });
  
  const pillars2 = [
    { title: "Marketplaces", desc: "OwnerNet, GigNet, MemberNet: interconnected commerce ecosystems.", color: "FEF3C7", icon: "🛒" },
    { title: "Infrastructure", desc: "WytCloud, WytScore, WytPoints, WytPay: enterprise-grade services.", color: "FCE7F3", icon: "☁️" }
  ];
  
  pillars2.forEach((p, i) => {
    const x = 2 + i * 3.5;
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 3.5, w: 3.3, h: 1.3,
      fill: { color: p.color },
      line: { color: COLORS.wytlife, width: 1 }
    });
    slide.addText(p.icon + " " + p.title, {
      x: x + 0.1, y: 3.6, w: 3.1, h: 0.35,
      fontSize: 11, bold: true, color: COLORS.dark, align: "center"
    });
    slide.addText(p.desc, {
      x: x + 0.1, y: 3.95, w: 3.1, h: 0.7,
      fontSize: 9, color: COLORS.dark, valign: "top", align: "center"
    });
  });
}

function createMarketOpportunitySlide() {
  const slide = pptx.addSlide();
  
  slide.addText("A $300 Billion+ Global Opportunity", {
    x: 0.5, y: 0.3, w: 9, h: 0.6,
    fontSize: 32, bold: true, color: COLORS.dark, align: "center"
  });
  
  const markets = [
    { value: "$70B", label: "Wearables Market", desc: "Smart glasses and AR drive explosive growth in consumer tech.", color: "DBEAFE" },
    { value: "$150B", label: "AI Life Management", desc: "AI platforms are reshaping how people work and live.", color: "EDE9FE" },
    { value: "$235B", label: "SaaS Ecosystem", desc: "Cloud-based business infrastructure dominates enterprise tech spending.", color: "D1FAE5" },
    { value: "$45B", label: "Digital Identity", desc: "Unified authentication and identity management are rapidly expanding.", color: "FEF3C7" }
  ];
  
  markets.forEach((m, i) => {
    const x = 0.3 + i * 2.4;
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 1.1, w: 2.3, h: 2.8,
      fill: { color: m.color },
      line: { color: COLORS.wytlife, width: 1 }
    });
    slide.addText(m.value, {
      x: x + 0.1, y: 1.2, w: 2.1, h: 0.6,
      fontSize: 28, bold: true, color: COLORS.wytlife, align: "center"
    });
    slide.addText(m.label, {
      x: x + 0.1, y: 1.8, w: 2.1, h: 0.5,
      fontSize: 11, bold: true, color: COLORS.dark, align: "center"
    });
    slide.addText(m.desc, {
      x: x + 0.1, y: 2.35, w: 2.1, h: 1.4,
      fontSize: 9, color: COLORS.dark, valign: "top", align: "center"
    });
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 4.1, w: 9, h: 1.1,
    fill: { color: COLORS.wytlife }
  });
  
  slide.addText("We converge four massive tech trends, creating an unprecedented opportunity.", {
    x: 0.7, y: 4.2, w: 8.6, h: 0.4,
    fontSize: 14, bold: true, color: COLORS.white, align: "center"
  });
  
  slide.addText("The timing is now. Total Addressable Market: $300B+", {
    x: 0.7, y: 4.65, w: 8.6, h: 0.4,
    fontSize: 16, bold: true, color: COLORS.white, align: "center"
  });
}

function createReadinessSlide() {
  const slide = pptx.addSlide();
  
  slide.addText("Vision Ready. Technology Ready. Ecosystem Ready.", {
    x: 0.5, y: 0.3, w: 9, h: 0.5,
    fontSize: 26, bold: true, color: COLORS.dark, align: "center"
  });
  
  const items = [
    { num: "01", title: "WytNet Core Architecture", desc: "Fully operational multi-SaaS platform with 51 modules.", status: "✓ Complete" },
    { num: "02", title: "WytApps & WytHubs Ecosystem", desc: "39 integrated applications ready for scale across 17 categories.", status: "✓ Complete" },
    { num: "03", title: "WytLife Validation", desc: "Life OS concept validated. Founder's MyClone actively in use.", status: "✓ Complete" },
    { num: "04", title: "WytGlass Prototype", desc: "UI/UX complete, hardware partnerships in discussion.", status: "In Progress" },
    { num: "05", title: "WytData DataLake", desc: "2.4M+ trademark records. WytApi gateway ready for monetization.", status: "✓ Complete" }
  ];
  
  items.forEach((item, i) => {
    const y = 0.95 + i * 0.9;
    const isComplete = item.status.includes("Complete");
    
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y, w: 0.7, h: 0.8,
      fill: { color: isComplete ? COLORS.wytlife : "FEF3C7" }
    });
    
    slide.addText(item.num, {
      x: 0.5, y: y + 0.2, w: 0.7, h: 0.4,
      fontSize: 18, bold: true, color: isComplete ? COLORS.white : COLORS.dark, align: "center"
    });
    
    slide.addShape(pptx.ShapeType.rect, {
      x: 1.3, y, w: 8.2, h: 0.8,
      fill: { color: isComplete ? "D1FAE5" : "FEF3C7" }
    });
    
    slide.addText(item.title, {
      x: 1.5, y: y + 0.1, w: 5.5, h: 0.35,
      fontSize: 13, bold: true, color: COLORS.dark
    });
    
    slide.addText(item.desc, {
      x: 1.5, y: y + 0.45, w: 5.5, h: 0.3,
      fontSize: 9, color: COLORS.dark
    });
    
    slide.addText(item.status, {
      x: 7.2, y: y + 0.2, w: 2, h: 0.4,
      fontSize: 10, bold: true, color: isComplete ? COLORS.green : COLORS.orange, align: "right"
    });
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 5, w: 9, h: 0.3,
    fill: { color: COLORS.wytlife }
  });
  
  slide.addText("Expert Team: Proven execution, deep technical expertise.", {
    x: 0.7, y: 5.02, w: 8.6, h: 0.25,
    fontSize: 11, bold: true, color: COLORS.white, align: "center"
  });
}

function createDataLakeSlide() {
  const slide = pptx.addSlide();
  
  slide.addText("WytData: DataLake Platform", {
    x: 0.5, y: 0.3, w: 9, h: 0.5,
    fontSize: 28, bold: true, color: COLORS.dark
  });
  
  slide.addText("India's Largest Trademark Database + Global Reference Data", {
    x: 0.5, y: 0.8, w: 9, h: 0.3,
    fontSize: 16, color: COLORS.wytlife
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.2, w: 4.2, h: 3.3,
    fill: { color: "D1FAE5" },
    line: { color: COLORS.green, width: 2 }
  });
  
  slide.addText("🏛️ Trademark DataLake - India", {
    x: 0.7, y: 1.3, w: 4, h: 0.4,
    fontSize: 14, bold: true, color: COLORS.dark
  });
  
  slide.addText([
    "• 2.4M+ Records - Comprehensive Indian trademark database\n\n",
    "• Real-time Updates - Synced with IP India & TMView\n\n",
    "• Full Lifecycle Tracking - Application → Registration → Renewal\n\n",
    "• 45 Nice Classifications - Complete goods/services categorization\n\n",
    "• Bulk Import/Export - CSV, JSON, API access"
  ].join(""), {
    x: 0.7, y: 1.8, w: 4, h: 2.5,
    fontSize: 10, color: COLORS.dark, valign: "top"
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.2, y: 1.2, w: 4.2, h: 3.3,
    fill: { color: "DBEAFE" },
    line: { color: COLORS.blue, width: 2 }
  });
  
  slide.addText("🌐 38+ Global Datasets", {
    x: 5.4, y: 1.3, w: 4, h: 0.4,
    fontSize: 14, bold: true, color: COLORS.dark
  });
  
  slide.addText([
    "✓ Locations: Countries, States, Cities, Timezones\n\n",
    "✓ Languages: 20+ global languages\n\n",
    "✓ Currencies: 20+ world currencies\n\n",
    "✓ Industries: 15+ sector classifications\n\n",
    "✓ Company Sizes: Startup to Enterprise\n\n",
    "Coming Soon: Patent DB, Company Registry, GST Directory"
  ].join(""), {
    x: 5.4, y: 1.8, w: 4, h: 2.5,
    fontSize: 10, color: COLORS.dark, valign: "top"
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 4.7, w: 8.9, h: 0.5,
    fill: { color: COLORS.wytlife }
  });
  
  slide.addText("Proprietary Data Moat: A defensible competitive advantage in the Indian market", {
    x: 0.7, y: 4.8, w: 8.5, h: 0.3,
    fontSize: 12, bold: true, color: COLORS.white, align: "center"
  });
}

function createWytApiSlide() {
  const slide = pptx.addSlide();
  
  slide.addText("WytApi: API Monetization Gateway", {
    x: 0.5, y: 0.3, w: 9, h: 0.5,
    fontSize: 28, bold: true, color: COLORS.dark
  });
  
  slide.addText("Enterprise Data Access with Tiered Pricing", {
    x: 0.5, y: 0.8, w: 9, h: 0.3,
    fontSize: 16, color: COLORS.wytlife
  });
  
  const tiers = [
    { name: "Free Tier", price: "$0", features: ["100 API calls/day", "Basic search endpoints", "Community support", "Rate limited"], color: "F3F4F6", accent: COLORS.dark },
    { name: "Professional", price: "$99/mo", features: ["10,000 API calls/day", "All search endpoints", "Priority support", "Bulk export access"], color: "DBEAFE", accent: COLORS.wytlife },
    { name: "Enterprise", price: "$999/mo", features: ["Unlimited API calls", "Dedicated endpoints", "White-label access", "Custom integrations"], color: COLORS.wytlife, accent: COLORS.white }
  ];
  
  tiers.forEach((tier, i) => {
    const x = 0.5 + i * 3.1;
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 1.2, w: 3, h: 2.8,
      fill: { color: tier.color },
      line: { color: COLORS.wytlife, width: 2 }
    });
    
    slide.addText(tier.name, {
      x: x + 0.1, y: 1.3, w: 2.8, h: 0.35,
      fontSize: 14, bold: true, color: tier.accent, align: "center"
    });
    
    slide.addText(tier.price, {
      x: x + 0.1, y: 1.65, w: 2.8, h: 0.5,
      fontSize: 24, bold: true, color: tier.accent, align: "center"
    });
    
    slide.addText(tier.features.map(f => `✓ ${f}`).join("\n"), {
      x: x + 0.2, y: 2.2, w: 2.6, h: 1.7,
      fontSize: 10, color: tier.accent, valign: "top"
    });
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 4.2, w: 8.9, h: 1,
    fill: { color: "D1FAE5" }
  });
  
  const apiStats = [
    { value: "2.4M+", label: "Trademark Records" },
    { value: "38+", label: "Global Datasets" },
    { value: "99.9%", label: "Uptime SLA" },
    { value: "<50ms", label: "Response Time" }
  ];
  
  apiStats.forEach((stat, i) => {
    slide.addText(stat.value, {
      x: 0.7 + i * 2.2, y: 4.35, w: 2, h: 0.35,
      fontSize: 18, bold: true, color: COLORS.wytlife, align: "center"
    });
    slide.addText(stat.label, {
      x: 0.7 + i * 2.2, y: 4.7, w: 2, h: 0.3,
      fontSize: 10, color: COLORS.dark, align: "center"
    });
  });
}

function createWytAppsSlide() {
  const slide = pptx.addSlide();
  
  slide.addText("WytNet Platform: 39 WytApps Ecosystem", {
    x: 0.5, y: 0.3, w: 9, h: 0.4,
    fontSize: 24, bold: true, color: COLORS.dark
  });
  
  const categories = [
    { title: "Core Platform (4)", apps: "WytPass, WytPanel, WytPoints, WytApps", color: "DBEAFE" },
    { title: "Communication (6)", apps: "WytCall, WytMeet, WytMail, WytCast, WytWall, WytSonic", color: "EDE9FE" },
    { title: "Finance (6)", apps: "WytPay, WytWallet, WytInvoice, WytCoin, WytGold, WytQuote", color: "D1FAE5" },
    { title: "Business (5)", apps: "WytBiz, WytTrace, WytShop, WytStore, Esign Creator", color: "FEF3C7" },
    { title: "Productivity (4)", apps: "WytDuty, WytHive, WytForm, WytCircle", color: "FCE7F3" },
    { title: "Creation (3)", apps: "WytSite, WytBuilder, WytCode", color: "E0E7FF" },
    { title: "Lifestyle (3)", apps: "WytLife, WytGod, WytWorld", color: "FEF9C3" },
    { title: "AI & Analytics (3)", apps: "WytAI, WytScore, WytHash", color: "CFFAFE" },
    { title: "Storage & Data (5)", apps: "WytCloud, WytQRC, WytData, WytAssesser, Currency", color: "CCFBF1" }
  ];
  
  categories.forEach((cat, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const x = 0.5 + col * 3.1;
    const y = 0.85 + row * 1.5;
    
    slide.addShape(pptx.ShapeType.rect, {
      x, y, w: 3, h: 1.4,
      fill: { color: cat.color },
      line: { color: COLORS.wytlife, width: 0.5 }
    });
    
    slide.addText(cat.title, {
      x: x + 0.1, y: y + 0.05, w: 2.8, h: 0.3,
      fontSize: 10, bold: true, color: COLORS.dark
    });
    
    slide.addText(cat.apps, {
      x: x + 0.1, y: y + 0.4, w: 2.8, h: 0.9,
      fontSize: 8, color: COLORS.dark, valign: "top"
    });
  });
}

function createRevenueSlide() {
  const slide = pptx.addSlide();
  
  slide.addText("Business Model & Revenue Streams", {
    x: 0.5, y: 0.3, w: 9, h: 0.5,
    fontSize: 28, bold: true, color: COLORS.dark
  });
  
  const streams = [
    { num: "1", name: "SaaS Subscriptions", desc: "$5-$99/month", color: COLORS.blue },
    { num: "2", name: "WytSuites Bundles", desc: "$199-$999/month", color: COLORS.purple },
    { num: "3", name: "WytLife Premium", desc: "$29-$999/month", color: COLORS.green },
    { num: "4", name: "Enterprise Licenses", desc: "$5K-$50K/year", color: COLORS.orange },
    { num: "5", name: "Transaction Fees", desc: "1-3% per transaction", color: COLORS.pink },
    { num: "6", name: "WytApi Data Services", desc: "$99-$999/month", color: COLORS.teal }
  ];
  
  streams.forEach((stream, i) => {
    const y = 0.95 + i * 0.65;
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y, w: 4.5, h: 0.55,
      fill: { color: "F9FAFB" }
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y, w: 0.1, h: 0.55,
      fill: { color: stream.color }
    });
    slide.addText(`${stream.num}. ${stream.name}`, {
      x: 0.7, y, w: 2.5, h: 0.55,
      fontSize: 11, bold: true, color: COLORS.dark, valign: "middle"
    });
    slide.addText(stream.desc, {
      x: 3.2, y, w: 1.8, h: 0.55,
      fontSize: 10, color: stream.color, valign: "middle", align: "right"
    });
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.3, y: 0.95, w: 4.2, h: 4.2,
    fill: { color: COLORS.wytlife }
  });
  
  slide.addText("Total Addressable Market", {
    x: 5.5, y: 1.1, w: 3.8, h: 0.5,
    fontSize: 16, bold: true, color: COLORS.white
  });
  
  const markets = [
    { name: "Wearables", value: "$70B" },
    { name: "AI Life Management", value: "$150B" },
    { name: "SaaS Ecosystem", value: "$235B" },
    { name: "Digital Identity", value: "$45B" }
  ];
  
  markets.forEach((m, i) => {
    const y = 1.7 + i * 0.65;
    slide.addText(m.name, {
      x: 5.5, y, w: 2.5, h: 0.5,
      fontSize: 11, color: COLORS.white
    });
    slide.addText(m.value, {
      x: 8, y, w: 1.3, h: 0.5,
      fontSize: 14, bold: true, color: COLORS.white, align: "right"
    });
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.5, y: 4.4, w: 3.8, h: 0.6,
    fill: { color: COLORS.white }
  });
  
  slide.addText("$300B+", {
    x: 5.5, y: 4.45, w: 3.8, h: 0.5,
    fontSize: 28, bold: true, color: COLORS.wytlife, align: "center"
  });
}

function createInvestmentSlide() {
  const slide = pptx.addSlide();
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { type: "solid", color: COLORS.wytlife }
  });
  
  slide.addText("Build India's Leading Tech Ecosystem with Us", {
    x: 0.5, y: 0.5, w: 9, h: 0.6,
    fontSize: 26, bold: true, color: COLORS.white, align: "center"
  });
  
  const opportunities = [
    { title: "Strategic Investment", desc: "Seeking visionary investors to scale WytLife, WytGlass, & WytNet globally, embracing the convergence opportunity." },
    { title: "Manufacturing Partnership", desc: "Collaborate on WytGlass hardware manufacturing. Leverage 'Make in India' for global distribution." },
    { title: "Government & Enterprise", desc: "Align with Digital India & Smart Cities. Partner with universities and enterprises for rapid adoption." }
  ];
  
  opportunities.forEach((opp, i) => {
    const x = 0.5 + i * 3.1;
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 1.3, w: 3, h: 2,
      fill: { color: COLORS.white }
    });
    slide.addText(opp.title, {
      x: x + 0.15, y: 1.4, w: 2.7, h: 0.5,
      fontSize: 12, bold: true, color: COLORS.wytlife, align: "center"
    });
    slide.addText(opp.desc, {
      x: x + 0.15, y: 1.9, w: 2.7, h: 1.3,
      fontSize: 9, color: COLORS.dark, valign: "top", align: "center"
    });
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 1, y: 3.5, w: 8, h: 1,
    fill: { color: "0D6EBE" }
  });
  
  slide.addText("Let's build the future from Madurai. India's moment to lead in human-computer interfaces is now. We have the vision, tech, and team. We need ambitious partners.", {
    x: 1.2, y: 3.6, w: 7.6, h: 0.8,
    fontSize: 11, italic: true, color: COLORS.white, align: "center", valign: "middle"
  });
  
  slide.addText("Market Timing is Perfect: India's matured digital infrastructure, manufacturing, and talent ecosystem make this vision achievable.", {
    x: 0.5, y: 4.65, w: 9, h: 0.5,
    fontSize: 10, color: COLORS.white, align: "center"
  });
}

function createThankYouSlide() {
  const slide = pptx.addSlide();
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { type: "solid", color: COLORS.wytlife }
  });
  
  slide.addText("The Future Belongs to Those Who Build It", {
    x: 0.5, y: 0.8, w: 9, h: 0.6,
    fontSize: 28, bold: true, color: COLORS.white, align: "center"
  });
  
  slide.addText("From Madurai to the World", {
    x: 0.5, y: 1.4, w: 9, h: 0.4,
    fontSize: 16, italic: true, color: COLORS.white, align: "center"
  });
  
  slide.addText("We are building India's most ambitious integrated ecosystem for life management, wearable computing, and digital infrastructure. This is more than a product; it's a platform for human potential.", {
    x: 1, y: 2, w: 8, h: 0.8,
    fontSize: 12, color: COLORS.white, align: "center"
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 1.5, y: 3, w: 3.3, h: 1.2,
    fill: { color: COLORS.white }
  });
  
  slide.addText("JK Muthu", {
    x: 1.6, y: 3.1, w: 3.1, h: 0.4,
    fontSize: 16, bold: true, color: COLORS.wytlife, align: "center"
  });
  
  slide.addText("Founder", {
    x: 1.6, y: 3.5, w: 3.1, h: 0.3,
    fontSize: 11, color: COLORS.dark, align: "center"
  });
  
  slide.addText("jkm@wytnet.com", {
    x: 1.6, y: 3.85, w: 3.1, h: 0.25,
    fontSize: 9, color: COLORS.wytlife, align: "center"
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.2, y: 3, w: 3.3, h: 1.2,
    fill: { color: COLORS.white }
  });
  
  slide.addText("M. Senthil Kumar", {
    x: 5.3, y: 3.1, w: 3.1, h: 0.4,
    fontSize: 16, bold: true, color: COLORS.wytlife, align: "center"
  });
  
  slide.addText("Tech Advisor", {
    x: 5.3, y: 3.5, w: 3.1, h: 0.3,
    fontSize: 11, color: COLORS.dark, align: "center"
  });
  
  if (fs.existsSync(WYTLIFE_LOGO_PATH)) {
    slide.addImage({
      path: WYTLIFE_LOGO_PATH,
      x: 3.5, y: 4.4, w: 3, h: 1.2
    });
  }
}

createTitleSlide();
createProblemSlide();
createWytLifeIntroSlide();
createWytGlassSlide();
createWytLifeGlassCombinationSlide();
createWytNetInfraSlide();
createMarketOpportunitySlide();
createReadinessSlide();
createDataLakeSlide();
createWytApiSlide();
createWytAppsSlide();
createRevenueSlide();
createInvestmentSlide();
createThankYouSlide();

const outputDir = path.join(process.cwd(), "docs", "presentations");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const outputPath = path.join(outputDir, "WytNet-Investor-Presentation-2025.pptx");

pptx.writeFile({ fileName: outputPath })
  .then(() => {
    console.log("✅ Professional PowerPoint presentation created successfully!");
    console.log(`📁 Output: ${outputPath}`);
    console.log("📊 14 slides with WytLife branding, WytGlass vision, and $300B+ market opportunity");
  })
  .catch((err: Error) => {
    console.error("Error creating presentation:", err);
  });
