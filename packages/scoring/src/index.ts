import type {
  BrandProfile,
  CreatorCompassReport,
  ReadinessDimension,
  TerritoryRecommendation,
} from "@creator-compass/contracts";
import { creatorTerritories, type CreatorTerritory } from "@creator-compass/taxonomy";

export const METHODOLOGY_VERSION = "2026.07.2";

const statusScore = { strong: 90, mixed: 62, weak: 32, unknown: 50 } as const;
const evidenceText = (profile: BrandProfile) => profile.evidence.map((item) => item.excerpt.toLowerCase()).join(" ");
const evidenceIdsFor = (profile: BrandProfile, terms: string[]) => profile.evidence
  .filter((item) => terms.some((term) => item.excerpt.toLowerCase().includes(term.toLowerCase())))
  .slice(0, 3)
  .map((item) => item.id);

function bestEvidence(profile: BrandProfile, terms: string[]) {
  const normalized = terms.flatMap((term) => term.toLowerCase().split(/[^a-z0-9]+/)).filter((term) => term.length > 3);
  return [...profile.evidence]
    .map((item, index) => ({ item, index, score: normalized.filter((term) => item.excerpt.toLowerCase().includes(term)).length }))
    .sort((a, b) => b.score - a.score || a.index - b.index)[0]?.item.id ?? "evidence-1";
}

type ReadinessSpec = {
  key: string;
  label: string;
  status: (profile: BrandProfile) => keyof typeof statusScore;
  rationale: (profile: BrandProfile) => string;
  improvement: string;
  evidenceTerms: (profile: BrandProfile) => string[];
};

