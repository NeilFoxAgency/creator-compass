export type CreatorTerritory = {
  id: string;
  name: string;
  description: string;
  audienceMotivations: string[];
  commonContentFormats: string[];
  compatibleProductTraits: string[];
  incompatibleProductTraits: string[];
  funnelStrengths: Array<"awareness" | "consideration" | "conversion" | "retention">;
  riskTags: string[];
  searchTemplates: string[];
  keywords: string[];
  audienceType: "b2b" | "b2c" | "mixed";
  buyerRoles: string[];
  userRoles: string[];
  industries: string[];
  useCases: string[];
  jobsToBeDone: string[];
  compatibleBusinessModels: string[];
  compatibleProductTypes: string[];
  technicalLevel: "non-technical" | "mixed" | "technical" | "developer";
  purchaseIntent: "low" | "medium" | "high";
  exclusionTags: string[];
  superficialMatchRisks: string[];
  categorySignals: string[];
};

type Seed = readonly [
  name: string,
  motivations: string,
  formats: string,
  traits: string,
  risks: string,
];

const seeds: Seed[] = [
  [
    "SEO and search marketing",
    "search visibility|qualified traffic|competitive insight",
    "site audits|keyword research walkthroughs|SERP teardowns",
    "B2B|measurable|technical",
    "performance claims|data quality",
  ],
  [
    "AI agents and workflow automation",
    "automation|leverage|reliable workflows",
    "agent builds|workflow demos|integration tutorials",
    "B2B|technical|demonstrable",
    "security|automation claims",
  ],
  [
    "Developer tools",
    "developer productivity|control|technical capability",
    "code walkthroughs|benchmarks|integration builds",
    "B2B|developer|technical",
    "security|benchmark claims",
  ],
  [
    "Open source and self-hosting",
    "ownership|transparency|control",
    "self-hosting guides|architecture reviews|migration demos",
    "open source|developer|technical",
    "security|maintenance burden",
  ],
  [
    "SaaS and indie hacking",
    "sustainable growth|shipping products|efficient operations",
    "build in public|tool stack reviews|founder case studies",
    "B2B|software|measurable",
    "income claims|survivorship bias",
  ],
  [
    "Web development",
    "building websites|performance|maintainability",
    "code tutorials|site rebuilds|stack comparisons",
    "B2B|developer|technical",
    "security|accessibility claims",
  ],
  [
    "Growth marketing and conversion optimization",
    "qualified growth|conversion improvement|measurement",
    "funnel teardowns|experiments|landing-page audits",
    "B2B|measurable|educational",
    "performance claims|attribution",
  ],
  [
    "Agency operations",
    "client delivery|margin|repeatable processes",
    "client workflows|tool comparisons|delivery playbooks",
    "B2B|service|operational",
    "client confidentiality|outcome claims",
  ],
  [
    "No-code and business automation",
    "automation|efficiency|accessible systems",
    "workflow builds|tool comparisons|templates",
    "B2B|software|demonstrable",
    "security|automation claims",
  ],
  [
    "E-commerce growth",
    "profitable growth|store conversion|customer acquisition",
    "store teardowns|growth experiments|tool comparisons",
    "B2B|e-commerce|measurable",
    "income claims|attribution",
  ],
  [
    "Small-business website improvement",
    "local growth|credible websites|lead generation",
    "website audits|before and after|fix lists",
    "B2B|service|demonstrable",
    "performance claims|local variation",
  ],
  [
    "AI industry news",
    "novelty|industry awareness|future readiness",
    "news analysis|tool roundups|trend commentary",
    "technical|timely|awareness",
    "hype|weak purchase intent",
  ],
  [
    "AI image and video creation",
    "creative production|visual storytelling|faster content creation",
    "generation walkthroughs|model comparisons|creative experiments",
    "software|visual|demonstrable",
    "quality claims|model limitations|rights",
  ],
  [
    "Creative AI and design workflows",
    "creative control|production efficiency|design exploration",
    "workflow demonstrations|design breakdowns|before and after",
    "software|visual|creative",
    "rights|brand consistency|unsupported outcomes",
  ],
  [
    "Consumer technology",
    "capability|convenience|novelty",
    "reviews|comparisons|setup guides",
    "demonstrable|innovative|useful",
    "privacy|claims",
  ],
  [
    "Productivity systems",
    "focus|organization|time saving",
    "workflows|desk tours|challenges",
    "repeatable|visual|practical",
    "overpromising",
  ],
  [
    "Home organization",
    "calm|control|space saving",
    "before and after|routines|tutorials",
    "visual|demonstrable|household",
    "safety",
  ],
  [
    "Budget living",
    "saving money|resourcefulness|value",
    "hauls|comparisons|challenges",
    "affordable|practical|transparent pricing",
    "price mismatch",
  ],
  [
    "Personal finance",
    "security|independence|planning",
    "explainers|case studies|Q&A",
    "educational|trustworthy|measurable",
    "financial claims|regulatory",
  ],
  [
    "Cooking and meal preparation",
    "nourishment|convenience|creativity",
    "recipes|taste tests|meal prep",
    "tangible|repeat purchase|sensory",
    "health claims|allergens",
  ],
  [
    "Fitness education",
    "progress|confidence|health",
    "workouts|form guides|challenges",
    "demonstrable|routine|community",
    "medical claims|body image",
  ],
  [
    "Outdoor recreation",
    "adventure|resilience|nature",
    "field tests|trip logs|gear guides",
    "durable|portable|visual",
    "safety|environmental claims",
  ],
  [
    "Family routines",
    "connection|reliability|less stress",
    "day in life|routine resets|tips",
    "safe|practical|repeatable",
    "child privacy|safety",
  ],
  [
    "Sustainable living",
    "lower impact|intentionality|durability",
    "swaps|audits|how it is made",
    "reusable|traceable|durable",
    "greenwashing",
  ],
  [
    "Beauty tutorials",
    "self expression|confidence|discovery",
    "tutorials|wear tests|routines",
    "visual|demonstrable|sampling",
    "claims|inclusivity",
  ],
  [
    "Fashion styling",
    "identity|confidence|inspiration",
    "lookbooks|styling challenges|hauls",
    "visual|wearable|seasonal",
    "sustainability|sizing",
  ],
  [
    "Gaming",
    "mastery|entertainment|community",
    "streams|reviews|challenges",
    "digital|interactive|enthusiast",
    "age suitability",
  ],
  [
    "Hobby craftsmanship",
    "mastery|creativity|tactility",
    "builds|tool tests|tutorials",
    "demonstrable|specialized|durable",
    "safety",
  ],
  [
    "Miniature painting",
    "creativity|collecting|skill",
    "paint-alongs|reviews|transformations",
    "visual|niche|repeat purchase",
    "ventilation|age suitability",
  ],
  [
    "Accessibility and adaptive living",
    "independence|dignity|inclusion",
    "demonstrations|lived experience|guides",
    "accessible|practical|inclusive",
    "medical claims|tokenism",
  ],
  [
    "Travel planning",
    "discovery|confidence|efficiency",
    "itineraries|packing guides|reviews",
    "portable|bookable|visual",
    "availability|safety",
  ],
  [
    "Pet care",
    "companionship|wellbeing|responsibility",
    "routines|tests|training tips",
    "demonstrable|repeat purchase|safe",
    "veterinary claims|animal welfare",
  ],
  [
    "Home improvement",
    "pride|savings|capability",
    "renovations|how-to|tool reviews",
    "durable|demonstrable|project based",
    "safety|permits",
  ],
  [
    "Automotive ownership",
    "reliability|performance|identity",
    "maintenance|road tests|comparisons",
    "durable|technical|high consideration",
    "safety|financial claims",
  ],
  [
    "Entrepreneurship",
    "growth|autonomy|efficiency",
    "case studies|build in public|tool stacks",
    "B2B|measurable|educational",
    "income claims",
  ],
  [
    "Remote work",
    "flexibility|focus|comfort",
    "desk setups|routines|tool reviews",
    "portable|productivity|practical",
    "employment claims",
  ],
  [
    "Education",
    "mastery|curiosity|advancement",
    "lessons|study routines|explainers",
    "educational|repeatable|trustworthy",
    "outcome claims|child privacy",
  ],
  [
    "Science communication",
    "curiosity|evidence|understanding",
    "experiments|explainers|myth checks",
    "evidence led|technical|demonstrable",
    "misinformation",
  ],
  [
    "Pop-culture commentary",
    "belonging|entertainment|interpretation",
    "essays|reactions|rankings",
    "timely|conversation worthy|expressive",
    "copyright|brand safety",
  ],
  [
    "Wellness routines",
    "balance|energy|self care",
    "morning routines|habit tests|journals",
    "repeatable|sensory|personal",
    "medical claims",
  ],
  [
    "Sleep improvement",
    "rest|energy|recovery",
    "routine tests|bedroom resets|explainers",
    "routine|demonstrable|comfort",
    "medical claims",
  ],
  [
    "Mental wellbeing",
    "resilience|reflection|support",
    "journaling|expert interviews|practices",
    "supportive|educational|accessible",
    "medical claims|crisis safety",
  ],
  [
    "Gardening",
    "growth|calm|self sufficiency",
    "seasonal diaries|how-to|harvests",
    "demonstrable|seasonal|repeat purchase",
    "chemical safety",
  ],
  [
    "Interior design",
    "identity|comfort|beauty",
    "room makeovers|mood boards|tours",
    "visual|aspirational|high consideration",
    "budget mismatch",
  ],
  [
    "Cleaning systems",
    "control|hygiene|efficiency",
    "clean with me|tests|routines",
    "visual|repeat purchase|demonstrable",
    "chemical safety|claims",
  ],
  [
    "DIY repair",
    "savings|capability|durability",
    "fix-alongs|diagnostics|tool guides",
    "practical|demonstrable|durable",
    "safety|warranty",
  ],
  [
    "Photography",
    "creativity|memory|craft",
    "shoot breakdowns|editing|gear tests",
    "visual|technical|high consideration",
    "privacy|copyright",
  ],
  [
    "Video production",
    "storytelling|quality|growth",
    "behind the scenes|tutorials|gear reviews",
    "visual|technical|creator relevant",
    "copyright",
  ],
  [
    "Podcasting",
    "expression|authority|community",
    "studio tours|interviews|workflow guides",
    "audio|technical|B2B",
    "copyright|claims",
  ],
  [
    "Music creation",
    "expression|mastery|community",
    "sessions|breakdowns|reviews",
    "audio|demonstrable|specialized",
    "copyright",
  ],
  [
    "Books and reading",
    "learning|escape|identity",
    "reviews|reading vlogs|themed lists",
    "story rich|portable|giftable",
    "copyright",
  ],
  [
    "Writing and journaling",
    "clarity|creativity|reflection",
    "write with me|prompts|tool reviews",
    "tactile|repeatable|educational",
    "privacy",
  ],
  [
    "Language learning",
    "connection|mobility|mastery",
    "lessons|challenges|immersion logs",
    "educational|repeatable|community",
    "outcome claims",
  ],
  [
    "Career development",
    "advancement|confidence|security",
    "interviews|portfolio reviews|guides",
    "educational|B2B|trustworthy",
    "employment claims",
  ],
  [
    "Leadership and management",
    "impact|clarity|team performance",
    "case studies|frameworks|Q&A",
    "B2B|educational|high trust",
    "outcome claims",
  ],
  [
    "Marketing education",
    "growth|creativity|measurement",
    "teardowns|experiments|case studies",
    "B2B|measurable|visual",
    "performance claims",
  ],
  [
    "E-commerce operations",
    "growth|efficiency|reliability",
    "store audits|workflows|tool comparisons",
    "B2B|measurable|technical",
    "income claims",
  ],
  [
    "Creator business",
    "independence|growth|professionalism",
    "income breakdowns|workflows|case studies",
    "creator relevant|B2B|educational",
    "income claims",
  ],
  [
    "Freelancing",
    "autonomy|income stability|craft",
    "day in life|tool stacks|pricing guides",
    "B2B|practical|educational",
    "income claims",
  ],
  [
    "Local discovery",
    "belonging|novelty|convenience",
    "tours|reviews|guides",
    "local|visual|experience",
    "availability",
  ],
  [
    "Food discovery",
    "novelty|pleasure|connection",
    "taste tests|reviews|tours",
    "sensory|visual|local",
    "allergens|availability",
  ],
  [
    "Coffee and tea",
    "ritual|craft|taste",
    "brewing guides|comparisons|routines",
    "sensory|repeat purchase|demonstrable",
    "health claims",
  ],
  [
    "Parenting education",
    "confidence|connection|development",
    "expert Q&A|routines|product tests",
    "safe|educational|practical",
    "child privacy|medical claims",
  ],
  [
    "College life",
    "belonging|saving|independence",
    "dorm tours|study routines|budget guides",
    "affordable|portable|practical",
    "age suitability",
  ],
  [
    "Senior living",
    "independence|comfort|connection",
    "how-to|reviews|family guides",
    "accessible|trustworthy|practical",
    "medical claims|patronizing tone",
  ],
  [
    "Wedding planning",
    "celebration|confidence|coordination",
    "planning diaries|vendor guides|DIY",
    "visual|high consideration|time bound",
    "budget claims",
  ],
  [
    "Gift guides",
    "connection|discovery|convenience",
    "roundups|unboxings|occasion guides",
    "giftable|visual|available",
    "seasonality",
  ],
  [
    "Collecting",
    "identity|discovery|completion",
    "collection tours|unboxings|history",
    "specialized|visual|community",
    "scarcity claims",
  ],
  [
    "Board games",
    "connection|strategy|fun",
    "playthroughs|reviews|rules explainers",
    "social|demonstrable|repeat use",
    "age suitability",
  ],
  [
    "Tabletop roleplaying",
    "storytelling|community|creativity",
    "actual play|worldbuilding|reviews",
    "community|specialized|repeat use",
    "brand safety",
  ],
  [
    "Cycling",
    "fitness|mobility|adventure",
    "ride logs|gear tests|maintenance",
    "demonstrable|durable|technical",
    "safety",
  ],
  [
    "Running",
    "progress|community|wellbeing",
    "training logs|gear tests|race diaries",
    "routine|demonstrable|community",
    "medical claims|safety",
  ],
  [
    "Camping",
    "adventure|self reliance|connection",
    "trip logs|gear tests|setup guides",
    "portable|durable|demonstrable",
    "safety|environment",
  ],
  [
    "Water sports",
    "adventure|skill|community",
    "sessions|gear tests|safety guides",
    "visual|durable|technical",
    "safety",
  ],
  [
    "Skincare education",
    "confidence|care|understanding",
    "routines|ingredient explainers|wear tests",
    "repeat purchase|demonstrable|educational",
    "medical claims|inclusivity",
  ],
  [
    "Hair care",
    "confidence|identity|routine",
    "tutorials|routines|product tests",
    "visual|repeat purchase|demonstrable",
    "claims|inclusivity",
  ],
  [
    "Fragrance",
    "identity|discovery|ritual",
    "reviews|collections|occasion guides",
    "sensory|luxury|giftable",
    "subjectivity",
  ],
  [
    "Men's style and grooming",
    "confidence|identity|simplicity",
    "routines|styling|reviews",
    "visual|repeat purchase|demonstrable",
    "stereotyping",
  ],
  [
    "Women's health education",
    "understanding|advocacy|wellbeing",
    "expert Q&A|explainers|lived experience",
    "educational|high trust|supportive",
    "medical claims|privacy",
  ],
  [
    "Zero-waste making",
    "lower impact|craft|resourcefulness",
    "makes|audits|swaps",
    "reusable|demonstrable|traceable",
    "greenwashing|safety",
  ],
  [
    "Urban mobility",
    "efficiency|freedom|lower cost",
    "commute tests|comparisons|city guides",
    "portable|practical|technical",
    "safety|regulation",
  ],
  [
    "Luxury lifestyle",
    "status|craft|exclusivity",
    "tours|reviews|heritage stories",
    "premium|visual|high consideration",
    "authenticity|budget mismatch",
  ],
  [
    "Value-conscious shopping",
    "confidence|savings|quality",
    "comparisons|deal guides|tests",
    "transparent pricing|practical|available",
    "price volatility",
  ],
  [
    "Community volunteering",
    "purpose|connection|local impact",
    "field stories|guides|interviews",
    "mission aligned|local|trustworthy",
    "exploitation|privacy",
  ],
];

