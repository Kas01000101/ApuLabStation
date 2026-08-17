-- =========================================================
-- APULAB STATION: Supabase Postgres Research Telemetry Schema
-- Sprint 0 schema supports both STUDY and DEMO sessions.
-- =========================================================

DO $$ BEGIN
  CREATE TYPE apulab_session_mode AS ENUM ('study', 'demo');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 1. Anonymous Sessions Table
CREATE TABLE IF NOT EXISTS apulab_sessions (
  session_id TEXT PRIMARY KEY,
  participant_code VARCHAR(32),
  session_mode apulab_session_mode NOT NULL DEFAULT 'demo',
  build_version VARCHAR(32) NOT NULL,
  schema_version VARCHAR(32) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  status VARCHAR(32) NOT NULL DEFAULT 'in_progress',
  screen_width INT NOT NULL,
  screen_height INT NOT NULL,
  user_agent TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE apulab_sessions
  ALTER COLUMN participant_code DROP NOT NULL;

ALTER TABLE apulab_sessions
  ADD COLUMN IF NOT EXISTS session_mode apulab_session_mode NOT NULL DEFAULT 'demo',
  ADD COLUMN IF NOT EXISTS schema_version VARCHAR(32) NOT NULL DEFAULT '2026-08-sprint0',
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

DO $$ BEGIN
  ALTER TABLE apulab_sessions
    ADD CONSTRAINT apulab_study_requires_code
    CHECK (session_mode = 'demo' OR participant_code IS NOT NULL) NOT VALID;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Index for session queries
CREATE INDEX IF NOT EXISTS idx_apulab_sessions_participant ON apulab_sessions(participant_code);
CREATE INDEX IF NOT EXISTS idx_apulab_sessions_mode ON apulab_sessions(session_mode);

-- 2. Telemetry Events Table
CREATE TABLE IF NOT EXISTS apulab_events (
  event_id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES apulab_sessions(session_id) ON DELETE CASCADE,
  participant_code VARCHAR(32),
  session_mode apulab_session_mode NOT NULL DEFAULT 'demo',
  build_version VARCHAR(32) NOT NULL,
  schema_version VARCHAR(32) NOT NULL,
  scene_id VARCHAR(64) NOT NULL,
  challenge_id VARCHAR(64),
  event_type VARCHAR(64) NOT NULL,
  attempt_number INT,
  payload JSONB DEFAULT '{}'::jsonb,
  result VARCHAR(32),
  error_code VARCHAR(64),
  hint_used BOOLEAN DEFAULT FALSE,
  duration_seconds INT,
  timestamp TIMESTAMPTZ NOT NULL,
  sync_status VARCHAR(32) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE apulab_events
  ALTER COLUMN participant_code DROP NOT NULL;

ALTER TABLE apulab_events
  ADD COLUMN IF NOT EXISTS session_mode apulab_session_mode NOT NULL DEFAULT 'demo',
  ADD COLUMN IF NOT EXISTS schema_version VARCHAR(32) NOT NULL DEFAULT '2026-08-sprint0',
  ADD COLUMN IF NOT EXISTS timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS sync_status VARCHAR(32) NOT NULL DEFAULT 'pending';

-- Indexes for performance telemetry analytics
CREATE INDEX IF NOT EXISTS idx_apulab_events_session ON apulab_events(session_id);
CREATE INDEX IF NOT EXISTS idx_apulab_events_type ON apulab_events(event_type);
CREATE INDEX IF NOT EXISTS idx_apulab_events_challenge ON apulab_events(challenge_id);
CREATE INDEX IF NOT EXISTS idx_apulab_events_mode ON apulab_events(session_mode);