const readinessSpecs: ReadinessSpec[] = [
  { key: "audience-clarity", label: "Audience clarity", status: (p) => p.targetCustomers.length >= 2 ? "strong" : p.targetCustomers.length ? "mixed" : "unknown", rationale: (p) => p.targetCustomers.length ? `The public site points to ${p.targetCustomers.join(" and ")}.` : "The reviewed pages do not define a specific customer clearly.", improvement: "Name the primary buyer and the moment that triggers purchase.", evidenceTerms: (p) => p.targetCustomers },
  { key: "demonstrability", label: "Product demonstrability", status: (p) => p.demonstrability, rationale: (p) => `The offer appears ${p.demonstrability} to show inside creator content.`, improvement: "Prepare a short, visual product demonstration that shows the before-and-after moment.", evidenceTerms: () => ["demo", "how it works", "before", "after", "tutorial"] },
  { key: "content-naturalness", label: "Naturalness in creator content", status: (p) => p.demonstrability === "strong" ? "strong" : p.demonstrability === "weak" ? "weak" : "mixed", rationale: (p) => `${p.products[0]?.name ?? "The offer"} can be connected to ${p.customerNeeds[0] ?? "a customer need"}, with some creative framing.`, improvement: "Document three real situations where the product naturally enters a customer's day.", evidenceTerms: (p) => [...p.customerNeeds, ...p.products.map((item) => item.name)] },
  { key: "trust-education", label: "Trust or education requirement", status: (p) => p.trustRequirement === "low" ? "strong" : p.trustRequirement === "medium" ? "mixed" : p.trustRequirement === "high" ? "weak" : "unknown", rationale: (p) => `The purchase appears to require ${p.trustRequirement} trust or education.`, improvement: "Give creators substantiated proof points and plain-language answers to likely objections.", evidenceTerms: () => ["learn", "guide", "proof", "research", "expert", "certified"] },
  { key: "purchase-friction", label: "Purchase friction", status: (p) => p.purchaseFriction === "low" ? "strong" : p.purchaseFriction === "medium" ? "mixed" : p.purchaseFriction === "high" ? "weak" : "unknown", rationale: (p) => `The observed purchase path appears to have ${p.purchaseFriction} friction.`, improvement: "Shorten the path from creator content to a clear offer and mobile-ready landing page.", evidenceTerms: () => ["buy", "cart", "price", "book", "quote", "contact"] },
  { key: "repeat-purchase", label: "Repeat purchase or lifetime value", status: (p) => p.repeatPurchasePotential === "high" ? "strong" : p.repeatPurchasePotential === "medium" ? "mixed" : p.repeatPurchasePotential === "low" ? "weak" : "unknown", rationale: (p) => `Repeat-purchase potential appears ${p.repeatPurchasePotential} based on the offer type.`, improvement: "Define the repeat-use, replenishment, or referral behavior that can justify acquisition cost.", evidenceTerms: () => ["subscription", "refill", "membership", "monthly", "renew"] },
  { key: "offer-readiness", label: "Offer readiness", status: (p) => p.products.length && p.pricePositioning !== "unknown" ? "strong" : p.products.length ? "mixed" : "unknown", rationale: (p) => p.products.length ? `The site presents ${p.products.length} identifiable offer${p.products.length === 1 ? "" : "s"}.` : "A concrete offer was not identifiable.", improvement: "Create a campaign-specific offer with a clear benefit, terms, and expiration.", evidenceTerms: (p) => p.products.flatMap((item) => [item.name, item.category]) },
  { key: "tracking-readiness", label: "Tracking readiness", status: (p) => /\b(utm|attribution|tracking|discount code|affiliate link|conversion reporting)\b/.test(evidenceText(p)) ? "mixed" : "unknown", rationale: (p) => /\b(utm|attribution|tracking|discount code|affiliate link|conversion reporting)\b/.test(evidenceText(p)) ? "The reviewed evidence mentions a tracking mechanism, but implementation still requires verification." : "Public pages do not establish attribution, links, or conversion tracking.", improvement: "Prepare unique links, codes, and a lightweight campaign reporting sheet.", evidenceTerms: () => ["utm", "attribution", "tracking", "discount code", "affiliate link", "conversion reporting"] },
  { key: "sample-fulfillment", label: "Sample and fulfillment readiness", status: (p) => /\b(sample inventory|creator samples|fulfillment|ships to|shipping markets|in stock)\b/.test(evidenceText(p)) ? "mixed" : "unknown", rationale: (p) => /\b(sample inventory|creator samples|fulfillment|ships to|shipping markets|in stock)\b/.test(evidenceText(p)) ? "The site provides some fulfillment evidence, but creator sampling capacity still requires confirmation." : "Public pages do not establish creator sampling inventory or fulfillment operations.", improvement: "Define sample inventory, shipping markets, owner, and delivery timeline before outreach.", evidenceTerms: () => ["sample inventory", "creator samples", "fulfillment", "ships to", "shipping markets", "in stock"] },
  { key: "claims-safety", label: "Claims, regulatory, and brand-safety risk", status: (p) => p.riskTags.length ? "mixed" : /\b(approved claims|disclosure guidelines|substantiated claims|legal review)\b/.test(evidenceText(p)) ? "strong" : "unknown", rationale: (p) => p.riskTags.length ? `Review is needed for ${p.riskTags.join(", ")}.` : "No risk keyword is not proof of claims safety; approved language and disclosure controls were not established.", improvement: "Prepare approved claims, prohibited language, disclosure rules, and escalation contacts.", evidenceTerms: (p) => [...p.riskTags, "approved claims", "disclosure guidelines", "substantiated claims", "legal review"] },
];

export function scoreReadiness(profile: BrandProfile): ReadinessDimension[] {
  return readinessSpecs.map((spec) => {
    const status = spec.status(profile);
    return {
      key: spec.key,
      label: spec.label,
      status,
      score: status === "unknown" ? null : statusScore[status],
      rationale: spec.rationale(profile),
      evidenceIds: evidenceIdsFor(profile, spec.evidenceTerms(profile)),
      improvement: spec.improvement,
      confidence: profile.evidence.length >= 4 ? "high" : profile.evidence.length >= 2 ? "medium" : "low",
    };
  });
}

const tokens = (profile: BrandProfile) => new Set(
  [profile.summary, ...profile.targetCustomers, ...profile.customerNeeds, ...profile.differentiators, ...profile.products.flatMap((p) => [p.name, p.category])]
    .join(" ").toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2),
);

