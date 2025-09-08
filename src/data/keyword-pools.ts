// Canonical keyword pools by category
// Categories: artificial-intelligence, content-creation, business, productivity, nutrition

export type KeywordCategory =
  | "artificial-intelligence"
  | "content-creation"
  | "business"
  | "productivity"
  | "nutrition";

export const CATEGORY_ALIASES: Record<string, KeywordCategory> = {
  ai: "artificial-intelligence",
  "artificial intelligence": "artificial-intelligence",
  "artificial-intelligence": "artificial-intelligence",

  content: "content-creation",
  "content creation": "content-creation",
  "content-creation": "content-creation",

  business: "business",
  biz: "business",

  productivity: "productivity",

  nutrition: "nutrition",
  health: "nutrition",
};

export function normalizeCategory(input?: string | null): KeywordCategory | undefined {
  if (!input) return undefined;
  const key = String(input).trim().toLowerCase();
  return CATEGORY_ALIASES[key] ?? (undefined as any);
}

export const KEYWORD_POOLS: Record<KeywordCategory, string[]> = {
  "artificial-intelligence": [
    // Tools & Platforms
    "ChatGPT prompts",
    "GPT-4 tips",
    "prompt engineering",
    "custom GPTs",
    "AI agents",
    "automation with AI",
    "AI workflows",
    "LangChain basics",
    "RAG pipelines",
    "vector databases",
    "Claude prompts",
    "Midjourney tips",
    "Runway video AI",
    "Sora examples",
    // Use cases
    "AI for marketing",
    "AI for content",
    "AI for sales",
    "AI for research",
    "AI email writing",
    "AI slide decks",
    "meeting summaries",
    "AI coding helpers",
    // Education & Myths
    "AI myths",
    "ethical AI",
    "AI limitations",
    "real world AI",
    "small business AI",
    "no code AI",
    // Tactics
    "few-shot prompting",
    "system prompts",
    "persona prompts",
    "chain of thought",
    "AI content calendar",
    "AI SOPs",
  ],
  "content-creation": [
    // Strategy
    "content pillars",
    "viral hooks",
    "scroll stoppers",
    "retention tactics",
    "storytelling frameworks",
    "creator economy",
    // Platforms
    "TikTok growth",
    "Instagram Reels tips",
    "YouTube Shorts strategy",
    "cross posting",
    "hashtag strategy",
    // Production
    "mobile editing tricks",
    "lighting for reels",
    "caption templates",
    "b-roll ideas",
    // Monetization
    "UGC strategies",
    "affiliate content",
    "digital products",
    "offer positioning",
    // Workflows
    "content batching",
    "30 day content plan",
    "hook formulas",
    "call to action ideas",
  ],
  business: [
    // Fundamentals
    "product market fit",
    "offer creation",
    "pricing strategy",
    "customer research",
    "sales funnels",
    // Growth
    "lead generation",
    "B2B outbound",
    "cold email tips",
    "landing page audits",
    "growth loops",
    // Ops & Finance
    "unit economics",
    "cash flow basics",
    "SaaS metrics",
    "churn reduction",
    "retention strategy",
    // Playbooks
    "case study breakdowns",
    "positioning examples",
    "objection handling",
    "founder led sales",
    "business storytelling",
  ],
  productivity: [
    // Systems
    "time blocking",
    "task batching",
    "second brain",
    "weekly review",
    "SOP templates",
    // Psychology
    "beat procrastination",
    "focus strategies",
    "energy management",
    "deep work",
    // Tools & Tactics
    "notion workflows",
    "calendar mastery",
    "email zero",
    "meeting hygiene",
    "automation ideas",
    // Quick wins
    "2 minute rule",
    "context switching",
    "priority matrices",
    "goal planning",
  ],
  nutrition: [
    // Basics
    "macros explained",
    "balanced meals",
    "protein sources",
    "healthy snacks",
    "hydration habits",
    // Science
    "gut health",
    "fiber benefits",
    "micronutrients",
    "metabolism myths",
    // Practical
    "meal prep tips",
    "grocery lists",
    "budget eating",
    "quick breakfasts",
    "smart swaps",
    // Lifestyles
    "vegetarian protein",
    "high protein recipes",
    "sugar reduction",
    "eating out smart",
  ],
};

