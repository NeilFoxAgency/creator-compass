import { describe, expect, it } from "vitest";
import { creatorTerritories } from "./index";

describe("creator territory taxonomy", () => {
  it("contains a reviewed, unique 60-100 territory set", () => {
    expect(creatorTerritories.length).toBeGreaterThanOrEqual(60);
    expect(creatorTerritories.length).toBeLessThanOrEqual(100);
    expect(new Set(creatorTerritories.map((item) => item.id)).size).toBe(creatorTerritories.length);
  });
});

