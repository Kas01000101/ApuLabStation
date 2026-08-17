import { LocalQueueService } from './LocalQueueService';
import { SupabaseClient } from './SupabaseClient';
import { GameState } from './GameState';
import { SyncStatus } from '../types/telemetry';

export class SyncService {
  private static isSyncing = false;

  public static async processQueue(): Promise<void> {
    if (SyncService.isSyncing) return;
    if (!SupabaseClient.isConfigured()) return;

    SyncService.isSyncing = true;

    try {
      // 1. Sync session state first if needed
      const gameState = GameState.getInstance();
      await SupabaseClient.ingestSession(gameState.getSessionData());

      // 2. Fetch pending events from localStorage
      const events = LocalQueueService.getEvents();
      const pendingEvents = events.filter(e => e.sync_status === 'pending' || e.sync_status === 'failed');

      if (pendingEvents.length === 0) {
        SyncService.isSyncing = false;
        return;
      }

      // 3. Attempt batch sync to Supabase
      const res = await SupabaseClient.ingestEvents(pendingEvents);

      if (res.success) {
        // Mark all as synced
        pendingEvents.forEach(e => {
          LocalQueueService.updateEventStatus(e.event_id, 'synced');
        });
        LocalQueueService.addEvent({
          event_id: 'sync-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          session_id: gameState.sessionId,
          participant_code: gameState.participantCode,
          session_mode: gameState.sessionMode,
          build_version: gameState.buildVersion,
          schema_version: gameState.schemaVersion,
          scene_id: gameState.currentScene,
          event_type: 'sync_success',
          payload: { count: pendingEvents.length },
          timestamp: new Date().toISOString(),
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
          participant_code: gameState.participantCode,
          session_mode: gameState.sessionMode,
          build_version: gameState.buildVersion,
          schema_version: gameState.schemaVersion,
          scene_id: gameState.currentScene,
          event_type: 'sync_failed',
          payload: { count: pendingEvents.length, error: res.error },
          timestamp: new Date().toISOString(),
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
    return SupabaseClient.isConfigured() ? 'pending' : 'local_only';
  }
}
