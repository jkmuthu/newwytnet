import PptxGenJSModule from "pptxgenjs";
import * as fs from "fs";
import * as path from "path";

const PptxGenJS = (PptxGenJSModule as any).default || PptxGenJSModule;
const pptx = new PptxGenJS();

pptx.author = "WytNet";
pptx.company = "WytNet Platform";
pptx.subject = "Investor Presentation 2025";
pptx.title = "WytNet Platform - Investor Presentation";

const COLORS = {
  primary: "4F46E5",
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
  indigo: "6366F1"
};

function createTitleSlide() {
  const slide = pptx.addSlide();
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { type: "solid", color: COLORS.primary }
  });
  
  slide.addText("WytNet Platform", {
    x: 0.5, y: 2, w: 9, h: 1.2,
    fontSize: 48, bold: true, color: COLORS.white,
    align: "center"
  });
  
  slide.addText("The Future of Digital Life & Business", {
    x: 0.5, y: 3.2, w: 9, h: 0.6,
    fontSize: 24, color: COLORS.white,
    align: "center"
  });
  
  slide.addText('"Where Life Continues Forever & Business Thrives Seamlessly"', {
    x: 0.5, y: 4.2, w: 9, h: 0.5,
    fontSize: 16, italic: true, color: COLORS.white,
    align: "center"
  });
  
  slide.addText("Investor Presentation 2025", {
    x: 0.5, y: 5, w: 9, h: 0.4,
    fontSize: 14, color: COLORS.white,
    align: "center"
  });
}

function createExecutiveSummarySlide() {
  const slide = pptx.addSlide();
  
  slide.addText("Executive Summary", {
    x: 0.5, y: 0.3, w: 9, h: 0.6,
    fontSize: 32, bold: true, color: COLORS.dark
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.1, w: 4.2, h: 3.4,
    fill: { color: "FEF3C7" },
    line: { color: COLORS.warning, width: 1 }
  });
  
  slide.addText("The Problem", {
    x: 0.7, y: 1.2, w: 4, h: 0.4,
    fontSize: 18, bold: true, color: COLORS.dark
  });
  
  slide.addText([
    { text: "• Death ends legacy & knowledge transfer\n", options: { bullet: false } },
    { text: "• Businesses struggle with disconnected tools\n", options: { bullet: false } },
    { text: "• Digital immortality remains science fiction\n", options: { bullet: false } },
    { text: "• Multi-platform subscription fatigue\n", options: { bullet: false } },
    { text: "• Data silos limit business intelligence", options: { bullet: false } }
  ], {
    x: 0.7, y: 1.7, w: 4, h: 2.5,
    fontSize: 12, color: COLORS.dark, valign: "top"
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.2, y: 1.1, w: 4.2, h: 3.4,
    fill: { color: "DCFCE7" },
    line: { color: COLORS.success, width: 1 }
  });
  
  slide.addText("Our Solution", {
    x: 5.4, y: 1.2, w: 4, h: 0.4,
    fontSize: 18, bold: true, color: COLORS.dark
  });
  
  slide.addText([
    { text: "• WytLife: Digital immortality platform\n", options: { bullet: false } },
    { text: "• 39 WytApps: Unified business ecosystem\n", options: { bullet: false } },
    { text: "• Soul Engine: AI consciousness preservation\n", options: { bullet: false } },
    { text: "• Multi-tenant SaaS: White-label ready\n", options: { bullet: false } },
    { text: "• WytData: Comprehensive DataLake", options: { bullet: false } }
  ], {
    x: 5.4, y: 1.7, w: 4, h: 2.5,
    fontSize: 12, color: COLORS.dark, valign: "top"
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 4.7, w: 8.9, h: 0.7,
    fill: { color: "E0E7FF" }
  });
  
  slide.addText("Market Opportunity: $50B+ digital legacy + $200B+ SaaS + $15B data services = $265B+", {
    x: 0.7, y: 4.8, w: 8.5, h: 0.5,
    fontSize: 14, bold: true, color: COLORS.indigo, align: "center"
  });
}

