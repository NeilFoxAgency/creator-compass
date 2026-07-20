import type {
  BrandProfile,
  CreatorCompassReport,
  ReadinessDimension,
  TerritoryRecommendation,
} from "@creator-compass/contracts";
import { creatorTerritories, type CreatorTerritory } from "@creator-compass/taxonomy";

export const METHODOLOGY_VERSION = "2026.07.4";

const statusScore = { strong: 90, mixed: 62, weak: 32, unknown: 50 } as const;
const genericMatchWords = new Set([
  "ai",
  "business",
  "capability",
  "community",
  "confidence",
  "digital",
  "growth",
  "people",
  "platform",
  "practical",
  "product",
  "self",
  "service",
  "support",
  "technology",
  "tool",
  "tools",
  "value",
  "visual",
]);

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export function humanizeDisplayText(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\be\s+commerce\b/gi, "e-commerce")
    .replace(/\bseo\b/gi, "SEO")
    .replace(/\bai\b/gi, "AI")
    .replace(/\bmcp\b/gi, "MCP")
    .replace(/\bsaas\b/gi, "SaaS")
    .replace(/\bb2b\b/gi, "B2B")
    .replace(/\bapi\b/gi, "API")
    .replace(/\bugc\b/gi, "UGC")
    .replace(/\s+/g, " ")
    .trim();
}

const meaningfulTokens = (value: string) => [
  ...new Set(
    normalize(value)
      .split(" ")
      .filter((word) => word.length > 2 && !genericMatchWords.has(word)),
  ),
];

function affirmativeEvidence(value: string) {
  return value
    .replace(
      /\b(?:do(?:es)?|did|is|are|was|were|has|have|had|can|could|will|would|should|must)\s+not\b[^.!?\n]*/gi,
      " ",
    )
    .replace(/\b(?:no|without)\s+(?:claims?\s+(?:of|about)\s+)?[^.!?\n]*/gi, " ");
}

function phraseMatch(left: string, right: string) {
  const a = normalize(left);
  const b = normalize(right);
  if (!a || !b) return 0;
  if (a === b) return 100;
  const aTokens = meaningfulTokens(a);
  const bTokens = meaningfulTokens(b);
  if (!aTokens.length || !bTokens.length) return 0;
  const aPhrase = ` ${a} `;
  const bPhrase = ` ${b} `;
  if (
    (aPhrase.includes(` ${b} `) || bPhrase.includes(` ${a} `)) &&
    Math.min(aTokens.length, bTokens.length) >= 1
  )
    return Math.min(aTokens.length, bTokens.length) >= 2 ? 92 : 68;
  const intersection = aTokens.filter((token) => bTokens.includes(token));
  if (!intersection.length) return 0;
  const coverage = intersection.length / Math.min(aTokens.length, bTokens.length);
  if (intersection.length === 1 && Math.max(aTokens.length, bTokens.length) > 2)
    return coverage >= 0.5 ? 42 : 0;
  return Math.round(coverage * 82);
}

function maxFacetMatch(left: string[], right: string[]) {
  let best = 0;
  for (const a of left) for (const b of right) best = Math.max(best, phraseMatch(a, b));
  return best;
}

const evidenceText = (profile: BrandProfile) =>
  profile.evidence.map((item) => affirmativeEvidence(item.excerpt).toLowerCase()).join(" ");

const profileText = (profile: BrandProfile) =>
  [
    profile.summary,
    ...profile.products.flatMap((item) => [item.name, item.category]),
    ...profile.targetCustomers,
    ...profile.customerNeeds,
    ...profile.differentiators,
    ...(profile.buyerRoles ?? []),
    ...(profile.userRoles ?? []),
    ...(profile.industries ?? []),
    ...(profile.useCases ?? []),
    ...(profile.jobsToBeDone ?? []),
  ].join(" ");

const inferredAudienceType = (profile: BrandProfile) => {
  if (profile.audienceType && profile.audienceType !== "unknown") return profile.audienceType;
  return /\b(b2b|saas|agency|marketers?|developers?|business|founders?|teams?|professionals?)\b/i.test(
    profileText(profile),
  )
    ? "b2b"
    : "b2c";
};

const inferredProductType = (profile: BrandProfile) => {
  if (profile.productType && profile.productType !== "unknown") return profile.productType;
  const text = profileText(profile);
  if (/\b(saas|software|platform|api|app|mcp|developer tool|open source)\b/i.test(text))
    return "software";
  if (/\b(service|agency|consulting|installation|contractor)\b/i.test(text)) return "service";
  return "physical-product";
};

