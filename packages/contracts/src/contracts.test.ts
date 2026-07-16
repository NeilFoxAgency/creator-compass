import { describe, expect, it } from "vitest";
import { analysisInputSchema } from "./index";

describe("analysisInputSchema", () => {
  it("requires a URL or usable pasted description", () => {
    expect(analysisInputSchema.safeParse({}).success).toBe(false);
    expect(analysisInputSchema.safeParse({ url: "https://example.com" }).success).toBe(true);
    expect(analysisInputSchema.safeParse({ userProvidedText: "x".repeat(100) }).success).toBe(true);
  });
});

