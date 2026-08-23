import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_BATCH_SIZE = 20;
const MAX_PAYLOAD_BYTES = 8192;
const MAX_POST_ANSWER_BYTES = 4096;

const allowedEventTypes = new Set([
  'session_started',
  'checkpoint_reached',
  'opportunity_intro_completed',
  'assessment_response',
  'challenge_started',
  'choice_selected',
  'selection_changed',
  'measurement_taken',
  'answer_submitted',
  'solution_changed',
  'solution_submitted',
  'attempt_completed',
  'attempt_finished',
  'hint_requested',
  'configuration_changed',
  'feedback_shown',
  'challenge_completed',
  'challenge_failed',
  'mars_revealed',
  'program_changed',
  'simulation_started',
  'command_executed',
  'posttest_started',
  'posttest_answered',
  'posttest_completed',
  'game_completed',
  'export_json_clicked',
  'export_csv_clicked',
  'sync_success',
  'sync_failed',
]);

const forbiddenPayloadKeys = new Set([
  'name',
  'first_name',
  'last_name',
  'email',
  'phone',
  'address',
  'document_id',
  'birth_date',
  'school',
  'credential',
  'password',
  'credential_hash',
  'audio',
  'video',
  'image',
  'screenshot',
  'html',
]);

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function byteLength(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value ?? {})).length;
}

function assertString(value: unknown, field: string, max = 128): string {
  if (typeof value !== 'string' || value.trim().length === 0 || value.length > max) {
    throw new Error(`${field}_invalid`);
  }
  return value;
}

function assertNullableString(value: unknown, field: string, max = 128): string | null {
  if (value == null) return null;
  return assertString(value, field, max);
}

function assertSessionMode(value: unknown): 'study' | 'demo' {
  if (value !== 'study' && value !== 'demo') throw new Error('session_mode_invalid');
  return value;
}

function assertSafePayload(payload: unknown, maxBytes: number): Record<string, unknown> {
  if (payload == null) return {};
  if (typeof payload !== 'object' || Array.isArray(payload)) throw new Error('payload_invalid');
  if (byteLength(payload) > maxBytes) throw new Error('payload_too_large');

  const stack = [payload as Record<string, unknown>];
  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const [key, value] of Object.entries(current)) {
      if (forbiddenPayloadKeys.has(key.toLowerCase())) throw new Error('payload_forbidden_field');
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        stack.push(value as Record<string, unknown>);
      }
    }
  }
  return payload as Record<string, unknown>;
}

function normalizeSession(input: Record<string, unknown>): Record<string, unknown> {
  const sessionMode = assertSessionMode(input.session_mode ?? 'demo');
  const participantId = assertNullableString(input.participant_id, 'participant_id', 64);

  if (sessionMode === 'study' && !participantId) throw new Error('study_requires_participant_id');
  if (sessionMode === 'demo' && participantId) throw new Error('demo_must_not_have_participant_id');

  return {
    session_id: assertString(input.session_id, 'session_id', 128),
    participant_id: participantId,
    participant_code: null,
    session_mode: sessionMode,
    build_version: assertString(input.build_version, 'build_version', 32),
    game_version: input.game_version ?? input.build_version,
    schema_version: assertString(input.schema_version, 'schema_version', 32),
    started_at: assertString(input.started_at, 'started_at', 64),
    completed_at: input.completed_at ?? null,
    status: assertString(input.status ?? 'active', 'status', 32),
    screen_width: input.screen_width,
    screen_height: input.screen_height,
    user_agent: assertString(input.user_agent ?? 'unknown', 'user_agent', 512),
  };
}

function normalizeEvent(input: Record<string, unknown>, receivedAt: string): Record<string, unknown> {
  const eventType = assertString(input.event_type, 'event_type', 64);
  if (!allowedEventTypes.has(eventType)) throw new Error('event_type_not_allowed');

  return {
    event_id: assertString(input.event_id, 'event_id', 128),
    session_id: assertString(input.session_id, 'session_id', 128),
    participant_id: input.participant_id ?? null,
    participant_code: null,
    session_mode: assertSessionMode(input.session_mode ?? 'demo'),
    build_version: assertString(input.build_version, 'build_version', 32),
    schema_version: assertString(input.schema_version, 'schema_version', 32),
    scene_id: assertString(input.scene_id, 'scene_id', 64),
    challenge_id: input.challenge_id ?? null,
    event_type: eventType,
    attempt_number: input.attempt_number ?? null,
    payload: assertSafePayload(input.payload ?? {}, MAX_PAYLOAD_BYTES),
    result: input.result ?? null,
    error_code: input.error_code ?? null,
    hint_used: Boolean(input.hint_used ?? false),
    duration_seconds: input.duration_seconds ?? null,
    timestamp: input.timestamp ?? input.client_timestamp ?? receivedAt,
    client_timestamp: input.client_timestamp ?? input.timestamp ?? null,
    received_at: receivedAt,
    sync_status: 'synced',
  };
}

