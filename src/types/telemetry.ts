export type SyncStatus = "local_only" | "pending" | "synced" | "failed";
export type SessionMode = "study" | "demo";

export type EventType =
  | 'session_started'
  | 'opportunity_intro_completed'
  | 'assessment_response'
  | 'challenge_started'
  | 'selection_changed'
  | 'solution_changed'
  | 'hint_requested'
  | 'solution_submitted'
  | 'feedback_shown'
  | 'attempt_finished'
  | 'challenge_completed'
  | 'mars_revealed'
  | 'program_changed'
  | 'simulation_started'
  | 'command_executed'
  | 'game_completed'
  | 'export_json_clicked'
  | 'export_csv_clicked'
  | 'sync_success'
  | 'sync_failed';

export interface TelemetryEvent {
  event_id: string;
  session_id: string;
  participant_code: string | null;
  session_mode: SessionMode;
  build_version: string;
  schema_version: string;
  scene_id: string;
  challenge_id: string | null;
  event_type: EventType | string;
  attempt_number?: number;
  payload?: Record<string, unknown>;
  result?: string;
  error_code?: string | null;
  hint_used?: boolean;
  duration_seconds?: number;
  timestamp: string;
  sync_status: SyncStatus;
}

export interface SessionData {
  session_id: string;
  participant_code: string | null;
  session_mode: SessionMode;
  build_version: string;
  schema_version: string;
  started_at: string;
  completed_at?: string;
  status: "in_progress" | "completed";
  screen_width: number;
  screen_height: number;
  user_agent: string;
}
