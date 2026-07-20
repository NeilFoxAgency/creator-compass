import { mkdir, writeFile } from "node:fs/promises";
import type { BrandProfile } from "@creator-compass/contracts";
import { creatorCompassReportSchema } from "@creator-compass/contracts";
import { assembleDeterministicReport, METHODOLOGY_VERSION } from "@creator-compass/scoring";

const makeProfile = (
  name: string,
  summary: string,
  overrides: Partial<BrandProfile> = {},
): BrandProfile => ({
  canonicalDomain: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.example`,
  brandName: name,
  summary,
  products: [{ name: `${name} offer`, category: "software" }],
  targetCustomers: ["business professionals", "small teams"],
  customerNeeds: ["improve a repeatable business workflow"],
  businessModel: "saas",
  productType: "software",
  audienceType: "b2b",
  buyerRoles: ["business owner"],
  userRoles: ["business professional"],
  industries: ["software"],
  useCases: ["business workflow"],
  jobsToBeDone: ["improve a repeatable business workflow"],
  buyerGoalVerbPhrases: ["improve a repeatable business workflow"],
  problemStatements: ["The current workflow is fragmented."],
  technicalLevel: "mixed",
  purchaseMotion: "product-led",
  campaignAssetType: "software-access",
  differentiators: ["focused workflow"],
  pricePositioning: "mid-market",
  purchaseFriction: "low",
  demonstrability: "strong",
  trustRequirement: "medium",
  repeatPurchasePotential: "high",
  riskTags: [],
  unknowns: ["campaign attribution"],
  evidence: [
    { id: "e1", sourceUrl: "https://example.com", excerpt: summary, kind: "website" },
    {
      id: "e2",
      sourceUrl: "https://example.com/features",
      excerpt: `${name} documents its primary user, use case, and offer.`,
      kind: "website",
    },
  ],
  ...overrides,
});

const openSeo = makeProfile(
  "OpenSEO",
  "Open-source B2B SEO software for SEO professionals, agencies, SaaS founders, and developers building AI-agent workflows.",
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
      "audit website SEO",
      "connect AI agents to SEO data",
    ],
    businessModel: "open-source",
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
    differentiators: ["open source", "usage-based pricing", "self-hosting", "MCP integration"],
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
          "Connect AI agents over MCP to keyword, SERP, backlink, rank-tracking, and Search Console data.",
        kind: "website",
      },
      {
        id: "o3",
        sourceUrl: "https://openseo.so/pricing",
        excerpt: "Self-host OpenSEO or use hosted usage-based pricing.",
        kind: "website",
      },
    ],
  },
);

type Case = {
  profile: BrandProfile;
  expectedAny: string[];
  prohibitedCoreAdjacent?: string[];
  abstain?: boolean;
  productReadinessKey?: string;
};

const cases: Case[] = [
  {
    profile: openSeo,
    expectedAny: [
      "seo-and-search-marketing",
      "ai-agents-and-workflow-automation",
      "developer-tools",
      "open-source-and-self-hosting",
      "saas-and-indie-hacking",
    ],
    prohibitedCoreAdjacent: [
      "beauty-tutorials",
      "gardening",
      "camping",
      "gaming",
      "zero-waste-making",
      "writing-and-journaling",
    ],
    productReadinessKey: "demo-trial-readiness",
  },
  {
    profile: makeProfile(
      "PipelineFlow",
      "B2B SaaS for growth teams to automate lead routing and improve conversion workflows.",
      {
        targetCustomers: ["growth marketers", "revenue operations teams"],
        buyerRoles: ["growth marketer", "operations leader"],
        userRoles: ["automation specialist"],
        industries: ["SaaS", "marketing"],
        useCases: ["workflow automation", "conversion optimization"],
        jobsToBeDone: ["automate lead routing", "improve conversion workflows"],
        customerNeeds: ["automate lead routing", "improve conversion workflows"],
      },
    ),
    expectedAny: [
      "growth-marketing-and-conversion-optimization",
      "no-code-and-business-automation",
      "saas-and-indie-hacking",
    ],
    prohibitedCoreAdjacent: ["beauty-tutorials", "gardening"],
    productReadinessKey: "creator-account-provisioning",
  },
  {
    profile: makeProfile(
      "CodeHarbor",
      "An open-source developer tool for self-hosting API workflows and inspecting application integrations.",
      {
        businessModel: "open-source",
        targetCustomers: ["software developers", "technical founders"],
        buyerRoles: ["developer", "technical founder"],
        userRoles: ["software developer"],
        industries: ["software"],
        useCases: ["self-hosting", "API integration", "developer workflow"],
        jobsToBeDone: ["self-host a developer service", "integrate reliable APIs"],
        customerNeeds: ["self-host a developer service", "integrate reliable APIs"],
        technicalLevel: "developer",
      },
    ),
    expectedAny: ["developer-tools", "open-source-and-self-hosting", "web-development"],
    prohibitedCoreAdjacent: ["beauty-tutorials", "camping"],
    productReadinessKey: "test-environment",
  },
  {
    profile: makeProfile(
      "GlowTheory",
      "A direct-to-consumer skincare serum and routine for people with sensitive skin.",
      {
        products: [{ name: "GlowTheory Serum", category: "skincare", priceText: "$38" }],
        targetCustomers: ["people with sensitive skin", "beauty shoppers"],
        customerNeeds: ["choose a gentle skincare routine"],
        businessModel: "e-commerce",
        productType: "physical-product",
        audienceType: "b2c",
        buyerRoles: ["skincare buyer"],
        userRoles: ["skincare user"],
        industries: ["beauty", "skincare"],
        useCases: ["skincare routine", "ingredient education"],
        jobsToBeDone: ["choose a gentle skincare routine"],
        campaignAssetType: "physical-sample",
        purchaseMotion: "retail",
      },
    ),
    expectedAny: ["skincare-education", "beauty-tutorials"],
    prohibitedCoreAdjacent: ["developer-tools", "gardening"],
    productReadinessKey: "sample-inventory",
  },
  {
    profile: makeProfile(
      "TrailKind",
      "A physical e-commerce brand selling repairable camping equipment to weekend hikers.",
      {
        products: [{ name: "TrailKind Shelter", category: "camping equipment" }],
        targetCustomers: ["weekend hikers", "campers"],
        customerNeeds: ["choose durable camping equipment"],
        businessModel: "e-commerce",
        productType: "physical-product",
        audienceType: "b2c",
        buyerRoles: ["camping gear buyer"],
        userRoles: ["camper", "hiker"],
        industries: ["outdoor recreation"],
        useCases: ["camping", "hiking"],
        jobsToBeDone: ["choose durable camping equipment"],
        campaignAssetType: "physical-sample",
        purchaseMotion: "retail",
      },
    ),
    expectedAny: ["camping", "outdoor-recreation"],
    prohibitedCoreAdjacent: ["beauty-tutorials", "developer-tools"],
    productReadinessKey: "shipping-fulfillment",
  },
  {
    profile: makeProfile(
      "Main Street HVAC",
      "A local residential heating and cooling installation service for homeowners.",
      {
        products: [{ name: "HVAC installation", category: "home improvement service" }],
        targetCustomers: ["local homeowners"],
        customerNeeds: ["replace an unreliable heating system"],
        businessModel: "service",
        productType: "service",
        audienceType: "b2c",
        buyerRoles: ["homeowner"],
        userRoles: ["homeowner"],
        industries: ["home improvement", "local services"],
        useCases: ["HVAC installation", "heating repair"],
        jobsToBeDone: ["replace an unreliable heating system"],
        purchaseMotion: "consultative",
        campaignAssetType: "service-experience",
      },
    ),
    expectedAny: ["home-improvement", "local-discovery"],
    prohibitedCoreAdjacent: ["beauty-tutorials", "gaming"],
  },
  {
    profile: makeProfile(
      "ManyThings",
      "A broad multi-category retailer with a wide range of unrelated home, travel, fitness, and pet products for everyone.",
      {
        products: [
          { name: "Home goods", category: "home" },
          { name: "Travel goods", category: "travel" },
          { name: "Fitness goods", category: "fitness" },
          { name: "Pet goods", category: "pet" },
        ],
        targetCustomers: ["everyone"],
        jobsToBeDone: [],
        customerNeeds: [],
      },
    ),
    expectedAny: [],
    abstain: true,
  },
  {
    profile: makeProfile("SparseBrand", "A new brand.", {
      products: [],
      targetCustomers: [],
      customerNeeds: [],
      buyerRoles: [],
      userRoles: [],
      industries: [],
      useCases: [],
      jobsToBeDone: [],
      buyerGoalVerbPhrases: [],
      evidence: [
        { id: "s1", sourceUrl: "https://sparse.example", excerpt: "A new brand.", kind: "website" },
      ],
    }),
    expectedAny: [],
    abstain: true,
  },
];

const results = cases.map(
  ({ profile, expectedAny, prohibitedCoreAdjacent = [], abstain, productReadinessKey }, index) => {
    const report = assembleDeterministicReport(profile, {
      id: `eval-${index + 1}`,
      slug: `eval-${index + 1}`,
      now: new Date("2026-07-19T12:00:00Z"),
    });
    const recommended = report.territories
      .filter((item) => ["core", "adjacent"].includes(item.classification))
      .map((item) => item.territoryId);
    const expectedTerritory = abstain || expectedAny.some((id) => recommended.includes(id));
    const prohibitedAbsent = prohibitedCoreAdjacent.every((id) => !recommended.includes(id));
    const variableCounts =
      report.territories.filter((item) => item.classification === "core").length <= 3 &&
      report.territories.filter((item) => item.classification === "adjacent").length <= 3 &&
      report.territories.filter((item) => item.classification === "experimental").length <= 2 &&
      report.territories.filter((item) => item.classification === "risk").length <= 2;
    const abstentionCorrect = abstain
      ? report.recommendationState === "preliminary-hypotheses" &&
        report.northStar === null &&
        report.readinessSummary.score === null
      : report.recommendationState === "recommendation" && report.northStar !== null;
    const readinessProfileCorrect =
      !productReadinessKey || report.readiness.some((item) => item.key === productReadinessKey);
    const rankTrackingSafe =
      profile.brandName !== "OpenSEO" ||
      report.readiness.find((item) => item.key === "tracking-readiness")?.status === "unknown";
    const grammarSafe = !/trying to (?:SEO platform|marketing software|technology)/i.test(
      JSON.stringify(report),
    );
    const schemaValid = creatorCompassReportSchema.safeParse(report).success;
    return {
      case: profile.brandName,
      passed:
        schemaValid &&
        expectedTerritory &&
        prohibitedAbsent &&
        variableCounts &&
        abstentionCorrect &&
        readinessProfileCorrect &&
        rankTrackingSafe &&
        grammarSafe,
      schemaValid,
      expectedTerritory,
      prohibitedAbsent,
      variableCounts,
      abstentionCorrect,
      readinessProfileCorrect,
      rankTrackingSafe,
      grammarSafe,
      recommended,
      northStar: report.northStar?.territoryId ?? "ABSTAINED",
    };
  },
);

const generatedAt = new Date().toISOString();
const passed = results.every((item) => item.passed);
await mkdir("outputs/evaluation", { recursive: true });
await writeFile(
  "outputs/evaluation/evaluation.json",
  `${JSON.stringify({ generatedAt, methodology: METHODOLOGY_VERSION, passed, cases: results }, null, 2)}\n`,
);
const markdown = `# CreatorCompass evaluation report\n\nGenerated: ${generatedAt}\n\n**Result: ${passed ? "PASS" : "FAIL"} (${results.filter((item) => item.passed).length}/${results.length})**\n\n| Case | Result | North Star | Recommended territories | Prohibited absent | Grammar |\n|---|---|---|---|---|---|\n${results.map((item) => `| ${item.case} | ${item.passed ? "PASS" : "FAIL"} | ${item.northStar} | ${item.recommended.join(", ") || "none"} | ${item.prohibitedAbsent ? "yes" : "no"} | ${item.grammarSafe ? "yes" : "no"} |`).join("\n")}\n\nThe suite checks eligibility, bounded variable portfolios, B2B and consumer relevance, product-aware readiness, OpenSEO attribution safety, abstention, schema validity, and deterministic grammar.\n`;
await writeFile("outputs/evaluation/evaluation.md", markdown);
console.log(markdown);
