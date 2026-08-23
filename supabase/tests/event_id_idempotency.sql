-- Manual verification for Supabase SQL editor or local Supabase.
-- Expected result: idempotent_event_rows = 1. The transaction rolls back test data.

BEGIN;

INSERT INTO apulab_sessions (
  session_id,
  participant_code,
  session_mode,
  build_version,
  schema_version,
  started_at,
  status,
  screen_width,
  screen_height,
  user_agent
) VALUES (
  'idempotency-session',
  NULL,
  'demo',
  'test',
  '2026-08-sprint0',
  NOW(),
  'in_progress',
  1280,
  720,
  'supabase-idempotency-test'
) ON CONFLICT (session_id) DO UPDATE SET
  session_mode = EXCLUDED.session_mode,
  participant_code = EXCLUDED.participant_code;

INSERT INTO apulab_events (
  event_id,
  session_id,
  participant_code,
  session_mode,
  build_version,
  schema_version,
  scene_id,
  event_type,
  payload,
  timestamp,
  sync_status
) VALUES (
  'idempotency-event',
  'idempotency-session',
  NULL,
  'demo',
  'test',
  '2026-08-sprint0',
  'SupabaseIdempotencyTest',
  'session_started',
  '{"attempt": 1}'::jsonb,
  NOW(),
  'pending'
) ON CONFLICT (event_id) DO UPDATE SET
  payload = EXCLUDED.payload;

INSERT INTO apulab_events (
  event_id,
  session_id,
  participant_code,
  session_mode,
  build_version,
  schema_version,
  scene_id,
  event_type,
  payload,
  timestamp,
  sync_status
) VALUES (
  'idempotency-event',
  'idempotency-session',
  NULL,
  'demo',
  'test',
  '2026-08-sprint0',
  'SupabaseIdempotencyTest',
  'session_started',
  '{"attempt": 2}'::jsonb,
  NOW(),
  'pending'
) ON CONFLICT (event_id) DO UPDATE SET
  payload = EXCLUDED.payload;

SELECT COUNT(*) AS idempotent_event_rows
FROM apulab_events
WHERE event_id = 'idempotency-event';

ROLLBACK;
