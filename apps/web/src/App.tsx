import { useEffect, useMemo, useState, type FormEvent } from "react";
import type {
  AnalysisJob,
  CreatorCompassReport,
  TerritoryRecommendation,
} from "@creator-compass/contracts";
import { sampleReport } from "./sample";

const stageLabels: Record<string, string> = {
  queued: "Preparing your analysis",
  "reading-brand": "Reading the brand",
  "understanding-customer": "Understanding the customer",
  "checking-readiness": "Checking sponsorship readiness",
  "charting-territories": "Charting creator territories",
  "reviewing-routes": "Reviewing the strongest routes",
  "preparing-report": "Preparing the compass report",
  complete: "Your direction is ready",
};
const stageOrder = Object.keys(stageLabels);

function Logo() {
  return (
    <a className="logo" href="/" aria-label="CreatorCompass home">
      <img src="/brand/neil-fox-logo.webp" alt="" />
      <span>
        <b>Creator</b>Compass
      </span>
    </a>
  );
}

function Header() {
  return (
    <header className="site-header">
      <Logo />
      <nav aria-label="Primary navigation">
        <a href="/#methodology">Methodology</a>
        <a href="/reports/sample-neil-fox-agency">Sample report</a>
        <a
          className="agency-link"
          href="https://neilfoxagency.com/"
          target="_blank"
          rel="noreferrer"
        >
          Neil Fox Agency
        </a>
      </nav>
    </header>
  );
}

function Footer() {
  return (
    <footer>
      <Logo />
      <p>A transparent first step into creator sponsorships.</p>
      <div>
        <a href="https://neilfoxagency.com/privacy">Privacy</a>
        <a href="https://neilfoxagency.com/terms">Terms</a>
        <span>© 2026 Neil Fox Agency</span>
      </div>
    </footer>
  );
}

export function App() {
  const path = window.location.pathname;
  if (path.startsWith("/reports/"))
    return <ReportPage slug={decodeURIComponent(path.split("/")[2] ?? "")} />;
  if (path.startsWith("/analysis/"))
    return <ProgressPage id={decodeURIComponent(path.split("/")[2] ?? "")} />;
  return <LandingPage />;
}

