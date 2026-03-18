import { create } from 'zustand';

// ── Types ─────────────────────────────────────────────────────────────────────

interface GameConfig {
  tags: string[];
  difficultyScore: number;
  userLevel: number;
  templateName: string;
}

interface GameManifest {
  gameType: string;
  version: string;
  config: GameConfig;
}

interface GameResult {
  xpAwarded: number;
  totalPoints: number;
  expLvl: number;
  isRemediated: boolean;
  message: string;
}

type GamePhase = 'loading' | 'briefing' | 'playing' | 'feedback' | 'complete';

interface GameStore {
  // Session data
  token: string | null;
  manifest: GameManifest | null;

  // Game progress
  currentRound: number;    // 0-indexed
  totalRounds: number;     // constant 5
  score: number;           // correct answer count
  answers: boolean[];      // per-round correctness

  // UI state
  phase: GamePhase;
  isSubmitting: boolean;
  error: string | null;

  // Result (populated after PUT /api/games/savegame)
  gameResult: GameResult | null;

  // Actions
  initSession: (token: string) => Promise<void>;
  startGame: () => void;
  recordAnswer: (wasCorrect: boolean) => void;
  nextRound: () => void;
  submitGame: () => Promise<void>;
  reset: () => void;
}

// ── Initial State ─────────────────────────────────────────────────────────────

const INITIAL_STATE = {
  token: null,
  manifest: null,
  currentRound: 0,
  totalRounds: 5,
  score: 0,
  answers: [] as boolean[],
  phase: 'loading' as GamePhase,
  isSubmitting: false,
  error: null,
  gameResult: null,
};

// ── Store ─────────────────────────────────────────────────────────────────────
// No `persist` middleware — game state is intentionally ephemeral.

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
    set({ phase: 'playing' });
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

  submitGame: async () => {
    const { token, score, totalRounds } = get();
    if (!token) return;

    set({ isSubmitting: true, error: null });
    try {
      const finalScore = Math.round((score / totalRounds) * 100);
      const { recoveryAPI } = await import('@/lib/api');
      const response = await recoveryAPI.saveGameProgress(token, finalScore);
      set({ gameResult: response.data, isSubmitting: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save game progress.';
      set({ error: message, isSubmitting: false });
    }
  },

  reset: () => {
    set(INITIAL_STATE);
  },
}));
