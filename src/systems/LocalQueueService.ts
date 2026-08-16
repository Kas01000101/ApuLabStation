import { TelemetryEvent, SyncStatus } from '../types/telemetry';

export class LocalQueueService {
  private static STORAGE_KEY = 'apulab_telemetry_events';

  public static getEvents(): TelemetryEvent[] {
    try {
      const data = localStorage.getItem(LocalQueueService.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Failed to read telemetry events from localStorage', e);
      return [];
    }
  }

  public static addEvent(event: TelemetryEvent): void {
    try {
      const events = LocalQueueService.getEvents();
      events.push(event);
      localStorage.setItem(LocalQueueService.STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.warn('Failed to save telemetry event to localStorage', e);
    }
  }

  public static updateEventStatus(eventId: string, status: SyncStatus): void {
    try {
      const events = LocalQueueService.getEvents();
      const target = events.find(e => e.event_id === eventId);
      if (target) {
        target.sync_status = status;
        localStorage.setItem(LocalQueueService.STORAGE_KEY, JSON.stringify(events));
      }
    } catch (e) {
      console.warn('Failed to update telemetry event status', e);
    }
  }

  public static clearEvents(): void {
    localStorage.removeItem(LocalQueueService.STORAGE_KEY);
  }
}
