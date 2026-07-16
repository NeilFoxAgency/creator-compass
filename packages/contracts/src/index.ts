import { z } from "zod";

export const confidenceSchema = z.enum(["high", "medium", "low"]);
export const readinessStatusSchema = z.enum(["strong", "mixed", "weak", "unknown"]);
export const territoryClassSchema = z.enum(["core", "adjacent", "experimental", "risk"]);

export const evidenceRefSchema = z.object({
  id: z.string().min(1),
  sourceUrl: z.string().url(),
  excerpt: z.string().min(1).max(500),
  kind: z.enum(["website", "user", "heuristic", "model"]).default("website"),
});

export const brandProfileSchema = z.object({
  canonicalDomain: z.string().min(1),
  brandName: z.string().min(1),
  summary: z.string().min(1),
  products: z.array(
    z.object({
      name: z.string().min(1),
      category: z.string().min(1),
      priceText: z.string().optional(),
    }),
  ),
  targetCustomers: z.array(z.string()),
  customerNeeds: z.array(z.string()),
  differentiators: z.array(z.string()),
  pricePositioning: z.enum(["budget", "mid-market", "premium", "luxury", "unknown"]),
  purchaseFriction: z.enum(["low", "medium", "high", "unknown"]),
  demonstrability: readinessStatusSchema,
  trustRequirement: z.enum(["low", "medium", "high", "unknown"]),
  repeatPurchasePotential: z.enum(["low", "medium", "high", "unknown"]),
  riskTags: z.array(z.string()),
  unknowns: z.array(z.string()),
  evidence: z.array(evidenceRefSchema).min(1),
});

export const readinessDimensionSchema = z.object({
  key: z.string(),
  label: z.string(),
  status: readinessStatusSchema,
  score: z.number().min(0).max(100).nullable(),
  rationale: z.string(),
  evidenceIds: z.array(z.string()),
  improvement: z.string(),
  confidence: confidenceSchema,
});

export const territoryRecommendationSchema = z.object({
  territoryId: z.string(),
  name: z.string(),
  classification: territoryClassSchema,
  score: z.number().min(0).max(100),
  rationale: z.string(),
  audienceConnection: z.string(),
  customerNeed: z.string(),
  contentStyles: z.array(z.string()).min(1),
  creatorProfile: z.string(),
  creatorSizeBand: z.enum(["nano", "micro", "small", "mid-size", "large", "mixed"]),
  sponsorshipFormats: z.array(z.string()).min(1),
  campaignConcepts: z
    .array(
      z.object({
        title: z.string(),
        concept: z.string(),
        openingHook: z.string(),
      }),
    )
    .length(2),
  viewerObjection: z.string(),
  keyRisk: z.string(),
  searchQueries: z.array(z.string()).min(1),
  evidenceIds: z.array(z.string()).min(1),
  confidence: confidenceSchema,
});

export const finalReviewSchema = z.object({
  portfolio: z.array(z.object({ territoryId: z.string(), classification: territoryClassSchema })).length(8),
  northStarTerritoryId: z.string(),
  format: z.string(),
  creatorDirection: z.string(),
  testShape: z.string(),
  why: z.string(),
  fixFirst: z.array(z.string()),
  assumptions: z.array(z.string()),
});

export const creatorCompassReportSchema = z.object({
  id: z.string(),
  slug: z.string(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  brandProfile: brandProfileSchema,
  readiness: z.array(readinessDimensionSchema).length(10),
  readinessSummary: z.object({
    status: z.enum(["ready", "promising", "prepare-first", "poor-fit", "insufficient-evidence"]),
    score: z.number().min(0).max(100).nullable(),
    summary: z.string(),
  }),
  territories: z.array(territoryRecommendationSchema).length(8),
  northStar: z.object({
    territoryId: z.string(),
    format: z.string(),
    creatorDirection: z.string(),
    testShape: z.string(),
    why: z.string(),
    fixFirst: z.array(z.string()),
  }),
  nextSteps: z.array(z.string()).length(5),
  assumptions: z.array(z.string()),
  methodologyVersion: z.string(),
  aiReview: z.object({
    usedGpt56: z.boolean(),
    model: z.string(),
    promptVersion: z.string(),
    qualityFlag: z.enum(["gpt56", "cloudflare-fallback", "deterministic-fallback"]),
  }),
});

export const analysisInputSchema = z
  .object({
    url: z.string().url().optional(),
    userProvidedText: z.string().min(80).max(12_000).optional(),
    market: z.string().max(80).optional(),
    goal: z.string().max(160).optional(),
    budgetBand: z.enum(["under-2k", "2k-5k", "5k-15k", "15k-plus", "unknown"]).optional(),
    notes: z.string().max(1_000).optional(),
    turnstileToken: z.string().max(2_048).optional(),
    refresh: z.boolean().optional(),
  })
  .refine((value) => Boolean(value.url || value.userProvidedText), {
    message: "Provide a website URL or a brand description.",
  });

export const analysisJobSchema = z.object({
  id: z.string(),
  status: z.enum(["queued", "running", "complete", "failed", "needs-input"]),
  stage: z.enum([
    "queued",
    "reading-brand",
    "understanding-customer",
    "checking-readiness",
    "charting-territories",
    "reviewing-routes",
    "preparing-report",
    "complete",
    "failed",
    "needs-input",
  ]),
  reportSlug: z.string().nullable().optional(),
  error: z
    .object({ code: z.string(), message: z.string(), canProvideText: z.boolean() })
    .nullable()
    .optional(),
});

export type EvidenceRef = z.infer<typeof evidenceRefSchema>;
export type BrandProfile = z.infer<typeof brandProfileSchema>;
export type ReadinessDimension = z.infer<typeof readinessDimensionSchema>;
export type TerritoryRecommendation = z.infer<typeof territoryRecommendationSchema>;
export type CreatorCompassReport = z.infer<typeof creatorCompassReportSchema>;
export type AnalysisInput = z.infer<typeof analysisInputSchema>;
export type AnalysisJob = z.infer<typeof analysisJobSchema>;
export type FinalReview = z.infer<typeof finalReviewSchema>;