function createPlatformOverviewSlide() {
  const slide = pptx.addSlide();
  
  slide.addText("WytNet Platform Overview", {
    x: 0.5, y: 0.3, w: 9, h: 0.5,
    fontSize: 28, bold: true, color: COLORS.dark
  });
  
  slide.addText("Multi-Tenant White-Label SaaS Ecosystem", {
    x: 0.5, y: 0.8, w: 9, h: 0.3,
    fontSize: 16, color: COLORS.secondary
  });
  
  const boxes = [
    { title: "Platform Architecture", items: ["Multi-tenant infrastructure", "White-label capabilities", "Custom domain support", "Row-level security (RLS)"], color: "DBEAFE", x: 0.5 },
    { title: "Core Components", items: ["39 WytApps", "51 Platform Modules", "5 Active Hubs", "WytPass Universal Auth"], color: "EDE9FE", x: 3.4 },
    { title: "Technology Stack", items: ["React + TypeScript", "PostgreSQL (Neon)", "Express.js Backend", "AI (GPT-4o, Claude, Gemini)"], color: "FCE7F3", x: 6.3 }
  ];
  
  boxes.forEach(box => {
    slide.addShape(pptx.ShapeType.rect, {
      x: box.x, y: 1.3, w: 2.8, h: 2.8,
      fill: { color: box.color },
      line: { color: COLORS.primary, width: 1 }
    });
    
    slide.addText(box.title, {
      x: box.x + 0.1, y: 1.4, w: 2.6, h: 0.4,
      fontSize: 12, bold: true, color: COLORS.dark, align: "center"
    });
    
    slide.addText(box.items.map(item => `✓ ${item}`).join("\n"), {
      x: box.x + 0.1, y: 1.9, w: 2.6, h: 2,
      fontSize: 10, color: COLORS.dark, valign: "top"
    });
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 4.3, w: 8.9, h: 1,
    fill: { color: "E0E7FF" }
  });
  
  slide.addText("Platform Statistics", {
    x: 0.7, y: 4.4, w: 8.5, h: 0.3,
    fontSize: 14, bold: true, color: COLORS.dark
  });
  
  const stats = [
    { value: "39", label: "WytApps", color: COLORS.indigo },
    { value: "51", label: "Modules", color: COLORS.purple },
    { value: "5", label: "Hubs", color: COLORS.pink },
    { value: "38+", label: "Datasets", color: COLORS.blue },
    { value: "2.4M+", label: "Records", color: COLORS.green }
  ];
  
  stats.forEach((stat, i) => {
    slide.addText(stat.value, {
      x: 0.7 + i * 1.8, y: 4.7, w: 1.6, h: 0.35,
      fontSize: 18, bold: true, color: stat.color, align: "center"
    });
    slide.addText(stat.label, {
      x: 0.7 + i * 1.8, y: 5, w: 1.6, h: 0.25,
      fontSize: 10, color: COLORS.dark, align: "center"
    });
  });
}

function createWytLifeSlide() {
  const slide = pptx.addSlide();
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { type: "solid", color: COLORS.secondary }
  });
  
  slide.addText("WytLife", {
    x: 0.5, y: 1.8, w: 9, h: 1,
    fontSize: 56, bold: true, color: COLORS.white, align: "center"
  });
  
  slide.addText("The World's First Life Continuity Platform", {
    x: 0.5, y: 2.8, w: 9, h: 0.5,
    fontSize: 24, color: COLORS.white, align: "center"
  });
  
  slide.addText('"The day humanity stops dying and starts evolving — begins with WytLife"', {
    x: 0.5, y: 3.8, w: 9, h: 0.5,
    fontSize: 16, italic: true, color: COLORS.white, align: "center"
  });
}

