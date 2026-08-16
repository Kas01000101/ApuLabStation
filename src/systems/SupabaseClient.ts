import { SessionData, TelemetryEvent } from '../types/telemetry';

export class SupabaseClient {
  private static loggedDisabledNotice = false;

  public static getIngestUrl(): string | undefined {
    const url = import.meta.env.VITE_SUPABASE_INGEST_URL;
    if (!url && !SupabaseClient.loggedDisabledNotice) {
      console.log('Supabase disabled. Using local telemetry only.');
      SupabaseClient.loggedDisabledNotice = true;
    }
    return url;
  }

  public static isConfigured(): boolean {
    return !!SupabaseClient.getIngestUrl();
  }

  public static async ingestSession(session: SessionData): Promise<{ success: boolean; error?: string }> {
    const url = SupabaseClient.getIngestUrl();
    if (!url) {
      return { success: false, error: 'Supabase disabled' };
    }

    try {
      const response = await fetch(`${url}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session)
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }

      return { success: true };
    } catch (e: any) {
      console.warn('[SupabaseClient] Session ingest failed:', e);
      return { success: false, error: e?.message || 'Network error' };
    }
  }

  public static async ingestEvents(events: TelemetryEvent[]): Promise<{ success: boolean; error?: string }> {
    const url = SupabaseClient.getIngestUrl();
    if (!url || events.length === 0) {
      return { success: false, error: 'Supabase disabled or empty batch' };
    }

    try {
      const response = await fetch(`${url}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events })
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
      }

      return { success: true };
    } catch (e: any) {
      console.warn('[SupabaseClient] Events ingest failed:', e);
      return { success: false, error: e?.message || 'Network error' };
    }
  }
}
