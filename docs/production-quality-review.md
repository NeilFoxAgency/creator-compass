# Production quality review

Date: 2026-07-16  
Production: <https://creatorcompass.neilfoxagency.com>  
Methodology: `2026.07.2`  
Reviewed deployment: `9e97a5b1-675a-453f-a3a5-f88baa5aa5cf`

## Production provider diagnostics

These are the exact cumulative production counters returned by `/api/admin/diagnostics` on
2026-07-16 after the uncached review batch. A success is `calls - failures`.

| Path                               | Calls | Failures | Successes or fallback uses |
| ---------------------------------- | ----: | -------: | -------------------------: |
| Cloudflare brand extraction        |    33 |       10 |               23 successes |
| Mistral brand-extraction fallback  |     0 |        0 |                     0 uses |
| OpenAI final review                |    20 |        2 |               18 successes |
| Deterministic brand extraction     |    10 |        0 |                    10 uses |
| Deterministic candidate enrichment |    24 |        0 |                    24 uses |
| Deterministic final review         |     1 |        0 |                      1 use |

Cloudflare candidate enrichment recorded 49 calls, 24 failed attempts, and 25 successful calls.
The report pipeline can retain successful chunks while replacing rejected or failed chunks with
deterministic content. Mistral was not invoked because production health correctly reported
`mistral: false`; no Mistral key is installed. Health reported Cloudflare and OpenAI enabled,
with YouTube disabled.

The adapter now sends the Zod-derived JSON Schema as Cloudflare `response_format`, accepts both
structured `response` and `choices[0].message.content`, records returned usage, and never retries an
identical schema failure. Realistic Qwen and GPT-OSS fixtures cover these response shapes. Candidate
enrichment rejects unknown evidence IDs, unresolved placeholders, unsupported numeric claims, and
unsupported credential or outcome claims.

## Fresh real-report review

All five analyses were submitted with `refresh: true`; no cached report was accepted as the fresh
job result. The table records the provider path stored by the application, without editing model
provenance metadata.

| Domain              | Report slug                  | Provider path                                                                                  | GPT-5.6 genuinely used? | Manual review                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `neilfoxagency.com` | `neilfoxagency-com-4980e015` | Cloudflare extraction → deterministic enrichment → OpenAI final review                         | Yes                     | Accurate agency/service extraction. Creator Business is defensible; Marketing Education and Consumer Technology are useful supporting cores. Food and Career are plausible client/application adjacencies; Local Discovery is appropriately exploratory. Evidence is relevant and readiness is capped at 59 because tracking, offer, claims, and fulfillment remain unproven. An invalid schema sentence returned as `format` exposed a final-review edge case; delivery now replaces such prose with the selected candidate's canonical format (`income breakdowns`). |
| `glossier.com`      | `glossier-com-b2826b2d`      | Cloudflare extraction → deterministic enrichment → OpenAI final review                         | Yes                     | Product, audience, and uncomplicated-routine extraction are credible. Beauty Tutorials and Skincare Education are strong; Men's Grooming and Hair Care are useful adjacencies. Writing/Journaling is clearly experimental rather than presented as a sure fit. The report is appropriately capped at 59 and does not pretend public pages prove operations. Cloudflare enrichment failed closed, so concepts remain conservative but somewhat templated.                                                                                                               |
| `mailchimp.com`     | `mailchimp-com-f3c609a9`     | Cloudflare extraction → Cloudflare plus deterministic partial enrichment → OpenAI final review | Yes                     | Extraction correctly identifies email, SMS, AI marketing tools, and business/retail audiences. Marketing Education is the defensible North Star; E-commerce Operations, Creator Business, Entrepreneurship, and Productivity are plausible extensions. Gardening is a deliberately weak vertical experiment, not a core recommendation. The earlier erroneous Home Improvement ranking was corrected by category ordering, word-boundary matching, and explicit marketing signals.                                                                                     |
| `oatly.com`         | `oatly-com-30d45909`         | Cloudflare extraction → Cloudflare enrichment → OpenAI final review                            | Yes                     | Extraction captures oat drink, plant-based audiences, and sustainability. Sustainable Living is a strong North Star; Zero-Waste and Budget Living are coherent cores, with Camping a plausible use-context adjacency. Writing/Journaling and Board Games are low-confidence lifestyle tests. Evidence supports the direction while the review explicitly avoids unproven nutrition, price, and environmental claims. Readiness is capped at 59.                                                                                                                        |
| `mozilla.org`       | `mozilla-org-bbd0b4fa`       | Cloudflare extraction → deterministic enrichment → abstained for insufficient evidence         | No, by design           | The public-page extraction did not establish a primary buyer or concrete campaign need. The system correctly provides no North Star and no numerical score, labels all routes preliminary, and asks for buyer, outcome, offer, proof, tracking, and fulfillment context. This is the desired abstention behavior; invoking GPT-5.6 would have created false confidence.                                                                                                                                                                                                |