function createWytLifeDetailsSlide() {
  const slide = pptx.addSlide();
  
  slide.addText("WytLife: Digital Immortality", {
    x: 0.5, y: 0.3, w: 9, h: 0.5,
    fontSize: 28, bold: true, color: COLORS.dark
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1, w: 4.2, h: 3.5,
    fill: { color: "F3F4F6" }
  });
  
  slide.addText("What is WytLife?", {
    x: 0.7, y: 1.1, w: 4, h: 0.4,
    fontSize: 16, bold: true, color: COLORS.dark
  });
  
  slide.addText([
    "✓ MyClone: Your digital twin powered by AI\n",
    "✓ Soul Engine: Proprietary AI capturing essence\n",
    "✓ Record voice, memories, thoughts, emotions\n",
    "✓ Your personality lives forever\n",
    "✓ Family can interact with your digital self"
  ].join(""), {
    x: 0.7, y: 1.6, w: 4, h: 2.5,
    fontSize: 11, color: COLORS.dark, valign: "top"
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.2, y: 1, w: 4.2, h: 3.5,
    fill: { color: "EDE9FE" }
  });
  
  slide.addText("Key Features", {
    x: 5.4, y: 1.1, w: 4, h: 0.4,
    fontSize: 16, bold: true, color: COLORS.dark
  });
  
  slide.addText([
    "🗄️ Preserve Legacy: Knowledge never fades\n",
    "❤️ Reconnect Forever: Family interactions\n",
    "🧠 Extend Your Mind: Digital assistant\n",
    "✨ WytPoints Powered: Ecosystem integration\n",
    "🔮 Soul Intelligence: Captures essence"
  ].join(""), {
    x: 5.4, y: 1.6, w: 4, h: 2.5,
    fontSize: 11, color: COLORS.dark, valign: "top"
  });
}

function createFounderSlide() {
  const slide = pptx.addSlide();
  
  slide.addText("WytLife: Founder's Story", {
    x: 0.5, y: 0.3, w: 9, h: 0.5,
    fontSize: 28, bold: true, color: COLORS.dark
  });
  
  slide.addText("JK Muthu", {
    x: 0.5, y: 1, w: 4, h: 0.5,
    fontSize: 24, bold: true, color: COLORS.primary
  });
  
  slide.addText("The World's First Deathless Person", {
    x: 0.5, y: 1.5, w: 4, h: 0.3,
    fontSize: 14, color: COLORS.secondary
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.9, w: 4.2, h: 0.6,
    fill: { color: "F3E8FF" }
  });
  
  slide.addText('"I am creating my immortality. I\'m alive, and I\'m becoming eternal."', {
    x: 0.6, y: 2, w: 4, h: 0.4,
    fontSize: 10, italic: true, color: COLORS.purple
  });
  
  slide.addText([
    "✓ Currently building his MyClone\n",
    "✓ Active documentation of consciousness\n",
    "✓ Family already has MyClones\n",
    "✓ Living proof of digital immortality\n",
    "✓ This isn't science fiction—it's happening TODAY"
  ].join(""), {
    x: 0.5, y: 2.7, w: 4.2, h: 2,
    fontSize: 11, color: COLORS.dark, valign: "top"
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.2, y: 1, w: 4.2, h: 3.8,
    fill: { color: "E0E7FF" }
  });
  
  slide.addText("Founding 1000 Program", {
    x: 5.4, y: 1.1, w: 4, h: 0.4,
    fontSize: 16, bold: true, color: COLORS.dark
  });
  
  slide.addText([
    "🎯 Early Access: First to build MyClone\n",
    "✨ Exclusive Features: Premium capabilities\n",
    "👥 Community: Connect with immortals\n",
    "🏆 Legacy Status: Founding member badge\n",
    "∞ Digital Immortality: Live forever"
  ].join(""), {
    x: 5.4, y: 1.6, w: 4, h: 2,
    fontSize: 11, color: COLORS.dark, valign: "top"
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.4, y: 3.8, w: 3.8, h: 0.8,
    fill: { color: COLORS.white }
  });
  
  slide.addText("WhatsApp Community Active\nReal-time updates & exclusive access", {
    x: 5.5, y: 3.9, w: 3.6, h: 0.6,
    fontSize: 10, color: COLORS.dark, align: "center"
  });
}

