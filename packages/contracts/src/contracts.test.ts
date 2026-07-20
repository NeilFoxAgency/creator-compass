import { describe, expect, it } from "vitest";
import { analysisInputSchema, finalReviewSchema } from "./index";

describe("analysisInputSchema", () => {
  it("requires a URL or usable pasted description", () => {
    expect(analysisInputSchema.safeParse({}).success).toBe(false);
    expect(analysisInputSchema.safeParse({ url: "https://example.com" }).success).toBe(true);
    expect(analysisInputSchema.safeParse({ userProvidedText: "x".repeat(100) }).success).toBe(true);
  });
});

describe("finalReviewSchema", () => {
  const review = {
    portfolio: [{ territoryId: "seo-and-search-marketing", classification: "core" }],
    northStarTerritoryId: "seo-and-search-marketing",
    format: "site audit",
    creatorDirection: "SEO practitioners",
    testShape: "One bounded test",
    why: "Direct buyer and use-case fit",
    fixFirst: [],
    assumptions: [],
  };

  it("accepts a smaller evidence-led portfolio", () => {
    expect(finalReviewSchema.safeParse(review).success).toBe(true);
  });

  it("rejects category counts above bounded maximums", () => {
    expect(
      finalReviewSchema.safeParse({
        ...review,
        portfolio: Array.from({ length: 4 }, (_, index) => ({
          territoryId: `core-${index}`,
          classification: "core",
        })),
      }).success,
    ).toBe(false);
  });
});