const split = (value: string) => value.split("|");
const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

type TerritoryMetadata = Pick<
  CreatorTerritory,
  | "audienceType"
  | "buyerRoles"
  | "userRoles"
  | "industries"
  | "useCases"
  | "jobsToBeDone"
  | "compatibleBusinessModels"
  | "compatibleProductTypes"
  | "technicalLevel"
  | "purchaseIntent"
  | "exclusionTags"
  | "superficialMatchRisks"
  | "categorySignals"
>;

const technicalMetadata: Record<string, Partial<TerritoryMetadata>> = {
  "skincare-education": {
    buyerRoles: ["skincare buyer", "beauty shopper"],
    userRoles: ["skincare user"],
    industries: ["skincare", "beauty"],
    useCases: ["skincare routine", "ingredient education", "sensitive-skin routine"],
    jobsToBeDone: [
      "choose a skincare routine",
      "understand skincare ingredients",
      "care for sensitive skin",
    ],
    categorySignals: ["skincare", "skin care", "serum", "sensitive skin"],
  },
  "beauty-tutorials": {
    buyerRoles: ["beauty shopper", "makeup buyer"],
    userRoles: ["beauty product user"],
    industries: ["beauty", "cosmetics"],
    useCases: ["beauty routine", "makeup application", "product wear test"],
    jobsToBeDone: ["choose beauty products", "learn a beauty routine", "compare product wear"],
    categorySignals: ["beauty", "makeup", "cosmetics"],
  },
  "home-improvement": {
    buyerRoles: ["homeowner", "home improvement buyer"],
    userRoles: ["homeowner", "DIY renovator"],
    industries: ["home improvement", "residential services", "HVAC"],
    useCases: ["HVAC installation", "heating repair", "home repair", "renovation"],
    jobsToBeDone: [
      "repair a home system",
      "replace an unreliable heating system",
      "improve a home",
    ],
    categorySignals: ["home improvement", "HVAC", "heating", "cooling", "residential contractor"],
  },
  "local-discovery": {
    buyerRoles: ["local customer", "homeowner", "local business buyer"],
    userRoles: ["local resident"],
    industries: ["local services", "local business"],
    useCases: ["find a local service", "compare local providers"],
    jobsToBeDone: ["find a trusted local provider", "choose a local service"],
    categorySignals: ["local service", "local business", "near me"],
  },
  "seo-and-search-marketing": {
    buyerRoles: [
      "SEO professional",
      "growth marketer",
      "content marketer",
      "marketing agency",
      "SaaS founder",
    ],
    userRoles: ["SEO specialist", "content strategist", "digital marketer"],
    industries: ["marketing", "SaaS", "e-commerce", "agency"],
    useCases: [
      "keyword research",
      "backlink analysis",
      "rank tracking",
      "site audits",
      "SERP analysis",
    ],
    jobsToBeDone: [
      "improve search visibility",
      "find keyword opportunities",
      "audit website performance",
      "analyze competitors",
    ],
    categorySignals: [
      "SEO",
      "search marketing",
      "search engine optimization",
      "SERP",
      "keyword research",
      "backlinks",
      "rank tracking",
      "site audit",
    ],
  },
  "ai-agents-and-workflow-automation": {
    buyerRoles: ["developer", "automation lead", "technical founder", "operations leader"],
    userRoles: ["AI agent builder", "developer", "automation specialist"],
    industries: ["software", "SaaS", "technology", "operations"],
    useCases: ["AI agent integration", "MCP integration", "workflow automation", "tool calling"],
    jobsToBeDone: [
      "connect agents to reliable data",
      "automate repeatable work",
      "build agent workflows",
    ],
    categorySignals: [
      "AI agent",
      "agent workflow",
      "MCP",
      "Model Context Protocol",
      "automation",
      "tool calling",
    ],
  },
  "developer-tools": {
    buyerRoles: ["developer", "engineering leader", "technical founder"],
    userRoles: ["software developer", "AI engineer", "web developer"],
    industries: ["software", "SaaS", "technology"],
    useCases: ["developer integration", "API integration", "CLI workflow", "software development"],
    jobsToBeDone: [
      "build software faster",
      "integrate reliable tools",
      "inspect technical systems",
    ],
    categorySignals: ["developer tool", "API", "CLI", "SDK", "MCP server", "open source software"],
  },
  "open-source-and-self-hosting": {
    buyerRoles: ["developer", "technical founder", "IT leader"],
    userRoles: ["self-hoster", "developer", "system administrator"],
    industries: ["software", "technology", "IT"],
    useCases: ["self-hosting", "source-code inspection", "open-source deployment"],
    jobsToBeDone: ["retain control of software", "self-host a service", "avoid vendor lock-in"],
    categorySignals: ["open source", "self-host", "self hosting", "GitHub", "source code"],
  },
  "saas-and-indie-hacking": {
    buyerRoles: ["SaaS founder", "indie hacker", "product leader", "growth marketer"],
    userRoles: ["founder", "operator", "marketer"],
    industries: ["SaaS", "software", "startups"],
    useCases: ["software evaluation", "tool-stack selection", "product-led growth"],
    jobsToBeDone: [
      "grow a software business",
      "choose an affordable SaaS tool",
      "operate a lean product",
    ],
    categorySignals: [
      "SaaS",
      "software subscription",
      "usage-based pricing",
      "indie hacker",
      "founder",
    ],
  },
  "web-development": {
    buyerRoles: ["web developer", "technical founder", "agency owner"],
    userRoles: ["web developer", "frontend developer", "site owner"],
    industries: ["web development", "software", "agency"],
    useCases: ["website development", "site optimization", "technical SEO"],
    jobsToBeDone: ["build a better website", "improve site performance", "connect website tools"],
    categorySignals: ["web development", "website", "frontend", "technical SEO", "Search Console"],
  },
  "growth-marketing-and-conversion-optimization": {
    buyerRoles: ["growth marketer", "conversion specialist", "marketing leader", "SaaS founder"],
    userRoles: ["growth marketer", "CRO specialist", "digital marketer"],
    industries: ["marketing", "SaaS", "e-commerce"],
    useCases: [
      "conversion optimization",
      "growth experiments",
      "funnel analysis",
      "competitor analysis",
    ],
    jobsToBeDone: [
      "increase qualified traffic",
      "improve conversion rates",
      "find growth opportunities",
    ],
    categorySignals: [
      "growth marketing",
      "conversion optimization",
      "CRO",
      "funnel",
      "landing page",
      "competitor analysis",
    ],
  },
  "agency-operations": {
    buyerRoles: ["agency owner", "agency strategist", "client services leader"],
    userRoles: ["agency marketer", "SEO consultant", "account strategist"],
    industries: ["agency", "consulting", "marketing services"],
    useCases: ["client reporting", "client research", "repeatable delivery", "multi-client SEO"],
    jobsToBeDone: [
      "deliver client work efficiently",
      "standardize agency workflows",
      "research client opportunities",
    ],
    categorySignals: ["agency", "client work", "consulting", "client reporting"],
  },
  "no-code-and-business-automation": {
    buyerRoles: ["operations leader", "small-business owner", "automation consultant"],
    userRoles: ["no-code builder", "operations specialist", "automation consultant"],
    industries: ["operations", "small business", "consulting"],
    useCases: ["business automation", "no-code workflow", "systems integration"],
    jobsToBeDone: ["automate business work", "connect business tools", "reduce manual tasks"],
    categorySignals: ["no-code", "business automation", "workflow automation", "integration"],
  },
  "e-commerce-growth": {
    buyerRoles: ["e-commerce manager", "store owner", "growth marketer"],
    userRoles: ["e-commerce marketer", "store operator"],
    industries: ["e-commerce", "retail"],
    useCases: ["store SEO", "product-page optimization", "e-commerce growth"],
    jobsToBeDone: ["grow store traffic", "improve product discovery", "increase store conversion"],
    categorySignals: ["e-commerce", "online store", "store SEO", "Shopify", "product pages"],
  },
  "small-business-website-improvement": {
    buyerRoles: ["small-business owner", "local business marketer", "web consultant"],
    userRoles: ["site owner", "small-business marketer"],
    industries: ["small business", "local services"],
    useCases: ["website audit", "local website improvement", "lead generation"],
    jobsToBeDone: [
      "improve a small-business website",
      "generate more website leads",
      "fix discoverability problems",
    ],
    categorySignals: ["small business", "website improvement", "website audit", "local SEO"],
  },
  "ai-industry-news": {
    buyerRoles: ["technology professional"],
    userRoles: ["AI enthusiast"],
    industries: ["technology", "media"],
    useCases: ["follow AI news", "discover AI tools"],
    jobsToBeDone: ["stay current on AI news"],
    categorySignals: ["AI news", "AI tools", "artificial intelligence"],
    superficialMatchRisks: ["AI", "agent", "MCP"],
    purchaseIntent: "low",
  },
  "ai-image-and-video-creation": {
    audienceType: "mixed",
    buyerRoles: ["content creator", "creative marketer", "e-commerce marketer"],
    userRoles: ["AI image creator", "AI video creator", "visual content producer"],
    industries: ["creative production", "marketing", "e-commerce", "design"],
    useCases: [
      "AI image generation",
      "AI video generation",
      "product photography",
      "product avatar video",
      "visual content production",
    ],
    jobsToBeDone: [
      "create AI images",
      "generate AI videos",
      "produce product visuals",
      "speed up creative production",
    ],
    categorySignals: [
      "AI image generator",
      "AI video generator",
      "text to video",
      "image to video",
      "product photography",
      "visual content creation",
    ],
    compatibleBusinessModels: ["saas", "subscription"],
    compatibleProductTypes: ["software", "digital-product"],
    purchaseIntent: "high",
  },
  "creative-ai-and-design-workflows": {
    audienceType: "mixed",
    buyerRoles: ["creative director", "designer", "content creator", "creative marketer"],
    userRoles: ["designer", "creative producer", "content creator"],
    industries: ["design", "creative production", "marketing", "e-commerce"],
    useCases: [
      "creative AI workflow",
      "design workflow",
      "ad creative production",
      "e-commerce content creation",
    ],
    jobsToBeDone: [
      "produce visual content",
      "explore creative concepts",
      "create product marketing assets",
    ],
    categorySignals: [
      "creative AI",
      "design workflow",
      "creative production",
      "AI creative tools",
      "ad images",
    ],
    compatibleBusinessModels: ["saas", "subscription", "service"],
    compatibleProductTypes: ["software", "digital-product", "service"],
    purchaseIntent: "high",
  },
  "consumer-technology": {
    buyerRoles: ["consumer technology buyer"],
    userRoles: ["technology consumer"],
    useCases: ["evaluate consumer devices", "set up personal technology"],
    jobsToBeDone: ["choose a consumer technology product"],
    categorySignals: ["consumer technology", "consumer device", "personal technology", "gadget"],
    superficialMatchRisks: ["software", "technology", "AI", "open source"],
    purchaseIntent: "medium",
  },
};

