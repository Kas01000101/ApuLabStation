-- Sprint 0 research telemetry hardening.
-- Safe to run on an existing database; it adds nullable/demo support without deleting rows.

DO $$ BEGIN
  CREATE TYPE apulab_session_mode AS ENUM ('study', 'demo');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE IF EXISTS apulab_events
  DROP CONSTRAINT IF EXISTS apulab_events_session_id_fkey;

ALTER TABLE IF EXISTS apulab_sessions
  ALTER COLUMN session_id TYPE TEXT USING session_id::TEXT,
  ALTER COLUMN participant_code DROP NOT NULL;

ALTER TABLE IF EXISTS apulab_sessions
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

ALTER TABLE IF EXISTS apulab_events
  ALTER COLUMN event_id TYPE TEXT USING event_id::TEXT,
  ALTER COLUMN session_id TYPE TEXT USING session_id::TEXT,
  ALTER COLUMN participant_code DROP NOT NULL;

ALTER TABLE IF EXISTS apulab_events
  ADD COLUMN IF NOT EXISTS session_mode apulab_session_mode NOT NULL DEFAULT 'demo',
  ADD COLUMN IF NOT EXISTS schema_version VARCHAR(32) NOT NULL DEFAULT '2026-08-sprint0',
  ADD COLUMN IF NOT EXISTS timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS sync_status VARCHAR(32) NOT NULL DEFAULT 'pending';

CREATE UNIQUE INDEX IF NOT EXISTS idx_apulab_events_event_id_unique
  ON apulab_events(event_id);

DO $$ BEGIN
  ALTER TABLE apulab_events
    ADD CONSTRAINT apulab_events_session_id_fkey
    FOREIGN KEY (session_id) REFERENCES apulab_sessions(session_id) ON DELETE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_apulab_sessions_participant ON apulab_sessions(participant_code);
CREATE INDEX IF NOT EXISTS idx_apulab_sessions_mode ON apulab_sessions(session_mode);
CREATE INDEX IF NOT EXISTS idx_apulab_events_session ON apulab_events(session_id);
CREATE INDEX IF NOT EXISTS idx_apulab_events_type ON apulab_events(event_type);
CREATE INDEX IF NOT EXISTS idx_apulab_events_challenge ON apulab_events(challenge_id);
CREATE INDEX IF NOT EXISTS idx_apulab_events_mode ON apulab_events(session_mode);
