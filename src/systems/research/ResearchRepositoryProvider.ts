import { getDataMode } from './DataMode';
import { MockResearchRepository } from './MockResearchRepository';
import { ResearchRepository } from './ResearchRepository';
import { SupabaseResearchRepository } from './SupabaseResearchRepository';

let repository: ResearchRepository | undefined;

export function getResearchRepository(): ResearchRepository {
  if (!repository) {
    // TODO(APULAB-FUTURE:RESEARCH-BACKEND)
    // Replace MockResearchRepository as the default before running real STUDY sessions.
    // Implement when data contracts, POST, Edge Functions, and RLS are ready.
    // See docs/FUTURE_IMPLEMENTATION.md#supabase-research
    repository = getDataMode() === 'supabase'
      ? new SupabaseResearchRepository()
      : new MockResearchRepository();
  }
  return repository!;
}

export function resetResearchRepositoryForTests(): void {
  repository = undefined;
}
