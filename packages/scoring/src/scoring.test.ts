import { describe, expect, it } from "vitest";
import type { BrandProfile } from "@creator-compass/contracts";
import {
  assembleDeterministicReport,
  rankRiskCandidates,
  rankTerritories,
  scoreReadiness,
  selectPortfolio,
} from "./index";

const profile = (
  name: string,
  summary: string,
  overrides: Partial<BrandProfile> = {},
): BrandProfile => ({
  canonicalDomain: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.example`,
  brandName: name,
  summary,
  products: [{ name: `${name} offer`, category: "productivity" }],
  targetCustomers: ["remote professionals", "creative teams"],
  customerNeeds: ["organize weekly priorities", "reduce distracting work"],
  businessModel: "subscription",
  productType: "physical-product",
  audienceType: "b2c",
  buyerRoles: ["remote professional"],
  userRoles: ["creative professional"],
  industries: ["productivity"],
  useCases: ["weekly planning"],
  jobsToBeDone: ["organize weekly priorities", "plan focused work"],
  buyerGoalVerbPhrases: ["organize weekly priorities"],
  problemStatements: ["Priorities are scattered across the week."],
  technicalLevel: "non-technical",
  purchaseMotion: "retail",
  campaignAssetType: "physical-sample",
  differentiators: ["visual weekly planning"],
  pricePositioning: "mid-market",
  purchaseFriction: "low",
  demonstrability: "strong",
  trustRequirement: "medium",
  repeatPurchasePotential: "medium",
  riskTags: [],
  unknowns: ["campaign attribution"],
  evidence: [
    {
      id: "e1",
      sourceUrl: "https://example.com",
      excerpt: summary,
      kind: "website",
    },
    {
      id: "e2",
      sourceUrl: "https://example.com/details",
      excerpt: `The ${name} offer includes documented setup details and a clear customer use case.`,
      kind: "website",
    },
  ],
  ...overrides,
});

const openSeo = profile(
  "OpenSEO",
  "An open-source B2B SEO software platform for marketers, agencies, SaaS founders, and developers building AI-agent workflows.",
  {
    canonicalDomain: "openseo.so",
    products: [{ name: "OpenSEO", category: "SEO tools", priceText: "Starts at $10/month" }],
    targetCustomers: [
      "SEO professionals",
      "growth marketers",
      "marketing agencies",
      "SaaS founders",
      "developers",
    ],
    customerNeeds: [
      "research keyword opportunities",
      "analyze backlinks",
      "monitor search rankings",
      "audit websites",
      "connect AI agents to SEO data",
    ],
    businessModel: "open-source",
    productType: "software",
    audienceType: "b2b",
    buyerRoles: [
      "SEO professional",
      "growth marketer",
      "agency owner",
      "SaaS founder",
      "developer",
    ],
    userRoles: ["SEO specialist", "developer", "content strategist"],
    industries: ["marketing", "SaaS", "software", "agency"],
    useCases: [
      "keyword research",
      "backlink analysis",
      "rank tracking",
      "site audits",
      "self-hosting",
      "MCP integration",
      "AI agent integration",
    ],
    jobsToBeDone: [
      "research keyword opportunities",
      "analyze backlink profiles",
      "monitor search rankings",
      "audit website SEO",
      "self-host the software",
      "connect AI agents to SEO data",
    ],
    buyerGoalVerbPhrases: ["improve search visibility", "connect AI agents to SEO data"],
    technicalLevel: "technical",
    purchaseMotion: "product-led",
    campaignAssetType: "software-access",
    differentiators: ["open source", "usage-based pricing", "self-hosting", "MCP integration"],
    repeatPurchasePotential: "high",
    trustRequirement: "high",
    evidence: [
      {
        id: "o1",
        sourceUrl: "https://openseo.so/",
        excerpt:
          "OpenSEO is an open-source SEO platform for keyword research, backlinks, rank tracking, and site audits, billed by usage.",
        kind: "website",
      },
      {
        id: "o2",
        sourceUrl: "https://openseo.so/features/mcp",
        excerpt:
          "Connect Claude, Cursor, Codex, or any MCP client to keyword, SERP, backlink, rank-tracking, and Search Console data.",
        kind: "website",
      },
      {
        id: "o3",
        sourceUrl: "https://openseo.so/pricing",
        excerpt: "Self-host OpenSEO or use the hosted plan starting at $10 per month.",
        kind: "website",
      },
    ],
  },
);

const loova = profile(
  "Loova AI",
  "Loova brings together AI image and video models including Sora, Veo, Kling, and Seedance. Create AI images and videos and speed up creative production.",
  {
    canonicalDomain: "loova.ai",
    products: [{ name: "Loova AI", category: "AI image and video generator" }],
    targetCustomers: ["content creators", "creative marketers", "e-commerce marketers"],
    customerNeeds: ["create AI images", "generate AI videos", "produce product visuals"],
    businessModel: "subscription",
    productType: "software",
    audienceType: "mixed",
    buyerRoles: ["content creator", "creative marketer"],
    userRoles: ["AI image creator", "AI video creator"],
    industries: ["creative production", "marketing", "design"],
    useCases: ["AI image generation", "AI video generation", "product photography"],
    jobsToBeDone: ["create AI images", "generate AI videos", "speed up creative production"],
    buyerGoalVerbPhrases: ["create AI images", "generate AI videos"],
    campaignAssetType: "software-access",
    demonstrability: "strong",
    evidence: [
      {
        id: "l1",
        sourceUrl: "https://loova.ai/",
        excerpt:
          "Loova brings together AI image and video models including Sora, Veo, Kling, and Seedance. Create AI images and videos and speed up creative production.",
        kind: "website",
      },
      {
        id: "l2",
        sourceUrl: "https://loova.ai/product",
        excerpt: "Generate product photos and videos for visual content production.",
        kind: "website",
      },
    ],
  },
);

describe("territory fit scoring", () => {
  it("routes Loova toward AI creative production without unsupported SEO semantics", () => {
    const portfolio = selectPortfolio(loova);
    const selectedText = JSON.stringify(portfolio);
    const selectedIds = portfolio
      .filter((item) => item.classification !== "risk")
      .map((item) => item.territoryId);
    expect(selectedIds).toEqual(expect.arrayContaining(["ai-image-and-video-creation"]));
    expect(selectedIds).not.toContain("seo-and-search-marketing");
    expect(selectedText).not.toMatch(/site audits|keyword research|SERPs|backlinks|rank tracking/i);
    expect(selectedText).toContain("Loova AI");
  });

  it("requires direct website evidence before a territory can become Core", () => {
    const hallucinatedSeo = {
      ...loova,
      useCases: [...(loova.useCases ?? []), "keyword research"],
      jobsToBeDone: [...(loova.jobsToBeDone ?? []), "research keyword opportunities"],
    };
    const seo = rankTerritories(hallucinatedSeo).find(
      (item) => item.territory.id === "seo-and-search-marketing",
    )!;
    expect(seo.eligible).toBe(false);
    expect(selectPortfolio(hallucinatedSeo).map((item) => item.territoryId)).not.toContain(
      "seo-and-search-marketing",
    );
  });
  it("ranks OpenSEO by buyer and use-case fit instead of general readiness", () => {
    const ranked = rankTerritories(openSeo);
    const top = ranked.slice(0, 10).map((item) => item.territory.id);
    expect(top).toContain("seo-and-search-marketing");
    expect(top).toContain("ai-agents-and-workflow-automation");
    expect(top).toContain("developer-tools");
    for (const id of [
      "beauty-tutorials",
      "gardening",
      "camping",
      "gaming",
      "zero-waste-making",
      "writing-and-journaling",
    ])
      expect(
        ranked.find((item) => item.territory.id === id)?.territoryFitScore,
      ).toBeLessThanOrEqual(18);
  });

  it("records inspectable component scores and keeps readiness out of fit", () => {
    const seo = rankTerritories(openSeo).find(
      (item) => item.territory.id === "seo-and-search-marketing",
    )!;
    const beauty = rankTerritories(openSeo).find(
      (item) => item.territory.id === "beauty-tutorials",
    )!;
    expect(seo.scoreComponents.categoryUseCaseMatch).toBeGreaterThanOrEqual(90);
    expect(seo.scoreComponents.buyerRoleOverlap).toBeGreaterThanOrEqual(90);
    expect(beauty.scoreComponents.incompatibilityPenalty).toBeGreaterThanOrEqual(80);
    expect(beauty.eligible).toBe(false);
  });

  it("uses bounded maximums and does not fill weak portfolio slots", () => {
    const portfolio = selectPortfolio(openSeo);
    expect(
      portfolio.filter((item) => item.classification === "core").length,
    ).toBeGreaterThanOrEqual(1);
    expect(portfolio.filter((item) => item.classification === "core").length).toBeLessThanOrEqual(
      3,
    );
    expect(
      portfolio.filter((item) => item.classification === "adjacent").length,
    ).toBeLessThanOrEqual(3);
    expect(
      portfolio.filter((item) => item.classification === "experimental").length,
    ).toBeLessThanOrEqual(2);
    expect(portfolio.filter((item) => item.classification === "risk").length).toBeLessThanOrEqual(
      2,
    );
    expect(
      portfolio
        .filter((item) => ["core", "adjacent"].includes(item.classification))
        .map((item) => item.territoryId),
    ).not.toEqual(expect.arrayContaining(["beauty-tutorials", "gardening", "camping", "gaming"]));
  });

  it("creates strategic OpenSEO risks rather than random bottom categories", () => {
    expect(
      rankRiskCandidates(openSeo)
        .slice(0, 2)
        .map((item) => item.territory.id),
    ).toEqual(["ai-industry-news", "consumer-technology"]);
  });

  it("keeps deterministic language grammatical", () => {
    const report = assembleDeterministicReport({ ...openSeo, customerNeeds: ["SEO platform"] });
    expect(JSON.stringify(report)).not.toMatch(/trying to SEO platform/i);
    expect(
      report.territories.every((item) =>
        /^(improve|increase|reduce|find|analyze|audit|build|connect|automate|choose|compare|evaluate|grow|manage|research|track|understand|use|create|generate|produce|edit|speed|deliver|optimize|identify|retain|avoid|monitor|self[ -]?host)/i.test(
          item.customerNeed,
        ),
      ),
    ).toBe(true);
  });

  it("carries distinct documented OpenSEO features into safe campaign fallbacks", () => {
    const portfolio = selectPortfolio(openSeo);
    const conceptsFor = (territoryId: string) =>
      JSON.stringify(
        portfolio.find((item) => item.territoryId === territoryId)?.campaignConcepts ?? [],
      );
    expect(conceptsFor("seo-and-search-marketing")).toMatch(/keyword research/i);
    expect(conceptsFor("seo-and-search-marketing")).toMatch(/backlink analysis/i);
    expect(conceptsFor("seo-and-search-marketing")).toMatch(/rank tracking/i);
    expect(conceptsFor("seo-and-search-marketing")).toMatch(/site audits/i);
    expect(conceptsFor("open-source-and-self-hosting")).toMatch(/self[ -]hosting/i);
    expect(conceptsFor("open-source-and-self-hosting")).toMatch(/usage[ -]based pricing/i);
  });

  it("uses the brand name when extraction returns a generic product label", () => {
    const report = assembleDeterministicReport({
      ...openSeo,
      products: [{ name: "open source SEO platform", category: "SEO tools" }],
    });
    expect(JSON.stringify(report.territories[0]?.campaignConcepts)).toContain("OpenSEO");
    expect(JSON.stringify(report.territories[0]?.campaignConcepts)).not.toContain(
      "use open source SEO platform",
    );
  });
});

describe("product-aware readiness", () => {
  it("does not treat rank tracking as creator-campaign attribution", () => {
    const tracking = scoreReadiness(openSeo).find((item) => item.key === "tracking-readiness");
    expect(tracking).toMatchObject({ status: "unknown", score: null, evidenceIds: [] });
  });

  it("uses readiness keys in deterministic North Star repair priorities", () => {
    const report = assembleDeterministicReport(openSeo);
    const readinessKeys = new Set(report.readiness.map((item) => item.key));
    expect(report.northStar?.fixFirst.every((key) => readinessKeys.has(key))).toBe(true);
  });

  it("uses software readiness dimensions for SaaS and open-source tools", () => {
    const dimensions = scoreReadiness(openSeo);
    expect(dimensions.map((item) => item.key)).toEqual(
      expect.arrayContaining([
        "demo-trial-readiness",
        "creator-account-provisioning",
        "onboarding-documentation",
        "test-environment",
      ]),
    );
    expect(dimensions.map((item) => item.key)).not.toContain("sample-inventory");
  });

  it("uses physical readiness dimensions for e-commerce products", () => {
    const beauty = profile(
      "GlowTheory",
      "A direct-to-consumer skincare serum for people with sensitive skin.",
      {
        products: [{ name: "GlowTheory Serum", category: "skincare", priceText: "$38" }],
        targetCustomers: ["people with sensitive skin"],
        customerNeeds: ["choose a gentle skincare routine"],
        buyerRoles: ["skincare buyer"],
        userRoles: ["skincare user"],
        industries: ["beauty", "skincare"],
        useCases: ["sensitive-skin routine"],
        jobsToBeDone: ["choose a gentle skincare routine"],
        productType: "physical-product",
        businessModel: "e-commerce",
      },
    );
    const dimensions = scoreReadiness(beauty);
    expect(dimensions.map((item) => item.key)).toEqual(
      expect.arrayContaining(["sample-inventory", "shipping-fulfillment", "demonstration-units"]),
    );
    expect(dimensions.map((item) => item.key)).not.toContain("creator-account-provisioning");
  });

  it("does not infer claims safety from silence", () => {
    expect(scoreReadiness(openSeo).find((item) => item.key === "claims-safety")?.status).not.toBe(
      "strong",
    );
  });

  it("does not treat explicitly negated SEO terms as positive evidence", () => {
    const profile = {
      ...loova,
      evidence: [
        {
          id: "loova-negated",
          sourceUrl: "https://loova.ai/",
          kind: "website" as const,
          excerpt:
            "Loova creates AI images and videos. It does not claim SEO, keyword research, SERPs, backlinks, rank tracking, or site audits.",
        },
      ],
      buyerRoles: ["content creator"],
      useCases: ["AI image generation", "AI video generation"],
      jobsToBeDone: ["create AI images", "generate AI videos"],
    };
    const report = assembleDeterministicReport(profile);
    expect(report.territories.map((item) => item.territoryId)).not.toContain(
      "seo-and-search-marketing",
    );
    expect(report.territories.map((item) => item.territoryId)).not.toContain(
      "ai-agents-and-workflow-automation",
    );
    for (const territory of report.territories)
      expect(territory.scoreComponents?.directEvidenceMatch ?? 0).toBeLessThanOrEqual(100);
  });
});

describe("cross-category regressions", () => {
  it("retains relevant consumer beauty recommendations", () => {
    const beauty = profile(
      "GlowTheory",
      "A skincare serum and routine for sensitive-skin consumers.",
      {
        products: [{ name: "GlowTheory Serum", category: "skincare" }],
        targetCustomers: ["sensitive-skin consumers", "beauty shoppers"],
        customerNeeds: ["choose a gentle skincare routine"],
        buyerRoles: ["skincare buyer"],
        userRoles: ["skincare user"],
        industries: ["beauty", "skincare"],
        useCases: ["skincare routine", "ingredient education"],
        jobsToBeDone: ["choose a gentle skincare routine"],
        businessModel: "e-commerce",
        productType: "physical-product",
      },
    );
    const recommended = selectPortfolio(beauty)
      .filter((item) => ["core", "adjacent"].includes(item.classification))
      .map((item) => item.territoryId);
    expect(recommended).toEqual(expect.arrayContaining(["skincare-education"]));
  });

  it("supports a focused local service", () => {
    const local = profile(
      "Main Street HVAC",
      "Residential heating and cooling installation for local homeowners.",
      {
        products: [{ name: "HVAC installation", category: "home improvement service" }],
        targetCustomers: ["local homeowners"],
        customerNeeds: ["replace an unreliable heating system"],
        buyerRoles: ["homeowner"],
        industries: ["home improvement", "local services"],
        useCases: ["HVAC installation", "heating repair"],
        jobsToBeDone: ["replace an unreliable heating system"],
        businessModel: "service",
        productType: "service",
        audienceType: "b2c",
        purchaseMotion: "consultative",
        campaignAssetType: "service-experience",
      },
    );
    expect(
      rankTerritories(local)
        .slice(0, 5)
        .map((item) => item.territory.id),
    ).toContain("home-improvement");
  });

  it("abstains for sparse and broad multi-category brands", () => {
    const sparse = profile("SparseBrand", "A new brand.", {
      products: [],
      targetCustomers: [],
      customerNeeds: [],
      jobsToBeDone: [],
      evidence: [
        { id: "s1", sourceUrl: "https://sparse.example", excerpt: "A new brand.", kind: "website" },
      ],
    });
    const broad = profile(
      "ManyThings",
      "A multi-category retailer with a wide range of unrelated products for everyone.",
      {
        products: [
          { name: "Lamp", category: "home" },
          { name: "Serum", category: "beauty" },
          { name: "Shoes", category: "fashion" },
          { name: "Snacks", category: "food" },
        ],
        targetCustomers: ["everyone"],
      },
    );
    for (const candidate of [sparse, broad]) {
      const report = assembleDeterministicReport(candidate);
      expect(report.recommendationState).toBe("preliminary-hypotheses");
      expect(report.northStar).toBeNull();
      expect(report.readinessSummary.score).toBeNull();
      expect(report.clarifyingQuestions.length).toBeGreaterThanOrEqual(3);
    }
  });
});
