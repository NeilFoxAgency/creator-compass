# Architecture

CreatorCompass uses one Cloudflare Worker for the public Hono API, Queue consumer, and static Vite assets. The initial request returns after D1 persistence and Queue publication. The client polls a small job record and displays named stages instead of a fictional percentage.

## Data boundaries

- The browser sends a website URL and optional campaign context.
- Website ingestion stores only bounded evidence excerpts in the finished report. Raw HTML is not persisted or returned.
- D1 owns job state, reports, provider counters, leads, rate limits, leases, and diagnostic events.
- KV caches final report payloads and optional YouTube exploration results.
- Queue delivery provides retries without holding a browser request open.
- Job leasing prevents duplicate queue deliveries from concurrently overwriting one another.
- Provider keys exist only as Worker secrets.

## Analysis boundaries

- Website ingestion creates immutable server-owned evidence records.
- Structured extraction may enrich the deterministic profile, but fields that influence scoring must have semantic support in the original evidence or user-provided context.
- Ordinary TypeScript calculates readiness, territory eligibility, fit components, thresholds, and deterministic candidate concepts.
- Candidate enrichment is bounded to eligible territories and cannot change scores, classifications, or evidence ownership.
- GPT-5.6 receives the bounded candidate set and acts as the final strategic adjudicator.
- Every model result is schema-validated and passes additional grounding, threshold, grammar, and quality checks before delivery.

## Failure boundaries

- Website failure becomes `needs-input`; the user may paste a product or company description.
- Insufficient evidence produces preliminary hypotheses without a North Star or numerical readiness score.
- Extraction failure uses a conservative deterministic profile.
- Candidate-enrichment failure preserves server-grounded deterministic concepts.
- GPT-5.6 failure can use a validated Workers AI, Mistral, or deterministic strategy path.
- Provider fallback alone is not shown as a user-facing product error. A fallback report is delivered normally only when it passes content-based delivery validation.
- A report that cannot pass grounding and quality validation is repaired or reduced to preliminary hypotheses.
- YouTube failure never changes or removes a territory recommendation.

## Security invariants

Every URL and redirect is revalidated. Only HTTP(S), standard ports, bounded HTML responses, and a small page count are allowed. Model outputs are Zod-validated before entering product state. Public creation is Turnstile-protected, rate-limited, cached, and deduplicated. Model evidence IDs must resolve to immutable server-owned records, and reports contain no lead contact data.
