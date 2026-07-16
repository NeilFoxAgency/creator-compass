# Sample inputs

These fixtures let judges and contributors inspect representative input without calling a live website or model provider.

- `brand-profiles.json` contains four structured brand profiles covering ecommerce, local service, regulated wellness, and sparse evidence.
- `sites/` contains small HTML pages for the bounded ingestion tests and demonstrations.
- `pnpm test` verifies ingestion, contracts, scoring, and fallbacks.
- `pnpm eval` runs twelve deterministic cases and writes the reviewable results to `outputs/evaluation/`.

All domains use the reserved `.example` namespace. The fixtures contain no customer data or third-party copyrighted material.
