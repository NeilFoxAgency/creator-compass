PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS analysis_jobs (
  id TEXT PRIMARY KEY,
  fingerprint TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued','running','complete','failed','needs-input')),
  stage TEXT NOT NULL,
  normalized_url TEXT NOT NULL,
  input_json TEXT NOT NULL,
  report_slug TEXT,
  error_code TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_jobs_fingerprint ON analysis_jobs(fingerprint);
CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_fingerprint_active ON analysis_jobs(fingerprint)
WHERE status IN ('queued', 'running');

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  fingerprint TEXT NOT NULL,
  domain TEXT NOT NULL,
  report_json TEXT NOT NULL,
  methodology_version TEXT NOT NULL,
  used_gpt56 INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_fingerprint ON reports(fingerprint);
CREATE INDEX IF NOT EXISTS idx_reports_domain ON reports(domain);

CREATE TABLE IF NOT EXISTS provider_usage (
  day TEXT NOT NULL,
  provider TEXT NOT NULL,
  task TEXT NOT NULL,
  calls INTEGER NOT NULL DEFAULT 0,
  failures INTEGER NOT NULL DEFAULT 0,
  input_units INTEGER NOT NULL DEFAULT 0,
  output_units INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, provider, task)
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  message TEXT,
  consent INTEGER NOT NULL CHECK (consent IN (0, 1)),
  created_at TEXT NOT NULL,
  FOREIGN KEY (report_id) REFERENCES reports(id)
);

CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT NOT NULL,
  window_start TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (key, window_start)
);

CREATE TABLE IF NOT EXISTS system_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  code TEXT,
  duration_ms INTEGER,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_type_created ON system_events(type, created_at);

