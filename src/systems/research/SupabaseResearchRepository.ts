import { SessionData, TelemetryEvent } from '../../types/telemetry';
import { SupabaseClient } from '../SupabaseClient';
import { AuthenticateParticipantInput, AuthenticatedParticipant, PosttestResponseData, ResearchRepository, RepositoryResult } from './ResearchRepository';

export class SupabaseResearchRepository implements ResearchRepository {
  public readonly mode = 'supabase' as const;

  public async authenticateParticipant(input: AuthenticateParticipantInput): Promise<RepositoryResult<AuthenticatedParticipant>> {
    return SupabaseClient.authenticateParticipant(input.participantCode, input.credential);
  }

  public async createSession(session: SessionData): Promise<RepositoryResult> {
    return SupabaseClient.ingestSession(session);
  }

  public async saveEvents(events: TelemetryEvent[]): Promise<RepositoryResult<{ accepted: number }>> {
    return SupabaseClient.ingestEvents(events);
  }

  public async savePosttestResponse(response: PosttestResponseData): Promise<RepositoryResult> {
    return SupabaseClient.ingestPosttestResponse(response);
  }

  public async completeSession(sessionId: string, completedAt: string): Promise<RepositoryResult> {
    return SupabaseClient.completeSession(sessionId, completedAt);
  }

  public async getCheckpoint(sessionId: string): Promise<RepositoryResult<{ checkpoint: string | null }>> {
    return SupabaseClient.getCheckpoint(sessionId);
  }
}
