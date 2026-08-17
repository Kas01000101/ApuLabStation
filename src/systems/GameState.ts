import { AssessmentResponse } from '../types/assessment';
import { SessionData, SessionMode } from '../types/telemetry';

const STORAGE_KEY = 'apulab_session_state';
const BUILD_VERSION = '0.1.0-web-pilot';
const SCHEMA_VERSION = '2026-08-sprint0';

export interface ChallengeResult {
  challengeId: string;
  attempts: number;
  completed: boolean;
  hintsUsed: boolean;
  durationSeconds: number;
}

interface PersistedGameState {
  session_id: string;
  participant_code: string | null;
  session_mode: SessionMode;
  current_scene: string;
  current_level: number;
  current_challenge: string;
  completed_challenges: string[];
  challenge_results: Record<string, ChallengeResult>;
  build_version: string;
  schema_version: string;
  started_at: string;
  last_saved_at: string;
  completed_at?: string;
  status: 'in_progress' | 'completed';
  screen_width: number;
  screen_height: number;
  user_agent: string;
}

export class GameState {
  private static instance: GameState;

  public participantCode: string | null = null;
  public sessionMode: SessionMode = 'demo';
  public sessionId: string = '';
  public readonly buildVersion: string = BUILD_VERSION;
  public readonly schemaVersion: string = SCHEMA_VERSION;
  public currentScene: string = 'MainMenuScene';
  public currentLevel: number = 0;
  public currentChallenge: string = '';
  public completedChallenges: string[] = [];
  public challengeResults: Record<string, ChallengeResult> = {};
  public startedAt: string = '';
  public lastSavedAt: string = '';
  public completedAt: string = '';
  public status: 'in_progress' | 'completed' = 'in_progress';
  public screenWidth: number = 0;
  public screenHeight: number = 0;
  public userAgent: string = '';

  // Historical assessment arrays remain for old scenes kept in the repo but removed from active flow.
  public pretestAnswers: AssessmentResponse[] = [];
  public posttestAnswers: AssessmentResponse[] = [];

  private constructor() {
    this.resetRuntimeMetadata();
  }

  public static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
      GameState.instance.restoreSessionState();
    }
    return GameState.instance;
  }

  public static hasRecoverableSession(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as Partial<PersistedGameState>;
      return !!parsed.session_id && parsed.status !== 'completed';
    } catch {
      return false;
    }
  }

  public startNewSession(mode: SessionMode, participantCode: string | null): void {
    this.resetRuntimeMetadata();
    this.sessionId = this.generateUUID();
    this.sessionMode = mode;
    this.participantCode = mode === 'study' ? this.normalizeParticipantCode(participantCode || '') : null;
    this.currentScene = 'OpportunityIntroScene';
    this.currentLevel = 0;
    this.currentChallenge = 'INTRO_STORY';
    this.completedChallenges = [];
    this.challengeResults = {};
    this.status = 'in_progress';
    this.completedAt = '';
    this.persistSessionState();
  }

  public setParticipantCode(code: string): void {
    this.sessionMode = 'study';
    this.participantCode = this.normalizeParticipantCode(code);
    this.persistSessionState();
  }

  public setDemoMode(): void {
    this.sessionMode = 'demo';
    this.participantCode = null;
    this.persistSessionState();
  }

  public updateProgress(currentScene: string, currentLevel: number, currentChallenge: string): void {
    this.currentScene = currentScene;
    this.currentLevel = currentLevel;
    this.currentChallenge = currentChallenge;
    this.persistSessionState();
  }

  public addPretestAnswer(answer: AssessmentResponse): void {
    this.pretestAnswers.push(answer);
    this.persistSessionState();
  }

  public addPosttestAnswer(answer: AssessmentResponse): void {
    this.posttestAnswers.push(answer);
    this.persistSessionState();
  }

  public recordChallengeResult(result: ChallengeResult): void {
    this.challengeResults[result.challengeId] = result;
    if (!this.completedChallenges.includes(result.challengeId)) {
      this.completedChallenges.push(result.challengeId);
    }
    this.currentChallenge = result.challengeId;
    this.persistSessionState();
  }

  public completeSession(): void {
    this.completedAt = new Date().toISOString();
    this.status = 'completed';
    this.currentScene = 'FinalScene';
    this.persistSessionState();
  }

  public restoreSessionState(): boolean {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return false;
      const state = JSON.parse(raw) as Partial<PersistedGameState>;
      if (!state.session_id) return false;

      this.sessionId = state.session_id;
      this.participantCode = state.participant_code ?? null;
      this.sessionMode = state.session_mode ?? (this.participantCode ? 'study' : 'demo');
      this.currentScene = state.current_scene || 'OpportunityIntroScene';
      this.currentLevel = state.current_level ?? 0;
      this.currentChallenge = state.current_challenge || '';
      this.completedChallenges = state.completed_challenges || [];
      this.challengeResults = state.challenge_results || {};
      this.startedAt = state.started_at || new Date().toISOString();
      this.lastSavedAt = state.last_saved_at || this.startedAt;
      this.completedAt = state.completed_at || '';
      this.status = state.status || 'in_progress';
      this.screenWidth = state.screen_width || this.screenWidth;
      this.screenHeight = state.screen_height || this.screenHeight;
      this.userAgent = state.user_agent || this.userAgent;
      return true;
    } catch (e) {
      console.warn('Failed to restore session state from localStorage', e);
      return false;
    }
  }

  public getSessionData(): SessionData {
    return {
      session_id: this.sessionId,
      participant_code: this.participantCode,
      session_mode: this.sessionMode,
      build_version: this.buildVersion,
      schema_version: this.schemaVersion,
      started_at: this.startedAt,
      completed_at: this.completedAt || undefined,
      status: this.status,
      screen_width: this.screenWidth,
      screen_height: this.screenHeight,
      user_agent: this.userAgent
    };
  }

  public persistSessionState(): void {
    try {
      this.lastSavedAt = new Date().toISOString();
      const stateObj: PersistedGameState = {
        session_id: this.sessionId,
        participant_code: this.participantCode,
        session_mode: this.sessionMode,
        current_scene: this.currentScene,
        current_level: this.currentLevel,
        current_challenge: this.currentChallenge,
        completed_challenges: this.completedChallenges,
        challenge_results: this.challengeResults,
        build_version: this.buildVersion,
        schema_version: this.schemaVersion,
        started_at: this.startedAt,
        last_saved_at: this.lastSavedAt,
        completed_at: this.completedAt || undefined,
        status: this.status,
        screen_width: this.screenWidth,
        screen_height: this.screenHeight,
        user_agent: this.userAgent
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateObj));
    } catch (e) {
      console.warn('Failed to save session state to localStorage', e);
    }
  }

  private resetRuntimeMetadata(): void {
    this.sessionId = this.generateUUID();
    this.startedAt = new Date().toISOString();
    this.lastSavedAt = this.startedAt;
    this.screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1280;
    this.screenHeight = typeof window !== 'undefined' ? window.innerHeight : 720;
    this.userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
  }

  private normalizeParticipantCode(code: string): string {
    return code.trim().toUpperCase();
  }

  private generateUUID(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'session-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
  }
}
