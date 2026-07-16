import { describe, expect, it } from "vitest";
import type { BrandProfile } from "@creator-compass/contracts";
import { assembleDeterministicReport, rankTerritories, scoreReadiness } from "./index";

const profile: BrandProfile = {
  canonicalDomain: "example.com",
  brandName: "FocusKit",
  summary:
    "A visual productivity planning system that helps remote workers and creative teams organize priorities, reduce distraction, and plan focused work every week.",
  products: [{ name: "FocusKit Planner", category: "productivity" }],
  targetCustomers: ["remote workers", "creative teams"],
  customerNeeds: ["organize priorities", "reduce distraction"],
  differentiators: ["visual weekly planning"],
  pricePositioning: "mid-market",
  purchaseFriction: "low",
  demonstrability: "strong",
  trustRequirement: "medium",
  repeatPurchasePotential: "medium",
  riskTags: [],
  unknowns: ["tracking readiness"],
  evidence: [
    {
      id: "e1",
      sourceUrl: "https://example.com",
      excerpt:
        "FocusKit Planner helps remote workers and creative teams plan focused work every week.",
      kind: "website",
    },
    {
      id: "e2",
      sourceUrl: "https://example.com/how-it-works",
      excerpt:
        "A visual weekly tutorial with affiliate link tracking, creator samples in stock, approved claims, and disclosure guidelines.",
      kind: "website",
    },
  ],
};

describe("deterministic scoring", () => {
  it("is reproducible and inspectable", () => {
    expect(scoreReadiness(profile)).toEqual(scoreReadiness(profile));
    expect(rankTerritories(profile)[0]?.score).toBeGreaterThan(0);
  });

  it("creates exactly the required territory portfolio", () => {
    const report = assembleDeterministicReport(profile, {
      id: "12345678-1234",
      slug: "sample",
      now: new Date("2026-07-16T12:00:00Z"),
    });
    expect(report.territories.filter((item) => item.classification === "core")).toHaveLength(3);
    expect(report.territories.filter((item) => item.classification === "adjacent")).toHaveLength(2);
    expect(
      report.territories.filter((item) => item.classification === "experimental"),
    ).toHaveLength(1);
    expect(report.territories.filter((item) => item.classification === "risk")).toHaveLength(2);
    expect(report.readiness).toHaveLength(10);
    expect(report.recommendationState).toBe("recommendation");
    expect(report.northStar).not.toBeNull();
  });

  it("abstains for SparseBrand without inventing a North Star or score", () => {
    const sparse: BrandProfile = {
      ...profile,
      brandName: "SparseBrand",
      summary: "SparseBrand makes things.",
      products: [],
      targetCustomers: [],
      customerNeeds: [],
      evidence: [
        {
          id: "s1",
          sourceUrl: "https://sparse.example",
          excerpt: "Welcome to SparseBrand.",
          kind: "website",
        },
      ],
    };
    const report = assembleDeterministicReport(sparse);
    expect(report.recommendationState).toBe("preliminary-hypotheses");
    expect(report.readinessSummary).toMatchObject({ status: "insufficient-evidence", score: null });
    expect(report.northStar).toBeNull();
    expect(report.clarifyingQuestions.length).toBeGreaterThanOrEqual(3);
  });

  it("abstains for an unfocused broad multi-category brand", () => {
    const broad: BrandProfile = {
      ...profile,
      brandName: "Everything House",
      summary:
        "A multi-category retailer offering a wide range of unrelated products for everyone across home, beauty, electronics, and food.",
      products: [
        { name: "Lamp", category: "home" },
        { name: "Serum", category: "beauty" },
        { name: "Headphones", category: "electronics" },
        { name: "Snacks", category: "food" },
      ],
      targetCustomers: ["everyone"],
    };
    expect(assembleDeterministicReport(broad).northStar).toBeNull();
  });

  it.each([
    ["regulated", { riskTags: ["medical claims"], trustRequirement: "high" as const }],
    [
      "service",
      {
        products: [{ name: "Strategy Sprint", category: "service" }],
        purchaseFriction: "high" as const,
      },
    ],
    [
      "e-commerce",
      {
        products: [{ name: "FocusKit Planner", category: "productivity", priceText: "$49" }],
        purchaseFriction: "low" as const,
      },
    ],
  ])("keeps readiness evidence-specific for %s brands", (_name, overrides) => {
    const dimensions = scoreReadiness({ ...profile, ...overrides });
    expect(dimensions.find((item) => item.key === "tracking-readiness")?.evidenceIds).toContain(
      "e2",
    );
    expect(dimensions.find((item) => item.key === "sample-fulfillment")?.evidenceIds).toContain(
      "e2",
    );
    expect(dimensions.find((item) => item.key === "claims-safety")?.status).not.toBeUndefined();
  });

  it("caps overall readiness when critical operational evidence is unknown", () => {
    const unproven = {
      ...profile,
      evidence: profile.evidence.map((item) => ({
        ...item,
        excerpt: item.excerpt.replace(
          /affiliate link tracking, creator samples in stock, approved claims, and disclosure guidelines/i,
          "a clear weekly planning method",
        ),
      })),
    };
    const report = assembleDeterministicReport(unproven);
    expect(report.readinessSummary.score).toBeLessThanOrEqual(59);
    expect(report.readinessSummary.status).toBe("prepare-first");
  });
});