function createDataLakeSlide() {
  const slide = pptx.addSlide();
  
  slide.addText("WytData: DataLake Platform", {
    x: 0.5, y: 0.3, w: 9, h: 0.5,
    fontSize: 28, bold: true, color: COLORS.dark
  });
  
  slide.addText("India's Largest Trademark Database", {
    x: 0.5, y: 0.8, w: 9, h: 0.3,
    fontSize: 16, color: COLORS.secondary
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.2, w: 4.2, h: 3.3,
    fill: { color: "D1FAE5" },
    line: { color: COLORS.green, width: 1 }
  });
  
  slide.addText("Trademark DataLake - India", {
    x: 0.7, y: 1.3, w: 4, h: 0.4,
    fontSize: 14, bold: true, color: COLORS.dark
  });
  
  slide.addText([
    "• 2.4M+ Records - Comprehensive Indian trademark database\n",
    "• Real-time Updates - Synced with IP India & TMView\n",
    "• Full Lifecycle Tracking - Application → Registration → Renewal\n",
    "• 45 Nice Classifications - Complete goods/services categorization\n",
    "• Bulk Import/Export - CSV, JSON, API access"
  ].join(""), {
    x: 0.7, y: 1.8, w: 4, h: 2.5,
    fontSize: 10, color: COLORS.dark, valign: "top"
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.2, y: 1.2, w: 4.2, h: 3.3,
    fill: { color: "DBEAFE" },
    line: { color: COLORS.blue, width: 1 }
  });
  
  slide.addText("38+ Global Datasets", {
    x: 5.4, y: 1.3, w: 4, h: 0.4,
    fontSize: 14, bold: true, color: COLORS.dark
  });
  
  slide.addText([
    "✓ Locations: Countries, States, Cities, Timezones\n",
    "✓ Languages: 20+ global languages\n",
    "✓ Currencies: 20+ world currencies\n",
    "✓ Industries: 15+ sector classifications\n",
    "✓ Company Sizes: Startup to Enterprise\n",
    "✓ Job Roles: 15+ professional categories\n",
    "\n",
    "Coming Soon: Patent Database, Company Registry, GST Directory"
  ].join(""), {
    x: 5.4, y: 1.8, w: 4, h: 2.5,
    fontSize: 10, color: COLORS.dark, valign: "top"
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
    fontSize: 16, color: COLORS.secondary
  });
  
  const tiers = [
    { name: "Free Tier", price: "$0", features: ["100 API calls/day", "Basic search endpoints", "Community support", "Rate limited"], color: "F3F4F6", x: 0.5 },
    { name: "Professional", price: "$99/mo", features: ["10,000 API calls/day", "All search endpoints", "Priority support", "Bulk export access"], color: "DBEAFE", x: 3.4 },
    { name: "Enterprise", price: "$999/mo", features: ["Unlimited API calls", "Dedicated endpoints", "White-label access", "Custom integrations"], color: "EDE9FE", x: 6.3 }
  ];
  
  tiers.forEach(tier => {
    slide.addShape(pptx.ShapeType.rect, {
      x: tier.x, y: 1.2, w: 2.8, h: 2.8,
      fill: { color: tier.color },
      line: { color: COLORS.primary, width: 1 }
    });
    
    slide.addText(tier.name, {
      x: tier.x + 0.1, y: 1.3, w: 2.6, h: 0.35,
      fontSize: 12, bold: true, color: COLORS.dark, align: "center"
    });
    
    slide.addText(tier.price, {
      x: tier.x + 0.1, y: 1.65, w: 2.6, h: 0.4,
      fontSize: 20, bold: true, color: COLORS.primary, align: "center"
    });
    
    slide.addText(tier.features.map(f => `• ${f}`).join("\n"), {
      x: tier.x + 0.1, y: 2.1, w: 2.6, h: 1.8,
      fontSize: 9, color: COLORS.dark, valign: "top"
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
      fontSize: 16, bold: true, color: COLORS.green, align: "center"
    });
    slide.addText(stat.label, {
      x: 0.7 + i * 2.2, y: 4.7, w: 2, h: 0.3,
      fontSize: 9, color: COLORS.dark, align: "center"
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
      line: { color: COLORS.primary, width: 0.5 }
    });
    
    slide.addText(cat.title, {
      x: x + 0.1, y: y + 0.05, w: 2.8, h: 0.3,
      fontSize: 9, bold: true, color: COLORS.dark
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
    { num: "6", name: "WytApi Data Services", desc: "$99-$999/month (NEW)", color: COLORS.teal }
  ];
  
  streams.forEach((stream, i) => {
    const y = 1 + i * 0.6;
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y, w: 0.1, h: 0.5,
      fill: { color: stream.color }
    });
    slide.addText(`${stream.num}. ${stream.name}`, {
      x: 0.7, y, w: 2.5, h: 0.5,
      fontSize: 11, bold: true, color: COLORS.dark, valign: "middle"
    });
    slide.addText(stream.desc, {
      x: 3.2, y, w: 1.8, h: 0.5,
      fontSize: 10, color: COLORS.dark, valign: "middle"
    });
  });
  
  slide.addText("Market Opportunity", {
    x: 5.5, y: 0.9, w: 4, h: 0.4,
    fontSize: 18, bold: true, color: COLORS.dark
  });
  
  const markets = [
    { name: "Digital Legacy", value: "$50B+", color: COLORS.indigo },
    { name: "Multi-SaaS", value: "$200B+", color: COLORS.purple },
    { name: "Data Services", value: "$15B+", color: COLORS.green }
  ];
  
  markets.forEach((market, i) => {
    const y = 1.4 + i * 1.1;
    slide.addShape(pptx.ShapeType.rect, {
      x: 5.5, y, w: 4, h: 1,
      fill: { color: "F3F4F6" }
    });
    slide.addText(market.name, {
      x: 5.7, y: y + 0.1, w: 3.6, h: 0.35,
      fontSize: 12, bold: true, color: COLORS.dark
    });
    slide.addText(market.value, {
      x: 5.7, y: y + 0.45, w: 3.6, h: 0.4,
      fontSize: 24, bold: true, color: market.color
    });
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.5, y: 4.7, w: 4, h: 0.5,
    fill: { color: "FEF3C7" }
  });
  
  slide.addText("Total Addressable Market: $265B+", {
    x: 5.5, y: 4.75, w: 4, h: 0.4,
    fontSize: 14, bold: true, color: COLORS.orange, align: "center"
  });
}

function createTractionSlide() {
  const slide = pptx.addSlide();
  
  slide.addText("Traction & Milestones", {
    x: 0.5, y: 0.3, w: 9, h: 0.5,
    fontSize: 28, bold: true, color: COLORS.dark
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1, w: 4.2, h: 4,
    fill: { color: "D1FAE5" }
  });
  
  slide.addText("✅ Achieved (Current)", {
    x: 0.7, y: 1.1, w: 4, h: 0.4,
    fontSize: 14, bold: true, color: COLORS.green
  });
  
  slide.addText([
    "✓ Platform architecture completed\n",
    "✓ 39 WytApps designed & documented\n",
    "✓ 51 platform modules implemented\n",
    "✓ WytLife MVP functional\n",
    "✓ Founder's MyClone created\n",
    "✓ Founding 1000 program launched\n",
    "✓ WytPass auth system operational\n",
    "✓ Razorpay payment integration\n",
    "✓ Trademark DataLake (2.4M+ records)\n",
    "✓ WytApi gateway ready\n",
    "✓ 38+ global datasets seeded"
  ].join(""), {
    x: 0.7, y: 1.55, w: 4, h: 3.3,
    fontSize: 9, color: COLORS.dark, valign: "top"
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.2, y: 1, w: 4.2, h: 4,
    fill: { color: "DBEAFE" }
  });
  
  slide.addText("🎯 Next 6 Months", {
    x: 5.4, y: 1.1, w: 4, h: 0.4,
    fontSize: 14, bold: true, color: COLORS.blue
  });
  
  slide.addText([
    "🔄 WytLife public beta (1,000 users)\n",
    "🔄 Mobile apps launch (iOS + Android)\n",
    "🔄 WytApps marketplace opening\n",
    "🔄 WytApi public launch\n",
    "🔄 First enterprise hub sale\n",
    "🔄 API documentation & partnerships\n",
    "🔄 Reach 10,000 platform users\n",
    "🔄 $100K monthly recurring revenue\n",
    "🔄 Strategic partnership (Meta/Google)\n",
    "🔄 Additional DataLakes (Patents, etc.)\n",
    "🔄 Series A funding closed"
  ].join(""), {
    x: 5.4, y: 1.55, w: 4, h: 3.3,
    fontSize: 9, color: COLORS.dark, valign: "top"
  });
}

function createInvestmentSlide() {
  const slide = pptx.addSlide();
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { type: "solid", color: COLORS.primary }
  });
  
  slide.addText("Investment Opportunity", {
    x: 0.5, y: 0.5, w: 9, h: 0.6,
    fontSize: 32, bold: true, color: COLORS.white, align: "center"
  });
  
  slide.addText("Join Us in Making Humanity Immortal", {
    x: 0.5, y: 1.1, w: 9, h: 0.4,
    fontSize: 18, color: COLORS.white, align: "center"
  });
  
  const highlights = [
    { icon: "🚀", title: "First-Mover", desc: "Digital immortality pioneer" },
    { icon: "💰", title: "Huge Market", desc: "$265B+ opportunity" },
    { icon: "🌟", title: "Proven Team", desc: "Real product, real users" },
    { icon: "🗄️", title: "Data Moat", desc: "2.4M+ proprietary records" }
  ];
  
  highlights.forEach((h, i) => {
    const x = 0.7 + i * 2.3;
    slide.addShape(pptx.ShapeType.rect, {
      x, y: 1.8, w: 2.1, h: 1.4,
      fill: { color: COLORS.white }
    });
    slide.addText(h.icon, {
      x, y: 1.9, w: 2.1, h: 0.4,
      fontSize: 24, align: "center"
    });
    slide.addText(h.title, {
      x, y: 2.3, w: 2.1, h: 0.35,
      fontSize: 12, bold: true, color: COLORS.dark, align: "center"
    });
    slide.addText(h.desc, {
      x, y: 2.6, w: 2.1, h: 0.4,
      fontSize: 9, color: COLORS.dark, align: "center"
    });
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 1.5, y: 3.5, w: 7, h: 2,
    fill: { color: COLORS.white }
  });
  
  slide.addText("Series A Funding", {
    x: 1.5, y: 3.6, w: 7, h: 0.4,
    fontSize: 20, bold: true, color: COLORS.primary, align: "center"
  });
  
  slide.addText("$5M", {
    x: 1.5, y: 4, w: 3.5, h: 0.6,
    fontSize: 36, bold: true, color: COLORS.indigo, align: "center"
  });
  
  slide.addText("20%", {
    x: 5, y: 4, w: 3.5, h: 0.6,
    fontSize: 36, bold: true, color: COLORS.purple, align: "center"
  });
  
  slide.addText("Funding Amount", {
    x: 1.5, y: 4.5, w: 3.5, h: 0.3,
    fontSize: 10, color: COLORS.dark, align: "center"
  });
  
  slide.addText("Equity Offered", {
    x: 5, y: 4.5, w: 3.5, h: 0.3,
    fontSize: 10, color: COLORS.dark, align: "center"
  });
  
  slide.addText("Exit: 3-5 year horizon | IPO or strategic acquisition | $500M-$1B valuation", {
    x: 1.5, y: 5, w: 7, h: 0.3,
    fontSize: 10, color: COLORS.dark, align: "center"
  });
}