const genericMatchWords = new Set(["practical", "visual", "community", "confidence", "choice", "people", "clear", "value", "support", "product", "service"]);
const territorySignals: Record<string, string[]> = {
  "home-improvement": ["hvac", "heating", "cooling", "contractor", "installation", "residential"],
  "wellness-routines": ["wellness", "supplement", "energy", "self care"],
  "skincare-education": ["skincare", "skin", "sensitive skin", "ingredient"],
  education: ["education", "course", "learning", "student"],
  "career-development": ["career", "professional", "course", "job"],
  "miniature-painting": ["miniature", "painting supplies", "tabletop terrain"],
  gaming: ["gaming", "game", "tabletop"],
  "outdoor-recreation": ["outdoor", "camping", "hiking", "trail"],
  "sustainable-living": ["sustainable", "recycled", "reusable", "lower impact"],
  "pet-care": ["pet", "dog", "cat", "animal"],
  "productivity-systems": ["productivity", "planning", "focus", "priorities"],
  "cooking-and-meal-preparation": ["meal", "cooking", "recipe", "food"],
};

export function scoreTerritory(profile: BrandProfile, territory: CreatorTerritory): number {
  const brandTokens = tokens(profile);
  const brandText = [profile.summary, ...profile.products.flatMap((item) => [item.name, item.category]), ...profile.targetCustomers, ...profile.customerNeeds].join(" ").toLowerCase();
  const territoryWords = territory.name.toLowerCase().split(" ").filter((word) => word.length > 3);
  const nameMatches = territoryWords.filter((word) => brandTokens.has(word)).length;
  const signalMatches = (territorySignals[territory.id] ?? []).filter((signal) => brandText.includes(signal)).length;
  const overlap = territory.keywords.filter((keyword) => keyword.split(" ").some((word) => word.length > 3 && !genericMatchWords.has(word) && brandTokens.has(word))).length;
  const customerOverlap = Math.min(100, 18 + nameMatches * 28 + signalMatches * 22 + overlap * 7);
  const naturalness = profile.demonstrability === "strong" ? 88 : profile.demonstrability === "mixed" ? 68 : 44;
  const demonstrability = statusScore[profile.demonstrability];
  const purchasePath = profile.purchaseFriction === "low" ? 88 : profile.purchaseFriction === "medium" ? 66 : 42;
  const trustFit = profile.trustRequirement === "high" && territory.funnelStrengths.includes("consideration") ? 82 : 64;
  const offerCompatibility = profile.products.length ? 76 : 38;
  const operations = profile.riskTags.some((tag) => territory.riskTags.includes(tag)) ? 38 : 72;
  const insufficientEvidencePenalty = profile.evidence.length < 2 ? 10 : 0;
  const regulatoryPenalty = profile.riskTags.some((tag) => /medical|financial|regulated|claims/.test(tag)) && territory.riskTags.some((tag) => /claims|regulatory/.test(tag)) ? 8 : 0;
  return Math.max(0, Math.min(100, Math.round(customerOverlap * .25 + naturalness * .2 + demonstrability * .15 + purchasePath * .1 + trustFit * .1 + offerCompatibility * .1 + operations * .1 - insufficientEvidencePenalty - regulatoryPenalty)));
}

export function rankTerritories(profile: BrandProfile) {
  return creatorTerritories
    .map((territory) => ({ territory, score: scoreTerritory(profile, territory) }))
    .sort((a, b) => b.score - a.score || a.territory.name.localeCompare(b.territory.name));
}

