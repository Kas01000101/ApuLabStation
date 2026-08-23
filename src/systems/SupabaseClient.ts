import { SessionData, TelemetryEvent } from '../types/telemetry';
import { PosttestResponseData, RepositoryResult } from './research/ResearchRepository';
import { isSupabaseResearchMode } from './research/DataMode';

export class SupabaseClient {
  private static loggedDisabledNotice = false;

  public static getIngestUrl(): string | undefined {
    if (!isSupabaseResearchMode()) {
      return undefined;
    }

    const url = import.meta.env.VITE_SUPABASE_INGEST_URL;
    if (!url && !SupabaseClient.loggedDisabledNotice) {
      console.log('Supabase disabled. Using local telemetry only.');
      SupabaseClient.loggedDisabledNotice = true;
    }
    return url;
  }

  public static isConfigured(): boolean {
    return isSupabaseResearchMode() && !!SupabaseClient.getIngestUrl();
  }

  public static async authenticateParticipant(participantCode: string, credential: string): Promise<RepositoryResult<{ participant_id: string; session_mode: 'study' }>> {
    const url = SupabaseClient.getIngestUrl();
    if (!url) {
      return { success: false, error: 'supabase_not_configured' };
    }

    return SupabaseClient.post(`${url}/authenticate`, {
      participant_code: participantCode,
      credential
    });
  }

  public static async ingestSession(session: SessionData): Promise<{ success: boolean; error?: string }> {
    const url = SupabaseClient.getIngestUrl();
    if (!url) {
      return { success: false, error: 'Supabase disabled' };
    }

    return SupabaseClient.post(`${url}/session`, session);
  }

  public static async ingestEvents(events: TelemetryEvent[]): Promise<RepositoryResult<{ accepted: number }>> {
    const url = SupabaseClient.getIngestUrl();
    if (!url || events.length === 0) {
      return { success: false, error: 'Supabase disabled or empty batch' };
    }

    return SupabaseClient.post(`${url}/events`, { events });
  }

  public static async ingestPosttestResponse(response: PosttestResponseData): Promise<RepositoryResult> {
    const url = SupabaseClient.getIngestUrl();
    if (!url) {
      return { success: false, error: 'supabase_not_configured' };
    }

    return SupabaseClient.post(`${url}/posttest`, response);
  }

  public static async completeSession(sessionId: string, completedAt: string): Promise<RepositoryResult> {
    const url = SupabaseClient.getIngestUrl();
    if (!url) {
      return { success: false, error: 'supabase_not_configured' };
    }

    return SupabaseClient.post(`${url}/complete-session`, {
      session_id: sessionId,
      completed_at: completedAt
    });
  }

  public static async getCheckpoint(sessionId: string): Promise<RepositoryResult<{ checkpoint: string | null }>> {
    const url = SupabaseClient.getIngestUrl();
    if (!url) {
      return { success: false, error: 'supabase_not_configured' };
    }

    return SupabaseClient.post(`${url}/checkpoint`, { session_id: sessionId });
  }

  private static async post<T>(url: string, body: unknown): Promise<RepositoryResult<T>> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.success === false) {
        return { success: false, error: data?.error || `HTTP ${response.status}: ${response.statusText}` };
      }

      return { success: true, data };
    } catch (e: any) {
      console.warn('[SupabaseClient] Request failed:', e);
      return { success: false, error: e?.message || 'Network error' };
    }
  }
}
