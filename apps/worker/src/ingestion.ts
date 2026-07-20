import type { BrandProfile, EvidenceRef } from "@creator-compass/contracts";

const MAX_REDIRECTS = 3;
const MAX_PAGES = 5;
const MAX_BODY_BYTES = 750_000;
const MAX_TEXT_CHARS = 18_000;
const blockedHostPatterns = [
  /(^|\.)localhost$/i,
  /(^|\.)local$/i,
  /(^|\.)internal$/i,
  /(^|\.)home$/i,
  /(^|\.)lan$/i,
  /(^|\.)localhost\.localdomain$/i,
  /^metadata\.google\.internal$/i,
];

function isPrivateIpv4(hostname: string) {
  const parts = hostname.split(".");
  if (parts.length !== 4 || parts.some((part) => !/^\d+$/.test(part) || Number(part) > 255))
    return false;
  const [a = 0, b = 0] = parts.map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
}

function isBlockedIpv6(hostname: string) {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (!host.includes(":")) return false;
  return (
    host === "::" ||
    host === "::1" ||
    host.startsWith("fc") ||
    host.startsWith("fd") ||
    /^fe[89ab]/.test(host) ||
    host.startsWith("::ffff:127.") ||
    host.startsWith("::ffff:10.") ||
    host.startsWith("::ffff:192.168.")
  );
}

export function validatePublicUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error("Enter a valid public website URL.");
  }
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("Only http and https websites are supported.");
  if (url.username || url.password) throw new Error("Website URLs cannot contain credentials.");
  if (
    url.port &&
    !(
      (url.protocol === "http:" && url.port === "80") ||
      (url.protocol === "https:" && url.port === "443")
    )
  )
    throw new Error("Non-standard website ports are not supported.");
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (
    !host.includes(".") ||
    blockedHostPatterns.some((pattern) => pattern.test(host)) ||
    isPrivateIpv4(host) ||
    isBlockedIpv6(host)
  )
    throw new Error("That address is not a public website.");
  url.hash = "";
  url.hostname = host;
  if (
    (url.protocol === "https:" && url.port === "443") ||
    (url.protocol === "http:" && url.port === "80")
  )
    url.port = "";
  return url;
}

export async function readBoundedBody(response: Response, timeoutMs = 8_000) {
  const length = Number(response.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) throw new Error("The page is too large to analyze safely.");
  const reader = response.body?.getReader();
  if (!reader) return "";
  const chunks: Uint8Array[] = [];
  let total = 0;
  const deadline = Date.now() + timeoutMs;
  while (true) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      await reader.cancel().catch(() => undefined);
      throw new Error("The website response body timed out.");
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    const { done, value } = await Promise.race([
      reader.read(),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(
          () => reject(new Error("The website response body timed out.")),
          remaining,
        );
      }),
    ]).finally(() => {
      if (timer) clearTimeout(timer);
    });
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new Error("The page is too large to analyze safely.");
    }
    chunks.push(value);
  }
  const combined = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(combined);
}

async function safeFetch(start: URL): Promise<{ response: Response; url: URL; html: string }> {
  let current = start;
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    const response = await fetch(current, {
      redirect: "manual",
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent":
          "CreatorCompassBot/1.0 (+https://creatorcompass.neilfoxagency.com/methodology)",
      },
      signal: AbortSignal.timeout(8_000),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location || redirects === MAX_REDIRECTS)
        throw new Error("The site redirected too many times.");
      current = validatePublicUrl(new URL(location, current).toString());
      continue;
    }
    if (!response.ok) throw new Error(`The website returned ${response.status}.`);
    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml"))
      throw new Error("The website did not return an HTML page.");
    return { response, url: current, html: await readBoundedBody(response) };
  }
  throw new Error("The website could not be fetched safely.");
}

const decodeEntities = (text: string) =>
  text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)));

const clean = (text: string) =>
  decodeEntities(
    text
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );

