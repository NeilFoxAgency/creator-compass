# Security and operations

Rotate provider secrets in the Cloudflare dashboard or with `wrangler secret put`; never paste secret values into logs, issues, commits, or CLI arguments. After rotation, verify `/api/health`, create one admin-bypass analysis, and inspect provider counters.

Production creation uses a managed Cloudflare Turnstile widget on all three AI-triggering form paths.
The browser sends its single-use token to the CreatorCompass Worker, which fails closed while asking
the managed Spin verification Worker to call Siteverify. The widget secret exists only on that
verification Worker. Keep `ADMIN_BYPASS_SECRET` restricted to the demo operator. Review D1
`system_events` and provider failure counters daily during the public demo. Disable any provider with
its environment kill switch if failures or spending become abnormal.

The ingestion layer rejects obvious private and metadata destinations and revalidates redirects. Because application-layer hostname validation cannot independently pin public DNS resolution inside a normal Worker fetch, Cloudflare network policy and bounded no-credential fetches remain part of the defense in depth. The endpoint never accepts request headers, methods, or proxy instructions from users.
