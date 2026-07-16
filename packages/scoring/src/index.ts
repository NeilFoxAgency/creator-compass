import type {
  BrandProfile,
  CreatorCompassReport,
  ReadinessDimension,
  TerritoryRecommendation,
} from "@creator-compass/contracts";
import { creatorTerritories, type CreatorTerritory } from "@creator-compass/taxonomy";

export const METHODOLOGY_VERSION = "2026.07.1";

const statusScore = { strong: 90, mixed: 62, weak: 32, unknown: 50 } as const;
const firstEvidence = (profile: BrandProfile) => profile.evidence[0]?.id ?? "evidence-1";

type ReadinessSpec = {
  key: string;
  label: string;
  status: (profile: BrandProfile) => keyof typeof statusScore;
  rationale: (profile: BrandProfile) => string;
  improvement: string;
};

const readinessSpecs: ReadinessSpec[] = [
  { key: "audience-clarity", label: "Audience clarity", status: (p) => p.targetCustomers.length >= 2 ? "strong" : p.targetCustomers.length ? "mixed" : "unknown", rationale: (p) => p.targetCustomers.length ? `The public site points to ${p.targetCustomers.join(" and ")}.` : "The reviewed pages do not define a specific customer clearly.", improvement: "Name the primary buyer and the moment that triggers purchase." },
  { key: "demonstrability", label: "Product demonstrability", status: (p) => p.demonstrability, rationale: (p) => `The offer appears ${p.demonstrability} to show inside creator content.`, improvement: "Prepare a short, visual product demonstration that shows the before-and-after moment." },
  { key: "content-naturalness", label: "Naturalness in creator content", status: (p) => p.demonstrability === "strong" ? "strong" : p.demonstrability === "weak" ? "weak" : "mixed", rationale: (p) => `${p.products[0]?.name ?? "The offer"} can be connected to ${p.customerNeeds[0] ?? "a customer need"}, with some creative framing.`, improvement: "Document three real situations where the product naturally enters a customer's day." },
  { key: "trust-education", label: "Trust or education requirement", status: (p) => p.trustRequirement === "low" ? "strong" : p.trustRequirement === "medium" ? "mixed" : p.trustRequirement === "high" ? "weak" : "unknown", rationale: (p) => `The purchase appears to require ${p.trustRequirement} trust or education.`, improvement: "Give creators substantiated proof points and plain-language answers to likely objections." },
  { key: "purchase-friction", label: "Purchase friction", status: (p) => p.purchaseFriction === "low" ? "strong" : p.purchaseFriction === "medium" ? "mixed" : p.purchaseFriction === "high" ? "weak" : "unknown", rationale: (p) => `The observed purchase path appears to have ${p.purchaseFriction} friction.`, improvement: "Shorten the path from creator content to a clear offer and mobile-ready landing page." },
  { key: "repeat-purchase", label: "Repeat purchase or lifetime value", status: (p) => p.repeatPurchasePotential === "high" ? "strong" : p.repeatPurchasePotential === "medium" ? "mixed" : p.repeatPurchasePotential === "low" ? "weak" : "unknown", rationale: (p) => `Repeat-purchase potential appears ${p.repeatPurchasePotential} based on the offer type.`, improvement: "Define the repeat-use, replenishment, or referral behavior that can justify acquisition cost." },
  { key: "offer-readiness", label: "Offer readiness", status: (p) => p.products.length && p.pricePositioning !== "unknown" ? "strong" : p.products.length ? "mixed" : "unknown", rationale: (p) => p.products.length ? `The site presents ${p.products.length} identifiable offer${p.products.length === 1 ? "" : "s"}.` : "A concrete offer was not identifiable.", improvement: "Create a campaign-specific offer with a clear benefit, terms, and expiration." },
  { key: "tracking-readiness", label: "Tracking readiness", status: () => "unknown", rationale: () => "Public pages do not establish attribution, links, or conversion tracking.", improvement: "Prepare unique links, codes, and a lightweight campaign reporting sheet." },
  { key: "sample-fulfillment", label: "Sample and fulfillment readiness", status: (p) => p.products.length ? "mixed" : "unknown", rationale: () => "Product availability is visible, but creator sampling and fulfillment operations require confirmation.", improvement: "Define sample inventory, shipping markets, owner, and delivery timeline before outreach." },
  { key: "claims-safety", label: "Claims, regulatory, and brand-safety risk", status: (p) => p.riskTags.length ? "mixed" : "strong", rationale: (p) => p.riskTags.length ? `Review is needed for ${p.riskTags.join(", ")}.` : "No prominent high-risk claim category was observed, but this is not a legal conclusion.", improvement: "Prepare approved claims, prohibited language, disclosure rules, and escalation contacts." },
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
      evidenceIds: [firstEvidence(profile)],
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
    evidenceIds: [firstEvidence(profile)],
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

export function assembleDeterministicReport(profile: BrandProfile, options: { id?: string; slug?: string; now?: Date } = {}): CreatorCompassReport {
  const now = options.now ?? new Date();
  const readiness = scoreReadiness(profile);
  const knownScores = readiness.flatMap((item) => item.score == null ? [] : [item.score]);
  const hasEnoughEvidence = profile.evidence.length >= 2 && readiness.filter((item) => item.status === "unknown").length < 5;
  const summaryScore = hasEnoughEvidence && knownScores.length ? Math.round(knownScores.reduce((a, b) => a + b, 0) / knownScores.length) : null;
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
      summary: `Based on the public pages reviewed, ${profile.brandName} ${summaryScore != null && summaryScore >= 62 ? "appears ready for a bounded creator test" : "should close a few readiness gaps before broad outreach"}.`,
    },
    territories,
    northStar: {
      territoryId: north.territoryId,
      format: north.sponsorshipFormats[0] ?? "integrated demonstration",
      creatorDirection: `${north.creatorSizeBand} ${north.name.toLowerCase()} creators`,
      testShape: "Brief 5 creators, activate 2, use one concept and one measurable landing-page action, then review after 30 days.",
      why: `${north.name} has the strongest combination of audience relevance, content naturalness, and evidence confidence in this analysis.`,
      fixFirst: readiness.filter((item) => item.status === "weak" || item.status === "unknown").slice(0, 3).map((item) => item.improvement),
    },
    nextSteps: [
      `Confirm the customer and product assumptions in the brand snapshot.`,
      `Close the highest-priority readiness gap: ${readiness.find((item) => item.status !== "strong")?.improvement ?? "document campaign tracking"}`,
      `Write a one-page brief for ${north.name}.`,
      `Build a shortlist using: ${north.searchQueries[0] ?? north.name}.`,
      "Run a small, measurable test before expanding the creator mix.",
    ],
    assumptions: [...profile.unknowns, "Creator availability, pricing, audience quality, and willingness to partner require direct verification."],
    methodologyVersion: METHODOLOGY_VERSION,
    aiReview: { usedGpt56: false, model: "deterministic", promptVersion: "review-v1", qualityFlag: "deterministic-fallback" },
  };
}
