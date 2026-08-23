-- Manual verification for Supabase SQL editor or local Supabase.
-- Expected result: every boolean column in the final SELECT is true.
-- The transaction rolls back test data.

BEGIN;

INSERT INTO apulab_participants (
  participant_id,
  participant_code_hash,
  credential_hash,
  is_active
) VALUES (
  '00000000-0000-4000-8000-000000000101',
  repeat('a', 64),
  repeat('b', 64),
  true
);

INSERT INTO apulab_sessions (
  session_id,
  participant_id,
  participant_code,
  session_mode,
  build_version,
  game_version,
  schema_version,
  started_at,
  status,
  screen_width,
  screen_height,
  user_agent
) VALUES (
  'study-session-governance',
  '00000000-0000-4000-8000-000000000101',
  NULL,
  'study',
  'test',
  'test',
  'test-schema',
  NOW(),
  'active',
  1280,
  720,
  'governance-test'
);

INSERT INTO apulab_sessions (
  session_id,
  participant_id,
  participant_code,
  session_mode,
  build_version,
  game_version,
  schema_version,
  started_at,
  status,
  screen_width,
  screen_height,
  user_agent
) VALUES (
  'demo-session-governance',
  NULL,
  NULL,
  'demo',
  'test',
  'test',
  'test-schema',
  NOW(),
  'active',
  1280,
  720,
  'governance-test'
);

DO $$
DECLARE
  i INT;
BEGIN
  FOR i IN 1..5 LOOP
    INSERT INTO apulab_events (
      event_id,
      session_id,
      participant_id,
      participant_code,
      session_mode,
      build_version,
      schema_version,
      scene_id,
      challenge_id,
      event_type,
      payload,
      timestamp,
      client_timestamp,
      sync_status
    ) VALUES (
      'duplicate-event-governance',
      'study-session-governance',
      '00000000-0000-4000-8000-000000000101',
      NULL,
      'study',
      'test',
      'test-schema',
      'GovernanceTestScene',
      'TEST_CHALLENGE',
      'challenge_started',
      jsonb_build_object('send_number', i),
      NOW(),
      NOW(),
      'pending'
    ) ON CONFLICT (event_id) DO UPDATE SET
      payload = EXCLUDED.payload;
  END LOOP;
END $$;

INSERT INTO apulab_events (
  event_id,
  session_id,
  participant_id,
  participant_code,
  session_mode,
  build_version,
  schema_version,
  scene_id,
  challenge_id,
  event_type,
  payload,
  timestamp,
  client_timestamp,
  sync_status
) VALUES
  (
    'batch-event-governance-1',
    'study-session-governance',
    '00000000-0000-4000-8000-000000000101',
    NULL,
    'study',
    'test',
    'test-schema',
    'GovernanceTestScene',
    'TEST_CHALLENGE',
    'choice_selected',
    '{"choice_id":"technical_option"}'::jsonb,
    NOW(),
    NOW(),
    'pending'
  ),
  (
    'batch-event-governance-2',
    'study-session-governance',
    '00000000-0000-4000-8000-000000000101',
    NULL,
    'study',
    'test',
    'test-schema',
    'GovernanceTestScene',
    'TEST_CHALLENGE',
    'answer_submitted',
    '{"attempt_number":1}'::jsonb,
    NOW(),
    NOW(),
    'pending'
  )
ON CONFLICT (event_id) DO NOTHING;

INSERT INTO apulab_events (
  event_id,
  session_id,
  participant_id,
  participant_code,
  session_mode,
  build_version,
  schema_version,
  scene_id,
  challenge_id,
  event_type,
  payload,
  timestamp,
  client_timestamp,
  sync_status
) VALUES
  (
    'batch-event-governance-1',
    'study-session-governance',
    '00000000-0000-4000-8000-000000000101',
    NULL,
    'study',
    'test',
    'test-schema',
    'GovernanceTestScene',
    'TEST_CHALLENGE',
    'choice_selected',
    '{"choice_id":"technical_option_retry"}'::jsonb,
    NOW(),
    NOW(),
    'pending'
  ),
  (
    'batch-event-governance-2',
    'study-session-governance',
    '00000000-0000-4000-8000-000000000101',
    NULL,
    'study',
    'test',
    'test-schema',
    'GovernanceTestScene',
    'TEST_CHALLENGE',
    'answer_submitted',
    '{"attempt_number":1,"retry":true}'::jsonb,
    NOW(),
    NOW(),
    'pending'
  )
ON CONFLICT (event_id) DO UPDATE SET
  payload = EXCLUDED.payload;

INSERT INTO apulab_posttest_responses (
  participant_id,
  session_id,
  questionnaire_version,
  question_id,
  answer,
  answered_at
) VALUES (
  '00000000-0000-4000-8000-000000000101',
  'study-session-governance',
  'posttest-technical-version',
  'post_q_technical',
  '{"option_id":"technical_option"}'::jsonb,
  NOW()
);

DO $$
BEGIN
  BEGIN
    INSERT INTO apulab_sessions (
      session_id,
      participant_id,
      participant_code,
      session_mode,
      build_version,
      game_version,
      schema_version,
      started_at,
      status,
      screen_width,
      screen_height,
      user_agent
    ) VALUES (
      'invalid-demo-session-governance',
      '00000000-0000-4000-8000-000000000101',
      NULL,
      'demo',
      'test',
      'test',
      'test-schema',
      NOW(),
      'active',
      1280,
      720,
      'governance-test'
    );
    RAISE EXCEPTION 'demo participant constraint did not fail';
  EXCEPTION
    WHEN check_violation THEN NULL;
  END;
END $$;

SELECT
  (SELECT COUNT(*) = 1 FROM apulab_events WHERE event_id = 'duplicate-event-governance') AS event_id_idempotent,
  (SELECT COUNT(*) = 2 FROM apulab_events WHERE event_id LIKE 'batch-event-governance-%') AS batch_idempotent,
  (SELECT COUNT(*) = 1 FROM apulab_posttest_responses WHERE session_id = 'study-session-governance') AS posttest_linked,
  (SELECT session_mode = 'study' FROM apulab_sessions WHERE session_id = 'study-session-governance') AS study_session_ok,
  (SELECT session_mode = 'demo' AND participant_id IS NULL FROM apulab_sessions WHERE session_id = 'demo-session-governance') AS demo_session_ok,
  true AS invalid_demo_rejected;

ROLLBACK;
