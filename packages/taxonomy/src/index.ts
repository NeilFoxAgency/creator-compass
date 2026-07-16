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
};

type Seed = readonly [name: string, motivations: string, formats: string, traits: string, risks: string];

const seeds: Seed[] = [
  ["Consumer technology", "capability|convenience|novelty", "reviews|comparisons|setup guides", "demonstrable|innovative|useful", "privacy|claims"],
  ["Productivity systems", "focus|organization|time saving", "workflows|desk tours|challenges", "repeatable|visual|practical", "overpromising"],
  ["Home organization", "calm|control|space saving", "before and after|routines|tutorials", "visual|demonstrable|household", "safety"],
  ["Budget living", "saving money|resourcefulness|value", "hauls|comparisons|challenges", "affordable|practical|transparent pricing", "price mismatch"],
  ["Personal finance", "security|independence|planning", "explainers|case studies|Q&A", "educational|trustworthy|measurable", "financial claims|regulatory"],
  ["Cooking and meal preparation", "nourishment|convenience|creativity", "recipes|taste tests|meal prep", "tangible|repeat purchase|sensory", "health claims|allergens"],
  ["Fitness education", "progress|confidence|health", "workouts|form guides|challenges", "demonstrable|routine|community", "medical claims|body image"],
  ["Outdoor recreation", "adventure|resilience|nature", "field tests|trip logs|gear guides", "durable|portable|visual", "safety|environmental claims"],
  ["Family routines", "connection|reliability|less stress", "day in life|routine resets|tips", "safe|practical|repeatable", "child privacy|safety"],
  ["Sustainable living", "lower impact|intentionality|durability", "swaps|audits|how it is made", "reusable|traceable|durable", "greenwashing"],
  ["Beauty tutorials", "self expression|confidence|discovery", "tutorials|wear tests|routines", "visual|demonstrable|sampling", "claims|inclusivity"],
  ["Fashion styling", "identity|confidence|inspiration", "lookbooks|styling challenges|hauls", "visual|wearable|seasonal", "sustainability|sizing"],
  ["Gaming", "mastery|entertainment|community", "streams|reviews|challenges", "digital|interactive|enthusiast", "age suitability"],
  ["Hobby craftsmanship", "mastery|creativity|tactility", "builds|tool tests|tutorials", "demonstrable|specialized|durable", "safety"],
  ["Miniature painting", "creativity|collecting|skill", "paint-alongs|reviews|transformations", "visual|niche|repeat purchase", "ventilation|age suitability"],
  ["Accessibility and adaptive living", "independence|dignity|inclusion", "demonstrations|lived experience|guides", "accessible|practical|inclusive", "medical claims|tokenism"],
  ["Travel planning", "discovery|confidence|efficiency", "itineraries|packing guides|reviews", "portable|bookable|visual", "availability|safety"],
  ["Pet care", "companionship|wellbeing|responsibility", "routines|tests|training tips", "demonstrable|repeat purchase|safe", "veterinary claims|animal welfare"],
  ["Home improvement", "pride|savings|capability", "renovations|how-to|tool reviews", "durable|demonstrable|project based", "safety|permits"],
  ["Automotive ownership", "reliability|performance|identity", "maintenance|road tests|comparisons", "durable|technical|high consideration", "safety|financial claims"],
  ["Entrepreneurship", "growth|autonomy|efficiency", "case studies|build in public|tool stacks", "B2B|measurable|educational", "income claims"],
  ["Remote work", "flexibility|focus|comfort", "desk setups|routines|tool reviews", "portable|productivity|practical", "employment claims"],
  ["Education", "mastery|curiosity|advancement", "lessons|study routines|explainers", "educational|repeatable|trustworthy", "outcome claims|child privacy"],
  ["Science communication", "curiosity|evidence|understanding", "experiments|explainers|myth checks", "evidence led|technical|demonstrable", "misinformation"],
  ["Pop-culture commentary", "belonging|entertainment|interpretation", "essays|reactions|rankings", "timely|conversation worthy|expressive", "copyright|brand safety"],
  ["Wellness routines", "balance|energy|self care", "morning routines|habit tests|journals", "repeatable|sensory|personal", "medical claims"],
  ["Sleep improvement", "rest|energy|recovery", "routine tests|bedroom resets|explainers", "routine|demonstrable|comfort", "medical claims"],
  ["Mental wellbeing", "resilience|reflection|support", "journaling|expert interviews|practices", "supportive|educational|accessible", "medical claims|crisis safety"],
  ["Gardening", "growth|calm|self sufficiency", "seasonal diaries|how-to|harvests", "demonstrable|seasonal|repeat purchase", "chemical safety"],
  ["Interior design", "identity|comfort|beauty", "room makeovers|mood boards|tours", "visual|aspirational|high consideration", "budget mismatch"],
  ["Cleaning systems", "control|hygiene|efficiency", "clean with me|tests|routines", "visual|repeat purchase|demonstrable", "chemical safety|claims"],
  ["DIY repair", "savings|capability|durability", "fix-alongs|diagnostics|tool guides", "practical|demonstrable|durable", "safety|warranty"],
  ["Photography", "creativity|memory|craft", "shoot breakdowns|editing|gear tests", "visual|technical|high consideration", "privacy|copyright"],
  ["Video production", "storytelling|quality|growth", "behind the scenes|tutorials|gear reviews", "visual|technical|creator relevant", "copyright"],
  ["Podcasting", "expression|authority|community", "studio tours|interviews|workflow guides", "audio|technical|B2B", "copyright|claims"],
  ["Music creation", "expression|mastery|community", "sessions|breakdowns|reviews", "audio|demonstrable|specialized", "copyright"],
  ["Books and reading", "learning|escape|identity", "reviews|reading vlogs|themed lists", "story rich|portable|giftable", "copyright"],
  ["Writing and journaling", "clarity|creativity|reflection", "write with me|prompts|tool reviews", "tactile|repeatable|educational", "privacy"],
  ["Language learning", "connection|mobility|mastery", "lessons|challenges|immersion logs", "educational|repeatable|community", "outcome claims"],
  ["Career development", "advancement|confidence|security", "interviews|portfolio reviews|guides", "educational|B2B|trustworthy", "employment claims"],
  ["Leadership and management", "impact|clarity|team performance", "case studies|frameworks|Q&A", "B2B|educational|high trust", "outcome claims"],
  ["Marketing education", "growth|creativity|measurement", "teardowns|experiments|case studies", "B2B|measurable|visual", "performance claims"],
  ["E-commerce operations", "growth|efficiency|reliability", "store audits|workflows|tool comparisons", "B2B|measurable|technical", "income claims"],
  ["Creator business", "independence|growth|professionalism", "income breakdowns|workflows|case studies", "creator relevant|B2B|educational", "income claims"],
  ["Freelancing", "autonomy|income stability|craft", "day in life|tool stacks|pricing guides", "B2B|practical|educational", "income claims"],
  ["Local discovery", "belonging|novelty|convenience", "tours|reviews|guides", "local|visual|experience", "availability"],
  ["Food discovery", "novelty|pleasure|connection", "taste tests|reviews|tours", "sensory|visual|local", "allergens|availability"],
  ["Coffee and tea", "ritual|craft|taste", "brewing guides|comparisons|routines", "sensory|repeat purchase|demonstrable", "health claims"],
  ["Parenting education", "confidence|connection|development", "expert Q&A|routines|product tests", "safe|educational|practical", "child privacy|medical claims"],
  ["College life", "belonging|saving|independence", "dorm tours|study routines|budget guides", "affordable|portable|practical", "age suitability"],
  ["Senior living", "independence|comfort|connection", "how-to|reviews|family guides", "accessible|trustworthy|practical", "medical claims|patronizing tone"],
  ["Wedding planning", "celebration|confidence|coordination", "planning diaries|vendor guides|DIY", "visual|high consideration|time bound", "budget claims"],
  ["Gift guides", "connection|discovery|convenience", "roundups|unboxings|occasion guides", "giftable|visual|available", "seasonality"],
  ["Collecting", "identity|discovery|completion", "collection tours|unboxings|history", "specialized|visual|community", "scarcity claims"],
  ["Board games", "connection|strategy|fun", "playthroughs|reviews|rules explainers", "social|demonstrable|repeat use", "age suitability"],
  ["Tabletop roleplaying", "storytelling|community|creativity", "actual play|worldbuilding|reviews", "community|specialized|repeat use", "brand safety"],
  ["Cycling", "fitness|mobility|adventure", "ride logs|gear tests|maintenance", "demonstrable|durable|technical", "safety"],
  ["Running", "progress|community|wellbeing", "training logs|gear tests|race diaries", "routine|demonstrable|community", "medical claims|safety"],
  ["Camping", "adventure|self reliance|connection", "trip logs|gear tests|setup guides", "portable|durable|demonstrable", "safety|environment"],
  ["Water sports", "adventure|skill|community", "sessions|gear tests|safety guides", "visual|durable|technical", "safety"],
  ["Skincare education", "confidence|care|understanding", "routines|ingredient explainers|wear tests", "repeat purchase|demonstrable|educational", "medical claims|inclusivity"],
  ["Hair care", "confidence|identity|routine", "tutorials|routines|product tests", "visual|repeat purchase|demonstrable", "claims|inclusivity"],
  ["Fragrance", "identity|discovery|ritual", "reviews|collections|occasion guides", "sensory|luxury|giftable", "subjectivity"],
  ["Men's style and grooming", "confidence|identity|simplicity", "routines|styling|reviews", "visual|repeat purchase|demonstrable", "stereotyping"],
  ["Women's health education", "understanding|advocacy|wellbeing", "expert Q&A|explainers|lived experience", "educational|high trust|supportive", "medical claims|privacy"],
  ["Zero-waste making", "lower impact|craft|resourcefulness", "makes|audits|swaps", "reusable|demonstrable|traceable", "greenwashing|safety"],
  ["Urban mobility", "efficiency|freedom|lower cost", "commute tests|comparisons|city guides", "portable|practical|technical", "safety|regulation"],
  ["Luxury lifestyle", "status|craft|exclusivity", "tours|reviews|heritage stories", "premium|visual|high consideration", "authenticity|budget mismatch"],
  ["Value-conscious shopping", "confidence|savings|quality", "comparisons|deal guides|tests", "transparent pricing|practical|available", "price volatility"],
  ["Community volunteering", "purpose|connection|local impact", "field stories|guides|interviews", "mission aligned|local|trustworthy", "exploitation|privacy"],
];

const split = (value: string) => value.split("|");
const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

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
    searchTemplates: [`best ${name.toLowerCase()} creators`, `${name.toLowerCase()} YouTube channels`, `${name.toLowerCase()} product review`],
    keywords: [...split(motivations), ...split(traits), ...name.toLowerCase().split(" ")],
  }),
);

export const territoryById = new Map(creatorTerritories.map((territory) => [territory.id, territory]));

