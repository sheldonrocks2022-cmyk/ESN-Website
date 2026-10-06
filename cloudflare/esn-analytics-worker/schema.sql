CREATE TABLE IF NOT EXISTS analytics_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  occurred_at INTEGER NOT NULL,
  day TEXT NOT NULL,
  visitor_hash TEXT NOT NULL,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  path TEXT NOT NULL,
  referrer_host TEXT NOT NULL DEFAULT 'Direct',
  device TEXT NOT NULL DEFAULT 'unknown',
  browser TEXT NOT NULL DEFAULT 'Other',
  os TEXT NOT NULL DEFAULT 'Other',
  country TEXT NOT NULL DEFAULT '—',
  duration_ms INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS idx_analytics_time ON analytics_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_analytics_day ON analytics_events(day);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type,occurred_at);
CREATE INDEX IF NOT EXISTS idx_analytics_path ON analytics_events(path,occurred_at);
CREATE INDEX IF NOT EXISTS idx_analytics_visitor ON analytics_events(visitor_hash,occurred_at);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON analytics_events(session_id,occurred_at);

CREATE TABLE IF NOT EXISTS analytics_admin_sessions (
  token_hash TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics_login_attempts (
  ip_hash TEXT NOT NULL,
  attempted_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_analytics_login ON analytics_login_attempts(ip_hash,attempted_at);
