# AI pipeline

## Stage 1: brand extraction

Primary: Cloudflare Workers AI `@cf/qwen/qwen3-30b-a3b-fp8`. Optional fallback: Mistral. Input is a compact evidence array and optional user context; raw HTML is excluded. Output must validate as `BrandProfile`, including product type, business model, audience type, buyer and user roles, industries, use cases, jobs to be done, technical level, purchase motion, and campaign asset type. Action fields are normalized to grammatical verb phrases. Failure falls back to a conservative deterministic profile with explicit unknowns.

## Deterministic core

Product-aware readiness and territory fit live in ordinary TypeScript as separate concepts. Eligibility first rejects category, buyer, use-case, job, product-type, and B2B/B2C mismatches. Ranking then weights category/use case (38%), buyer roles (23%), jobs to be done (17%), content naturalness (10%), purchase influence (7%), and evidence strength (5%), with explicit incompatibility penalties. The taxonomy contains reviewed consumer, service, technical, and B2B territories with structured compatibility metadata. Code owns scores, penalties, thresholds, retrieval, budget gates, and deduplication.

## Stage 2: bounded candidates

CreatorCompass builds a compact set from eligible ranked territories. Risk candidates are created separately when a direction is superficially tempting but strategically weak; random bottom-ranked categories are never injected. Cloudflare Workers AI enriches chunks of at most three candidates, with Mistral fallback. Each chunk records provider and fallback outcome.

## Stage 3: GPT-5.6 review

`gpt-5.6-luna` receives only the structured profile, readiness results, bounded candidates, evidence IDs, unknowns, fit scores, and score components. A strict Responses API JSON schema permits up to 3 Core, 3 Adjacent, 2 Experimental, and 2 Risk entries. Deterministic postflight checks enforce unique known IDs and fit thresholds; the model cannot fill a quota or promote an ineligible candidate. Workers AI and then Mistral are verified final-review fallbacks before deterministic review.

A full-quality report requires at least 75% successful candidate enrichment, a completed verified strategic review, and a grammar-safe payload. Otherwise the product delivers a reduced, visibly labeled draft analysis, suppresses raw fit scores, and offers regeneration.

No hidden chain-of-thought is requested or displayed. The report shows concise rationale, evidence, assumptions, confidence, and methodology.
