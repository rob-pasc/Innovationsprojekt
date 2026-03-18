import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Trophy, Loader2, Mail } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/useGameStore';
import type { GameQuestion } from '../data/questions';

interface PhishingDetectiveGameProps {
  questions: GameQuestion[];
}

export default function PhishingDetectiveGame({ questions }: PhishingDetectiveGameProps) {
  const { phase, score, totalRounds, currentRound, answers, isSubmitting, error, recordAnswer, nextRound, submitGame } =
    useGameStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const lastAnswer = answers[answers.length - 1]; // true = correct, false = wrong

  const handleAnswer = (isPhishing: boolean) => {
    if (!currentQuestion) return;
    const wasCorrect = isPhishing === currentQuestion.isPhishing;
    recordAnswer(wasCorrect);
  };

  const handleNext = () => {
    setCurrentQuestionIndex(i => i + 1);
    nextRound();
  };

  // ── Playing Phase ─────────────────────────────────────────────────────────
  if (phase === 'playing' && currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto px-4">
        {/* Progress */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            Round {currentRound + 1} of {totalRounds}
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: totalRounds }).map((_, i) => (
              <div
                key={i}
                className={`h-2 w-8 rounded-full transition-colors ${
                  i < answers.length
                    ? answers[i]
                      ? 'bg-green-500'
                      : 'bg-destructive'
                    : i === currentRound
                      ? 'bg-primary'
                      : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Email Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -80, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="p-6 space-y-4 border-2">
              {/* Email header */}
              <div className="flex items-start gap-3 pb-4 border-b border-border">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-0.5">From</p>
                  <p className="text-sm font-mono font-medium text-foreground truncate">
                    {currentQuestion.scenario.from}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">Subject</p>
                  <p className="text-sm font-semibold text-foreground">
                    {currentQuestion.scenario.subject}
                  </p>
                </div>
              </div>

              {/* Email body */}
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {currentQuestion.scenario.body}
              </p>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Decision buttons */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <Button
            variant="outline"
            size="lg"
            className="h-14 text-base font-semibold border-2 hover:border-green-500 hover:bg-green-500/10 hover:text-green-600"
            onClick={() => handleAnswer(false)}
          >
            ✅ Real Email
          </Button>
          <Button
            variant="destructive"
            size="lg"
            className="h-14 text-base font-semibold"
            onClick={() => handleAnswer(true)}
          >
            🎣 Phishing!
          </Button>
        </div>
      </div>
    );
  }

  // ── Feedback Phase ────────────────────────────────────────────────────────
  if (phase === 'feedback' && currentQuestion) {
    const isCorrect = lastAnswer;

    return (
      <div className="max-w-2xl mx-auto px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key="feedback"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card className={`p-6 space-y-4 border-2 ${isCorrect ? 'border-green-500/50' : 'border-destructive/50'}`}>
              {/* Result badge */}
              <div className={`flex items-center gap-2 ${isCorrect ? 'text-green-600' : 'text-destructive'}`}>
                {isCorrect ? (
                  <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 flex-shrink-0" />
                )}
                <p className="text-lg font-bold">
                  {isCorrect ? 'Correct!' : `Not quite — this was ${currentQuestion.isPhishing ? 'phishing' : 'legitimate'}`}
                </p>
              </div>

              {/* Explanation */}
              <p className="text-sm text-foreground leading-relaxed">{currentQuestion.explanation}</p>

              {/* Red flags */}
              {currentQuestion.redFlags && currentQuestion.redFlags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Red Flags
                  </p>
                  <ul className="space-y-1">
                    {currentQuestion.redFlags.map((flag, i) => (
                      <li key={i} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-destructive mt-0.5 flex-shrink-0">⚑</span>
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        <Button className="w-full mt-4" size="lg" onClick={handleNext}>
          {currentRound + 1 >= totalRounds ? 'See Results' : 'Next Round →'}
        </Button>
      </div>
    );
  }

  // ── Complete Phase ────────────────────────────────────────────────────────
  if (phase === 'complete') {
    const percentage = Math.round((score / totalRounds) * 100);

    return (
      <div className="max-w-md mx-auto px-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          <Card className="p-8 text-center space-y-6">
            <Trophy className="w-14 h-14 text-yellow-500 mx-auto" />

            <div>
              <p className="text-3xl font-bold text-foreground">{score} / {totalRounds}</p>
              <p className="text-muted-foreground mt-1">emails correctly classified</p>
            </div>

            {/* Score bar */}
            <div className="w-full bg-muted rounded-full h-3">
              <motion.div
                className="bg-primary h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.6, delay: 0.2 }}
              />
            </div>
            <p className="text-sm text-muted-foreground">{percentage}% accuracy</p>

            {/* Per-round results */}
            <div className="flex justify-center gap-2">
              {answers.map((correct, i) => (
                <div
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                    correct ? 'bg-green-500' : 'bg-destructive'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={submitGame}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : (
                '⚡ Submit & Earn XP'
              )}
            </Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return null;
}
