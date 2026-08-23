-- ApuLab Station research data governance baseline.
-- Safe incremental migration: adds pseudonymous participant architecture,
-- posttest mapping, idempotency/integrity constraints, and RLS.
-- Do not run destructive changes or delete existing research rows.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE apulab_session_mode AS ENUM ('study', 'demo');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS apulab_participants (
  participant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_code_hash TEXT NOT NULL UNIQUE,
  credential_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT apulab_participants_code_hash_not_blank CHECK (length(trim(participant_code_hash)) >= 32),
  CONSTRAINT apulab_participants_credential_hash_not_blank CHECK (length(trim(credential_hash)) >= 32)
);

COMMENT ON TABLE apulab_participants IS
  'Pseudonymous participant registry. Stores hashes only; never store raw participant codes or credentials.';
COMMENT ON COLUMN apulab_participants.participant_code_hash IS
  'Hash of participant_code used for controlled matching with external PRE data.';
COMMENT ON COLUMN apulab_participants.credential_hash IS
  'Secure hash of individual participant credential. Never store raw credential.';

CREATE TABLE IF NOT EXISTS apulab_auth_attempts (
  attempt_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_code_hash TEXT,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cooldown_until TIMESTAMPTZ,
  client_context JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT apulab_auth_attempts_context_size CHECK (pg_column_size(client_context) <= 2048)
);

COMMENT ON TABLE apulab_auth_attempts IS
  'Minimal audit trail for rate limiting authentication attempts; does not store raw participant codes or credentials.';

ALTER TABLE IF EXISTS apulab_sessions
  ADD COLUMN IF NOT EXISTS participant_id UUID,
  ADD COLUMN IF NOT EXISTS last_checkpoint TEXT,
  ADD COLUMN IF NOT EXISTS game_version VARCHAR(32),
  ADD COLUMN IF NOT EXISTS questionnaire_version TEXT;

ALTER TABLE IF EXISTS apulab_sessions
  DROP CONSTRAINT IF EXISTS apulab_study_requires_code;

UPDATE apulab_sessions
SET game_version = build_version
WHERE game_version IS NULL AND build_version IS NOT NULL;

DO $$ BEGIN
  ALTER TABLE apulab_sessions
    ADD CONSTRAINT apulab_sessions_participant_id_fkey
    FOREIGN KEY (participant_id) REFERENCES apulab_participants(participant_id) ON DELETE RESTRICT;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE apulab_sessions
    ADD CONSTRAINT apulab_sessions_mode_participant_consistency
    CHECK (
      (session_mode = 'demo' AND participant_id IS NULL)
      OR
      (session_mode = 'study' AND participant_id IS NOT NULL)
    ) NOT VALID;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE apulab_sessions
    ADD CONSTRAINT apulab_sessions_status_allowed
    CHECK (status IN ('in_progress', 'active', 'completed', 'abandoned', 'completed_pending_sync')) NOT VALID;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE IF EXISTS apulab_events
  ADD COLUMN IF NOT EXISTS participant_id UUID,
  ADD COLUMN IF NOT EXISTS client_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS received_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE apulab_events
SET client_timestamp = "timestamp"
WHERE client_timestamp IS NULL AND "timestamp" IS NOT NULL;

DO $$ BEGIN
  ALTER TABLE apulab_events
    ADD CONSTRAINT apulab_events_participant_id_fkey
    FOREIGN KEY (participant_id) REFERENCES apulab_participants(participant_id) ON DELETE RESTRICT;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE IF EXISTS apulab_events
  DROP CONSTRAINT IF EXISTS apulab_events_session_id_fkey;

DO $$ BEGIN
  ALTER TABLE apulab_events
    ADD CONSTRAINT apulab_events_session_id_fkey
    FOREIGN KEY (session_id) REFERENCES apulab_sessions(session_id) ON DELETE RESTRICT;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE apulab_events
    ADD CONSTRAINT apulab_events_payload_size
    CHECK (pg_column_size(payload) <= 8192) NOT VALID;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE apulab_events
    ADD CONSTRAINT apulab_events_type_not_blank
    CHECK (length(trim(event_type)) BETWEEN 3 AND 64) NOT VALID;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_apulab_events_event_id_unique
  ON apulab_events(event_id);

CREATE INDEX IF NOT EXISTS idx_apulab_participants_code_hash ON apulab_participants(participant_code_hash);
CREATE INDEX IF NOT EXISTS idx_apulab_sessions_participant_id ON apulab_sessions(participant_id);
CREATE INDEX IF NOT EXISTS idx_apulab_sessions_status ON apulab_sessions(status);
CREATE INDEX IF NOT EXISTS idx_apulab_events_participant_id ON apulab_events(participant_id);
CREATE INDEX IF NOT EXISTS idx_apulab_events_received_at ON apulab_events(received_at);

CREATE TABLE IF NOT EXISTS apulab_posttest_responses (
  response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES apulab_participants(participant_id) ON DELETE RESTRICT,
  session_id TEXT NOT NULL REFERENCES apulab_sessions(session_id) ON DELETE RESTRICT,
  questionnaire_version TEXT NOT NULL,
  question_id TEXT NOT NULL,
  answer JSONB NOT NULL,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT apulab_posttest_question_not_blank CHECK (length(trim(question_id)) > 0),
  CONSTRAINT apulab_posttest_questionnaire_not_blank CHECK (length(trim(questionnaire_version)) > 0),
  CONSTRAINT apulab_posttest_answer_size CHECK (pg_column_size(answer) <= 4096),
  CONSTRAINT apulab_posttest_unique_answer UNIQUE (session_id, questionnaire_version, question_id)
);

COMMENT ON TABLE apulab_posttest_responses IS
  'Structured internal POST-test responses linked automatically by participant_id and session_id.';

ALTER TABLE apulab_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE apulab_auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE apulab_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE apulab_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE apulab_posttest_responses ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE VIEW apulab_participants_analysis AS
SELECT
  participant_id,
  participant_code_hash,
  is_active,
  created_at
FROM apulab_participants;

CREATE OR REPLACE VIEW apulab_sessions_analysis AS
SELECT
  session_id,
  participant_id,
  session_mode,
  status,
  started_at,
  completed_at,
  last_checkpoint,
  game_version,
  schema_version,
  questionnaire_version,
  screen_width,
  screen_height,
  created_at
FROM apulab_sessions;

CREATE OR REPLACE VIEW apulab_events_analysis AS
SELECT
  event_id,
  session_id,
  participant_id,
  session_mode,
  scene_id,
  challenge_id,
  event_type,
  attempt_number,
  payload,
  result,
  error_code,
  hint_used,
  duration_seconds,
  client_timestamp,
  received_at,
  build_version AS game_version,
  schema_version
FROM apulab_events;

CREATE OR REPLACE VIEW apulab_posttest_analysis AS
SELECT
  response_id,
  participant_id,
  session_id,
  questionnaire_version,
  question_id,
  answer,
  answered_at
FROM apulab_posttest_responses;