export function extractPage(html: string, sourceUrl: string) {
  const withoutNoise = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<(footer|nav|aside)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--([\s\S]*?)-->/g, " ");
  const title = clean(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
  const description = clean(
    html
      .match(
        /<meta[^>]+(?:name=["']description["'][^>]+content=["']([^"']*)|content=["']([^"']*)["'][^>]+name=["']description["'])/i,
      )
      ?.slice(1)
      .find(Boolean) ?? "",
  );
  const blocks = [...withoutNoise.matchAll(/<(h1|h2|h3|p|li|summary)[^>]*>([\s\S]*?)<\/\1>/gi)]
    .map((match) => ({ tag: (match[1] ?? "").toLowerCase(), text: clean(match[2] ?? "") }))
    .filter(
      ({ tag, text }) =>
        (text.length >= 24 || (/^h[1-3]$/.test(tag) && text.length >= 3)) &&
        !/cookie|privacy preferences|all rights reserved/i.test(text),
    )
    .map(({ text }) => text);
  const prices = [...html.matchAll(/(?:\$|£|€)\s?\d+(?:[,.]\d{2})?/g)]
    .map((match) => match[0])
    .slice(0, 12);
  const links = [...html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)].map(
    (match) => ({ href: match[1] ?? "", label: clean(match[2] ?? "") }),
  );
  return {
    sourceUrl,
    title,
    description,
    text: [title, description, ...blocks].filter(Boolean).join("\n").slice(0, MAX_TEXT_CHARS),
    prices,
    links,
  };
}

function scoreLink(label: string, pathname: string) {
  const value = `${label} ${pathname}`.toLowerCase();
  const priorities = [
    [/about|story|mission/, 9],
    [/product|shop|collection|service|solution/, 8],
    [/pricing|plans?/, 8],
    [/faq|how.it.works|learn/, 7],
    [/contact|blog|press|legal|privacy|terms|account|cart/, -8],
  ] as const;
  return priorities.reduce(
    (total, [pattern, points]) => total + (pattern.test(value) ? points : 0),
    0,
  );
}

