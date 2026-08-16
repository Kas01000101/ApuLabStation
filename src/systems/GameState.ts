import { AssessmentResponse } from '../types/assessment';
import { SessionData } from '../types/telemetry';

export interface ChallengeResult {
  challengeId: string;
  attempts: number;
  completed: boolean;
  hintsUsed: boolean;
  durationSeconds: number;
}

export class GameState {
  private static instance: GameState;

  public participantCode: string = '';
  public sessionId: string = '';
  public readonly buildVersion: string = '0.1.0-web-pilot';
  public currentScene: string = 'MainMenuScene';
  public currentLevel: number = 0;
  public currentChallenge: string = '';
  public pretestAnswers: AssessmentResponse[] = [];
  public posttestAnswers: AssessmentResponse[] = [];
  public challengeResults: Record<string, ChallengeResult> = {};
  public startedAt: string = '';
  public finishedAt: string = '';
  public status: 'in_progress' | 'completed' = 'in_progress';
  public screenWidth: number = 0;
  public screenHeight: number = 0;
  public userAgent: string = '';

  private constructor() {
    this.sessionId = this.generateUUID();
    this.startedAt = new Date().toISOString();
    this.screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1280;
    this.screenHeight = typeof window !== 'undefined' ? window.innerHeight : 720;
    this.userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
  }

  public static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }

  public setParticipantCode(code: string): void {
    this.participantCode = code.trim().toUpperCase();
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
    this.persistSessionState();
  }

  public completeSession(): void {
    this.finishedAt = new Date().toISOString();
    this.status = 'completed';
    this.persistSessionState();
  }

  public getSessionData(): SessionData {
    return {
      session_id: this.sessionId,
      participant_code: this.participantCode,
      build_version: this.buildVersion,
      started_at: this.startedAt,
      finished_at: this.finishedAt || undefined,
      status: this.status,
      screen_width: this.screenWidth,
      screen_height: this.screenHeight,
      user_agent: this.userAgent
    };
  }

  public persistSessionState(): void {
    try {
      const stateObj = {
        session_metadata: this.getSessionData(),
        current_scene: this.currentScene,
        current_level: this.currentLevel,
        current_challenge: this.currentChallenge,
        pretest_answers: this.pretestAnswers,
        posttest_answers: this.posttestAnswers,
        challenge_results: this.challengeResults
      };
      localStorage.setItem('apulab_session_state', JSON.stringify(stateObj));
    } catch (e) {
      console.warn('Failed to save session state to localStorage', e);
    }
  }

  private generateUUID(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'session-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
  }
}
