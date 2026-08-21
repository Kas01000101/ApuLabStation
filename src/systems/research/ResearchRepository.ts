import { SessionData, SessionMode, TelemetryEvent } from '../../types/telemetry';

export interface AuthenticatedParticipant {
  participant_id: string;
  session_mode: Extract<SessionMode, 'study'>;
}

export interface AuthenticateParticipantInput {
  participantCode: string;
  credential: string;
}

export interface PosttestResponseData {
  response_id?: string;
  participant_id: string;
  session_id: string;
  questionnaire_version: string;
  question_id: string;
  answer: Record<string, unknown>;
  answered_at?: string;
}

export interface RepositoryResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ResearchRepository {
  readonly mode: 'mock' | 'supabase';
  authenticateParticipant(input: AuthenticateParticipantInput): Promise<RepositoryResult<AuthenticatedParticipant>>;
  createSession(session: SessionData): Promise<RepositoryResult>;
  saveEvents(events: TelemetryEvent[]): Promise<RepositoryResult<{ accepted: number }>>;
  savePosttestResponse(response: PosttestResponseData): Promise<RepositoryResult>;
  completeSession(sessionId: string, completedAt: string): Promise<RepositoryResult>;
  getCheckpoint(sessionId: string): Promise<RepositoryResult<{ checkpoint: string | null }>>;
}
