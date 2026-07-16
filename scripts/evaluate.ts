import { mkdir, writeFile } from "node:fs/promises";
import type { BrandProfile } from "@creator-compass/contracts";
import { creatorCompassReportSchema } from "@creator-compass/contracts";
import { assembleDeterministicReport, METHODOLOGY_VERSION } from "@creator-compass/scoring";

const base = (name: string, category: string, summary: string, overrides: Partial<BrandProfile> = {}): BrandProfile => ({
  canonicalDomain: `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.example`,
  brandName: name,
  summary,
  products: [{ name: `${name} offer`, category }],
  targetCustomers: [`people interested in ${category}`, "value-conscious buyers"],
  customerNeeds: ["make a confident choice", "solve a practical problem"],
  differentiators: ["clear practical positioning"],
  pricePositioning: "mid-market",
  purchaseFriction: "low",
  demonstrability: "strong",
  trustRequirement: "medium",
  repeatPurchasePotential: "medium",
  riskTags: [],
  unknowns: ["tracking readiness"],
  evidence: [
    { id: "e1", sourceUrl: `https://${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.example`, excerpt: summary, kind: "website" },
    { id: "e2", sourceUrl: `https://${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.example/about`, excerpt: `The ${name} team explains its ${category} approach and target customer.`, kind: "website" },
  ],
  ...overrides,
});

const cases: Array<{ profile: BrandProfile; expectedAny: string[]; expectedReadiness?: string; expectAbstention?: boolean }> = [
  { profile: base("TrailKind", "outdoor recreation", "Durable, repairable camping equipment for weekend hikers."), expectedAny: ["outdoor-recreation", "camping"] },
  { profile: base("DailyTable", "meal preparation", "A subscription meal-planning service for busy families.", { repeatPurchasePotential: "high" }), expectedAny: ["cooking-and-meal-preparation", "family-routines"] },
  { profile: base("Main Street HVAC", "local service", "Residential heating and cooling installation for homeowners.", { purchaseFriction: "high", demonstrability: "mixed" }), expectedAny: ["home-improvement", "local-discovery"] },
  { profile: base("ClearClaim", "wellness supplement", "A dietary supplement positioned around energy support.", { trustRequirement: "high", riskTags: ["medical claims"] }), expectedAny: ["wellness-routines", "fitness-education"] },
  { profile: base("QuietDesk", "productivity", "A visual planning tool for remote creative teams."), expectedAny: ["productivity-systems", "remote-work"] },
  { profile: base("GlowTheory", "skincare", "A gentle skincare routine designed for sensitive skin.", { riskTags: ["medical claims"], trustRequirement: "high" }), expectedAny: ["skincare-education", "beauty-tutorials"] },
  { profile: base("PawRoutine", "pet care", "Repeat-delivery enrichment products for indoor dogs.", { repeatPurchasePotential: "high" }), expectedAny: ["pet-care"] },
  { profile: base("CourseCraft", "education", "Short career courses for early-stage marketing professionals.", { purchaseFriction: "medium" }), expectedAny: ["education", "career-development"] },
  { profile: base("LoopBottle", "sustainable living", "A reusable bottle with traceable recycled materials.", { riskTags: ["environmental claims"] }), expectedAny: ["sustainable-living", "zero-waste-making"] },
  { profile: base("PixelForge", "gaming", "Accessible tabletop terrain and miniature painting supplies."), expectedAny: ["miniature-painting", "gaming"] },
  { profile: base("ManyThings", "multi-category retailer", "A wide range of unrelated home, travel, fitness, and pet products sold by a broad online retailer.", { products: [{ name: "Home goods", category: "home" }, { name: "Travel goods", category: "travel" }, { name: "Fitness goods", category: "fitness" }, { name: "Pet goods", category: "pet" }], targetCustomers: [], customerNeeds: [], unknowns: ["primary audience", "hero offer", "tracking readiness"] }), expectedAny: [], expectedReadiness: "insufficient-evidence", expectAbstention: true },
  { profile: base("SparseBrand", "unknown", "A new brand.", { products: [], targetCustomers: [], customerNeeds: [], differentiators: [], pricePositioning: "unknown", purchaseFriction: "unknown", demonstrability: "unknown", trustRequirement: "unknown", repeatPurchasePotential: "unknown", evidence: [{ id: "e1", sourceUrl: "https://sparse.example", excerpt: "A new brand.", kind: "website" }] }), expectedAny: [], expectedReadiness: "insufficient-evidence", expectAbstention: true },
];

