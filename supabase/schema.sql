-- =========================================================
-- APULAB STATION: Supabase Postgres Research Telemetry Schema
-- =========================================================

-- 1. Anonymous Sessions Table
CREATE TABLE IF NOT EXISTS apulab_sessions (
  session_id UUID PRIMARY KEY,
  participant_code VARCHAR(32) NOT NULL,
  build_version VARCHAR(32) NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  finished_at TIMESTAMPTZ,
  status VARCHAR(32) NOT NULL DEFAULT 'in_progress',
  screen_width INT NOT NULL,
  screen_height INT NOT NULL,
  user_agent TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for session queries
CREATE INDEX IF NOT EXISTS idx_apulab_sessions_participant ON apulab_sessions(participant_code);

-- 2. Telemetry Events Table
CREATE TABLE IF NOT EXISTS apulab_events (
  event_id UUID PRIMARY KEY,
  session_id UUID REFERENCES apulab_sessions(session_id) ON DELETE CASCADE,
  participant_code VARCHAR(32) NOT NULL,
  build_version VARCHAR(32) NOT NULL,
  scene_id VARCHAR(64) NOT NULL,
  challenge_id VARCHAR(64),
  event_type VARCHAR(64) NOT NULL,
  attempt_number INT,
  payload JSONB DEFAULT '{}'::jsonb,
  result VARCHAR(32),
  error_code VARCHAR(64),
  hint_used BOOLEAN DEFAULT FALSE,
  duration_seconds INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance telemetry analytics
CREATE INDEX IF NOT EXISTS idx_apulab_events_session ON apulab_events(session_id);
CREATE INDEX IF NOT EXISTS idx_apulab_events_type ON apulab_events(event_type);
CREATE INDEX IF NOT EXISTS idx_apulab_events_challenge ON apulab_events(challenge_id);
