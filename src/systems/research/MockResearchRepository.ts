import { SessionData, TelemetryEvent } from '../../types/telemetry';
import { AuthenticatedParticipant, AuthenticateParticipantInput, PosttestResponseData, ResearchRepository, RepositoryResult } from './ResearchRepository';

const SESSION_KEY = 'apulab_mock_sessions';
const EVENT_KEY = 'apulab_mock_events';
const POSTTEST_KEY = 'apulab_mock_posttest_responses';

function readArray<T>(key: string): T[] {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : [];
  } catch {
    return [];
  }
}

function writeArray<T>(key: string, rows: T[]): void {
  localStorage.setItem(key, JSON.stringify(rows));
}

export class MockResearchRepository implements ResearchRepository {
  public readonly mode = 'mock' as const;

  public async authenticateParticipant(_input: AuthenticateParticipantInput): Promise<RepositoryResult<AuthenticatedParticipant>> {
    // TODO(APULAB-FUTURE:AUTH-REAL)
    // Implement server-side code + credential verification before real STUDY launch.
    // See docs/FUTURE_IMPLEMENTATION.md#real-code--password-authentication
    return {
      success: false,
      error: 'study_requires_supabase_data_mode'
    };
  }

  public async createSession(session: SessionData): Promise<RepositoryResult> {
    if (session.session_mode === 'study') {
      const error = '[ApuLab] Real STUDY sessions cannot run with DATA_MODE=mock. Implement/enable the Research backend first. See docs/FUTURE_IMPLEMENTATION.md#supabase-research';
      if (import.meta.env.DEV) {
        throw new Error(error);
      }
      return {
        success: false,
        error
      };
    }

    // TODO(APULAB-FUTURE:IMPACT-BACKEND)
    // Connect anonymous demo analytics to ApuLab Impact after gameplay is stable.
    // See docs/FUTURE_IMPLEMENTATION.md#supabase-impact
    const sessions = readArray<SessionData & { environment: 'development' }>(SESSION_KEY);
    const next = sessions.filter((item) => item.session_id !== session.session_id);
    next.push({ ...session, environment: 'development' });
    writeArray(SESSION_KEY, next);
    return { success: true };
  }

  public async saveEvents(events: TelemetryEvent[]): Promise<RepositoryResult<{ accepted: number }>> {
    // TODO(APULAB-FUTURE:OFFLINE-SYNC)
    // Replace local mock event storage with durable offline-to-online retry semantics before research validation.
    // See docs/FUTURE_IMPLEMENTATION.md#offline-to-online-sync
    const stored = readArray<TelemetryEvent & { environment: 'development' }>(EVENT_KEY);
    const byId = new Map(stored.map((event) => [event.event_id, event]));

    events.forEach((event) => {
      byId.set(event.event_id, {
        ...event,
        payload: {
          environment: 'development',
          ...(event.payload || {})
        },
        sync_status: 'synced',
        environment: 'development'
      });
    });

    writeArray(EVENT_KEY, Array.from(byId.values()));
    return { success: true, data: { accepted: events.length } };
  }

  public async savePosttestResponse(response: PosttestResponseData): Promise<RepositoryResult> {
    // TODO(APULAB-FUTURE:POST-PERSISTENCE)
    // Store POST answers in Supabase Research before the real study launch.
    // See docs/FUTURE_IMPLEMENTATION.md#real-post-storage-in-research
    const responses = readArray<PosttestResponseData & { environment: 'development' }>(POSTTEST_KEY);
    responses.push({ ...response, environment: 'development' });
    writeArray(POSTTEST_KEY, responses);
    return { success: true };
  }

  public async completeSession(sessionId: string, completedAt: string): Promise<RepositoryResult> {
    const sessions = readArray<SessionData & { environment: 'development' }>(SESSION_KEY);
    const next = sessions.map((session) => (
      session.session_id === sessionId
        ? { ...session, status: 'completed' as const, completed_at: completedAt }
        : session
    ));
    writeArray(SESSION_KEY, next);
    return { success: true };
  }

  public async getCheckpoint(sessionId: string): Promise<RepositoryResult<{ checkpoint: string | null }>> {
    const sessions = readArray<SessionData & { last_checkpoint?: string }>(SESSION_KEY);
    const session = sessions.find((item) => item.session_id === sessionId);
    return { success: true, data: { checkpoint: session?.last_checkpoint ?? null } };
  }
}