function normalizePosttest(input: Record<string, unknown>): Record<string, unknown> {
  return {
    response_id: input.response_id ?? crypto.randomUUID(),
    participant_id: assertString(input.participant_id, 'participant_id', 64),
    session_id: assertString(input.session_id, 'session_id', 128),
    questionnaire_version: assertString(input.questionnaire_version, 'questionnaire_version', 64),
    question_id: assertString(input.question_id, 'question_id', 128),
    answer: assertSafePayload(input.answer ?? {}, MAX_POST_ANSWER_BYTES),
    answered_at: input.answered_at ?? new Date().toISOString(),
  };
}

function normalizeAuthentication(input: Record<string, unknown>): Record<string, string> {
  return {
    participant_code: assertString(input.participant_code, 'participant_code', 64),
    credential: assertString(input.credential, 'credential', 128),
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'method_not_allowed' }, 405);
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const url = new URL(req.url);
    const path = url.pathname;

    if (path.endsWith('/authenticate')) {
      // TODO(APULAB-FUTURE:AUTH-REAL)
      // Verify participant_code + credential hashes server-side before enabling real STUDY.
      // See docs/FUTURE_IMPLEMENTATION.md#real-code--password-authentication
      normalizeAuthentication(await req.json());
      return jsonResponse({ success: false, error: 'participant_auth_not_configured' }, 503);
    }

    if (path.endsWith('/session')) {
      const sessionData = normalizeSession(await req.json());
      const { error } = await supabase.from('apulab_sessions').upsert(sessionData, { onConflict: 'session_id' });
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    if (path.endsWith('/events')) {
      const body = await req.json();
      if (!Array.isArray(body.events)) throw new Error('events_batch_invalid');
      if (body.events.length > MAX_BATCH_SIZE) throw new Error('events_batch_too_large');

      const receivedAt = new Date().toISOString();
      const events = body.events.map((event: unknown) => normalizeEvent(event as Record<string, unknown>, receivedAt));
      const { error } = await supabase.from('apulab_events').upsert(events, { onConflict: 'event_id' });
      if (error) throw error;
      return jsonResponse({ success: true, accepted: events.length });
    }

    if (path.endsWith('/posttest')) {
      const body = await req.json();
      const responsesInput = Array.isArray(body.responses) ? body.responses : [body];
      if (responsesInput.length > MAX_BATCH_SIZE) throw new Error('posttest_batch_too_large');

      const responses = responsesInput.map((response: unknown) => normalizePosttest(response as Record<string, unknown>));
      const { error } = await supabase
        .from('apulab_posttest_responses')
        .upsert(responses, { onConflict: 'session_id,questionnaire_version,question_id' });
      if (error) throw error;
      return jsonResponse({ success: true, accepted: responses.length });
    }

    if (path.endsWith('/complete-session')) {
      const body = await req.json();
      const sessionId = assertString(body.session_id, 'session_id', 128);
      const completedAt = assertString(body.completed_at ?? new Date().toISOString(), 'completed_at', 64);
      const { error } = await supabase
        .from('apulab_sessions')
        .update({ status: 'completed', completed_at: completedAt })
        .eq('session_id', sessionId);
      if (error) throw error;
      return jsonResponse({ success: true });
    }

    if (path.endsWith('/checkpoint')) {
      const body = await req.json();
      const sessionId = assertString(body.session_id, 'session_id', 128);
      const { data, error } = await supabase
        .from('apulab_sessions')
        .select('last_checkpoint')
        .eq('session_id', sessionId)
        .maybeSingle();
      if (error) throw error;
      return jsonResponse({ success: true, checkpoint: data?.last_checkpoint ?? null });
    }

    return jsonResponse({ error: 'endpoint_not_found' }, 404);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown_error';
    return jsonResponse({ error: message }, 400);
  }
});
