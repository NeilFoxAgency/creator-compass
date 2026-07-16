# AI pipeline

## Stage 1: brand extraction

Primary: Cloudflare Workers AI `@cf/qwen/qwen3-30b-a3b-fp8`. Optional fallback: Mistral. Input is a compact evidence array and optional user context; raw HTML is excluded. Output must validate as `BrandProfile`. Failure falls back to a conservative deterministic profile with explicit unknowns.

## Deterministic core

Ten readiness dimensions and seven weighted territory factors live in ordinary TypeScript. The taxonomy contains 70 reviewed territories. Code owns scores, penalties, retrieval, budget gates, deduplication, and portfolio-count enforcement.

## Stage 2: bounded candidates

CreatorCompass builds a compact set containing strong matches plus deliberately poor-fit directions. Each candidate includes audience connection, formats, creator profile, campaign concepts, viewer objection, risk, evidence IDs, and deterministic score.

## Stage 3: GPT-5.6 review

`gpt-5.6-luna` receives only the structured profile, readiness results, candidates, evidence IDs, unknowns, and scores. A strict Responses API JSON schema requires exactly eight classified choices plus one North Star. Deterministic postflight checks require unique known IDs and exact 3 Core / 2 Adjacent / 1 Experimental / 2 Risk counts.

No hidden chain-of-thought is requested or displayed. The report shows concise rationale, evidence, assumptions, confidence, and methodology.
