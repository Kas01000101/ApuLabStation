export type DataMode = 'mock' | 'supabase';

let warnedMockMode = false;

export function getDataMode(): DataMode {
  const configured = import.meta.env.VITE_DATA_MODE;
  if (configured === 'supabase') return 'supabase';
  warnMockModeOnce();
  return 'mock';
}

export function isSupabaseResearchMode(): boolean {
  return getDataMode() === 'supabase';
}

function warnMockModeOnce(): void {
  if (warnedMockMode || !import.meta.env.DEV) return;

  warnedMockMode = true;
  console.warn(
    '[ApuLab] DATA_MODE=mock. Research and Impact backends are not connected. Real STUDY data must not be collected in this mode.'
  );
}