function LandingPage() {
  const [url, setUrl] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [goal, setGoal] = useState("");
  const [market, setMarket] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/analyses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url, goal: goal || undefined, market: market || undefined }),
      });
      const body = (await response.json()) as {
        analysisId?: string;
        reportSlug?: string;
        error?: { message?: string };
      };
      if (!response.ok) throw new Error(body.error?.message ?? "The analysis could not start.");
      if (body.reportSlug) window.location.assign(`/reports/${body.reportSlug}`);
      else if (body.analysisId) window.location.assign(`/analysis/${body.analysisId}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The analysis could not start.");
      setBusy(false);
    }
  }

  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="eyebrow">
            <span /> Creator direction, before creator selection
          </div>
          <h1>
            Discover where your brand belongs in the <em>creator economy.</em>
          </h1>
          <p className="hero-copy">
            Enter your website. Get a creator territory map, sponsorship readiness gaps, campaign
            directions, and one decisive first route—with the evidence behind it.
          </p>
          <form className="url-form" onSubmit={submit}>
            <label htmlFor="brand-url">Your brand website</label>
            <div className="url-row">
              <span aria-hidden="true">↗</span>
              <input
                id="brand-url"
                type="url"
                required
                placeholder="https://yourbrand.com"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
              />
              <button disabled={busy}>
                {busy ? "Setting course…" : "Find my direction"}
                <b>→</b>
              </button>
            </div>
            <button
              className="advanced-toggle"
              type="button"
              onClick={() => setAdvanced(!advanced)}
              aria-expanded={advanced}
            >
              {advanced ? "− Hide" : "+ Add"} optional context
            </button>
            {advanced && (
              <div className="advanced-fields">
                <label>
                  Campaign goal
                  <input
                    value={goal}
                    onChange={(event) => setGoal(event.target.value)}
                    placeholder="e.g. Build awareness with a test campaign"
                  />
                </label>
                <label>
                  Primary market
                  <input
                    value={market}
                    onChange={(event) => setMarket(event.target.value)}
                    placeholder="e.g. United States"
                  />
                </label>
              </div>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="form-note">
              <span>No account required</span>
              <span>Up to 5 public pages reviewed</span>
              <span>Evidence, not guesswork</span>
            </div>
          </form>
          <a className="sample-link" href="/reports/sample-neil-fox-agency">
            <span className="mini-compass">✦</span>
            <span>
              <small>See a finished compass</small>
              <b>Open the sample report</b>
            </span>
            <i>↗</i>
          </a>
        </section>
        <section className="report-preview" aria-label="Report preview">
          <div className="preview-copy">
            <span className="section-number">01 — THE DELIVERABLE</span>
            <h2>
              Not a list of names.
              <br />A direction you can defend.
            </h2>
            <p>
              CreatorCompass works upstream of creator databases. It identifies the communities,
              content formats, and test shape that make sense before you spend time on a shortlist.
            </p>
          </div>
          <CompassPreview />
        </section>
        <section className="included">
          <span className="section-number">WHAT YOUR REPORT INCLUDES</span>
          <div className="feature-grid">
            <Feature
              number="01"
              title="Brand snapshot"
              text="What you sell, who appears to need it, and which important facts remain unknown."
            />
            <Feature
              number="02"
              title="Readiness review"
              text="Ten inspectable dimensions with evidence, confidence, and a practical improvement."
            />
            <Feature
              number="03"
              title="Territory map"
              text="Three Core, two Adjacent, one Experimental, and two directions to avoid."
            />
            <Feature
              number="04"
              title="North Star route"
              text="The territory, format, creator size, test shape, and fix-first list we would begin with."
            />
          </div>
        </section>
        <section className="photo-story" aria-label="Creator campaign planning">
          <figure className="photo-wide">
            <img
              src="/stock/campaign-planning-1280.webp"
              alt="Marketing team reviewing a creator campaign plan together"
              loading="lazy"
            />
            <figcaption>From strategic direction to a campaign your team can brief.</figcaption>
          </figure>
          <div>
            <span className="section-number">BUILT FOR HUMAN DECISIONS</span>
            <h2>
              Strategy that works
              <br />
              beyond the screen.
            </h2>
            <p>
              The report is designed to help a real team choose a credible audience, shape
              creator-ready ideas, and know what must be fixed before outreach.
            </p>
            <figure className="photo-portrait">
              <img
                src="/stock/creator-studio-900.webp"
                alt="Creator recording content in a home studio"
                loading="lazy"
              />
            </figure>
          </div>
        </section>
        <section className="methodology" id="methodology">
          <div>
            <span className="section-number">02 — HOW IT DECIDES</span>
            <h2>
              AI judgment,
              <br />
              <em>with guardrails.</em>
            </h2>
          </div>
          <div className="method-list">
            <Method
              n="1"
              title="Evidence extraction"
              text="CreatorCompass reads a bounded set of public pages and stores short, attributable excerpts—not a copy of your website."
            />
            <Method
              n="2"
              title="Deterministic scoring"
              text="Ordinary code scores readiness and territory fit with published weights. Models do not secretly invent a score."
            />
            <Method
              n="3"
              title="Bounded strategic review"
              text="GPT-5.6 reviews a fixed candidate set, rejects weak routes, and chooses the North Star from structured evidence."
            />
            <Method
              n="4"
              title="Visible uncertainty"
              text="Facts, inference, assumptions, and unknowns remain distinct. Missing evidence is shown rather than filled in."
            />
          </div>
        </section>
        <section className="cta">
          <span className="section-number">READY TO FIND YOUR ROUTE?</span>
          <h2>
            One website.
            <br />A clearer starting point.
          </h2>
          <a
            href="#top"
            onClick={(event) => {
              event.preventDefault();
              document.getElementById("brand-url")?.focus();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Analyze your brand <b>→</b>
          </a>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Feature({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <article className="feature">
      <span>{number}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}
function Method({ n, title, text }: { n: string; title: string; text: string }) {
  return (
    <article>
      <span>{n}</span>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </article>
  );
}

function CompassPreview() {
  const dots = [
    { n: "Productivity", c: "core", x: 51, y: 11 },
    { n: "Remote work", c: "core", x: 79, y: 31 },
    { n: "Creator business", c: "core", x: 74, y: 72 },
    { n: "Education", c: "adjacent", x: 20, y: 29 },
    { n: "Entrepreneurship", c: "adjacent", x: 18, y: 70 },
    { n: "Local discovery", c: "experimental", x: 48, y: 89 },
  ];
  return (
    <div className="compass-card">
      <div className="compass-card-heading">
        <span>Illustrative territory map</span>
        <b>Evidence-backed routes</b>
      </div>
      <div className="compass-preview">
        <div className="rings">
          <i />
          <i />
          <i />
        </div>
        <div className="north-label">N</div>
        <div className="needle">
          <span />
        </div>
        {dots.map((dot) => (
          <div
            className={`map-dot ${dot.c} ${dot.x < 45 ? "label-left" : "label-right"}`}
            key={dot.n}
            style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
          >
            <i />
            <span>{dot.n}</span>
          </div>
        ))}
      </div>
      <div className="map-legend">
        <span>
          <i className="core" /> Core
        </span>
        <span>
          <i className="adjacent" /> Adjacent
        </span>
        <span>
          <i className="experimental" /> Experimental
        </span>
      </div>
    </div>
  );
}

function ProgressPage({ id }: { id: string }) {
  const [job, setJob] = useState<AnalysisJob | null>(null);
  const [text, setText] = useState("");
  const [submitError, setSubmitError] = useState("");
  useEffect(() => {
    let active = true;
    async function poll() {
      try {
        const response = await fetch(`/api/analyses/${id}`);
        if (!response.ok) throw new Error("This analysis could not be found.");
        const next = (await response.json()) as AnalysisJob;
        if (!active) return;
        setJob(next);
        if (next.status === "complete" && next.reportSlug)
          window.location.replace(`/reports/${next.reportSlug}`);
        else if (["queued", "running"].includes(next.status)) window.setTimeout(poll, 2000);
      } catch (error) {
        if (active)
          setSubmitError(error instanceof Error ? error.message : "Progress is unavailable.");
      }
    }
    poll();
    return () => {
      active = false;
    };
  }, [id]);
  const currentIndex = stageOrder.indexOf(job?.stage ?? "queued");
  async function continueWithText(event: FormEvent) {
    event.preventDefault();
    setSubmitError("");
    const response = await fetch("/api/analyses", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userProvidedText: text }),
    });
    const body = (await response.json()) as { analysisId?: string; error?: { message?: string } };
    if (!response.ok || !body.analysisId) {
      setSubmitError(body.error?.message ?? "The description could not be submitted.");
      return;
    }
    window.location.assign(`/analysis/${body.analysisId}`);
  }
  return (
    <>
      <Header />
      <main className="progress-page">
        <div className="progress-orbit">
          <div className="progress-needle" />
          <span>✦</span>
        </div>
        <span className="section-number">CREATORCOMPASS ANALYSIS</span>
        <h1>{stageLabels[job?.stage ?? "queued"] ?? "Preparing the report"}</h1>
        <p>We show completed stages and the current task—never a made-up percentage.</p>
        <ol>
          {stageOrder.slice(1, -1).map((stage, index) => (
            <li
              className={
                index < currentIndex - 1 ? "done" : index === currentIndex - 1 ? "active" : ""
              }
              key={stage}
            >
              <i>{index < currentIndex - 1 ? "✓" : index + 1}</i>
              <span>{stageLabels[stage]}</span>
            </li>
          ))}
        </ol>
        {job?.status === "needs-input" && (
          <form className="paste-fallback" onSubmit={continueWithText}>
            <h2>The site did not give us enough to read.</h2>
            <p>{job.error?.message}</p>
            <label>
              Paste a product description or company summary
              <textarea
                required
                minLength={80}
                maxLength={12000}
                value={text}
                onChange={(event) => setText(event.target.value)}
              />
            </label>
            <button>Continue from this description →</button>
          </form>
        )}
        {job?.status === "failed" && (
          <div className="status-error">
            <h2>The analysis stopped safely.</h2>
            <p>{job.error?.message}</p>
            <a href="/">Try another analysis</a>
          </div>
        )}
        {submitError && (
          <p className="form-error" role="alert">
            {submitError}
          </p>
        )}
      </main>
      <Footer />
    </>
  );
}

function ReportPage({ slug }: { slug: string }) {
  const [report, setReport] = useState<CreatorCompassReport | null>(
    slug === "sample-neil-fox-agency" ? sampleReport : null,
  );
  const [error, setError] = useState("");
  useEffect(() => {
    if (slug === "sample-neil-fox-agency") return;
    fetch(`/api/reports/${slug}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("This report is not available.");
        return response.json();
      })
      .then((data) => setReport(data as CreatorCompassReport))
      .catch((reason) =>
        setError(reason instanceof Error ? reason.message : "Report unavailable."),
      );
  }, [slug]);
  if (error)
    return (
      <>
        <Header />
        <main className="status-error">
          <h1>Report unavailable</h1>
          <p>{error}</p>
          <a href="/">Start a new analysis</a>
        </main>
        <Footer />
      </>
    );
  if (!report)
    return (
      <>
        <Header />
        <main className="loading-report">Loading the compass…</main>
      </>
    );
  return <Report report={report} />;
}

