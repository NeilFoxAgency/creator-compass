# OpenAI Build Week compliance map

Audited against the official rules on July 16, 2026.

| Requirement | CreatorCompass evidence | Status |
|---|---|---|
| Built with Codex and GPT-5.6 | Dated collaboration log; GPT-5.6 Luna Responses adapter; model-use explanation in README | Ready |
| One eligible category | Work & Productivity | Ready |
| Working, consistently runnable project | Cloudflare Worker/web app, local setup, test suite, deterministic fixture path | Deployment pending |
| Project description | Draft in `docs/submission-checklist.md` | Ready |
| Public or judge-shared repository with licensing | MIT license and public GitHub repository | Repository URL pending first push |
| README setup and testing guidance | Root README | Ready |
| Sample data if needed | `fixtures/` plus 12-case evaluation output | Ready |
| Codex collaboration and human decisions | README and `docs/codex-collaboration.md` | Ready |
| Free working access through judging | Public hosted demo | Deployment pending |
| Public YouTube demo under three minutes | English audio script in `docs/demo-script.md` | Recording pending |
| `/feedback` Session ID | Submission checklist placeholder | Pending user command |
| English submission materials | Repository documentation and planned video are English | Ready |

## Judging alignment

- **Technological implementation:** Non-trivial queue-backed Cloudflare system, bounded ingestion, provider abstraction, typed contracts, deterministic scoring, and a 70-territory taxonomy.
- **Design:** Complete responsive flow from URL entry through progress, evidence-backed report, map, readiness review, and share/print states.
- **Potential impact:** Gives brands a specific, low-friction decision layer before creator search, outreach, or agency spend.
- **Quality of idea:** Reframes creator discovery around strategic territory fit rather than another creator database.

The official rules and hackathon website remain the source of truth. Final compliance also depends on a functioning hosted demo, a public demo video, and a valid `/feedback` Session ID before the deadline.