export async function ingestWebsite(rawUrl: string): Promise<{
  canonicalUrl: string;
  domain: string;
  evidence: EvidenceRef[];
  combinedText: string;
}> {
  const start = validatePublicUrl(rawUrl);
  const home = await safeFetch(start);
  const first = extractPage(home.html, home.url.toString());
  const candidates = first.links
    .flatMap((link) => {
      try {
        const url = validatePublicUrl(new URL(link.href, home.url).toString());
        if (url.hostname !== home.url.hostname) return [];
        return [{ url, score: scoreLink(link.label, url.pathname) }];
      } catch {
        return [];
      }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
  const unique = [...new Map(candidates.map((item) => [item.url.pathname, item])).values()].slice(
    0,
    MAX_PAGES - 1,
  );
  const pages = [first];
  for (const candidate of unique) {
    try {
      const page = await safeFetch(candidate.url);
      pages.push(extractPage(page.html, page.url.toString()));
    } catch {
      /* One blocked secondary page must not fail the whole analysis. */
    }
  }
  const evidence: EvidenceRef[] = [];
  for (const [pageIndex, page] of pages.entries()) {
    const excerpts = page.text
      .split("\n")
      .filter((line) => line.length >= 24)
      .slice(0, 5);
    for (const [excerptIndex, excerpt] of excerpts.entries())
      evidence.push({
        id: `web-${pageIndex + 1}-${excerptIndex + 1}`,
        sourceUrl: page.sourceUrl,
        excerpt: excerpt.slice(0, 500),
        kind: "website",
      });
  }
  if (evidence.length < 2)
    throw new Error("The website did not provide enough readable information.");
  return {
    canonicalUrl: home.url.toString(),
    domain: home.url.hostname.replace(/^www\./, ""),
    evidence: evidence.slice(0, 24),
    combinedText: pages
      .map((page) => page.text)
      .join("\n\n")
      .slice(0, 45_000),
  };
}

export function ingestUserText(text: string, domain = "user-provided.local") {
  const excerptChunks = Array.from({ length: Math.ceil(text.length / 300) }, (_, index) =>
    text.slice(index * 300, (index + 1) * 300),
  );
  const evidence: EvidenceRef[] = excerptChunks.slice(0, 8).map((excerpt, index) => ({
    id: `user-${index + 1}`,
    sourceUrl: `https://${domain}/provided-description`,
    excerpt: excerpt.trim(),
    kind: "user",
  }));
  return {
    canonicalUrl: `https://${domain}/provided-description`,
    domain,
    evidence,
    combinedText: text,
  };
}

export function deterministicProfile(
  domain: string,
  text: string,
  evidence: EvidenceRef[],
): BrandProfile {
  const title =
    text
      .split("\n")
      .find((line) => line.trim().length >= 3)
      ?.trim() ??
    domain.split(".")[0] ??
    "The brand";
  const lower = text
    .toLowerCase()
    .replace(
      /\b(?:do(?:es)?|did|is|are|was|were|has|have|had|can|could|will|would|should|must)\s+not\b[^.!?\n]*/g,
      " ",
    )
    .replace(/\b(?:no|without)\s+(?:claims?\s+(?:of|about)\s+)?[^.!?\n]*/g, " ");
  const brandName =
    title
      .match(/^(.{2,60}?)\s+(?:is|sells|offers|provides|helps|builds|creates)\b/i)?.[1]
      ?.trim() ?? title.replace(/\s*[|–—-].*$/, "").slice(0, 80);
  const categories = [
    "software",
    "marketing",
    "skincare",
    "food",
    "fitness",
    "education",
    "finance",
    "fashion",
    "creator",
    "service",
    "travel",
    "home",
  ];
  const category =
    categories.find((item) => new RegExp(`\\b${item}\\b`).test(lower)) ?? "consumer offering";
  const price = text.match(/(?:\$|£|€)\s?\d+(?:[,.]\d{2})?/)?.[0];
  const riskTags = [
    lower.match(/health|medical|supplement|wellness/) ? "medical claims" : "",
    lower.match(/finance|investment|credit/) ? "financial claims" : "",
  ].filter(Boolean);
  const software = /\b(software|saas|platform|api|app|open source|mcp|developer tool)\b/.test(
    lower,
  );
  const service = /\b(agency|consulting|service|contractor|installation|book a call)\b/.test(lower);
  const b2b = /\b(b2b|business|marketer|agency|developer|founder|team|professional|client)\b/.test(
    lower,
  );
  const buyerRoles = [
    /\bseo\b/.test(lower) ? "SEO professional" : "",
    /growth marketer|digital marketer|marketing professional/.test(lower) ? "growth marketer" : "",
    /agenc/.test(lower) ? "marketing agency" : "",
    /founder|saas/.test(lower) ? "SaaS founder" : "",
    /developer|mcp|api|codex|cursor/.test(lower) ? "developer" : "",
    /small business/.test(lower) ? "small-business owner" : "",
    /content creator/.test(lower) ? "content creator" : "",
    /creative marketer/.test(lower) ? "creative marketer" : "",
    /designer/.test(lower) ? "designer" : "",
    /e.?commerce team/.test(lower) ? "e-commerce team" : "",
    /homeowner/.test(lower) ? "homeowner" : "",
    /beauty consumer|beauty shopper|makeup/.test(lower) ? "beauty shopper" : "",
  ].filter(Boolean);
  const useCases = [
    /keyword research/.test(lower) ? "keyword research" : "",
    /backlink/.test(lower) ? "backlink analysis" : "",
    /rank tracking/.test(lower) ? "rank tracking" : "",
    /site audit/.test(lower) ? "site audits" : "",
    /self.host/.test(lower) ? "self-hosting" : "",
    /\bmcp\b|model context protocol/.test(lower) ? "MCP integration" : "",
    /ai agent/.test(lower) ? "AI agent integration" : "",
    /conversion|landing page/.test(lower) ? "conversion optimization" : "",
    /ai image|image generator/.test(lower) ? "AI image generation" : "",
    /ai video|video generator|text[- ]to[- ]video|image[- ]to[- ]video/.test(lower)
      ? "AI video generation"
      : "",
    /product photograph|product image/.test(lower) ? "product photography" : "",
    /creative production|visual content/.test(lower) ? "visual content production" : "",
    /video edit/.test(lower) ? "video editing" : "",
    /skincare|skin care|routine/.test(lower) ? "skincare routine" : "",
    /makeup|application technique/.test(lower) ? "makeup application" : "",
    /hvac installation|air.conditioning/.test(lower) ? "HVAC installation" : "",
    /home comfort|home.services|home repair/.test(lower) ? "home repair" : "",
    /local technician|local service/.test(lower) ? "find a local service" : "",
  ].filter(Boolean);
  const jobsToBeDone = [
    /keyword research/.test(lower) ? "research keyword opportunities" : "",
    /backlink/.test(lower) ? "analyze backlink profiles" : "",
    /rank tracking/.test(lower) ? "monitor search rankings" : "",
    /site audit/.test(lower) ? "audit website SEO" : "",
    /self.host/.test(lower) ? "self-host the software" : "",
    /\bmcp\b|ai agent/.test(lower) ? "connect AI agents to SEO data" : "",
    /ai image|image generator/.test(lower) ? "create AI images" : "",
    /ai video|video generator|text[- ]to[- ]video|image[- ]to[- ]video/.test(lower)
      ? "generate AI videos"
      : "",
    /product photograph|product image/.test(lower) ? "produce product visuals" : "",
    /creative production|visual content/.test(lower) ? "speed up creative production" : "",
    /skincare|skin care/.test(lower) ? "choose a skincare routine" : "",
    /makeup|shade|texture/.test(lower) ? "choose beauty products" : "",
    /repair|replacement option/.test(lower) ? "repair a home system" : "",
    /local technician|local service/.test(lower) ? "find a trusted local provider" : "",
  ].filter(Boolean);
  return {
    canonicalDomain: domain,
    brandName,
    summary: evidence
      .slice(0, 2)
      .map((item) => item.excerpt)
      .join(" ")
      .slice(0, 360),
    products: [{ name: brandName, category, ...(price ? { priceText: price } : {}) }],
    targetCustomers: [
      category === "service"
        ? "business decision-makers"
        : "people seeking a practical improvement",
    ],
    customerNeeds: ["make a more confident choice"],
    businessModel: /open source/.test(lower)
      ? "open-source"
      : software
        ? "saas"
        : service
          ? "service"
          : /subscription|monthly/.test(lower)
            ? "subscription"
            : "unknown",
    productType: software ? "software" : service ? "service" : "physical-product",
    audienceType: b2b ? "b2b" : "b2c",
    buyerRoles: buyerRoles.length ? buyerRoles : b2b ? ["business decision-maker"] : [],
    userRoles: buyerRoles,
    industries: [
      /\bseo\b|marketing/.test(lower) ? "marketing" : "",
      software ? "software" : "",
      /e.?commerce/.test(lower) ? "e-commerce" : "",
      /skincare|makeup|beauty|fragrance/.test(lower) ? "beauty" : "",
      /hvac|air.conditioning|plumbing|electrical/.test(lower) ? "residential services" : "",
      /local technician|local service/.test(lower) ? "local services" : "",
    ].filter(Boolean),
    useCases,
    jobsToBeDone: jobsToBeDone.length ? jobsToBeDone : ["evaluate the offer"],
    buyerGoalVerbPhrases: jobsToBeDone.length ? jobsToBeDone : ["evaluate the offer"],
    problemStatements: [],
    technicalLevel: /developer|api|mcp|self.host|open source/.test(lower) ? "technical" : "mixed",
    purchaseMotion: software ? "product-led" : service ? "consultative" : "retail",
    campaignAssetType: software
      ? "software-access"
      : service
        ? "service-experience"
        : "physical-sample",
    differentiators: evidence.slice(1, 3).map((item) => item.excerpt.slice(0, 100)),
    pricePositioning: price ? "mid-market" : "unknown",
    purchaseFriction:
      lower.includes("book a call") || lower.includes("request a quote")
        ? "high"
        : lower.includes("buy now") || lower.includes("add to cart")
          ? "low"
          : "unknown",
    demonstrability:
      /demo|before|after|how it works|tutorial|(?:create|generate|edit|produce) (?:ai )?(?:images?|videos?|photos?|visuals?)/.test(
        lower,
      )
        ? "strong"
        : "mixed",
    trustRequirement: riskTags.length ? "high" : "medium",
    repeatPurchasePotential: lower.match(/subscription|monthly|refill|membership/)
      ? "high"
      : "unknown",
    riskTags,
    unknowns: [
      "creator sampling capacity",
      "campaign tracking readiness",
      "approved sponsorship claims",
    ],
    evidence,
  };
}
