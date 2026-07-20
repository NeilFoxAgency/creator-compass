# Production quality review

## Recommendation-quality overhaul — 2026-07-19

Production: <https://creatorcompass.neilfoxagency.com>  
Methodology: `2026.07.3`  
Reviewed deployment: `db53246b-0fd8-4fdb-80a5-93f02ec81e0a`  
Fresh OpenSEO report: <https://creatorcompass.neilfoxagency.com/reports/openseo-so-012fe0bb>

### Root causes and correction

The previous OpenSEO portfolio was produced by substring matches (`self` in self-hosting matched
self-expression, self-reliance, and self-sufficiency), generic-token matches (`digital` matched
gaming), and a roughly 59-point readiness floor applied to every territory. Bottom taxonomy entries
were appended to the candidate pool and the review contract then filled fixed slots. Candidate
enrichment failed by chunk and the deterministic fallback inserted arbitrary noun fragments into verb
positions. Readiness also treated physical-product operations as relevant to software and confused
rank tracking with campaign attribution.

The current pipeline separates territory fit, evidence confidence, and brand readiness; classifies the
buyer, business model, product, use cases, and jobs; filters eligibility before ranking; selects
strategic risks separately; and uses bounded maximums instead of fixed counts. Campaign concepts and
fit/evidence records are server grounded. A model can enrich audience reasoning, profiles, objections,
and risks, but cannot replace the validated concepts, scores, evidence, or canonical domain. Final
review postflight rejects meta-instructions, unknown readiness keys, undeveloped tests, and portfolios
that omit documented differentiators.

### Fresh OpenSEO result

The persisted brand profile identifies OpenSEO as B2B open-source software for SEO professionals and
developers, with keyword research, backlink analysis, rank tracking, site audits, self-hosting, MCP,
and AI-agent integration. The report uses software readiness dimensions and correctly leaves campaign
attribution unknown; rank tracking does not satisfy it.

| Classification | Territory                         | Fit label  | Raw diagnostic fit |
| -------------- | --------------------------------- | ---------- | -----------------: |
| Core           | AI agents and workflow automation | Strong fit |                 92 |
| Core           | SEO and search marketing          | Strong fit |                 90 |
| Core           | Open source and self-hosting      | Strong fit |                 88 |
| Adjacent       | Developer tools                   | Strong fit |                 88 |
| Adjacent       | Web development                   | Strong fit |                 81 |

The prior persisted report ranked Consumer Technology 65; Beauty Tutorials, Camping, Gaming, and
Gardening 61; and Entrepreneurship, Zero-Waste Making, and Writing/Journaling 59. The new report has
no unrelated lifestyle recommendation. Its concepts explicitly cover keyword research, backlinks,
rank tracking, site audits, open-source positioning, usage-based billing, self-hosting, and MCP/agent
integration. The selected component breakdowns are persisted in the report; for example SEO is
category/use case 100, buyer role 100, jobs-to-be-done 55, content naturalness 90, purchase intent 92,
evidence 92, penalty 0. Unrelated consumer territories now score close to zero and fail eligibility
instead of inheriting readiness points.

Provider path for the fresh report:

- Brand extraction: Cloudflare Workers AI.
- Candidate enrichment: Mistral plus Cloudflare, all four bounded chunks successful, with
  server-grounded campaign concepts.
- Final strategic review: `mistral-small-2603` verified fallback.
- GPT-5.6 genuinely used: no; OpenAI final review was unavailable and every OpenAI attempt that UTC
  day failed closed.
- Delivery quality: full report, 100% candidate enrichment, grammar gate passed.

The cumulative production diagnostics captured on 2026-07-20 UTC were:

| Provider      | Task                 | Calls | Failures | Successes / uses |
| ------------- | -------------------- | ----: | -------: | ---------------: |
| Cloudflare    | brand extraction     |    23 |        3 |               20 |
| Cloudflare    | candidate enrichment |    66 |       39 |               27 |
| Cloudflare    | final review         |    17 |       15 |                2 |
| Mistral       | brand extraction     |     3 |        0 |                3 |
| Mistral       | candidate enrichment |    45 |       18 |               27 |
| Mistral       | final review         |    17 |        9 |                8 |
| OpenAI        | final review         |    17 |       17 |                0 |
| Deterministic | candidate fallback   |    18 |        0 |               18 |
| Deterministic | final fallback       |     7 |        0 |                7 |

