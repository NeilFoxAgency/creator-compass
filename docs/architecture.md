# Architecture

CreatorCompass uses one Cloudflare Worker for the public Hono API, Queue consumer, and static Vite assets. The initial request returns immediately after D1 persistence and Queue publication. The client polls a small job record and displays named stages instead of a fictional percentage.

## Data boundaries

- The browser sends a website URL and optional campaign context.
- Website ingestion stores only bounded evidence excerpts in the finished report. Raw HTML is not persisted or returned.
- D1 owns job state, reports, provider counters, leads, rate limits, and diagnostic events.
- KV caches final report payloads and seven-day optional YouTube exploration results.
- Queue delivery provides retries without holding a browser request open.
- Provider keys exist only as Worker secrets.

## Failure boundaries

Website failure becomes `needs-input`; the user may paste a description. Extraction failure uses conservative deterministic profiling. GPT-5.6 failure uses Workers AI review when available, then the deterministic portfolio. YouTube failure never changes or removes a territory recommendation.

## Security invariants

Every URL and redirect is revalidated. Only HTTP(S), standard ports, bounded HTML responses, and a small page count are allowed. Model outputs are Zod-validated before entering product state. Public creation is rate-limited and deduplicated. Reports contain no lead contact data.
