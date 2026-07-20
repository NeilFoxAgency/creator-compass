import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  CloudflareProvider,
  MistralProvider,
  generateWithFallback,
  type StructuredModelProvider,
} from "./index";

afterEach(() => vi.unstubAllGlobals());

describe("provider fallback", () => {
  it("moves to the next provider without repeating an identical schema failure", async () => {
    let attempts = 0;
    const broken: StructuredModelProvider = {
      name: "cloudflare",
      generate: async () => {
        attempts += 1;
        throw new Error("schema rejected");
      },
    };
    const fallback: StructuredModelProvider = {
      name: "mistral",
      generate: async (request) => ({
        data: request.schema.parse({ ok: true }),
        provider: "mistral",
        model: "mock",
        latencyMs: 1,
        inputUnits: 1,
        outputUnits: 1,
        retryCount: 0,
        schemaValid: true,
        promptVersion: request.promptVersion,
      }),
    };
    const result = await generateWithFallback([broken, fallback], {
      task: "brand-extraction",
      schema: z.object({ ok: z.boolean() }),
      input: {},
      system: "test",
      maxOutputTokens: 10,
      temperature: 0,
      promptVersion: "v1",
    });
    expect(result.data.ok).toBe(true);
    expect(result.fallbackReason).toContain("cloudflare");
    expect(attempts).toBe(1);
  });

  it("moves to the next provider when post-schema quality validation fails", async () => {
    const attempts: string[] = [];
    const provider = (name: "cloudflare" | "mistral", value: string): StructuredModelProvider => ({
      name,
      generate: async (request) => ({
        data: request.schema.parse({ value }),
        provider: name,
        model: `mock-${name}`,
        latencyMs: 1,
        inputUnits: 1,
        outputUnits: 1,
        retryCount: 0,
        schemaValid: true,
        promptVersion: request.promptVersion,
      }),
    });
    const result = await generateWithFallback(
      [provider("cloudflare", "title only"), provider("mistral", "developed tactical concept")],
      {
        task: "candidate-reasoning",
        schema: z.object({ value: z.string() }),
        input: {},
        system: "test",
        maxOutputTokens: 10,
        temperature: 0,
        promptVersion: "v1",
      },
      (attempt) => {
        attempts.push(`${attempt.provider}:${attempt.succeeded}`);
      },
      (candidate) => {
        if (candidate.data.value === "title only") throw new Error("underdeveloped concept");
      },
    );
    expect(result.provider).toBe("mistral");
    expect(result.fallbackReason).toContain("underdeveloped concept");
    expect(attempts).toEqual(["cloudflare:false", "mistral:true"]);
  });
});

describe("Cloudflare structured responses", () => {
  const schema = z.object({ brandName: z.string(), evidenceIds: z.array(z.string()) });

  it("passes JSON Schema and parses a realistic Qwen response envelope", async () => {
    let request: Record<string, unknown> | undefined;
    const provider = new CloudflareProvider({
      run: async (_model, input) => {
        request = input;
        return {
          response: { brandName: "Fox & Co", evidenceIds: ["web-1-1"] },
          usage: { prompt_tokens: 231, completion_tokens: 47 },
        };
      },
    });
    const result = await provider.generate({
      task: "brand-extraction",
      schema,
      input: {},
      system: "Extract",
      maxOutputTokens: 200,
      temperature: 0,
      promptVersion: "brand-v2",
    });
    expect(request?.response_format).toMatchObject({
      type: "json_schema",
      json_schema: { type: "object" },
    });
    expect(result.data.brandName).toBe("Fox & Co");
    expect(result.inputUnits).toBe(231);
    expect(result.outputUnits).toBe(47);
  });

  it("parses a realistic GPT-OSS chat-completion envelope", async () => {
    const provider = new CloudflareProvider(
      {
        run: async () => ({
          choices: [
            {
              message: {
                content: '```json\n{"brandName":"Compass Labs","evidenceIds":["web-2-1"]}\n```',
              },
            },
          ],
          usage: { prompt_tokens: 410, completion_tokens: 61 },
        }),
      },
      "@cf/openai/gpt-oss-20b",
    );
    const result = await provider.generate({
      task: "brand-extraction",
      schema,
      input: {},
      system: "Extract",
      maxOutputTokens: 200,
      temperature: 0,
      promptVersion: "brand-v2",
    });
    expect(result.data).toEqual({ brandName: "Compass Labs", evidenceIds: ["web-2-1"] });
    expect(result.outputUnits).toBe(61);
  });

  it("falls through from a null structured response to chat choices", async () => {
    const provider = new CloudflareProvider({
      run: async () => ({
        response: null,
        choices: [
          {
            message: {
              content: JSON.stringify({ brandName: "Choice fallback", evidenceIds: ["web-1-1"] }),
            },
          },
        ],
      }),
    });
    const result = await provider.generate({
      task: "brand-extraction",
      schema,
      input: {},
      system: "Extract",
      maxOutputTokens: 200,
      temperature: 0,
      promptVersion: "brand-v2",
    });
    expect(result.data.brandName).toBe("Choice fallback");
  });
});

describe("Mistral structured responses", () => {
  it("uses Mistral Small 4 and parses a schema-valid chat completion", async () => {
    let requestBody: Record<string, unknown> | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, init?: RequestInit) => {
        requestBody = JSON.parse(String(init?.body)) as Record<string, unknown>;
        return new Response(
          JSON.stringify({
            id: "mistral-test-1",
            choices: [
              { message: { content: '{"brandName":"Compass Test","evidenceIds":["test-1"]}' } },
            ],
            usage: { prompt_tokens: 72, completion_tokens: 21 },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        );
      }),
    );
    const provider = new MistralProvider("test-key");
    const result = await provider.generate({
      task: "brand-extraction",
      schema: z.object({ brandName: z.string(), evidenceIds: z.array(z.string()) }),
      input: { evidence: [{ id: "test-1", excerpt: "Compass Test is a planning tool." }] },
      system: "Extract only supported facts.",
      maxOutputTokens: 120,
      temperature: 0,
      promptVersion: "mistral-smoke-v1",
    });
    expect(requestBody).toMatchObject({
      model: "mistral-small-2603",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "brand_extraction",
          schema: { type: "object" },
        },
      },
      reasoning_effort: "none",
    });
    expect(result).toMatchObject({
      provider: "mistral",
      model: "mistral-small-2603",
      inputUnits: 72,
      outputUnits: 21,
      data: { brandName: "Compass Test", evidenceIds: ["test-1"] },
    });
  });
});
