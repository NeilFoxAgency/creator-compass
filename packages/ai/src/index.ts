import { z } from "zod";

export type ModelTask = "brand-extraction" | "candidate-reasoning" | "final-review";

export type StructuredGenerationRequest<T> = {
  task: ModelTask;
  schema: z.ZodType<T>;
  input: unknown;
  system: string;
  maxOutputTokens: number;
  temperature: number;
  promptVersion: string;
};

export type ModelResult<T> = {
  data: T;
  provider: "cloudflare" | "mistral" | "openai";
  model: string;
  latencyMs: number;
  inputUnits: number;
  outputUnits: number;
  retryCount: number;
  schemaValid: true;
  fallbackReason?: string;
  promptVersion: string;
  responseId?: string;
};

export interface StructuredModelProvider {
  readonly name: ModelResult<unknown>["provider"];
  generate<T>(request: StructuredGenerationRequest<T>): Promise<ModelResult<T>>;
}

export type SafeProviderFailure = {
  provider: "openai";
  status: number | null;
  requestId: string | null;
  errorType: string;
  errorCode: string | null;
  message: string;
};

export class OpenAIRequestError extends Error {
  readonly details: SafeProviderFailure;

  constructor(details: SafeProviderFailure) {
    super(
      `OpenAI request failed${details.status ? ` with ${details.status}` : ""}${details.requestId ? ` (${details.requestId})` : ""}: ${details.errorType}: ${details.message}`,
    );
    this.name = "OpenAIRequestError";
    this.details = details;
  }
}

export type ProviderAttempt<T> = {
  provider: StructuredModelProvider["name"];
  succeeded: boolean;
  result?: ModelResult<T>;
  reason?: string;
};

type AiBinding = {
  run(model: string, input: Record<string, unknown>): Promise<unknown>;
};

function parseCandidate<T>(schema: z.ZodType<T>, value: unknown): T {
  if (typeof value === "string") {
    const cleaned = value.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    return schema.parse(JSON.parse(cleaned));
  }
  if (value && typeof value === "object" && "response" in value) {
    const response = (value as { response: unknown }).response;
    if (response != null) return parseCandidate(schema, response);
  }
  if (value && typeof value === "object" && "choices" in value) {
    const content = (value as { choices?: Array<{ message?: { content?: unknown } }> }).choices?.[0]
      ?.message?.content;
    return parseCandidate(schema, content);
  }
  return schema.parse(value);
}

function usageFrom(value: unknown) {
  if (!value || typeof value !== "object" || !("usage" in value))
    return { inputUnits: 0, outputUnits: 0 };
  const usage = (value as { usage?: Record<string, unknown> }).usage ?? {};
  const number = (candidate: unknown) =>
    typeof candidate === "number" && Number.isFinite(candidate) ? candidate : 0;
  return {
    inputUnits: number(usage.prompt_tokens ?? usage.input_tokens),
    outputUnits: number(usage.completion_tokens ?? usage.output_tokens),
  };
}

export class CloudflareProvider implements StructuredModelProvider {
  readonly name = "cloudflare" as const;
  constructor(
    private readonly ai: AiBinding,
    private readonly model = "@cf/qwen/qwen3-30b-a3b-fp8",
  ) {}

  async generate<T>(request: StructuredGenerationRequest<T>): Promise<ModelResult<T>> {
    const started = Date.now();
    const jsonSchema = z.toJSONSchema(request.schema, { target: "draft-7" });
    const response = await this.ai.run(this.model, {
      messages: [
        {
          role: "system",
          content: `${request.system}\nReturn only JSON matching the supplied contract. Never invent evidence.`,
        },
        { role: "user", content: JSON.stringify(request.input) },
      ],
      max_tokens: request.maxOutputTokens,
      temperature: request.temperature,
      response_format: { type: "json_schema", json_schema: jsonSchema },
    });
    const usage = usageFrom(response);
    return {
      data: parseCandidate(request.schema, response),
      provider: this.name,
      model: this.model,
      latencyMs: Date.now() - started,
      inputUnits: usage.inputUnits,
      outputUnits: usage.outputUnits,
      retryCount: 0,
      schemaValid: true,
      promptVersion: request.promptVersion,
    };
  }
}

export class MistralProvider implements StructuredModelProvider {
  readonly name = "mistral" as const;
  constructor(
    private readonly apiKey: string,
    private readonly model = "mistral-small-2603",
  ) {}

