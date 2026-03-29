import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ZoneAttempt {
  zoneId: string;
  selectedOption: string;
  wasCorrect: boolean;
  timestamp: string; // ISO 8601
}

interface PhishingForensicsState {
  // Session metadata
  gameModuleId: string | null;
  startedAt: string | null;
  completedAt: string | null;

  // Zone interaction log
  zoneAttempts: ZoneAttempt[];
  foundZoneIds: string[]; // correctly identified zone IDs

  // Verdict
  verdict: 'LEGITIM' | 'SCHÄDLICH' | null;
  verdictCorrect: boolean | null;

  // Results
  cluesFound: number;
  score: number;   // 0–100
  xpEarned: number;

  // Actions
  initGame: (gameModuleId: string) => void;
  recordZoneAttempt: (zoneId: string, selectedOption: string, wasCorrect: boolean) => void;
  submitVerdict: (verdict: 'LEGITIM' | 'SCHÄDLICH', isCorrect: boolean) => void;
  completeGame: (score: number, xpEarned: number) => void;
  reset: () => void;
}

// ── Initial State ─────────────────────────────────────────────────────────────

const INITIAL_STATE = {
  gameModuleId: null,
  startedAt: null,
  completedAt: null,
  zoneAttempts: [] as ZoneAttempt[],
  foundZoneIds: [] as string[],
  verdict: null as PhishingForensicsState['verdict'],
  verdictCorrect: null,
  cluesFound: 0,
  score: 0,
  xpEarned: 0,
};

// ── Store ─────────────────────────────────────────────────────────────────────
// Persisted to sessionStorage — survives page refreshes within the session
// but does not bleed across separate browser sessions.

export const usePhishingForensicsStore = create<PhishingForensicsState>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      initGame: (gameModuleId: string) => {
        set({ ...INITIAL_STATE, gameModuleId, startedAt: new Date().toISOString() });
      },

      recordZoneAttempt: (zoneId: string, selectedOption: string, wasCorrect: boolean) => {
        const attempt: ZoneAttempt = {
          zoneId,
          selectedOption,
          wasCorrect,
          timestamp: new Date().toISOString(),
        };
        set(state => ({
          zoneAttempts: [...state.zoneAttempts, attempt],
          foundZoneIds: wasCorrect ? [...state.foundZoneIds, zoneId] : state.foundZoneIds,
          cluesFound: wasCorrect ? state.cluesFound + 1 : state.cluesFound,
        }));
      },

      submitVerdict: (verdict: 'LEGITIM' | 'SCHÄDLICH', isCorrect: boolean) => {
        set({ verdict, verdictCorrect: isCorrect });
      },

      completeGame: (score: number, xpEarned: number) => {
        set({ score, xpEarned, completedAt: new Date().toISOString() });
      },

      reset: () => {
        set(INITIAL_STATE);
      },
    }),
    {
      name: 'phishing-forensics-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

// ── Snapshot Helper ───────────────────────────────────────────────────────────
// Returns only the serializable state fields — safe to send to the backend
// as `stateData`. Excludes all action functions.

export function getPhishingForensicsSnapshot(): object {
  const {
    gameModuleId, startedAt, completedAt,
    zoneAttempts, foundZoneIds,
    verdict, verdictCorrect,
    cluesFound, score, xpEarned,
  } = usePhishingForensicsStore.getState();
  return {
    gameModuleId, startedAt, completedAt,
    zoneAttempts, foundZoneIds,
    verdict, verdictCorrect,
    cluesFound, score, xpEarned,
  };
}
