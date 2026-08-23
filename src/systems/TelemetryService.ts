import { TelemetryEvent, SyncStatus } from '../types/telemetry';
import { GameState } from './GameState';
import { LocalQueueService } from './LocalQueueService';
import { SyncService } from './SyncService';

export interface RecordEventOptions {
  sceneId: string;
  eventType: string;
  challengeId?: string;
  attemptNumber?: number;
  payload?: Record<string, unknown>;
  result?: string;
  errorCode?: string | null;
  hintUsed?: boolean;
  durationSeconds?: number;
}

export class TelemetryService {
  private static instance: TelemetryService;

  public static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  public recordEvent(opts: RecordEventOptions): TelemetryEvent {
    const gameState = GameState.getInstance();
    const eventId = this.generateUUID();
    const syncStatus: SyncStatus = SyncService.determineInitialStatus();

    const event: TelemetryEvent = {
      event_id: eventId,
      session_id: gameState.sessionId,
      participant_id: gameState.participantId,
      participant_code: gameState.participantCode,
      session_mode: gameState.sessionMode,
      build_version: gameState.buildVersion,
      schema_version: gameState.schemaVersion,
      scene_id: opts.sceneId,
      challenge_id: opts.challengeId || gameState.currentChallenge || null,
      event_type: opts.eventType,
      attempt_number: opts.attemptNumber,
      payload: opts.payload || {},
      result: opts.result,
      error_code: opts.errorCode ?? null,
      hint_used: opts.hintUsed || false,
      duration_seconds: opts.durationSeconds,
      timestamp: new Date().toISOString(),
      client_timestamp: new Date().toISOString(),
      sync_status: syncStatus
    };

    // 1. SAVE LOCALLY FIRST (Offline-first rule)
    LocalQueueService.addEvent(event);

    // 2. Background attempt to sync with Supabase
    SyncService.processQueue();

    console.log(`[Telemetry] Recorded event: ${opts.eventType} (${opts.sceneId})`, event);

    return event;
  }

  private generateUUID(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'event-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
  }
}
