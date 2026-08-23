import { LocalQueueService } from './LocalQueueService';
import { GameState } from './GameState';
import { SyncStatus } from '../types/telemetry';
import { getResearchRepository } from './research/ResearchRepositoryProvider';

export class SyncService {
  private static isSyncing = false;

  public static async processQueue(): Promise<void> {
    if (SyncService.isSyncing) return;

    SyncService.isSyncing = true;

    try {
      const repository = getResearchRepository();
      const gameState = GameState.getInstance();
      const sessionResult = await repository.createSession(gameState.getSessionData());
      if (!sessionResult.success && repository.mode === 'supabase') {
        console.warn('[SyncService] Session sync failed:', sessionResult.error);
      }

      const events = LocalQueueService.getEvents();
      // TODO(APULAB-FUTURE:OFFLINE-SYNC)
      // Add durable backoff, pagehide retry, and resume-after-network recovery before research validation.
      // See docs/FUTURE_IMPLEMENTATION.md#offline-to-online-sync
      const pendingEvents = events.filter(e => e.sync_status === 'pending' || e.sync_status === 'failed');

      if (pendingEvents.length === 0) {
        SyncService.isSyncing = false;
        return;
      }

      const res = await repository.saveEvents(pendingEvents);

      if (res.success) {
        // Mark all as synced
        pendingEvents.forEach(e => {
          LocalQueueService.updateEventStatus(e.event_id, 'synced');
        });
        LocalQueueService.addEvent({
          event_id: 'sync-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          session_id: gameState.sessionId,
          participant_id: gameState.participantId,
          participant_code: gameState.participantCode,
          session_mode: gameState.sessionMode,
          build_version: gameState.buildVersion,
          schema_version: gameState.schemaVersion,
          scene_id: gameState.currentScene,
          challenge_id: gameState.currentChallenge || null,
          event_type: 'sync_success',
          payload: { count: pendingEvents.length, data_mode: repository.mode },
          timestamp: new Date().toISOString(),
          client_timestamp: new Date().toISOString(),
          sync_status: 'synced'
        });
      } else {
        // Keep as pending or failed
        pendingEvents.forEach(e => {
          LocalQueueService.updateEventStatus(e.event_id, 'pending');
        });
        LocalQueueService.addEvent({
          event_id: 'sync-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          session_id: gameState.sessionId,
          participant_id: gameState.participantId,
          participant_code: gameState.participantCode,
          session_mode: gameState.sessionMode,
          build_version: gameState.buildVersion,
          schema_version: gameState.schemaVersion,
          scene_id: gameState.currentScene,
          challenge_id: gameState.currentChallenge || null,
          event_type: 'sync_failed',
          payload: { count: pendingEvents.length, error: res.error, data_mode: repository.mode },
          timestamp: new Date().toISOString(),
          client_timestamp: new Date().toISOString(),
          sync_status: 'failed'
        });
      }
    } catch (e: any) {
      console.warn('[SyncService] Sync queue processing encountered error:', e);
    } finally {
      SyncService.isSyncing = false;
    }
  }

  public static determineInitialStatus(): SyncStatus {
    return 'pending';
  }
}
