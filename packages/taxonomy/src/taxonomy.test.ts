import { describe, expect, it } from "vitest";
import { creatorTerritories } from "./index";

describe("creator territory taxonomy", () => {
  it("contains a reviewed, unique 60-100 territory set", () => {
    expect(creatorTerritories.length).toBeGreaterThanOrEqual(60);
    expect(creatorTerritories.length).toBeLessThanOrEqual(100);
    expect(new Set(creatorTerritories.map((item) => item.id)).size).toBe(creatorTerritories.length);
  });

  it("includes structured technical and B2B audience metadata", () => {
    const required = [
      "seo-and-search-marketing",
      "ai-agents-and-workflow-automation",
      "developer-tools",
      "open-source-and-self-hosting",
      "saas-and-indie-hacking",
      "web-development",
      "growth-marketing-and-conversion-optimization",
      "agency-operations",
      "no-code-and-business-automation",
      "e-commerce-growth",
      "ai-image-and-video-creation",
      "creative-ai-and-design-workflows",
    ];
    for (const id of required) {
      const territory = creatorTerritories.find((item) => item.id === id);
      expect(territory).toBeDefined();
      expect(territory?.buyerRoles.length).toBeGreaterThan(0);
      expect(territory?.jobsToBeDone.length).toBeGreaterThan(0);
      expect(territory?.categorySignals.length).toBeGreaterThan(0);
    }
  });
});