const prohibited = /guaranteed ROI|guaranteed conversion|will accept|legally safe|medical cure/i;
const results = cases.map(({ profile, expectedAny, expectedReadiness, expectAbstention }, index) => {
  const report = assembleDeterministicReport(profile, { id: `eval-${index + 1}`, slug: `eval-${index + 1}`, now: new Date("2026-07-16T12:00:00Z") });
  const parsed = creatorCompassReportSchema.safeParse(report);
  const unique = new Set(report.territories.map((item) => item.territoryId)).size === 8;
  const evidenceCoverage = report.territories.every((item) => item.evidenceIds.length > 0);
  const prohibitedClaims = prohibited.test(JSON.stringify(report));
  const classCounts = Object.fromEntries(["core", "adjacent", "experimental", "risk"].map((classification) => [classification, report.territories.filter((item) => item.classification === classification).length]));
  const plausibleCore = expectedAny.length === 0 || report.territories.filter((item) => item.classification === "core").some((item) => expectedAny.includes(item.territoryId));
  const readinessExpected = !expectedReadiness || report.readinessSummary.status === expectedReadiness;
  const abstentionExpected = expectAbstention
    ? report.recommendationState === "preliminary-hypotheses" && report.northStar === null && report.readinessSummary.score === null && report.clarifyingQuestions.length >= 3
    : report.recommendationState === "recommendation" && report.northStar !== null;
  const passed = parsed.success && unique && evidenceCoverage && !prohibitedClaims && plausibleCore && readinessExpected && abstentionExpected && classCounts.core === 3 && classCounts.adjacent === 2 && classCounts.experimental === 1 && classCounts.risk === 2;
  return { case: profile.brandName, passed, schemaValid: parsed.success, uniqueTerritories: unique, evidenceCoverage, prohibitedClaims, plausibleCore, readinessExpected, abstentionExpected, classCounts, northStar: report.northStar?.territoryId ?? "ABSTAINED", readinessStatus: report.readinessSummary.status };
});

await mkdir("outputs/evaluation", { recursive: true });
await writeFile("outputs/evaluation/evaluation.json", `${JSON.stringify({ generatedAt: new Date().toISOString(), methodology: METHODOLOGY_VERSION, passed: results.every((item) => item.passed), cases: results }, null, 2)}\n`);
const markdown = `# CreatorCompass evaluation report\n\nGenerated: ${new Date().toISOString()}\n\n**Result: ${results.every((item) => item.passed) ? "PASS" : "FAIL"} (${results.filter((item) => item.passed).length}/${results.length})**\n\n| Case | Result | North Star | Readiness | Evidence | Unique |\n|---|---|---|---|---|---|\n${results.map((item) => `| ${item.case} | ${item.passed ? "PASS" : "FAIL"} | ${item.northStar} | ${item.readinessStatus} | ${item.evidenceCoverage ? "yes" : "no"} | ${item.uniqueTerritories ? "yes" : "no"} |`).join("\n")}\n\nThe suite checks structure, exact portfolio composition, evidence coverage, uniqueness, prohibited claims, schema validity, and North Star availability. It intentionally does not compare exact prose.\n`;
await writeFile("outputs/evaluation/evaluation.md", markdown);
console.log(markdown);
