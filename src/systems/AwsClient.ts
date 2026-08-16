import { TelemetryEvent } from '../types/telemetry';

export class AwsClient {
  private static getApiUrl(): string | undefined {
    return import.meta.env.VITE_APULAB_API_URL;
  }

  public static async startSession(sessionId: string, participantCode: string): Promise<boolean> {
    const url = AwsClient.getApiUrl();
    if (!url) {
      console.log('[AwsClient] AWS disabled. Using local telemetry only.');
      return false;
    }

    try {
      const response = await fetch(`${url}/session/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, participant_code: participantCode, timestamp: new Date().toISOString() })
      });
      return response.ok;
    } catch (e) {
      console.warn('[AwsClient] AWS request failed', e);
      return false;
    }
  }

  public static async sendEvent(event: TelemetryEvent): Promise<boolean> {
    const url = AwsClient.getApiUrl();
    if (!url) return false;

    try {
      const response = await fetch(`${url}/telemetry/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      return response.ok;
    } catch (e) {
      console.warn('[AwsClient] Event sync failed', e);
      return false;
    }
  }

  public static async sendBatchEvents(events: TelemetryEvent[]): Promise<boolean> {
    const url = AwsClient.getApiUrl();
    if (!url || events.length === 0) return false;

    try {
      const response = await fetch(`${url}/telemetry/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events })
      });
      return response.ok;
    } catch (e) {
      console.warn('[AwsClient] Batch sync failed', e);
      return false;
    }
  }

  public static async finishSession(sessionId: string): Promise<boolean> {
    const url = AwsClient.getApiUrl();
    if (!url) return false;

    try {
      const response = await fetch(`${url}/session/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, finished_at: new Date().toISOString() })
      });
      return response.ok;
    } catch (e) {
      console.warn('[AwsClient] Finish session failed', e);
      return false;
    }
  }
}
