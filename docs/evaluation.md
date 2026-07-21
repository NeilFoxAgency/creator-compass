# Evaluation

Run:

```bash
pnpm eval
```

This generates `outputs/evaluation/evaluation.json` and `outputs/evaluation/evaluation.md` for nine fixed regression cases:

1. Loova AI - AI image and video creation, with unsupported SEO routes prohibited
2. OpenSEO - specialist SEO, AI-agent, open-source, and developer-oriented routes
3. PipelineFlow - B2B SaaS and growth operations
4. CodeHarbor - open-source developer tools
5. GlowTheory - consumer beauty and skincare education
6. TrailKind - physical e-commerce and camping
7. Main Street HVAC - local service and home improvement
8. ManyThings - broad multi-category brand that should abstain
9. SparseBrand - insufficient evidence that should abstain

The golden-output policy avoids exact prose matching. It verifies:

- Schema compliance
- Bounded variable-size portfolios
- Direct-evidence territory eligibility
- B2B, B2C, software, service, and physical-product relevance
- Prohibited-category exclusion
- Product-aware readiness
- Campaign-attribution safety, including preventing rank tracking from counting as campaign tracking
- Semantic grounding and negation handling
- Grammatical deterministic copy
- North Star validity
- Abstention for broad or insufficient evidence

The latest committed result is [PASS, 9 of 9](../outputs/evaluation/evaluation.md).

Automated evaluation is not a replacement for product judgment. Human review should additionally assess plausibility, specificity, evidence relevance, usefulness of risk zones, campaign-concept quality, and whether every adjacent or experimental bridge is defensible.
