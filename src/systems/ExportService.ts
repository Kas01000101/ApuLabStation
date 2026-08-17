import { GameState } from './GameState';
import { LocalQueueService } from './LocalQueueService';

export class ExportService {
  public static downloadFile(filename: string, content: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public static exportJSON(): void {
    const gameState = GameState.getInstance();
    const telemetryEvents = LocalQueueService.getEvents();

    const data = {
      session_metadata: {
        session_id: gameState.sessionId,
        participant_code: gameState.participantCode,
        session_mode: gameState.sessionMode,
        build_version: gameState.buildVersion,
        schema_version: gameState.schemaVersion,
        started_at: gameState.startedAt,
        completed_at: gameState.completedAt,
        total_events: telemetryEvents.length
      },
      pretest_answers: gameState.pretestAnswers,
      posttest_answers: gameState.posttestAnswers,
      challenge_summaries: gameState.challengeResults,
      telemetry_events: telemetryEvents
    };

    const jsonStr = JSON.stringify(data, null, 2);
    const sessionLabel = gameState.participantCode || 'demo';
    const filename = `apulab_session_${sessionLabel}_${Date.now()}.json`;
    ExportService.downloadFile(filename, jsonStr, 'application/json');
  }

  public static exportCSV(): void {
    const gameState = GameState.getInstance();
    const events = LocalQueueService.getEvents();

    const headers = [
      'event_id',
      'session_id',
      'participant_code',
      'session_mode',
      'build_version',
      'schema_version',
      'scene_id',
      'challenge_id',
      'event_type',
      'attempt_number',
      'result',
      'error_code',
      'hint_used',
      'duration_seconds',
      'timestamp',
      'payload_json'
    ];

    const rows = events.map(e => [
      ExportService.escapeCsv(e.event_id),
      ExportService.escapeCsv(e.session_id),
      ExportService.escapeCsv(e.participant_code),
      ExportService.escapeCsv(e.session_mode),
      ExportService.escapeCsv(e.build_version),
      ExportService.escapeCsv(e.schema_version),
      ExportService.escapeCsv(e.scene_id),
      ExportService.escapeCsv(e.challenge_id || ''),
      ExportService.escapeCsv(e.event_type),
      e.attempt_number ?? '',
      ExportService.escapeCsv(e.result || ''),
      ExportService.escapeCsv(e.error_code || ''),
      e.hint_used ? 'true' : 'false',
      e.duration_seconds ?? '',
      ExportService.escapeCsv(e.timestamp),
      ExportService.escapeCsv(JSON.stringify(e.payload || {}))
    ]);

    const csvLines = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ];

    const csvContent = csvLines.join('\n');
    const sessionLabel = gameState.participantCode || 'demo';
    const filename = `apulab_telemetry_${sessionLabel}_${Date.now()}.csv`;
    ExportService.downloadFile(filename, csvContent, 'text/csv;charset=utf-8;');
  }

  private static escapeCsv(field: string | null | undefined): string {
    if (field === null || field === undefined) return '""';
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
}