function Report({ report }: { report: CreatorCompassReport }) {
  const initialTerritory =
    (report.northStar
      ? report.territories.find((item) => item.territoryId === report.northStar?.territoryId)
      : undefined) ?? report.territories[0]!;
  const [active, setActive] = useState(initialTerritory.territoryId);
  const activeTerritory =
    report.territories.find((item) => item.territoryId === active) ?? initialTerritory;
  const generated = new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
    new Date(report.createdAt),
  );
  async function share() {
    if (navigator.share)
      await navigator.share({
        title: `${report.brandProfile.brandName} Creator Compass`,
        url: location.href,
      });
    else await navigator.clipboard.writeText(location.href);
  }
  return (
    <>
      <Header />
      <main className="report-page">
        <section className="report-header">
          <div>
            <span className="section-number">
              CREATOR COMPASS REPORT · {generated.toUpperCase()}
            </span>
            <h1>{report.brandProfile.brandName}</h1>
            <p>{report.brandProfile.summary}</p>
          </div>
          <div className="report-actions">
            <button onClick={share}>Share report ↗</button>
            <button onClick={() => print()}>Print ↓</button>
          </div>
        </section>
        {report.northStar ? (
          <section className="north-star">
            <div className="north-symbol">
              <i>✦</i>
              <span>
                NORTH
                <br />
                STAR
              </span>
            </div>
            <div>
              <span className="section-number">RECOMMENDED FIRST ROUTE</span>
              <h2>{initialTerritory.name}</h2>
              <p>{report.northStar.why}</p>
              <dl>
                <div>
                  <dt>Campaign format</dt>
                  <dd>{report.northStar.format}</dd>
                </div>
                <div>
                  <dt>Creator direction</dt>
                  <dd>{report.northStar.creatorDirection}</dd>
                </div>
                <div>
                  <dt>Initial test</dt>
                  <dd>{report.northStar.testShape}</dd>
                </div>
              </dl>
            </div>
          </section>
        ) : (
          <PreliminaryPanel report={report} />
        )}
        <section className="territory-section">
          <div className="section-heading">
            <span className="section-number">
              01 —{" "}
              {report.recommendationState === "preliminary-hypotheses"
                ? "PRELIMINARY TERRITORY HYPOTHESES"
                : "CREATOR TERRITORY MAP"}
            </span>
            <h2>
              {report.recommendationState === "preliminary-hypotheses" ? (
                <>
                  What may fit,
                  <br />
                  <em>pending evidence.</em>
                </>
              ) : (
                <>
                  Where the brand
                  <br />
                  <em>naturally belongs.</em>
                </>
              )}
            </h2>
            <p>
              {report.recommendationState === "preliminary-hypotheses"
                ? "These are prompts for investigation, not confident recommendations. Add the missing context above before selecting a route."
                : "Select a point to inspect the route. Every territory is also available in the accessible card list below."}
            </p>
          </div>
          <TerritoryCompass territories={report.territories} active={active} onSelect={setActive} />
          <TerritoryDetail territory={activeTerritory} />
        </section>
        <section className="territory-cards" aria-label="All creator territories">
          {(["core", "adjacent", "experimental", "risk"] as const).map((classification) => (
            <div key={classification}>
              <h3>
                {classification === "risk"
                  ? "Risk zones"
                  : `${classification[0]!.toUpperCase()}${classification.slice(1)} territories`}
              </h3>
              {report.territories
                .filter((item) => item.classification === classification)
                .map((item) => (
                  <button
                    key={item.territoryId}
                    onClick={() => {
                      setActive(item.territoryId);
                      document
                        .querySelector(".territory-section")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <span>{item.name}</span>
                    <small>
                      {item.score}/100 · {item.confidence} confidence
                    </small>
                    <i>→</i>
                  </button>
                ))}
            </div>
          ))}
        </section>
        <section className="readiness">
          <div className="readiness-summary">
            <span className="section-number">02 — SPONSORSHIP READINESS</span>
            <h2>
              {report.readinessSummary.score ?? "—"}
              {report.readinessSummary.score != null && <small>/100</small>}
            </h2>
            <b>{report.readinessSummary.status.replace("-", " ")}</b>
            <p>{report.readinessSummary.summary}</p>
          </div>
          <div className="readiness-list">
            {report.readiness.map((item) => (
              <details key={item.key}>
                <summary>
                  <span className={`status-dot ${item.status}`} />
                  <b>{item.label}</b>
                  <em>{item.status}</em>
                  <i>+</i>
                </summary>
                <div>
                  <p>{item.rationale}</p>
                  <strong>Practical improvement</strong>
                  <p>{item.improvement}</p>
                  <small>
                    Confidence: {item.confidence} · Evidence:{" "}
                    {item.evidenceIds.length ? item.evidenceIds.join(", ") : "not established"}
                  </small>
                </div>
              </details>
            ))}
          </div>
        </section>
        <section className="route">
          <span className="section-number">03 — YOUR NEXT ROUTE</span>
          <h2>
            Five moves for
            <br />
            <em>this week.</em>
          </h2>
          <ol>
            {report.nextSteps.map((step, index) => (
              <li key={step}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="transparency">
          <div>
            <span className="section-number">HOW CREATORCOMPASS DECIDED</span>
            <h2>
              Evidence in.
              <br />
              Direction out.
            </h2>
            <p>
              We show concise evidence and rationale—not hidden chain-of-thought. Website facts,
              model inference, assumptions, and unknowns stay visibly distinct.
            </p>
            <p className="model-note">
              Final review: <b>{report.aiReview.usedGpt56 ? "GPT-5.6" : "resilient fallback"}</b> ·
              Methodology {report.methodologyVersion}
            </p>
          </div>
          <details className="evidence-drawer">
            <summary>
              Open evidence & assumptions <span>+</span>
            </summary>
            <div>
              <h3>Evidence excerpts</h3>
              {report.brandProfile.evidence.map((evidence) => (
                <blockquote key={evidence.id}>
                  <small>
                    {evidence.id} · {evidence.kind}
                  </small>
                  <p>“{evidence.excerpt}”</p>
                  <a href={evidence.sourceUrl} target="_blank" rel="noreferrer">
                    Source ↗
                  </a>
                </blockquote>
              ))}
              <h3>Important assumptions and unknowns</h3>
              <ul>
                {report.assumptions.map((assumption) => (
                  <li key={assumption}>{assumption}</li>
                ))}
              </ul>
            </div>
          </details>
        </section>
        <AgencyCta report={report} />
      </main>
      <Footer />
    </>
  );
}

function PreliminaryPanel({ report }: { report: CreatorCompassReport }) {
  const [context, setContext] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/analyses", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ userProvidedText: context, refresh: true }),
    });
    const body = (await response.json()) as { analysisId?: string; error?: { message?: string } };
    if (!response.ok || !body.analysisId) {
      setError(body.error?.message ?? "The context could not be submitted.");
      setBusy(false);
      return;
    }
    window.location.assign(`/analysis/${body.analysisId}`);
  }
  return (
    <section className="preliminary-panel">
      <div>
        <span className="section-number">PRELIMINARY HYPOTHESES · MORE EVIDENCE NEEDED</span>
        <h2>No North Star yet.</h2>
        <p>
          CreatorCompass is abstaining because the available evidence cannot support a confident
          recommendation or numerical readiness score.
        </p>
        <ol>
          {report.clarifyingQuestions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ol>
      </div>
      <form onSubmit={submit}>
        <label>
          Paste the missing brand context
          <textarea
            required
            minLength={80}
            maxLength={12000}
            value={context}
            onChange={(event) => setContext(event.target.value)}
            placeholder="Answer the questions in one focused brand description…"
          />
        </label>
        <button disabled={busy}>
          {busy ? "Rechecking evidence…" : "Continue with this context →"}
        </button>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>
    </section>
  );
}

function TerritoryCompass({
  territories,
  active,
  onSelect,
}: {
  territories: TerritoryRecommendation[];
  active: string;
  onSelect: (id: string) => void;
}) {
  const positions = useMemo(
    () =>
      territories.map((item, index) => {
        const angle = ((-90 + index * 45) * Math.PI) / 180;
        const radius =
          item.classification === "core" ? 31 : item.classification === "adjacent" ? 38 : 44;
        return { ...item, x: 50 + Math.cos(angle) * radius, y: 50 + Math.sin(angle) * radius };
      }),
    [territories],
  );
  return (
    <div className="territory-compass" role="group" aria-label="Interactive creator territory map">
      <div className="rings">
        <i />
        <i />
        <i />
      </div>
      <div className="axis axis-x" />
      <div className="axis axis-y" />
      <span className="north">N</span>
      <span className="center-star">✦</span>
      {positions.map((item) => (
        <button
          aria-pressed={active === item.territoryId}
          className={`territory-node ${item.classification} ${active === item.territoryId ? "active" : ""}`}
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
          key={item.territoryId}
          onClick={() => onSelect(item.territoryId)}
        >
          <i />
          <span>{item.name}</span>
        </button>
      ))}
    </div>
  );
}

function TerritoryDetail({ territory }: { territory: TerritoryRecommendation }) {
  return (
    <article className={`territory-detail ${territory.classification}`}>
      <div className="territory-meta">
        <span>{territory.classification}</span>
        <b>
          {territory.score}
          <small>/100</small>
        </b>
      </div>
      <h3>{territory.name}</h3>
      <p className="territory-rationale">{territory.rationale}</p>
      <div className="detail-grid">
        <div>
          <small>Audience connection</small>
          <p>{territory.audienceConnection}</p>
        </div>
        <div>
          <small>Creator profile</small>
          <p>{territory.creatorProfile}</p>
        </div>
        <div>
          <small>Best formats</small>
          <p>{territory.sponsorshipFormats.join(" · ")}</p>
        </div>
        <div>
          <small>Key risk</small>
          <p>{territory.keyRisk}</p>
        </div>
      </div>
      <h4>Campaign directions</h4>
      <div className="concepts">
        {territory.campaignConcepts.map((concept) => (
          <div key={concept.title}>
            <b>{concept.title}</b>
            <p>{concept.concept}</p>
            <q>{concept.openingHook}</q>
          </div>
        ))}
      </div>
      <details>
        <summary>Creator search phrases</summary>
        <ul>
          {territory.searchQueries.map((query) => (
            <li key={query}>{query}</li>
          ))}
        </ul>
      </details>
    </article>
  );
}

function AgencyCta({ report }: { report: CreatorCompassReport }) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        reportId: report.id,
        email: data.get("email"),
        company: data.get("company") || undefined,
        message: data.get("message") || undefined,
        consent: data.get("consent") === "on",
        website: data.get("website") || undefined,
      }),
    });
    if (response.ok) setSent(true);
    else setError("Please check the form and try again.");
  }
  return (
    <section className="agency-cta">
      <div>
        <span className="section-number">THE DIRECTION IS ONLY THE START</span>
        <h2>
          Ready to travel
          <br />
          the route?
        </h2>
        <p>
          CreatorCompass has shown the direction. Neil Fox Agency can identify, vet, contact,
          negotiate with, and coordinate creators inside these territories.
        </p>
      </div>
      {!open ? (
        <button onClick={() => setOpen(true)}>
          Talk through this report <b>→</b>
        </button>
      ) : sent ? (
        <div className="lead-success">
          <b>Thank you.</b>
          <p>Neil Fox Agency will follow up about your report.</p>
        </div>
      ) : (
        <form onSubmit={submit}>
          <input name="website" tabIndex={-1} autoComplete="off" className="honeypot" />
          <label>
            Work email
            <input required type="email" name="email" />
          </label>
          <label>
            Company
            <input name="company" />
          </label>
          <label>
            What would you like help with?
            <textarea name="message" />
          </label>
          <label className="consent">
            <input required type="checkbox" name="consent" /> I agree that Neil Fox Agency may
            contact me about this report.
          </label>
          <button>
            Send my report <b>→</b>
          </button>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