function createThankYouSlide() {
  const slide = pptx.addSlide();
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: "100%", h: "100%",
    fill: { type: "solid", color: COLORS.secondary }
  });
  
  slide.addText("Thank You", {
    x: 0.5, y: 1.5, w: 9, h: 1,
    fontSize: 56, bold: true, color: COLORS.white, align: "center"
  });
  
  slide.addText('"The day humanity stops dying and starts evolving — begins with WytLife"', {
    x: 0.5, y: 2.8, w: 9, h: 0.5,
    fontSize: 16, italic: true, color: COLORS.white, align: "center"
  });
  
  slide.addText("Together, let's make immortality accessible to everyone.", {
    x: 0.5, y: 3.6, w: 9, h: 0.4,
    fontSize: 14, color: COLORS.white, align: "center"
  });
  
  slide.addShape(pptx.ShapeType.rect, {
    x: 2.5, y: 4.3, w: 5, h: 1,
    fill: { color: COLORS.white }
  });
  
  slide.addText("Contact: JK Muthu, Founder & CEO\njkm@wytnet.com | WytNet.com", {
    x: 2.5, y: 4.4, w: 5, h: 0.8,
    fontSize: 12, color: COLORS.dark, align: "center"
  });
}

async function generatePresentation() {
  console.log("Creating WytNet Investor Presentation...");
  
  createTitleSlide();
  createExecutiveSummarySlide();
  createPlatformOverviewSlide();
  createWytLifeSlide();
  createWytLifeDetailsSlide();
  createFounderSlide();
  createDataLakeSlide();
  createWytApiSlide();
  createWytAppsSlide();
  createRevenueSlide();
  createTractionSlide();
  createInvestmentSlide();
  createThankYouSlide();
  
  const outputDir = path.join(process.cwd(), "docs", "presentations");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, "WytNet-Investor-Presentation-2025.pptx");
  
  await pptx.writeFile({ fileName: outputPath });
  console.log(`✓ Presentation saved to: ${outputPath}`);
}

generatePresentation().catch(console.error);
