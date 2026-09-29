CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('subdomain','custom')),
  label TEXT NOT NULL,
  hostname TEXT NOT NULL UNIQUE,
  custom_domain TEXT UNIQUE,
  target_url TEXT NOT NULL,
  contact TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_review',
  monthly_cents INTEGER NOT NULL DEFAULT 0,
  worker_domain_id TEXT,
  custom_hostname_id TEXT,
  validation_json TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  activated_at INTEGER,
  expires_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservations_custom ON reservations(custom_domain);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS login_attempts (
  ip TEXT NOT NULL,
  attempted_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_login_attempts ON login_attempts(ip, attempted_at);