const b2bNames =
  /SEO|AI agents|Developer tools|Open source|SaaS|Web development|Growth marketing|Agency operations|No-code|E-commerce growth|AI image and video|Creative AI|Entrepreneurship|Marketing education|E-commerce operations|Creator business|Freelancing|Leadership and management/i;
const lifestyleNames =
  /Beauty|Fashion|Gaming|Gardening|Camping|Skincare|Hair care|Fragrance|Cooking|Fitness|Wellness|Interior|Pet care|Outdoor|Travel|Parenting|Wedding|Coffee|Cycling|Running|Water sports|Zero-waste/i;

function metadataFor(
  name: string,
  motivations: string,
  formats: string,
  traits: string,
): TerritoryMetadata {
  const id = slugify(name);
  const explicit = technicalMetadata[id] ?? {};
  const b2b = b2bNames.test(name) || /\bB2B\b/i.test(traits);
  const lifestyle = lifestyleNames.test(name);
  return {
    audienceType: explicit.audienceType ?? (b2b ? "b2b" : lifestyle ? "b2c" : "mixed"),
    buyerRoles: explicit.buyerRoles ?? [`${name.toLowerCase()} buyer`],
    userRoles: explicit.userRoles ?? [`${name.toLowerCase()} audience member`],
    industries: explicit.industries ?? [name.toLowerCase()],
    useCases: explicit.useCases ?? split(formats),
    jobsToBeDone: explicit.jobsToBeDone ?? split(motivations).map((item) => `pursue ${item}`),
    compatibleBusinessModels:
      explicit.compatibleBusinessModels ??
      (b2b ? ["saas", "service", "subscription"] : ["e-commerce", "subscription", "service"]),
    compatibleProductTypes:
      explicit.compatibleProductTypes ??
      (b2b
        ? ["software", "service", "digital-product"]
        : ["physical-product", "service", "digital-product"]),
    technicalLevel:
      explicit.technicalLevel ??
      (/developer|technical|open source|AI agents|web development/i.test(name)
        ? "technical"
        : "mixed"),
    purchaseIntent: explicit.purchaseIntent ?? (b2b ? "high" : "medium"),
    exclusionTags:
      explicit.exclusionTags ?? (lifestyle ? ["b2b-software-without-specific-bridge"] : []),
    superficialMatchRisks: explicit.superficialMatchRisks ?? split(motivations),
    categorySignals: explicit.categorySignals ?? [name, ...split(traits)],
  };
}

export const creatorTerritories: CreatorTerritory[] = seeds.map(
  ([name, motivations, formats, traits, risks]) => ({
    id: slugify(name),
    name,
    description: `${name} creators help audiences pursue ${split(motivations).join(", ")}.`,
    audienceMotivations: split(motivations),
    commonContentFormats: split(formats),
    compatibleProductTraits: split(traits),
    incompatibleProductTraits: ["unclear audience", "unverifiable promise"],
    funnelStrengths: ["awareness", "consideration", "conversion"],
    riskTags: split(risks),
    searchTemplates: [
      `best ${name.toLowerCase()} creators`,
      `${name.toLowerCase()} YouTube channels`,
      `${name.toLowerCase()} product review`,
    ],
    keywords: [...split(motivations), ...split(traits), ...name.toLowerCase().split(" ")],
    ...metadataFor(name, motivations, formats, traits),
  }),
);

export const territoryById = new Map(
  creatorTerritories.map((territory) => [territory.id, territory]),
);
