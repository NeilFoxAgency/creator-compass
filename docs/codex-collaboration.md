# Codex collaboration log

This file records how Codex accelerated CreatorCompass and which product, engineering, and ethical decisions remained human decisions.

**Primary Codex `/feedback` Session ID:** `019f6c13-ed02-76c1-b025-f2231ba00854`

## 2026-07-16 - Product implementation

- **Task:** Build the CreatorCompass hackathon MVP from Neil's implementation plan.
- **Codex contribution:** Created the TypeScript monorepo, shared contracts, territory taxonomy, deterministic scoring, bounded website ingestion, provider adapters, asynchronous Cloudflare pipeline, persistence, rate limits, responsive product UI, optional discovery fallback, tests, evaluation suite, documentation, and deployment configuration.
- **Neil's decisions:** Territory-first positioning; one brand URL as the initial input; Work & Productivity category; Cloudflare-first cost posture; evidence and uncertainty language; GPT-5.6 as a bounded final adjudicator; no accounts, contact scraping, or mass outreach; optional creator discovery; agency call to action.
- **Key files:** `apps/web`, `apps/worker`, `packages/*`, `migrations`, `services/youtube-fallback`, `docs`, and `wrangler.jsonc`.
- **Verification:** `pnpm typecheck`, `pnpm test`, `pnpm build`, `pnpm eval`, Wrangler dry run, local browser checks, and live deployment checks.

## 2026-07-16 - Contest compliance and repository publication

- **Task:** Audit the official Devpost requirements and publish a licensed repository judges could inspect and run.
- **Codex contribution:** Mapped the product to Work & Productivity, added setup and testing documentation, created sample fixtures and a compliance map, and prepared the MIT-licensed public repository.
- **Neil's decision:** Keep the submission focused on one coherent brand-planning workflow rather than expanding into a CRM, creator marketplace, or outreach system.

## 2026-07-16 - Free-tier production deployment

- **Task:** Deploy a public judge build that could operate largely on free or already available infrastructure.
- **Codex contribution:** Provisioned and migrated D1, KV, Queue and DLQ resources; deployed the Worker and static app; configured provider secrets; attached the custom domain; removed paid-plan-only settings; and verified a persisted GPT-5.6 Luna review.
- **Neil's decision:** Production inference must use Cloudflare first where practical, Mistral as a resilient fallback, GPT-5.6 for the decisive bounded review, and deterministic logic whenever a model is not the right authority.

## 2026-07-20 - Strategic correctness pass

- **Trigger:** Neil reviewed an OpenSEO report and rejected the recommendation quality. Beauty, gardening, camping, and gaming appeared for an SEO platform despite a polished report design.
- **Codex contribution:** Traced the failure to loose substring matching, a territory-score floor, consumer-heavy taxonomy coverage, unrelated candidate injection, fixed portfolio quotas, weak B2B compatibility modeling, and physical-product-oriented readiness logic.
- **Engineering changes:** Rebuilt fit eligibility around direct category, use-case, buyer-role, and job-to-be-done support; separated readiness from territory fit; added specialist B2B and technical territories; introduced variable portfolio sizes and abstention; made readiness product-aware; added semantic grounding and negation checks; improved deterministic campaign language; and expanded regression coverage.
- **Neil's decisions:** A complete-looking map is less valuable than a smaller defensible map; risk zones must be tempting but strategically weak directions rather than random low-ranked categories; raw diagnostic scores should not dominate the user experience; and a system should abstain instead of forcing recommendations.
- **Verification:** OpenSEO retained SEO, AI-agent, open-source, developer-tool, and agency routes while unrelated consumer territories were removed.

## 2026-07-21 - Final reliability and presentation pass

- **Trigger:** Valid reports were displaying a provider-fallback warning, the readiness denominator overlapped the score, and a Loova report exposed unsupported SEO inferences.
- **Codex contribution:** Decoupled delivery quality from provider completion; added content-based report validation; ensured unreadable sites enter `needs-input`; preserved preliminary hypotheses for insufficient evidence; strengthened semantic support validation and negation handling; added direct-evidence rules for specialist routes; repaired GPT-5.6 final-review diagnostics and postflight validation; leased queue jobs against duplicate delivery; fixed sharing when clipboard permission is denied; and corrected responsive and print score layout.
- **Neil's decisions:** Provider failure is an implementation detail, not automatically a user-facing product error; a deterministic report may be delivered normally only when it passes the same content and grounding standards; source evidence must support the structured fields that influence scoring; and visible polish defects in the web and PDF reports are submission blockers.
- **Production verification:** Fresh Loova AI, OpenSEO, Linear, CoolToday, and Glossier reports were reviewed. GPT-5.6 completed genuine production reports, inaccessible-site behavior returned `needs-input`, and print verification produced an eight-page report without blank pages.
- **Final checks:** `pnpm typecheck`; 79 tests; formatting; 9 of 9 evaluation cases; Wrangler deploy dry run; production build; high-severity dependency audit; browser sharing; responsive score layout; and print-to-PDF verification.

## Division of responsibility

### Codex accelerated

- Repository scaffolding and implementation
- Repetitive schema and provider integration work
- Test and evaluation creation
- Production debugging across many files and provider paths
- Cloudflare deployment and diagnostics
- Converting report-quality feedback into code, tests, and guardrails

### Neil decided

- The problem and intended audience
- Product scope and category
- The one-input experience
- What constitutes a useful or embarrassing recommendation
- The boundary between deterministic code and model judgment
- Evidence, abstention, transparency, and user-agency requirements
- Which failures were acceptable fallbacks and which were product defects
- The final visual, report, and launch priorities

The project was built through repeated human review of real output. Codex accelerated the implementation loop, while Neil supplied the domain judgment and made the decisions that defined product quality.
