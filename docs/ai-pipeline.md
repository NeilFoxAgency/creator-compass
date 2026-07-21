# AI pipeline

## Stage 1: brand extraction

Primary: Cloudflare Workers AI `@cf/qwen/qwen3-30b-a3b-fp8`. Optional fallback: Mistral. Input is a compact server-owned evidence array and optional user context; raw HTML is excluded. Output must validate against the extracted-profile schema and may describe product type, business model, audience type, buyer and user roles, industries, use cases, jobs to be done, technical level, purchase motion, and campaign asset type.

A valid evidence ID is not sufficient by itself. Values that influence scoring must also have semantic support in the original website evidence, user-provided context, or an already grounded deterministic field. Unsupported fields are dropped. Failure falls back to a conservative deterministic profile with explicit unknowns.

Pasted-context continuation uses deterministic, server-grounded extraction so a model cannot add facts beyond the user's supplied description.

## Deterministic core

Product-aware readiness and territory fit live in ordinary TypeScript as separate concepts. Eligibility first rejects category, buyer, use-case, job, product-type, and B2B/B2C mismatches. Ranking then weights category and use case at 38%, buyer roles at 23%, jobs to be done at 17%, content naturalness at 10%, purchase influence at 7%, and evidence strength at 5%, with explicit incompatibility penalties.

The taxonomy contains reviewed consumer, service, technical, B2B, SaaS, agency, developer-tool, AI-creative, SEO, and creator-economy territories with structured compatibility metadata. Code owns scores, penalties, thresholds, retrieval, rate and provider budgets, deduplication, and abstention.

## Stage 2: bounded candidates

CreatorCompass builds a compact set from eligible ranked territories. Risk candidates are created separately when a direction is superficially tempting but strategically weak; random bottom-ranked categories are never injected.

Cloudflare Workers AI enriches chunks of two candidates, with Mistral and a changed repair strategy as fallbacks. Enrichment can improve audience reasoning, creator profiles, objections, and risks, but cannot change deterministic scores, eligibility, classifications, evidence ownership, or canonical brand facts. Server-grounded campaign concepts remain available whenever enrichment fails.

## Stage 3: GPT-5.6 review

`gpt-5.6-luna` receives only the structured profile, readiness results, bounded candidates, evidence IDs, unknowns, fit scores, score components, allowed readiness keys, and campaign-coverage goals. A strict Responses API JSON schema permits up to 3 Core, 3 Adjacent, 2 Experimental, and 2 Risk entries.

GPT-5.6 must select only defensible candidates, choose one selected Core territory as the North Star, and return the campaign format, creator direction, first-test shape, rationale, and fix-first priorities. Deterministic postflight checks enforce unique known IDs, fit thresholds, grounding, developed prose, allowed readiness keys, and documented campaign coverage. The model cannot fill a quota or promote an ineligible candidate.

Workers AI, Mistral, and deterministic strategy review remain fallbacks. Provider completion is not the delivery-quality test. The finished report must pass content-based validation regardless of which provider path was used.

## Delivery behavior

- An unreadable website becomes `needs-input` and offers pasted context.
- Insufficient evidence produces preliminary hypotheses without a North Star or numerical readiness score.
- A valid deterministic or secondary-provider report is delivered normally and records its provider path.
- Provider fallback alone does not create a user-facing error banner.
- A result that cannot pass schema, grounding, eligibility, grammar, and quality validation is repaired or reduced to preliminary hypotheses.

No hidden chain-of-thought is requested or displayed. The report shows concise rationale, evidence, assumptions, confidence, model provenance, and methodology version.