  async generate<T>(request: StructuredGenerationRequest<T>): Promise<ModelResult<T>> {
    const started = Date.now();
    const jsonSchema = z.toJSONSchema(request.schema, { target: "draft-7" });
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: { authorization: `Bearer ${this.apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "system",
            content: `${request.system}\nReturn only valid JSON. Never invent evidence.`,
          },
          { role: "user", content: JSON.stringify(request.input) },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: request.task.replace(/-/g, "_"), schema: jsonSchema },
        },
        reasoning_effort: "none",
        max_tokens: request.maxOutputTokens,
        temperature: request.temperature,
      }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!response.ok) {
      const detail = (await response.text()).replace(/\s+/g, " ").trim().slice(0, 500);
      throw new Error(
        `Mistral request failed with ${response.status}${detail ? `: ${detail}` : "."}`,
      );
    }
    const body = (await response.json()) as {
      id?: string;
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    return {
      data: parseCandidate(request.schema, body.choices?.[0]?.message?.content),
      provider: this.name,
      model: this.model,
      latencyMs: Date.now() - started,
      inputUnits: body.usage?.prompt_tokens ?? 0,
      outputUnits: body.usage?.completion_tokens ?? 0,
      retryCount: 0,
      schemaValid: true,
      promptVersion: request.promptVersion,
      ...(body.id ? { responseId: body.id } : {}),
    };
  }
}

export class OpenAIProvider implements StructuredModelProvider {
  readonly name = "openai" as const;
  constructor(
    private readonly apiKey: string,
    private readonly model = "gpt-5.6-luna",
  ) {}

  async generate<T>(request: StructuredGenerationRequest<T>): Promise<ModelResult<T>> {
    const started = Date.now();
    const jsonSchema = z.toJSONSchema(request.schema, { target: "draft-7" });
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { authorization: `Bearer ${this.apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        instructions: request.system,
        input: JSON.stringify(request.input),
        reasoning: { effort: "low" },
        max_output_tokens: request.maxOutputTokens,
        text: {
          format: {
            type: "json_schema",
            name: request.task.replace(/-/g, "_"),
            strict: true,
            schema: jsonSchema,
          },
        },
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) {
      const requestId = response.headers.get("x-request-id");
      const raw = (await response.json().catch(() => null)) as {
        error?: { type?: string; code?: string | null; message?: string };
      } | null;
      throw new OpenAIRequestError({
        provider: "openai",
        status: response.status,
        requestId,
        errorType: raw?.error?.type?.slice(0, 80) || "http_error",
        errorCode: raw?.error?.code?.slice(0, 80) || null,
        message:
          raw?.error?.message?.replace(/\s+/g, " ").trim().slice(0, 300) || "Request rejected.",
      });
    }
    const body = (await response.json()) as {
      id?: string;
      status?: string;
      incomplete_details?: { reason?: string };
      output_text?: string;
      output?: Array<{ content?: Array<{ text?: string }> }>;
      usage?: { input_tokens?: number; output_tokens?: number };
    };
    const outputText =
      body.output_text ??
      body.output
        ?.flatMap((item) => item.content ?? [])
        .map((item) => item.text ?? "")
        .join("");
    if (!outputText?.trim())
      throw new OpenAIRequestError({
        provider: "openai",
        status: 200,
        requestId: response.headers.get("x-request-id"),
        errorType: body.status === "incomplete" ? "incomplete_response" : "response_parse_error",
        errorCode: body.incomplete_details?.reason ?? null,
        message:
          body.status === "incomplete"
            ? `Response was incomplete: ${body.incomplete_details?.reason ?? "unknown reason"}.`
            : "Response did not contain structured output text.",
      });
    let data: T;
    try {
      data = parseCandidate(request.schema, outputText);
    } catch (error) {
      const message =
        error instanceof z.ZodError
          ? error.issues
              .slice(0, 6)
              .map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`)
              .join("; ")
          : error instanceof Error
            ? error.message
            : "Unknown structured-output parse error.";
      throw new OpenAIRequestError({
        provider: "openai",
        status: 200,
        requestId: response.headers.get("x-request-id"),
        errorType: error instanceof z.ZodError ? "schema_validation_error" : "response_parse_error",
        errorCode: null,
        message: message.replace(/\s+/g, " ").trim().slice(0, 300),
      });
    }
    return {
      data,
      provider: this.name,
      model: this.model,
      latencyMs: Date.now() - started,
      inputUnits: body.usage?.input_tokens ?? 0,
      outputUnits: body.usage?.output_tokens ?? 0,
      retryCount: 0,
      schemaValid: true,
      promptVersion: request.promptVersion,
      ...(body.id ? { responseId: body.id } : {}),
    };
  }
}

export async function generateWithFallback<T>(
  providers: StructuredModelProvider[],
  request: StructuredGenerationRequest<T>,
  onAttempt?: (attempt: ProviderAttempt<T>) => void | Promise<void>,
  validateResult?: (result: ModelResult<T>) => void | Promise<void>,
): Promise<ModelResult<T>> {
  const failures: string[] = [];
  for (const provider of providers) {
    try {
      const result = await provider.generate(request);
      await validateResult?.(result);
      await onAttempt?.({ provider: provider.name, succeeded: true, result });
      return {
        ...result,
        retryCount: 0,
        ...(failures.length ? { fallbackReason: failures.join("; ") } : {}),
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unknown failure";
      failures.push(`${provider.name}:${reason}`);
      await onAttempt?.({ provider: provider.name, succeeded: false, reason });
    }
  }
  throw new Error(`All model providers failed: ${failures.join("; ")}`);
}
