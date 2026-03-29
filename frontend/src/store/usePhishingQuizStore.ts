import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface QuizRound {
  roundIndex: number;
  questionId: string;
  userAnsweredPhishing: boolean;
  wasCorrect: boolean;
  timestamp: string; // ISO 8601
}

interface PhishingQuizState {
  // Session metadata
  gameModuleId: string | null;
  startedAt: string | null;
  completedAt: string | null;

  // Per-round log
  rounds: QuizRound[];

  // Results
  score: number;    // correct answer count
  totalRounds: number;
  accuracy: number; // 0–100

  // Actions
  initGame: (gameModuleId: string, totalRounds: number) => void;
  recordRound: (
    roundIndex: number,
    questionId: string,
    userAnsweredPhishing: boolean,
    wasCorrect: boolean,
  ) => void;
  completeGame: (accuracy: number) => void;
  reset: () => void;
}

// ── Initial State ─────────────────────────────────────────────────────────────

const INITIAL_STATE = {
  gameModuleId: null,
  startedAt: null,
  completedAt: null,
  rounds: [] as QuizRound[],
  score: 0,
  totalRounds: 5,
  accuracy: 0,
};

// ── Store ─────────────────────────────────────────────────────────────────────
// Persisted to sessionStorage — survives page refreshes within the session
// but does not bleed across separate browser sessions.

export const usePhishingQuizStore = create<PhishingQuizState>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      initGame: (gameModuleId: string, totalRounds: number) => {
        set({ ...INITIAL_STATE, gameModuleId, totalRounds, startedAt: new Date().toISOString() });
      },

      recordRound: (
        roundIndex: number,
        questionId: string,
        userAnsweredPhishing: boolean,
        wasCorrect: boolean,
      ) => {
        const round: QuizRound = {
          roundIndex,
          questionId,
          userAnsweredPhishing,
          wasCorrect,
          timestamp: new Date().toISOString(),
        };
        set(state => ({
          rounds: [...state.rounds, round],
          score: wasCorrect ? state.score + 1 : state.score,
        }));
      },

      completeGame: (accuracy: number) => {
        set({ accuracy, completedAt: new Date().toISOString() });
      },

      reset: () => {
        set(INITIAL_STATE);
      },
    }),
    {
      name: 'phishing-quiz-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

// ── Snapshot Helper ───────────────────────────────────────────────────────────
// Returns only the serializable state fields — safe to send to the backend
// as `stateData`. Excludes all action functions.

export function getPhishingQuizSnapshot(): object {
  const {
    gameModuleId, startedAt, completedAt,
    rounds, score, totalRounds, accuracy,
  } = usePhishingQuizStore.getState();
  return {
    mode: 'phishing-email-quiz',
    gameModuleId, startedAt, completedAt,
    rounds, score, totalRounds, accuracy,
  };
}