The reports do not reuse substantially identical AI-generated campaign claims across unrelated
brands. Where Cloudflare could not return grounded, schema-valid enrichment, the fail-closed
deterministic copy remains structurally consistent but inserts the brand, need, territory, format,
motivation, and evidence selected for that candidate.

## Corrections made during the review

- Repaired Cloudflare structured-output parsing, truncation handling, usage capture, and chunked
  candidate enrichment.
- Added insufficient-evidence abstention, clarifying questions, pasted-context continuation, and
  score suppression.
- Made ingestion evidence immutable and server owned; unknown evidence IDs are rejected, canonical
  domains are restored, and prompt-injection sentences are excluded from model input.
- Recalibrated readiness so tracking, fulfillment, and claims safety remain unknown without evidence;
  critical unknowns cap readiness at 59 and each dimension cites relevant excerpts.
- Removed deterministic campaign prose from model enrichment input so the model must create its own
  brand-specific concepts.
- Added category signals and word-boundary matching so explicit marketing, software, and beauty
  evidence beats generic navigation words.
- Added grounding checks that discard placeholders, unsupported numbers, credentials, and outcome
  claims instead of publishing them.
- Matched the Neil Fox Agency palette, typography, logo treatment, rounded imagery, and overall visual
  language. Rebuilt the report-preview compass as a bounded responsive card so labels cannot overlap.
- Expanded CI to run typecheck, tests, formatting, evaluation, deploy dry run, and build.

## Verification

Final local pipeline:

| Command               | Result                                                        |
| --------------------- | ------------------------------------------------------------- |
| `pnpm typecheck`      | Pass                                                          |
| `pnpm test`           | Pass — 7 files, 36 tests                                      |
| `pnpm format:check`   | Pass                                                          |
| `pnpm eval`           | Pass — 12/12, including SparseBrand and ManyThings abstention |
| `pnpm deploy:dry-run` | Pass                                                          |
| `pnpm build`          | Pass                                                          |

Production checks:

- `/api/health`: `ok: true`, methodology `2026.07.2`, Cloudflare and OpenAI enabled, Mistral and
  YouTube disabled.
- Landing page, SPA report route, and report API returned HTTP 200.
- The final live landing page retained the custom domain, repaired responsive compass visual, agency
  branding, and rounded editorial imagery.
- Installed Worker secrets are `OPENAI_API_KEY` and a QA-only admin bypass; no Turnstile secret is
  installed.

## Remaining known limitations

- Mistral fallback is implemented but unavailable until a Mistral key is configured.
- Some real sites block or challenge server-side ingestion; ten production jobs ended with
  `WEBSITE_UNAVAILABLE`. The paste-context continuation is the supported recovery path.
- Cloudflare structured generation is variable, so conservative deterministic enrichment is still
  common. The report exposes the exact provider path.
- Deterministic campaign copy is intentionally safer and more templated than a grounded model result.
- GPT-5.6 final review is capped at 20 production calls per UTC day. Appropriate abstention reports do
  not invoke it.
- YouTube expansion remains disabled, and Turnstile will remain secret-disabled until the browser
  widget submits valid tokens end to end.