function recommendation(profile: BrandProfile, territory: CreatorTerritory, score: number, classification: TerritoryRecommendation["classification"]): TerritoryRecommendation {
  const need = profile.customerNeeds[0] ?? territory.audienceMotivations[0] ?? "make a confident choice";
  const product = profile.products[0]?.name ?? profile.brandName;
  const format = territory.commonContentFormats[0] ?? "practical demonstration";
  return {
    territoryId: territory.id,
    name: territory.name,
    classification,
    score,
    rationale: classification === "risk" ? `This direction may look attractive, but the available evidence does not yet show a natural, low-risk connection.` : `${territory.name} connects ${profile.brandName} to an audience motivated by ${territory.audienceMotivations.slice(0, 2).join(" and ")}.`,
    audienceConnection: `The audience is already trying to ${need}, which creates a credible role for ${product}.`,
    customerNeed: need,
    contentStyles: territory.commonContentFormats.slice(0, 3),
    creatorProfile: `A trusted ${territory.name.toLowerCase()} educator who uses specific examples and explains tradeoffs.`,
    creatorSizeBand: score >= 75 ? "micro" : score >= 62 ? "small" : "nano",
    sponsorshipFormats: [format, "integrated demonstration"],
    campaignConcepts: [
      { title: "The real-world route", concept: `Show ${product} inside a realistic ${territory.name.toLowerCase()} routine, including one limitation.`, openingHook: `“I changed one part of my routine for a week—here is what actually happened.”` },
      { title: "The decision guide", concept: `Compare the current approach with ${product} using three practical decision criteria.`, openingHook: `“Before you choose this kind of solution, ask these three questions.”` },
    ],
    viewerObjection: `Viewers may question whether ${product} is genuinely useful or merely a sponsored interruption.`,
    keyRisk: territory.riskTags[0] ?? "The creative connection could feel forced without specific evidence.",
    searchQueries: territory.searchTemplates.slice(0, 3),
    evidenceIds: [bestEvidence(profile, [territory.name, product, need, ...territory.keywords])],
    confidence: score >= 75 && profile.evidence.length >= 3 ? "high" : score >= 58 ? "medium" : "low",
  };
}

export function buildCandidateSet(profile: BrandProfile, count = 12): TerritoryRecommendation[] {
  const ranked = rankTerritories(profile);
  const topCount = Math.max(5, count - 3);
  const candidates = [...ranked.slice(0, topCount), ...ranked.slice(-3)];
  return [...new Map(candidates.map((item) => [item.territory.id, item])).values()]
    .map(({ territory, score }) => recommendation(profile, territory, score, "adjacent"));
}

export function selectPortfolio(profile: BrandProfile): TerritoryRecommendation[] {
  const ranked = rankTerritories(profile);
  const core = ranked.slice(0, 3).map(({ territory, score }) => recommendation(profile, territory, score, "core"));
  const adjacent = ranked.slice(3, 5).map(({ territory, score }) => recommendation(profile, territory, score, "adjacent"));
  const experimentalIndex = Math.min(Math.max(8, Math.floor(ranked.length / 3)), ranked.length - 3);
  const experimentalPick = ranked[experimentalIndex];
  const riskPicks = ranked.slice(-2).reverse();
  if (!experimentalPick) throw new Error("Taxonomy is too small to select a portfolio.");
  return [
    ...core,
    ...adjacent,
    recommendation(profile, experimentalPick.territory, experimentalPick.score, "experimental"),
    ...riskPicks.map(({ territory, score }) => recommendation(profile, territory, score, "risk")),
  ];
}

export function hasSufficientEvidence(profile: BrandProfile) {
  const broadMultiCategory = new Set(profile.products.map((item) => item.category.toLowerCase())).size >= 4
    || /\b(wide range|all categories|everything for everyone|multi-category)\b/i.test(profile.summary);
  return profile.evidence.length >= 2
    && profile.summary.trim().length >= 80
    && profile.products.length > 0
    && profile.targetCustomers.some((item) => item.trim().length >= 5)
    && profile.customerNeeds.some((item) => item.trim().length >= 5)
    && !broadMultiCategory;
}

export function buildClarifyingQuestions(profile: BrandProfile) {
  const questions: string[] = [];
  if (!profile.products.length || new Set(profile.products.map((item) => item.category.toLowerCase())).size >= 4) questions.push("Which one product or service should this creator campaign prioritize?");
  if (!profile.targetCustomers.length || profile.targetCustomers.some((item) => /people|everyone|consumer/i.test(item))) questions.push("Who is the primary buyer, and what specific situation causes them to look for this offer?");
  if (!profile.customerNeeds.length) questions.push("What problem or desired outcome should creator content make concrete?");
  questions.push("What price, offer, or call to action should a creator send viewers toward?");
  questions.push("What proof points, approved claims, tracking setup, and fulfillment capacity are already available?");
  return [...new Set(questions)].slice(0, 5);
}

