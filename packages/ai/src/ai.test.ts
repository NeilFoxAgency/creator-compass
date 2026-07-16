import { describe, expect, it } from "vitest";
import { z } from "zod";
import { generateWithFallback, type StructuredModelProvider } from "./index";

describe("provider fallback", () => {
  it("moves to the next provider after one retry and records the reason", async () => {
    const broken: StructuredModelProvider = { name: "cloudflare", generate: async () => { throw new Error("offline"); } };
    const fallback: StructuredModelProvider = {
      name: "mistral",
      generate: async (request) => ({ data: request.schema.parse({ ok: true }), provider: "mistral", model: "mock", latencyMs: 1, inputUnits: 1, outputUnits: 1, retryCount: 0, schemaValid: true, promptVersion: request.promptVersion }),
    };
    const result = await generateWithFallback([broken, fallback], { task: "brand-extraction", schema: z.object({ ok: z.boolean() }), input: {}, system: "test", maxOutputTokens: 10, temperature: 0, promptVersion: "v1" });
    expect(result.data.ok).toBe(true);
    expect(result.fallbackReason).toContain("cloudflare");
  });
});

