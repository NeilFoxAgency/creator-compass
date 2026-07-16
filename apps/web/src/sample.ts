import type { BrandProfile } from "@creator-compass/contracts";
import { assembleDeterministicReport } from "@creator-compass/scoring";

const profile: BrandProfile = {
  canonicalDomain: "neilfoxagency.com",
  brandName: "Neil Fox Agency",
  summary: "Neil Fox Agency is a creator-business and marketing-education partner helping brands and YouTube creators build credible sponsorship programs through focused strategy, outreach, negotiation, and campaign coordination.",
  products: [
    { name: "Creator sponsorship strategy", category: "creator business and marketing education" },
    { name: "Campaign coordination", category: "video production sponsorship workflow" },
  ],
  targetCustomers: ["consumer-brand marketing teams beginning creator sponsorships", "YouTube creator businesses building sponsor readiness"],
  customerNeeds: ["choose a credible creator direction", "coordinate video-production sponsorships without guesswork"],
  differentiators: ["creator-business and marketing-education specialization", "practical systems for remote-work and entrepreneurship teams"],
  pricePositioning: "unknown",
  purchaseFriction: "high",
  demonstrability: "mixed",
  trustRequirement: "high",
  repeatPurchasePotential: "high",
  riskTags: ["performance claims"],
  unknowns: ["client campaign budget", "available creator sample inventory", "tracking stack"],
  evidence: [
    { id: "web-1-1", sourceUrl: "https://neilfoxagency.com/", excerpt: "Neil Fox Agency connects brands with YouTube creators through focused sponsorship strategy and coordination.", kind: "website" },
    { id: "web-1-2", sourceUrl: "https://neilfoxagency.com/for-brands", excerpt: "Campaign support includes creator identification, outreach, negotiation, and coordination.", kind: "website" },
    { id: "web-2-1", sourceUrl: "https://neilfoxagency.com/about", excerpt: "The agency emphasizes clear expectations, credible partnerships, and practical operating systems.", kind: "website" },
    { id: "web-3-1", sourceUrl: "https://neilfoxagency.com/resources", excerpt: "Educational resources help creators and brands prepare before outreach begins.", kind: "website" },
  ],
};

export const sampleReport = assembleDeterministicReport(profile, { id: "sample-neil-fox-agency", slug: "sample-neil-fox-agency", now: new Date("2026-07-16T14:00:00.000Z") });
sampleReport.aiReview = { usedGpt56: false, model: "deterministic-fixture", promptVersion: "review-v1", qualityFlag: "deterministic-fallback" };
