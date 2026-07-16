# CreatorCompass by Neil Fox Agency

**Discover where your brand belongs in the creator economy.**

CreatorCompass turns one input—a brand website—into an evidence-backed creator territory map, ten-dimension sponsorship-readiness review, campaign directions, and one decisive first route. It is deliberately earlier and more strategic than a creator database: it helps a brand understand where to go before presenting thousands of names.

**OpenAI Build Week track:** Work & Productivity  
**Hackathon build window:** July 13–21, 2026  
**Source:** [github.com/NeilFoxAgency/creator-compass](https://github.com/NeilFoxAgency/creator-compass)  
**Live Demo:** [creatorcompass.neilfoxagency.com](https://creatorcompass.neilfoxagency.com/)

## Quick Start

See full README in the repo for setup.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md)

## Architecture

```text
React/Vite client
      │ POST /api/analyses
      ▼
Hono Cloudflare Worker ── D1 job + rate limits
      │
      ▼
Cloudflare Queue consumer
      ├─ safe bounded website ingestion
      ├─ Workers AI → Mistral extraction fallback
      ├─ deterministic readiness + territory scoring
      ├─ GPT-5.6 Luna final review
      └─ deterministic/Workers AI final fallback
               │
               ├─ D1 report record
               └─ KV report cache
```

See [docs/architecture.md](docs/architecture.md) and [docs/ai-pipeline.md](docs/ai-pipeline.md).

## Local setup

Requirements: Node.js 22+, pnpm 10+, and Wrangler 4.

```bash
pnpm install
cp .env.example .dev.vars
pnpm build
pnpm dev
```

Create local D1 state before the first API request:

```bash
pnpm wrangler d1 migrations apply creator-compass --local
```

Workers AI runs remotely. For a fixture-only verification that uses no provider, run:

```bash
pnpm test
pnpm eval
```

Sample inputs live in [`fixtures/`](fixtures/). The evaluation suite uses twelve human-authored brand profiles, including regulated, local-service, multi-category, and insufficient-evidence cases. No API key is required for the deterministic test and evaluation path.

The bundled sample report is deliberately labeled as a deterministic fixture. The separate live verification report records `usedGpt56: true` and `model: gpt-5.6-luna` in the persisted report metadata.

## Environment variables

Secrets belong in `.dev.vars` locally and Wrangler secrets in production. Never prefix server secrets with `VITE_`.

| Variable                |       Required | Purpose                                         |
| ----------------------- | -------------: | ----------------------------------------------- |
| `OPENAI_API_KEY`        | Hackathon demo | GPT-5.6 final strategic review                  |
| `OPENAI_MODEL`          |            Yes | Defaults to `gpt-5.6-luna`                      |
| `OPENAI_MAX_DAILY_RUNS` |            Yes | Daily GPT review cap                            |
| `MISTRAL_API_KEY`       |             No | Extraction fallback                             |
| `YOUTUBE_API_KEY`       |             No | On-demand official YouTube discovery            |
| `YTDLP_SERVICE_URL`     |             No | Metadata-only fallback service                  |
| `YTDLP_SHARED_SECRET`   |  With fallback | Authenticates the fallback service              |
| `TURNSTILE_SECRET_KEY`  |    Recommended | Bot protection for public analysis creation     |
| `ADMIN_BYPASS_SECRET`   |    Recommended | Demo/admin bypass and diagnostics authorization |

Cloudflare bindings `AI`, `DB`, `REPORT_CACHE`, `ANALYSIS_QUEUE`, and `ASSETS` are declared in `wrangler.jsonc`.

## Test and evaluation path

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm eval
pnpm deploy:dry-run
```

The unit suite covers contracts, taxonomy size and uniqueness, deterministic scoring and exact portfolio counts, SSRF rejection, HTML extraction, provider fallback, quota detection, and YouTube normalization. The 12-case evaluation produces JSON and Markdown under `outputs/evaluation/` and tests structure rather than exact prose.

## Security posture

- Only HTTP(S), public-looking hosts, and standard ports are accepted.
- Credentials in URLs, private/loopback/metadata addresses, excessive redirects, non-HTML bodies, oversized bodies, and slow requests are rejected.
- Every redirect is revalidated; fetched scripts are never executed and raw HTML is never relayed to the client.
- Public creation limits default to 3 analyses per IP per hour and 1 uncached analysis per domain per hour.
- D1 deduplicates active jobs; Turnstile and an admin bypass are supported.
- Model output is untrusted until Zod validation succeeds.
- CSP, request-size limits, provider timeouts, bounded retries, kill switches, and daily provider budgets are enforced.
- No key is shipped to the browser or stored in D1/KV.

This is a marketing strategy aid, not legal, medical, financial, safety, or ROI advice.

## How Codex accelerated the build

Codex translated a detailed product plan into a deployable vertical system: workspace scaffold, contracts, taxonomy, scoring, bounded ingestion, provider adapters, Cloudflare persistence and queueing, UI, security tests, evaluation tooling, documentation, and deployment verification. It kept provider behavior behind interfaces and translated failures into explicit fallbacks rather than expanding product scope.

The most material Codex accelerations were the typed contracts shared across the client, Worker, model adapters, and tests; the 70-territory taxonomy and deterministic scoring engine; the SSRF-aware ingestion boundary; and the end-to-end Cloudflare queue/D1/KV architecture. Codex also generated and maintained the evaluation artifacts while implementation changed, making regressions visible before deployment.

The primary build task is the Codex task that contains this repository. Its `/feedback` Session ID must be recorded in `docs/submission-checklist.md` immediately before submission.

## Neil's decisions

Neil chose the upstream territory-first product position; the exact report composition; evidence-over-score presentation; Cloudflare-first operating model; GPT-5.6 as final adjudicator; optional rather than mandatory creator discovery; Neil Fox Agency attribution and follow-through; and the product's ethical boundaries. Codex implemented those decisions but did not replace them.

Key engineering decisions retained human ownership: deterministic code—not a model—owns readiness math and portfolio invariants; raw HTML never goes to GPT-5.6; unknowns remain visible rather than being filled by inference; creator discovery is optional; and every provider has a bounded fallback and budget gate. See [`docs/codex-collaboration.md`](docs/codex-collaboration.md) for the dated collaboration record and [`docs/contest-compliance.md`](docs/contest-compliance.md) for the contest audit.

## Why GPT-5.6 is meaningful

GPT-5.6 receives a compact packet containing the brand profile, inspectable readiness results, bounded candidates, evidence IDs, unknowns, contradictions, and deterministic scores. It must reject weak or repetitive candidates, produce the final 3/2/1/2 portfolio, and choose the North Star. It never receives raw website HTML and does not own deterministic scoring. If it is unavailable or over the daily cap, the product remains functional and labels the internal quality path honestly.

## License

MIT. See [LICENSE](LICENSE).
