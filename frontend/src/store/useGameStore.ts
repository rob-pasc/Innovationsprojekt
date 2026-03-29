import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';

// ── Types ─────────────────────────────────────────────────────────────────────

interface GameConfig {
  tags: string[];
  difficultyScore: number;
  userLevel: number;
  templateName: string;
  quizModuleId: string;      // GameModule id for PhishingEmailQuiz mode
  forensicsModuleId: string; // GameModule id for PhishingEmailForensics mode
}

interface GameManifest {
  gameType: string;
  version: string;
  config: GameConfig;
}

export interface GameResult {
  xpAwarded: number;
  totalPoints: number;
  expLvl: number;
  isRemediated: boolean;
  message: string;
}

// 'complete'  — game logic done, awaiting submission (quiz results screen)
// 'submitted' — API call succeeded, navigating to dashboard
type GamePhase = 'loading' | 'briefing' | 'selection' | 'playing' | 'feedback' | 'complete' | 'submitted';
type GameMode = 'phishing-email-quiz' | 'phishing-forensics';

interface GameStore {
  // Session data
  token: string | null;
  gameModuleId: string | null;
  manifest: GameManifest | null;

  // Game progress
  currentRound: number;    // 0-indexed
  totalRounds: number;     // constant 5
  score: number;           // correct answer count
  answers: boolean[];      // per-round correctness

  // UI state
  phase: GamePhase;
  selectedGameMode: GameMode | null;
  isSubmitting: boolean;
  error: string | null;

  // Result — populated after saveGame() succeeds
  gameResult: GameResult | null;

  // Actions
  initSession: (token: string) => Promise<void>;
  startGame: () => void;
  selectGameMode: (mode: GameMode) => void;
  recordAnswer: (wasCorrect: boolean) => void;
  nextRound: () => void;
  // Single submission action used by both game modes.
  // Makes the API call, stores the result, flushes module stores.
  // Does NOT change phase — caller decides when to transition.
  saveGame: (rawScore: number, stateData?: object) => Promise<GameResult | null>;
  // Transitions to 'submitted', triggering the dashboard redirect.
  markComplete: () => void;
  reset: () => void;
}

// ── Initial State ─────────────────────────────────────────────────────────────

const INITIAL_STATE = {
  token: null,
  gameModuleId: null,
  manifest: null,
  currentRound: 0,
  totalRounds: 5,
  score: 0,
  answers: [] as boolean[],
  phase: 'loading' as GamePhase,
  selectedGameMode: null,
  isSubmitting: false,
  error: null,
  gameResult: null,
};

// ── Store ─────────────────────────────────────────────────────────────────────
// No `persist` middleware — game session state is intentionally ephemeral.

export const useGameStore = create<GameStore>()((set, get) => ({
  ...INITIAL_STATE,

  initSession: async (token: string) => {
    set({ token, phase: 'loading', error: null });
    try {
      const { recoveryAPI } = await import('@/lib/api');
      const response = await recoveryAPI.getGameManifest(token);
      set({ manifest: response.data, phase: 'briefing' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load game data.';
      set({ error: message, phase: 'loading' });
    }
  },

  startGame: () => {
    set({ phase: 'selection' });
  },

  selectGameMode: (mode: GameMode) => {
    const { manifest } = get();
    const gameModuleId = mode === 'phishing-email-quiz'
      ? manifest?.config.quizModuleId
      : manifest?.config.forensicsModuleId;
    set({ selectedGameMode: mode, gameModuleId: gameModuleId ?? null, phase: 'playing' });
  },

  recordAnswer: (wasCorrect: boolean) => {
    set(state => ({
      answers: [...state.answers, wasCorrect],
      score: wasCorrect ? state.score + 1 : state.score,
      phase: 'feedback',
    }));
  },

  nextRound: () => {
    set(state => {
      const nextRound = state.currentRound + 1;
      return {
        currentRound: nextRound,
        phase: nextRound >= state.totalRounds ? 'complete' : 'playing',
      };
    });
  },

  saveGame: async (rawScore: number, stateData?: object) => {
    const { token, gameModuleId } = get();
    if (!token || !gameModuleId) return null;

    set({ isSubmitting: true, error: null });
    try {
      const { recoveryAPI } = await import('@/lib/api');
      const response = await recoveryAPI.saveGameProgress(token, rawScore, gameModuleId, stateData);
      const result: GameResult = response.data;
      set({ gameResult: result, isSubmitting: false });

      // Sync XP/level into the persisted auth store so the dashboard is up to date
      useAuthStore.getState().updateUser({
        totalPoints: result.totalPoints,
        expLvl: result.expLvl,
      });

      // Data is safely in the DB — flush both module stores from sessionStorage
      const { usePhishingForensicsStore } = await import('./usePhishingForensicsStore');
      usePhishingForensicsStore.getState().reset();
      const { usePhishingQuizStore } = await import('./usePhishingQuizStore');
      usePhishingQuizStore.getState().reset();

      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save game progress.';
      set({ error: message, isSubmitting: false });
      return null;
    }
  },

  markComplete: () => {
    set({ phase: 'submitted' });
  },

  reset: () => {
    set(INITIAL_STATE);
  },
}));