export function assembleDeterministicReport(profile: BrandProfile, options: { id?: string; slug?: string; now?: Date } = {}): CreatorCompassReport {
  const now = options.now ?? new Date();
  const readiness = scoreReadiness(profile);
  const knownScores = readiness.flatMap((item) => item.score == null ? [] : [item.score]);
  const hasEnoughEvidence = hasSufficientEvidence(profile);
  const rawScore = hasEnoughEvidence && knownScores.length ? Math.round(knownScores.reduce((a, b) => a + b, 0) / knownScores.length) : null;
  const criticalUnknowns = readiness.filter((item) => ["tracking-readiness", "sample-fulfillment", "claims-safety"].includes(item.key) && item.status === "unknown");
  const summaryScore = rawScore == null ? null : criticalUnknowns.length ? Math.min(rawScore, 59) : rawScore;
  const territories = selectPortfolio(profile);
  const north = territories.find((item) => item.classification === "core") ?? territories[0];
  if (!north) throw new Error("No territory could be selected.");
  const id = options.id ?? crypto.randomUUID();
  return {
    id,
    slug: options.slug ?? `${profile.canonicalDomain.replace(/\./g, "-")}-${id.slice(0, 8)}`,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 30 * 86_400_000).toISOString(),
    brandProfile: profile,
    readiness,
    readinessSummary: {
      status: summaryScore == null ? "insufficient-evidence" : summaryScore >= 78 ? "ready" : summaryScore >= 62 ? "promising" : summaryScore >= 45 ? "prepare-first" : "poor-fit",
      score: summaryScore,
      summary: summaryScore == null ? `There is not enough specific evidence to give ${profile.brandName} a confident route or numerical readiness score. The directions below are preliminary hypotheses only.` : `Based on the public pages reviewed, ${profile.brandName} ${summaryScore >= 62 ? "appears ready for a bounded creator test" : "should close a few readiness gaps before broad outreach"}.`,
    },
    recommendationState: hasEnoughEvidence ? "recommendation" : "preliminary-hypotheses",
    clarifyingQuestions: hasEnoughEvidence ? [] : buildClarifyingQuestions(profile),
    territories,
    northStar: hasEnoughEvidence ? {
      territoryId: north.territoryId,
      format: north.sponsorshipFormats[0] ?? "integrated demonstration",
      creatorDirection: `${north.creatorSizeBand} ${north.name.toLowerCase()} creators`,
      testShape: "Brief 5 creators, activate 2, use one concept and one measurable landing-page action, then review after 30 days.",
      why: `${north.name} has the strongest combination of audience relevance, content naturalness, and evidence confidence in this analysis.`,
      fixFirst: readiness.filter((item) => item.status === "weak" || item.status === "unknown").slice(0, 3).map((item) => item.improvement),
    } : null,
    nextSteps: hasEnoughEvidence ? [
      `Confirm the customer and product assumptions in the brand snapshot.`,
      `Close the highest-priority readiness gap: ${readiness.find((item) => item.status !== "strong")?.improvement ?? "document campaign tracking"}`,
      `Write a one-page brief for ${north.name}.`,
      `Build a shortlist using: ${north.searchQueries[0] ?? north.name}.`,
      "Run a small, measurable test before expanding the creator mix.",
    ] : [
      "Paste a focused brand description using the questions below.",
      "Choose one priority product or service and one primary buyer.",
      "Add the intended offer, price, and conversion action.",
      "Document available proof, claim restrictions, tracking, and fulfillment.",
      "Generate a new report once the critical evidence is present.",
    ],
    assumptions: [...profile.unknowns, "Creator availability, pricing, audience quality, and willingness to partner require direct verification."],
    methodologyVersion: METHODOLOGY_VERSION,
    aiReview: { usedGpt56: false, model: "deterministic", promptVersion: "review-v1", qualityFlag: "deterministic-fallback" },
  };
}
