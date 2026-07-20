import { z } from "zod";

export const confidenceSchema = z.enum(["high", "medium", "low"]);
export const readinessStatusSchema = z.enum([
  "strong",
  "mixed",
  "weak",
  "unknown",
  "not-applicable",
]);
export const territoryClassSchema = z.enum(["core", "adjacent", "experimental", "risk"]);
export const audienceTypeSchema = z.enum(["b2b", "b2c", "mixed", "unknown"]);
export const businessModelSchema = z.enum([
  "saas",
  "open-source",
  "e-commerce",
  "marketplace",
  "service",
  "subscription",
  "media",
  "nonprofit",
  "mixed",
  "unknown",
]);
export const productTypeSchema = z.enum([
  "software",
  "digital-product",
  "physical-product",
  "service",
  "marketplace",
  "content",
  "mixed",
  "unknown",
]);
export const technicalLevelSchema = z.enum([
  "non-technical",
  "mixed",
  "technical",
  "developer",
  "unknown",
]);
export const purchaseMotionSchema = z.enum([
  "self-serve",
  "sales-led",
  "product-led",
  "retail",
  "consultative",
  "mixed",
  "unknown",
]);
export const campaignAssetTypeSchema = z.enum([
  "software-access",
  "demo-environment",
  "physical-sample",
  "service-experience",
  "digital-access",
  "mixed",
  "unknown",
]);

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
  businessModel: businessModelSchema.optional(),
  productType: productTypeSchema.optional(),
  audienceType: audienceTypeSchema.optional(),
  buyerRoles: z.array(z.string()).optional(),
  userRoles: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
  useCases: z.array(z.string()).optional(),
  jobsToBeDone: z.array(z.string()).optional(),
  buyerGoalVerbPhrases: z.array(z.string()).optional(),
  problemStatements: z.array(z.string()).optional(),
  technicalLevel: technicalLevelSchema.optional(),
  purchaseMotion: purchaseMotionSchema.optional(),
  campaignAssetType: campaignAssetTypeSchema.optional(),
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
  territoryFitScore: z.number().min(0).max(100).optional(),
  fitLabel: z.enum(["strong-fit", "promising-fit", "exploratory", "not-recommended"]).optional(),
  evidenceConfidence: confidenceSchema.optional(),
  scoreComponents: z
    .object({
      categoryUseCaseMatch: z.number().min(0).max(100),
      buyerRoleOverlap: z.number().min(0).max(100),
      jobsToBeDoneOverlap: z.number().min(0).max(100),
      contentFormatNaturalness: z.number().min(0).max(100),
      purchaseInfluenceIntent: z.number().min(0).max(100),
      evidenceStrength: z.number().min(0).max(100),
      incompatibilityPenalty: z.number().min(0).max(100),
    })
    .optional(),
  riskCandidateScore: z.number().min(0).max(100).optional(),
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
  portfolio: z
    .array(z.object({ territoryId: z.string(), classification: territoryClassSchema }))
    .min(1)
    .max(10)
    .superRefine((portfolio, context) => {
      const limits = { core: 3, adjacent: 3, experimental: 2, risk: 2 } as const;
      for (const [classification, maximum] of Object.entries(limits)) {
        if (portfolio.filter((item) => item.classification === classification).length > maximum)
          context.addIssue({
            code: "custom",
            message: `Portfolio may contain at most ${maximum} ${classification} territories.`,
          });
      }
    }),
  northStarTerritoryId: z.string(),
  format: z.string(),
  creatorDirection: z.string(),
  testShape: z.string(),
  why: z.string(),
  fixFirst: z.array(z.string()),
  assumptions: z.array(z.string()),
});

export const candidateEnrichmentSchema = z.object({
  candidates: z
    .array(
      z.object({
        territoryId: z.string(),
        audienceConnection: z.string(),
        creatorProfile: z.string(),
        campaignConcepts: z
          .array(z.object({ title: z.string(), concept: z.string(), openingHook: z.string() }))
          .length(2),
        viewerObjection: z.string(),
        keyRisk: z.string(),
        evidenceIds: z.array(z.string()).min(1),
      }),
    )
    .min(1)
    .max(12),
});

export const creatorCompassReportSchema = z.object({
  id: z.string(),
  slug: z.string(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  brandProfile: brandProfileSchema,
  readiness: z.array(readinessDimensionSchema).min(8).max(12),
  readinessSummary: z.object({
    status: z.enum(["ready", "promising", "prepare-first", "poor-fit", "insufficient-evidence"]),
    score: z.number().min(0).max(100).nullable(),
    summary: z.string(),
  }),
  brandReadiness: z
    .object({
      status: z.enum(["ready", "promising", "prepare-first", "poor-fit", "insufficient-evidence"]),
      score: z.number().min(0).max(100).nullable(),
      summary: z.string(),
    })
    .optional(),
  recommendationState: z
    .enum(["recommendation", "preliminary-hypotheses"])
    .default("recommendation"),
  clarifyingQuestions: z.array(z.string()).default([]),
  territories: z.array(territoryRecommendationSchema).max(10),
  northStar: z
    .object({
      territoryId: z.string(),
      format: z.string(),
      creatorDirection: z.string(),
      testShape: z.string(),
      why: z.string(),
      fixFirst: z.array(z.string()),
    })
    .nullable(),
  nextSteps: z.array(z.string()).length(5),
  assumptions: z.array(z.string()),
  methodologyVersion: z.string(),
  aiReview: z.object({
    usedGpt56: z.boolean(),
    model: z.string(),
    promptVersion: z.string(),
    qualityFlag: z.enum([
      "gpt56",
      "verified-fallback",
      "cloudflare-fallback",
      "deterministic-fallback",
    ]),
  }),
  deliveryQuality: z
    .object({
      state: z.enum(["full-report", "draft-analysis"]),
      enrichmentSuccessRate: z.number().min(0).max(1),
      finalReviewCompleted: z.boolean(),
      grammarChecksPassed: z.boolean(),
      reasons: z.array(z.string()),
    })
    .optional(),
  providerPath: z
    .object({
      brandExtraction: z.string(),
      candidateEnrichment: z.string(),
      finalReview: z.string(),
      enrichmentChunks: z
        .array(
          z.object({
            start: z.number().int().nonnegative(),
            count: z.number().int().positive(),
            provider: z.string(),
            success: z.boolean(),
            reason: z.string().optional(),
          }),
        )
        .optional(),
    })
    .optional(),
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
export type CandidateEnrichment = z.infer<typeof candidateEnrichmentSchema>;