function relevantEvidenceIds(profile: BrandProfile, terms: string[], limit = 3) {
  const ranked = profile.evidence
    .map((item, index) => ({
      id: item.id,
      index,
      score: terms.reduce(
        (score, term) => score + (phraseMatch(item.excerpt, term) >= 42 ? 1 : 0),
        0,
      ),
    }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .filter((item) => item.score > 0)
    .slice(0, limit)
    .map((item) => item.id);
  return ranked.length ? ranked : profile.evidence.slice(0, 1).map((item) => item.id);
}

export type TerritoryScoreBreakdown = {
  categoryUseCaseMatch: number;
  buyerRoleOverlap: number;
  jobsToBeDoneOverlap: number;
  contentFormatNaturalness: number;
  purchaseInfluenceIntent: number;
  evidenceStrength: number;
  incompatibilityPenalty: number;
  directEvidenceMatch: number;
};

export type TerritoryScoreResult = {
  territory: CreatorTerritory;
  /** @deprecated Use territoryFitScore. */
  score: number;
  territoryFitScore: number;
  evidenceConfidence: "high" | "medium" | "low";
  eligible: boolean;
  eligibilityReasons: string[];
  scoreComponents: TerritoryScoreBreakdown;
};

function scoreTerritoryDetailed(
  profile: BrandProfile,
  territory: CreatorTerritory,
): TerritoryScoreResult {
  const categories = [
    ...profile.products.flatMap((item) => [item.name, item.category]),
    ...(profile.industries ?? []),
    ...(profile.useCases ?? []),
  ];
  const categoryTargets = [
    territory.name,
    ...territory.categorySignals,
    ...territory.industries,
    ...territory.useCases,
  ];
  const categoryUseCaseMatch = maxFacetMatch(categories, categoryTargets);
  const buyerRoleOverlap = maxFacetMatch(
    [...profile.targetCustomers, ...(profile.buyerRoles ?? []), ...(profile.userRoles ?? [])],
    [...territory.buyerRoles, ...territory.userRoles],
  );
  const jobsToBeDoneOverlap = maxFacetMatch(
    [
      ...profile.customerNeeds,
      ...(profile.jobsToBeDone ?? []),
      ...(profile.buyerGoalVerbPhrases ?? []),
    ],
    territory.jobsToBeDone,
  );
  const directEvidenceMatch = maxFacetMatch(
    profile.evidence.map((item) => affirmativeEvidence(item.excerpt)),
    [
      ...categoryTargets,
      ...territory.buyerRoles,
      ...territory.userRoles,
      ...territory.jobsToBeDone,
    ],
  );
  const directMatch = Math.max(categoryUseCaseMatch, buyerRoleOverlap, jobsToBeDoneOverlap);
  const audienceType = inferredAudienceType(profile);
  const productType = inferredProductType(profile);
  const b2bLifestyleMismatch =
    audienceType === "b2b" &&
    productType === "software" &&
    territory.audienceType === "b2c" &&
    territory.exclusionTags.includes("b2b-software-without-specific-bridge") &&
    directMatch < 72;
  const broadConsumerTechMismatch =
    audienceType === "b2b" &&
    productType === "software" &&
    ["consumer-technology", "ai-industry-news"].includes(territory.id) &&
    ![...(profile.useCases ?? []), ...(profile.buyerRoles ?? [])].some((item) =>
      /\b(consumer device|gadget|personal technology buyer|ai news)\b/i.test(item),
    );
  const productMismatch =
    !territory.compatibleProductTypes.includes(productType) &&
    productType !== "mixed" &&
    directMatch < 72;
  const incompatibilityPenalty =
    b2bLifestyleMismatch || broadConsumerTechMismatch ? 90 : productMismatch ? 35 : 0;
  const seoEvidencePresent =
    territory.id !== "seo-and-search-marketing" ||
    /\b(SEO|search marketing|search engine optimization|keywords?|search rankings?|SERPs?|backlinks?|site audits?|technical SEO)\b/i.test(
      evidenceText(profile),
    );
  const openSourceEvidencePresent =
    territory.id !== "open-source-and-self-hosting" ||
    /\b(open source|open-source|self.host(?:ed|ing)?|source code|GitHub)\b/i.test(
      evidenceText(profile),
    );
  const eligible =
    directMatch >= 46 &&
    incompatibilityPenalty === 0 &&
    seoEvidencePresent &&
    openSourceEvidencePresent;
  const contentFormatNaturalness = !eligible
    ? 0
    : profile.demonstrability === "strong"
      ? 90
      : profile.demonstrability === "mixed"
        ? 70
        : profile.demonstrability === "weak"
          ? 38
          : 52;
  const purchaseInfluenceIntent = !eligible
    ? 0
    : territory.purchaseIntent === "high"
      ? 92
      : territory.purchaseIntent === "medium"
        ? 65
        : 30;
  const matchedTerms = [
    ...categories,
    ...(profile.buyerRoles ?? []),
    ...(profile.jobsToBeDone ?? []),
  ].filter((term) => categoryTargets.some((target) => phraseMatch(term, target) >= 42));
  const matchingEvidence = profile.evidence.filter((item) =>
    matchedTerms.some((term) => phraseMatch(item.excerpt, term) >= 42),
  ).length;
  const evidenceStrength = !eligible
    ? 0
    : matchingEvidence >= 3
      ? 92
      : matchingEvidence >= 1
        ? 68
        : 38;
  const weighted =
    categoryUseCaseMatch * 0.38 +
    buyerRoleOverlap * 0.23 +
    jobsToBeDoneOverlap * 0.17 +
    contentFormatNaturalness * 0.1 +
    purchaseInfluenceIntent * 0.07 +
    evidenceStrength * 0.05 -
    incompatibilityPenalty;
  const territoryFitScore = eligible
    ? Math.max(0, Math.min(100, Math.round(weighted)))
    : Math.max(0, Math.min(18, Math.round(directMatch * 0.18)));
  const evidenceConfidence =
    matchingEvidence >= 3 ? "high" : matchingEvidence >= 1 ? "medium" : "low";
  const eligibilityReasons = [
    categoryUseCaseMatch >= 46 ? "category or use-case match" : "",
    buyerRoleOverlap >= 46 ? "buyer-role overlap" : "",
    jobsToBeDoneOverlap >= 46 ? "job-to-be-done overlap" : "",
    b2bLifestyleMismatch ? "B2B software and consumer-lifestyle mismatch" : "",
    broadConsumerTechMismatch ? "broad attention audience without evidenced buyer intent" : "",
    productMismatch ? "product-type mismatch" : "",
    !seoEvidencePresent ? "no direct SEO evidence" : "",
    !openSourceEvidencePresent ? "no direct open-source or self-hosting evidence" : "",
  ].filter(Boolean);
  return {
    territory,
    score: territoryFitScore,
    territoryFitScore,
    evidenceConfidence,
    eligible,
    eligibilityReasons,
    scoreComponents: {
      categoryUseCaseMatch,
      buyerRoleOverlap,
      jobsToBeDoneOverlap,
      contentFormatNaturalness,
      purchaseInfluenceIntent,
      evidenceStrength,
      incompatibilityPenalty,
      directEvidenceMatch,
    },
  };
}

export function scoreTerritory(profile: BrandProfile, territory: CreatorTerritory) {
  return scoreTerritoryDetailed(profile, territory).territoryFitScore;
}

export function rankTerritories(profile: BrandProfile) {
  return creatorTerritories
    .map((territory) => scoreTerritoryDetailed(profile, territory))
    .sort(
      (a, b) =>
        Number(b.eligible) - Number(a.eligible) ||
        b.territoryFitScore - a.territoryFitScore ||
        a.territory.name.localeCompare(b.territory.name),
    );
}

function fitLabel(score: number, classification: TerritoryRecommendation["classification"]) {
  if (classification === "risk") return "not-recommended" as const;
  if (score >= 70) return "strong-fit" as const;
  if (score >= 50) return "promising-fit" as const;
  return "exploratory" as const;
}

function safeGoal(profile: BrandProfile, territory: CreatorTerritory) {
  const candidates = [
    ...(profile.buyerGoalVerbPhrases ?? []),
    ...(profile.jobsToBeDone ?? []),
    ...profile.customerNeeds,
  ];
  const verb =
    /^(improve|increase|reduce|find|analyze|audit|build|connect|automate|choose|compare|evaluate|grow|manage|research|track|understand|use|create|deliver|optimize|identify|retain|avoid|monitor|self-host|integrate|perform|inspect|summarize|access|retrieve|review|read|save|conduct)\b/i;
  const matched = candidates.find(
    (item) =>
      verb.test(item.trim()) && territory.jobsToBeDone.some((job) => phraseMatch(item, job) >= 42),
  );
  const anyVerb = candidates.find((item) => verb.test(item.trim()));
  const noun = candidates.find((item) => item.trim().length > 2);
  return (
    matched?.trim() ??
    anyVerb?.trim() ??
    (noun ? `evaluate ${noun.trim()}` : (territory.jobsToBeDone[0] ?? "evaluate the offer"))
  );
}

const territoryFeaturePriorities: Record<string, string[]> = {
  "seo-and-search-marketing": [
    "keyword research",
    "backlink analysis",
    "rank tracking",
    "site audits",
  ],
  "ai-agents-and-workflow-automation": ["MCP", "AI agent", "workflow automation", "integration"],
  "developer-tools": ["MCP", "self-hosting", "open source", "API", "developer workflow"],
  "open-source-and-self-hosting": [
    "self-hosting",
    "open source",
    "usage-based pricing",
    "billed by usage",
    "source code",
    "deployment",
  ],
  "saas-and-indie-hacking": ["usage-based pricing", "self-hosting", "product analytics"],
  "web-development": ["site audits", "technical SEO", "Search Console", "website"],
  "growth-marketing-and-conversion-optimization": [
    "rank tracking",
    "site audits",
    "backlink analysis",
    "competitor analysis",
  ],
  "agency-operations": ["site audits", "backlink analysis", "keyword research", "client reporting"],
  "ai-image-and-video-creation": [
    "integration of multiple AI models",
    "AI video generation",
    "AI image generation",
    "product photography",
  ],
  "creative-ai-and-design-workflows": [
    "integration of multiple AI models",
    "visual content production",
    "product photography",
  ],
};

function matchedUseCases(profile: BrandProfile, territory: CreatorTerritory) {
  const candidates = [
    ...(profile.useCases ?? []),
    ...profile.differentiators,
    ...profile.products.map((item) => item.category),
  ].filter((value, index, all) => all.indexOf(value) === index);
  const priorities = territoryFeaturePriorities[territory.id] ?? [];
  const prioritized = priorities.flatMap((priority) =>
    candidates.some(
      (value) =>
        normalize(value).includes(normalize(priority)) ||
        normalize(priority).includes(normalize(value)),
    )
      ? [priority === "billed by usage" ? "usage-based pricing" : priority]
      : [],
  );
  const ranked = candidates
    .map((value) => ({
      value,
      score: maxFacetMatch([value], [...territory.useCases, ...territory.categorySignals]),
    }))
    .sort((a, b) => b.score - a.score)
    .map(({ value }) => value);
  const uniquePrioritized = prioritized.filter((value, index, all) => all.indexOf(value) === index);
  const selected = [...uniquePrioritized, ...ranked].filter(
    (value, index, all) => all.indexOf(value) === index,
  );
  const secondary = uniquePrioritized.slice(1, 4);
  return [
    selected[0] ?? territory.useCases[0] ?? territory.name.toLowerCase(),
    secondary.length > 1
      ? new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(secondary)
      : (secondary[0] ??
        selected[1] ??
        selected[0] ??
        territory.useCases[0] ??
        territory.name.toLowerCase()),
  ] as const;
}

function recommendation(
  profile: BrandProfile,
  scored: TerritoryScoreResult,
  classification: TerritoryRecommendation["classification"],
): TerritoryRecommendation {
  const { territory, territoryFitScore, scoreComponents, evidenceConfidence } = scored;
  const extractedProductName = profile.products[0]?.name?.trim();
  const internalSlug = Boolean(
    extractedProductName && /^[a-z0-9]+(?:-[a-z0-9]+)+$/.test(extractedProductName),
  );
  const product =
    !extractedProductName ||
    internalSlug ||
    /^(?:(?:modern|open[- ]source)\s+)?(?:seo\s+)?(?:platform|software|service|product|tool)$/i.test(
      extractedProductName,
    )
      ? profile.brandName
      : humanizeDisplayText(extractedProductName);
  const goal = humanizeDisplayText(safeGoal(profile, territory));
  const [rawUseCase, rawSecondaryUseCase] = matchedUseCases(profile, territory);
  const useCase = humanizeDisplayText(rawUseCase);
  const secondaryUseCase = humanizeDisplayText(rawSecondaryUseCase);
  const format = territory.commonContentFormats[0] ?? "practical demonstration";
  const secondFormat = territory.commonContentFormats[1] ?? "comparison";
  const evidenceIds = relevantEvidenceIds(profile, [
    territory.name,
    useCase,
    goal,
    ...territory.categorySignals,
  ]);
  const risk = classification === "risk";
  return {
    territoryId: territory.id,
    name: territory.name,
    classification,
    score: territoryFitScore,
    territoryFitScore,
    fitLabel: fitLabel(territoryFitScore, classification),
    evidenceConfidence,
    scoreComponents,
    ...(classification === "risk" && "riskCandidateScore" in scored
      ? { riskCandidateScore: Number(scored.riskCandidateScore) }
      : {}),
    rationale: risk
      ? `${territory.name} has a tempting surface connection, but the available evidence does not show sufficient buyer intent or a defensible use-case bridge.`
      : `${territory.name} is supported by ${scored.eligibilityReasons.filter((reason) => !reason.includes("mismatch")).join(" and ")}.`,
    audienceConnection: risk
      ? `The topic may attract attention, but its audience is not clearly trying to ${goal}.`
      : `This audience includes people who need to ${goal}, giving ${product} a specific role through ${useCase}.`,
    customerNeed: goal,
    contentStyles: territory.commonContentFormats.slice(0, 3),
    creatorProfile: `A ${territory.name.toLowerCase()} practitioner who can demonstrate ${useCase}, explain tradeoffs, and speak to ${territory.buyerRoles.slice(0, 2).join(" or ")}.`,
    creatorSizeBand: territoryFitScore >= 80 ? "micro" : territoryFitScore >= 60 ? "small" : "nano",
    sponsorshipFormats: [format, "integrated demonstration"],
    campaignConcepts: [
      {
        title: `${useCase}: working walkthrough`,
        concept: `Have a creator use ${product} to ${goal} in a concrete workflow focused on ${useCase}, showing inputs, decisions, output, and one limitation.`,
        openingHook: `Here is how I use ${product} to ${goal}—and where it does not replace judgment.`,
      },
      {
        title: `${secondaryUseCase}: ${secondFormat}`,
        concept: `Compare ${product} with the audience's current way of handling ${secondaryUseCase}, using criteria drawn from the documented buyer problem rather than a generic feature list.`,
        openingHook: `If you need to ${goal}, these are the tradeoffs I would check before choosing a route.`,
      },
    ],
    viewerObjection: risk
      ? "Viewers may recognize the topic overlap but have little reason to adopt or influence purchase of this offer."
      : `Viewers may question whether ${product} materially improves ${useCase} or merely adds another tool.`,
    keyRisk: risk
      ? `Attention may not translate into qualified adoption because ${territory.name.toLowerCase()} is not an evidenced buyer community.`
      : (territory.riskTags[0] ?? "The connection must stay grounded in demonstrated use."),
    searchQueries: territory.searchTemplates.slice(0, 3),
    evidenceIds,
    confidence: evidenceConfidence,
  };
}

export function rankRiskCandidates(profile: BrandProfile) {
  const text = normalize(profileText(profile));
  const audienceType = inferredAudienceType(profile);
  const productType = inferredProductType(profile);
  return creatorTerritories
    .map((territory) => {
      const detailed = scoreTerritoryDetailed(profile, territory);
      const superficialMatches = territory.superficialMatchRisks.filter((term) => {
        const normalized = normalize(term);
        return meaningfulTokens(normalized).length > 0 && phraseMatch(text, normalized) >= 42;
      }).length;
      const strategicMismatch =
        (audienceType === "b2b" && territory.audienceType === "b2c") ||
        (productType === "software" && territory.purchaseIntent !== "high");
      const namedB2bSoftwareRisk =
        audienceType === "b2b" &&
        productType === "software" &&
        territory.id === "consumer-technology"
          ? 82
          : audienceType === "b2b" &&
              productType === "software" &&
              territory.id === "ai-industry-news" &&
              /\b(ai|agent|mcp)\b/i.test(profileText(profile))
            ? 76
            : 0;
      const riskCandidateScore = Math.max(
        namedB2bSoftwareRisk,
        superficialMatches > 0 && strategicMismatch
          ? Math.min(100, superficialMatches * 24 + 36)
          : 0,
      );
      return { ...detailed, riskCandidateScore };
    })
    .filter((item) => !item.eligible && item.riskCandidateScore >= 48)
    .sort(
      (a, b) =>
        b.riskCandidateScore - a.riskCandidateScore ||
        a.territory.name.localeCompare(b.territory.name),
    );
}

export function buildCandidateSet(profile: BrandProfile, count = 12): TerritoryRecommendation[] {
  const eligible = rankTerritories(profile)
    .filter(
      (item) =>
        item.eligible &&
        item.territoryFitScore >= 38 &&
        item.scoreComponents.directEvidenceMatch >= (item.territoryFitScore < 50 ? 46 : 42),
    )
    .slice(0, Math.max(0, count - 2))
    .map((item) => recommendation(profile, item, "adjacent"));
  const risks = rankRiskCandidates(profile)
    .slice(0, Math.min(2, count - eligible.length))
    .map((item) => recommendation(profile, item, "risk"));
  return [...eligible, ...risks];
}

export function selectPortfolio(profile: BrandProfile): TerritoryRecommendation[] {
  const ranked = rankTerritories(profile).filter((item) => item.eligible);
  const coreScores = ranked
    .filter(
      (item) => item.territoryFitScore >= 70 && item.scoreComponents.directEvidenceMatch >= 46,
    )
    .slice(0, 3);
  const coreIds = new Set(coreScores.map((item) => item.territory.id));
  const adjacentScores = ranked
    .filter(
      (item) =>
        !coreIds.has(item.territory.id) &&
        item.territoryFitScore >= 50 &&
        item.scoreComponents.directEvidenceMatch >= 42,
    )
    .slice(0, 3);
  const selectedIds = new Set([...coreScores, ...adjacentScores].map((item) => item.territory.id));
  const experimentalScores = ranked
    .filter(
      (item) =>
        !selectedIds.has(item.territory.id) &&
        item.territoryFitScore >= 38 &&
        item.territoryFitScore < 50 &&
        item.scoreComponents.directEvidenceMatch >= 46,
    )
    .slice(0, 2);
  const risks = rankRiskCandidates(profile).slice(0, 2);
  return [
    ...coreScores.map((item) => recommendation(profile, item, "core")),
    ...adjacentScores.map((item) => recommendation(profile, item, "adjacent")),
    ...experimentalScores.map((item) => recommendation(profile, item, "experimental")),
    ...risks.map((item) => recommendation(profile, item, "risk")),
  ];
}

const campaignTrackingPattern =
  /\b(utm(?: parameters?| links?)?|affiliate links?|referral codes?|discount codes?|campaign attribution|conversion events?|campaign reporting|creator campaign tracking)\b/i;

function readinessDimension(
  profile: BrandProfile,
  key: string,
  label: string,
  status: ReadinessDimension["status"],
  rationale: string,
  improvement: string,
  terms: string[],
): ReadinessDimension {
  return {
    key,
    label,
    status,
    score: status === "unknown" || status === "not-applicable" ? null : statusScore[status],
    rationale,
    evidenceIds:
      status === "unknown" || status === "not-applicable"
        ? []
        : relevantEvidenceIds(profile, terms),
    improvement,
    confidence:
      profile.evidence.length >= 4 ? "high" : profile.evidence.length >= 2 ? "medium" : "low",
  };
}

export function scoreReadiness(profile: BrandProfile): ReadinessDimension[] {
  const text = evidenceText(profile);
  const productType = inferredProductType(profile);
  const software = productType === "software" || productType === "digital-product";
  const audienceStatus =
    profile.targetCustomers.length >= 2
      ? "strong"
      : profile.targetCustomers.length
        ? "mixed"
        : "unknown";
  const offerStatus =
    profile.products.length && profile.pricePositioning !== "unknown"
      ? "strong"
      : profile.products.length
        ? "mixed"
        : "unknown";
  const trackingStatus = campaignTrackingPattern.test(text) ? "mixed" : "unknown";
  const claimsStatus =
    /\b(approved claims|disclosure guidelines|substantiated claims|legal review)\b/i.test(text)
      ? "strong"
      : profile.riskTags.length
        ? "mixed"
        : "unknown";
  const common: ReadinessDimension[] = [
    readinessDimension(
      profile,
      "audience-clarity",
      "Audience clarity",
      audienceStatus,
      audienceStatus === "unknown"
        ? "The reviewed pages do not define a primary buyer."
        : `The public site identifies ${profile.targetCustomers.join(", ")}.`,
      "Name the primary buyer and the purchase trigger.",
      profile.targetCustomers,
    ),
    readinessDimension(
      profile,
      "demonstrability",
      "Product demonstrability",
      profile.demonstrability,
      `The offer appears ${profile.demonstrability} to demonstrate in creator content.`,
      "Prepare a short, honest demonstration with a visible input and output.",
      ["demo", "tutorial", "walkthrough", ...(profile.useCases ?? [])],
    ),
    readinessDimension(
      profile,
      "trust-education",
      "Trust and education requirement",
      profile.trustRequirement === "low"
        ? "strong"
        : profile.trustRequirement === "medium"
          ? "mixed"
          : profile.trustRequirement === "high"
            ? "weak"
            : "unknown",
      `The purchase requires ${profile.trustRequirement} trust or education.`,
      "Prepare substantiated proof and plain-language objection handling.",
      ["proof", "documentation", "case study", "research"],
    ),
    readinessDimension(
      profile,
      "offer-readiness",
      "Offer readiness",
      offerStatus,
      offerStatus === "unknown"
        ? "A campaign-ready offer was not established."
        : `The site presents ${profile.products.length} identifiable offer${profile.products.length === 1 ? "" : "s"}.`,
      "Define the creator-specific offer, terms, and conversion action.",
      profile.products.flatMap((item) => [item.name, item.category, item.priceText ?? ""]),
    ),
    readinessDimension(
      profile,
      "tracking-readiness",
      "Campaign attribution readiness",
      trackingStatus,
      trackingStatus === "unknown"
        ? "Rank tracking and product analytics do not establish creator-campaign attribution. No UTM, referral, affiliate, or conversion-event setup was evidenced."
        : "The evidence mentions a campaign attribution mechanism, but implementation still needs verification.",
      "Prepare UTM links or referral codes and define the conversion event and reporting owner.",
      ["utm", "affiliate", "referral", "conversion event", "campaign attribution"],
    ),
    readinessDimension(
      profile,
      "claims-safety",
      "Claims and brand-safety controls",
      claimsStatus,
      claimsStatus === "unknown"
        ? "The absence of a risk keyword is not evidence of approved claims or disclosure controls."
        : profile.riskTags.length
          ? `Review is needed for ${profile.riskTags.join(", ")}.`
          : "Approved claims or disclosure controls are described.",
      "Document approved claims, prohibited language, disclosures, and escalation contacts.",
      [...profile.riskTags, "approved claims", "disclosure"],
    ),
  ];
  const softwareSpecific: ReadinessDimension[] = [
    readinessDimension(
      profile,
      "demo-trial-readiness",
      "Demo or trial readiness",
      /\b(demo|trial|free plan|start free|sign up)\b/i.test(text) ? "mixed" : "unknown",
      /\b(demo|trial|free plan|start free|sign up)\b/i.test(text)
        ? "A demo or trial path is visible, but creator suitability requires verification."
        : "No creator-ready demo or trial path was established.",
      "Create a low-friction trial or guided demo for creators.",
      ["demo", "trial", "start free", "sign up"],
    ),
    readinessDimension(
      profile,
      "creator-account-provisioning",
      "Creator account provisioning",
      /\b(creator account|partner account|sandbox account|test account)\b/i.test(text)
        ? "mixed"
        : "unknown",
      "Public evidence does not establish creator account provisioning or permissions.",
      "Define who creates, funds, and supports creator accounts.",
      ["creator account", "partner account", "sandbox account"],
    ),
    readinessDimension(
      profile,
      "onboarding-documentation",
      "Onboarding and documentation",
      /\b(documentation|docs|getting started|setup guide)\b/i.test(text) ? "mixed" : "unknown",
      /\b(documentation|docs|getting started|setup guide)\b/i.test(text)
        ? "Setup or documentation is visible, but creator onboarding still requires a campaign path."
        : "Creator-ready onboarding and documentation were not established.",
      "Prepare a concise onboarding path tied to the campaign use case.",
      ["documentation", "getting started", "setup guide"],
    ),
    readinessDimension(
      profile,
      "test-environment",
      "Test environment readiness",
      /\b(sandbox|test environment|demo workspace|sample project)\b/i.test(text)
        ? "mixed"
        : "unknown",
      "A safe creator test environment was not established from public evidence.",
      "Provide a sandbox, demo workspace, or reproducible sample project.",
      ["sandbox", "test environment", "demo workspace"],
    ),
  ];
  const physicalSpecific: ReadinessDimension[] = [
    readinessDimension(
      profile,
      "sample-inventory",
      "Sample inventory",
      /\b(creator samples?|sample inventory)\b/i.test(text) ? "mixed" : "unknown",
      "Creator sample inventory is not established from public evidence.",
      "Reserve creator sample inventory and assign an owner.",
      ["creator sample", "sample inventory"],
    ),
    readinessDimension(
      profile,
      "shipping-fulfillment",
      "Shipping and fulfillment",
      /\b(shipping|ships to|fulfillment|delivery)\b/i.test(text) ? "mixed" : "unknown",
      "Shipping evidence is incomplete for a creator campaign.",
      "Define shipping markets, timing, and fulfillment ownership.",
      ["shipping", "ships to", "fulfillment"],
    ),
    readinessDimension(
      profile,
      "demonstration-units",
      "Demonstration units",
      /\b(demo unit|tester|sample)\b/i.test(text) ? "mixed" : "unknown",
      "Demonstration-unit availability is not established.",
      "Prepare complete, camera-ready demonstration units.",
      ["demo unit", "tester", "sample"],
    ),
    readinessDimension(
      profile,
      "returns-logistics",
      "Returns and logistics",
      /\b(returns?|return policy|reverse logistics)\b/i.test(text) ? "mixed" : "unknown",
      "Return and campaign logistics are not established.",
      "Define returns, damaged-item handling, and campaign logistics.",
      ["return policy", "returns", "logistics"],
    ),
  ];
  return [...common, ...(software ? softwareSpecific : physicalSpecific)];
}

export function hasSufficientEvidence(profile: BrandProfile) {
  const categoryCount = new Set(profile.products.map((item) => item.category.toLowerCase())).size;
  const vagueAudience =
    !profile.targetCustomers.length ||
    profile.targetCustomers.every((item) =>
      /^(people|everyone|consumers?|buyers?)$/i.test(item.trim()),
    );
  const broadMultiCategory =
    /\b(wide range|all categories|everything for everyone|multi-category)\b/i.test(
      profile.summary,
    ) ||
    (categoryCount >= 4 &&
      (vagueAudience || !(profile.jobsToBeDone?.length ?? profile.customerNeeds.length)));
  return (
    profile.evidence.length >= 2 &&
    profile.summary.trim().length >= 40 &&
    profile.products.length > 0 &&
    !vagueAudience &&
    (profile.jobsToBeDone?.length ?? profile.customerNeeds.length) > 0 &&
    !broadMultiCategory
  );
}

export function buildClarifyingQuestions(profile: BrandProfile) {
  const questions: string[] = [];
  if (
    !profile.products.length ||
    new Set(profile.products.map((item) => item.category.toLowerCase())).size >= 4
  )
    questions.push("Which one product or service should this creator campaign prioritize?");
  if (
    !profile.targetCustomers.length ||
    profile.targetCustomers.some((item) => /people|everyone|consumer/i.test(item))
  )
    questions.push("Who is the primary buyer, and what situation causes them to seek this offer?");
  if (!(profile.jobsToBeDone?.length ?? profile.customerNeeds.length))
    questions.push("What action is the buyer trying to complete or improve?");
  questions.push("What offer, price, and conversion action should a creator send viewers toward?");
  questions.push(
    "What proof, claim restrictions, attribution setup, and campaign assets are available?",
  );
  return [...new Set(questions)].slice(0, 5);
}

export function assembleDeterministicReport(
  profile: BrandProfile,
  options: { id?: string; slug?: string; now?: Date } = {},
): CreatorCompassReport {
  const now = options.now ?? new Date();
  const readiness = scoreReadiness(profile);
  const knownScores = readiness.flatMap((item) => (item.score == null ? [] : [item.score]));
  const hasEnoughEvidence = hasSufficientEvidence(profile);
  const rawBrandReadiness =
    hasEnoughEvidence && knownScores.length
      ? Math.round(knownScores.reduce((a, b) => a + b, 0) / knownScores.length)
      : null;
  const criticalUnknowns = readiness.filter(
    (item) =>
      [
        "tracking-readiness",
        "claims-safety",
        inferredProductType(profile) === "software"
          ? "demo-trial-readiness"
          : "shipping-fulfillment",
      ].includes(item.key) && item.status === "unknown",
  );
  const brandReadiness =
    rawBrandReadiness == null
      ? null
      : criticalUnknowns.length
        ? Math.min(rawBrandReadiness, 59)
        : rawBrandReadiness;
  const territories = selectPortfolio(profile);
  const north = territories.find((item) => item.classification === "core");
  const canRecommend = hasEnoughEvidence && Boolean(north);
  const id = options.id ?? crypto.randomUUID();
  const readinessSummary: CreatorCompassReport["readinessSummary"] = {
    status:
      !canRecommend || brandReadiness == null
        ? "insufficient-evidence"
        : brandReadiness >= 78
          ? "ready"
          : brandReadiness >= 62
            ? "promising"
            : brandReadiness >= 45
              ? "prepare-first"
              : "poor-fit",
    score: canRecommend ? brandReadiness : null,
    summary: !canRecommend
      ? `There is not enough specific evidence or territory fit to give ${profile.brandName} a confident route or numerical readiness result.`
      : `Brand readiness is separate from territory fit. ${profile.brandName} ${brandReadiness! >= 62 ? "can consider a bounded creator test" : "should close readiness gaps before broad outreach"}.`,
  };
  return {
    id,
    slug: options.slug ?? `${profile.canonicalDomain.replace(/\./g, "-")}-${id.slice(0, 8)}`,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 30 * 86_400_000).toISOString(),
    brandProfile: profile,
    readiness,
    readinessSummary,
    brandReadiness: readinessSummary,
    recommendationState: canRecommend ? "recommendation" : "preliminary-hypotheses",
    clarifyingQuestions: canRecommend ? [] : buildClarifyingQuestions(profile),
    territories,
    northStar:
      canRecommend && north
        ? {
            territoryId: north.territoryId,
            format: north.sponsorshipFormats[0] ?? "integrated demonstration",
            creatorDirection: `${north.creatorSizeBand} ${humanizeDisplayText(north.name).toLowerCase()} creators`,
            testShape:
              "Brief up to 5 creators, activate 1–2, use one evidenced concept and one defined conversion event, then review the result.",
            why: `${north.name} is a ${(north.fitLabel ?? "strong-fit").replace("-", " ")} with ${north.evidenceConfidence ?? north.confidence} evidence confidence.`,
            fixFirst: readiness
              .filter((item) => item.status === "weak" || item.status === "unknown")
              .slice(0, 3)
              .map((item) => item.key),
          }
        : null,
    nextSteps:
      canRecommend && north
        ? [
            "Confirm the structured buyer, use-case, and product assumptions.",
            `Close the highest-priority readiness gap: ${readiness.find((item) => item.status === "weak" || item.status === "unknown")?.improvement ?? "document campaign attribution"}`,
            `Write a one-page brief for ${north.name}.`,
            `Build a shortlist using: ${north.searchQueries[0] ?? north.name}.`,
            "Run a small, measurable test before expanding the creator mix.",
          ]
        : [
            "Paste a focused brand description using the questions below.",
            "Choose one priority product and one primary buyer role.",
            "Describe the job the buyer is trying to complete.",
            "Add the offer, proof, attribution, and campaign assets available.",
            "Generate a new report when the critical evidence is present.",
          ],
    assumptions: [
      ...profile.unknowns,
      "Creator availability, pricing, audience quality, and willingness to partner require direct verification.",
    ],
    methodologyVersion: METHODOLOGY_VERSION,
    aiReview: {
      usedGpt56: false,
      model: "deterministic",
      promptVersion: "review-v2",
      qualityFlag: "deterministic-fallback",
    },
    deliveryQuality: {
      state: "draft-analysis",
      enrichmentSuccessRate: 0,
      finalReviewCompleted: false,
      grammarChecksPassed: true,
      reasons: ["Candidate copy and strategic review used the deterministic safety path."],
    },
  };
}