The protected Mistral smoke test also passed on `mistral-small-2603`: schema-valid output, one call,
zero failures, 65 input units, and 32 output units.

### User-interface and print review

- Desktop Share now copies the canonical report URL and shows `Report link copied.`; touch devices
  retain the native share sheet.
- Fit labels and evidence confidence are primary. Raw fit numbers remain only in the diagnostics
  disclosure.
- Chrome 150 printed the production report at desktop width to an eight-page Letter PDF. Every page
  contains report content, major cards remain intact, and the final agency CTA now shares page eight
  with the methodology block instead of following an almost blank page.
- Chrome print-to-PDF was re-run against deployment `db53246b`: eight Letter pages with respective
  non-whitespace character counts of 78, 900, 249, 1,208, 503, 293, 347, and 436. No page is blank.
- The reviewed PDF artifact is `tmp/pdfs/openseo-so-012fe0bb-final.pdf` and is intentionally not
  committed.

### Current limitations

- The fresh report did not use GPT-5.6 because all 17 OpenAI final-review attempts that UTC day failed;
  Mistral completed the verified final review. Provider provenance is displayed and persisted.
- Deterministic campaign language prioritizes evidence safety over editorial variety. The concepts are
  brand- and territory-specific, but share a deliberately consistent walkthrough/comparison shape.
- AI-provider variance can increase report latency; failed or under-covered reviews trigger a changed
  Mistral repair strategy and otherwise downgrade visibly to draft.
- YouTube expansion remains disabled.

---

Date: 2026-07-16  
Production: <https://creatorcompass.neilfoxagency.com>  
Methodology: `2026.07.2`  
Reviewed deployment: `088808e3-0649-4b40-9093-7cccf002471b`

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
deterministic content. Mistral brand-extraction and candidate-enrichment fallback use remains zero
because no new production report needed that fallback during this review. Production health now
reports Cloudflare, OpenAI, and Mistral enabled, with YouTube disabled.

The protected live Mistral smoke test completed twice successfully after the adapter repair. The
captured verification returned model `mistral-small-2603`, 569 ms latency, 65 input tokens, 32 output
tokens, and schema-valid output containing the supplied `test-1` evidence ID. The cumulative smoke
counter is 9 calls and 7 failures: the seven failures are the intentionally observed adapter/model
iterations that led to the repair, not report-pipeline fallback attempts.

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
- Replaced the illustrative stock assets with two licensed Pexels photographs, removed the sample-only
  Share control, and normalized model-supplied opening-hook quotation marks.
- Corrected the Mistral model ID, moved the adapter to Zod-derived custom JSON Schema output, disabled
  reasoning output for deterministic pipeline steps, and added a protected live provider smoke test.
- Expanded CI to run typecheck, tests, formatting, evaluation, deploy dry run, and build.

## Verification

Final local pipeline:

| Command               | Result                                                        |
| --------------------- | ------------------------------------------------------------- |
| `pnpm typecheck`      | Pass                                                          |
| `pnpm test`           | Pass — 8 files, 39 tests                                      |
| `pnpm format:check`   | Pass                                                          |
| `pnpm eval`           | Pass — 12/12, including SparseBrand and ManyThings abstention |
| `pnpm deploy:dry-run` | Pass                                                          |
| `pnpm build`          | Pass                                                          |

Production checks:

- `/api/health`: `ok: true`, methodology `2026.07.2`, Cloudflare, OpenAI, and Mistral enabled, and
  YouTube disabled.
- Landing page, SPA report route, and report API returned HTTP 200.
- The final live landing page retained the custom domain, repaired responsive compass visual, agency
  branding, and rounded Pexels photography.
- Desktop and 390 px mobile browser checks found no horizontal overflow or console errors. The sample
  report retains Print, omits Share, and renders a single semantic quote pair around opening hooks.
