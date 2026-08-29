import { AssessmentResponse } from '../types/assessment';
import { SessionData, SessionMode } from '../types/telemetry';

const LEGACY_GAMEPLAY_STATE_KEY = 'apulab_session_state';
const BUILD_VERSION = '0.1.0-web-pilot';
const SCHEMA_VERSION = '2026-08-sprint0';

export interface ChallengeResult {
  challengeId: string;
  attempts: number;
  completed: boolean;
  hintsUsed: boolean;
  durationSeconds: number;
}

export class GameState {
  private static instance: GameState;

  public participantCode: string | null = null;
  public participantId: string | null = null;
  public sessionMode: SessionMode = 'demo';
  public sessionId: string = '';
  public readonly buildVersion: string = BUILD_VERSION;
  public readonly schemaVersion: string = SCHEMA_VERSION;
  public currentScene: string = 'MainMenuScene';
  public currentLevel: number = 0;
  public currentChallenge: string = '';
  public mission01VoltageStep: 0 | 1 | 2 | 3 = 0;
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
    this.removeLegacyRecoverableState();
  }

  public static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }

  public static clearLegacyRecoverableState(): void {
    try {
      localStorage.removeItem(LEGACY_GAMEPLAY_STATE_KEY);
    } catch {
      // Runtime-only gameplay state must not depend on persistent storage availability.
    }
  }

  public startNewSession(mode: SessionMode, participantCode: string | null, participantId: string | null = null): void {
    this.resetRuntimeMetadata();
    this.sessionId = this.generateUUID();
    this.sessionMode = mode;
    this.participantCode = mode === 'study' ? this.normalizeParticipantCode(participantCode || '') : null;
    this.participantId = mode === 'study' ? participantId : null;
    this.currentScene = 'OpportunityIntroScene';
    this.currentLevel = 0;
    this.currentChallenge = 'INTRO_STORY';
    this.mission01VoltageStep = 0;
    this.completedChallenges = [];
    this.challengeResults = {};
    this.status = 'in_progress';
    this.completedAt = '';
  }

  public setParticipantCode(code: string): void {
    this.sessionMode = 'study';
    this.participantCode = this.normalizeParticipantCode(code);
  }

  public setDemoMode(): void {
    this.sessionMode = 'demo';
    this.participantCode = null;
    this.participantId = null;
  }

  public updateProgress(currentScene: string, currentLevel: number, currentChallenge: string): void {
    this.currentScene = currentScene;
    this.currentLevel = currentLevel;
    this.currentChallenge = currentChallenge;
  }

  public setMission01VoltageStep(step: 0 | 1 | 2 | 3): void {
    this.mission01VoltageStep = step;
  }

  public addPretestAnswer(answer: AssessmentResponse): void {
    this.pretestAnswers.push(answer);
  }

  public addPosttestAnswer(answer: AssessmentResponse): void {
    this.posttestAnswers.push(answer);
  }

  public recordChallengeResult(result: ChallengeResult): void {
    this.challengeResults[result.challengeId] = result;
    if (!this.completedChallenges.includes(result.challengeId)) {
      this.completedChallenges.push(result.challengeId);
    }
    this.currentChallenge = result.challengeId;
  }

  public completeSession(): void {
    this.completedAt = new Date().toISOString();
    this.status = 'completed';
    this.currentScene = 'FinalScene';
  }

  public getSessionData(): SessionData {
    return {
      session_id: this.sessionId,
      participant_id: this.participantId,
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

  private removeLegacyRecoverableState(): void {
    GameState.clearLegacyRecoverableState();
  }

  private generateUUID(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'session-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
  }
}
