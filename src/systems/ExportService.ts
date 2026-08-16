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
        build_version: gameState.buildVersion,
        started_at: gameState.startedAt,
        finished_at: gameState.finishedAt,
        total_events: telemetryEvents.length
      },
      pretest_answers: gameState.pretestAnswers,
      posttest_answers: gameState.posttestAnswers,
      challenge_summaries: gameState.challengeResults,
      telemetry_events: telemetryEvents
    };

    const jsonStr = JSON.stringify(data, null, 2);
    const filename = `apulab_session_${gameState.participantCode}_${Date.now()}.json`;
    ExportService.downloadFile(filename, jsonStr, 'application/json');
  }

  public static exportCSV(): void {
    const gameState = GameState.getInstance();
    const events = LocalQueueService.getEvents();

    const headers = [
      'event_id',
      'session_id',
      'participant_code',
      'build_version',
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
      ExportService.escapeCsv(e.build_version),
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
    const filename = `apulab_telemetry_${gameState.participantCode}_${Date.now()}.csv`;
    ExportService.downloadFile(filename, csvContent, 'text/csv;charset=utf-8;');
  }

  private static escapeCsv(field: string): string {
    if (field === null || field === undefined) return '""';
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
}