- Installed Worker secrets include OpenAI, Mistral, and a QA-only admin bypass; no Turnstile secret is
  installed or enabled.
- `pnpm audit --audit-level high` found no known vulnerabilities, and `wrangler check startup`
  completed successfully.

## Remaining known limitations

- Mistral fallback is configured and live-tested, but has not yet been naturally selected by a fresh
  production report because Cloudflare remained the successful primary provider in the tested path.
- Some real sites block or challenge server-side ingestion; ten production jobs ended with
  `WEBSITE_UNAVAILABLE`. The paste-context continuation is the supported recovery path.
- Cloudflare structured generation is variable, so conservative deterministic enrichment is still
  common. The report exposes the exact provider path.
- Deterministic campaign copy is intentionally safer and more templated than a grounded model result.
- GPT-5.6 final review is capped at 20 production calls per UTC day. Appropriate abstention reports do
  not invoke it.
- YouTube expansion remains disabled, and Turnstile will remain secret-disabled until the browser
  widget submits valid tokens end to end.

## Final reliability and presentation pass — 2026-07-20

Reviewed production deployment: `65c99adb-97dd-44f7-9195-eab85c93b601`  
Methodology: `2026.07.4`

Provider completion is no longer a delivery-quality proxy. Reports pass the content validator or
are converted to preliminary hypotheses; a valid deterministic report is delivered normally. The
website-unavailable path remains `needs-input`. Pasted brand context now uses deterministic,
server-grounded extraction and candidate construction before the bounded strategic review, avoiding
unnecessary dependency on a provider call that cannot improve source provenance.

| Review brand | Report slug                       | Stored provider path                                                                | GPT-5.6 used | Reviewed result                                                                                              |
| ------------ | --------------------------------- | ----------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------------------------ |
| Loova AI     | `provided-brand-example-c9c3f736` | Deterministic extraction → deterministic candidates → OpenAI GPT-5.6                | Yes          | AI image/video creation, creative AI/design workflows, and e-commerce growth; no SEO or search capabilities. |
| OpenSEO      | `provided-brand-example-af675cc0` | Deterministic extraction → deterministic candidates → OpenAI GPT-5.6                | Yes          | SEO/search marketing, AI-agent workflows, and open source/self-hosting; no lifestyle categories.             |
| Glossier     | `provided-brand-example-c861c590` | Deterministic extraction → deterministic candidates → deterministic strategy review | No           | Beauty tutorials and skincare education; normal validated report with physical-product readiness.            |
| CoolToday    | `provided-brand-example-afdf646a` | Deterministic extraction → deterministic candidates → OpenAI GPT-5.6                | Yes          | Home improvement and local discovery; service readiness profile.                                             |
| Linear       | `provided-brand-example-04595660` | Deterministic extraction → deterministic candidates → OpenAI GPT-5.6                | Yes          | Developer tools with SaaS and web-development adjacency; unsupported open-source positioning removed.        |

The deliberately inaccessible URL job `d52809be-8979-4200-b5a0-646bdad5d690` entered
`needs-input` with `WEBSITE_UNAVAILABLE` and offered pasted context.

Final cumulative production diagnostics for 2026-07-20: Cloudflare brand extraction 38 calls / 26
successes / 12 failures; Mistral brand extraction 13 calls / 13 successes; Cloudflare candidate
enrichment 92 calls / 44 successes / 48 failures; Mistral candidate enrichment 58 calls / 39
successes / 19 failures; OpenAI final review 29 calls / 5 successes / 24 failures; deterministic
strategy review 16 uses. These counters include the iterative production verification runs.

Responsive browser checks at 320, 390, 768, and 1440 px confirmed no readiness-score overlap, a
normal-letter-spacing `/100`, `white-space: nowrap`, and no viewport-width overflow. The live Share
control returned `Report link copied.` after the Clipboard API rejection fallback. Chrome
print-to-PDF produced eight nonblank pages; the readiness score is legible on page 5 and no blank
page precedes the CTA.
