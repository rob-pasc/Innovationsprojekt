import { useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';
import type React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/useGameStore';
import PhishingDetectiveGame from './components/PhishingDetectiveGame';
import GameSelectionScreen from './components/GameSelectionScreen';
import DetectiveStoryGame from './components/DetectiveStoryGame';
import { selectQuestionsForTags } from './data/questions';
import type { GameQuestion } from './data/questions';

// ── Game Registry ─────────────────────────────────────────────────────────────
// Maps gameType strings returned by the manifest endpoint to concrete components.
// To add a new game: implement the component and add an entry here.

const GAME_REGISTRY: Record<string, React.ComponentType<{ questions: GameQuestion[] }>> = {
  'phishing-detective': PhishingDetectiveGame,
  // 'deepfake-scanner': DeepfakeGame,  ← plug in future games here
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DetectiveGamePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const {
    phase, manifest, gameResult, error,
    selectedGameMode,
    initSession, startGame, selectGameMode, submitGameWithRawScore, reset,
  } = useGameStore();

  // Derive questions from manifest tags once manifest is loaded
  const questions = useMemo(
    () => (manifest ? selectQuestionsForTags(manifest.config.tags, 5) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [manifest?.config.tags.join(',')]
  );

  // Resolve game component from registry (used by quiz mode)
  const GameComponent = manifest ? GAME_REGISTRY[manifest.gameType] : undefined;

  // Ref-based guard — mutations don't trigger re-renders so the timer is never cancelled prematurely
  const navigatedRef = useRef(false);

  // Init on mount, cleanup on unmount
  useEffect(() => {
    if (!token) return;
    initSession(token);
    return () => reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Navigate to dashboard 3 s after phase becomes 'complete'.
  // Using a ref (not state) so that subsequent store updates (e.g. gameResult
  // changing from placeholder → real API data) don't re-run the effect and
  // cancel the timer via cleanup.
  useEffect(() => {
    if (phase !== 'complete' || navigatedRef.current) return;
    navigatedRef.current = true;
    const t = setTimeout(() => {
      navigate('/dashboard', { state: { levelUp: useGameStore.getState().gameResult } });
    }, 3000);
    return () => clearTimeout(t);
  }, [phase, navigate]);

  // Called when DetectiveStoryGame completes — submits the raw 0-100 score
  const handleStoryComplete = (score: number) => {
    submitGameWithRawScore(score);
  };


  // ── No token ────────────────────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-sm w-full text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
          <p className="font-semibold text-foreground">Invalid Session</p>
          <p className="text-sm text-muted-foreground">No training token was provided.</p>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (phase === 'loading' && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Preparing your training…</p>
        </div>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-sm w-full text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
          <p className="font-semibold text-foreground">Something went wrong</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // ── Briefing ────────────────────────────────────────────────────────────────
  if (phase === 'briefing' && manifest) {
    const { config } = manifest;

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg"
        >
          <Card className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Detective Training</h1>
                <p className="text-sm text-muted-foreground">Phishing Awareness Exercise</p>
              </div>
            </div>

            {/* What happened */}
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 space-y-2">
              <p className="text-xs font-semibold text-destructive uppercase tracking-wide">
                You fell for
              </p>
              <p className="text-sm font-medium text-foreground">{config.templateName}</p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Red flags in that email
              </p>
              <div className="flex flex-wrap gap-2">
                {config.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground"
                  >
                    {tag.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-lg font-bold text-foreground">
                  {'⭐'.repeat(config.difficultyScore)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Difficulty</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-lg font-bold text-foreground">Level {config.userLevel}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Your level</p>
              </div>
            </div>

            {/* Instructions */}
            <p className="text-sm text-muted-foreground text-center">
              Choose a training mode on the next screen to earn back your points.
            </p>

            <Button className="w-full" size="lg" onClick={startGame}>
              Choose Training Mode 🚀
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  // ── Game Mode Selection ──────────────────────────────────────────────────────
  if (phase === 'selection') {
    return <GameSelectionScreen onSelect={selectGameMode} />;
  }

  // ── Playing / Feedback / Complete ───────────────────────────────────────────
  return (
    <div className={selectedGameMode === 'detective-story' ? '' : 'min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8'}>
      {phase === 'complete' && gameResult && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-muted-foreground mb-6"
        >
          Redirecting to dashboard in a moment…
        </motion.p>
      )}
      {selectedGameMode === 'detective-story'
        ? <DetectiveStoryGame onComplete={handleStoryComplete} />
        : GameComponent && <GameComponent questions={questions} />
      }
    </div>
  );
}
