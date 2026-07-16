import { describe, expect, it } from "vitest";
import type { BrandProfile } from "@creator-compass/contracts";
import { assembleDeterministicReport, rankTerritories, scoreReadiness } from "./index";

const profile: BrandProfile = {
  canonicalDomain: "example.com",
  brandName: "FocusKit",
  summary: "A productivity planning system for remote creative teams.",
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
  evidence: [{ id: "e1", sourceUrl: "https://example.com", excerpt: "Plan focused creative work every week.", kind: "website" }],
};

describe("deterministic scoring", () => {
  it("is reproducible and inspectable", () => {
    expect(scoreReadiness(profile)).toEqual(scoreReadiness(profile));
    expect(rankTerritories(profile)[0]?.score).toBeGreaterThan(0);
  });

  it("creates exactly the required territory portfolio", () => {
    const report = assembleDeterministicReport(profile, { id: "12345678-1234", slug: "sample", now: new Date("2026-07-16T12:00:00Z") });
    expect(report.territories.filter((item) => item.classification === "core")).toHaveLength(3);
    expect(report.territories.filter((item) => item.classification === "adjacent")).toHaveLength(2);
    expect(report.territories.filter((item) => item.classification === "experimental")).toHaveLength(1);
    expect(report.territories.filter((item) => item.classification === "risk")).toHaveLength(2);
    expect(report.readiness).toHaveLength(10);
  });
});

