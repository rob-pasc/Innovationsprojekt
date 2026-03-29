import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { recoveryAPI } from '@/lib/api';

interface RecoveryData {
  templateName: string;
  templateSubject: string;
  senderName: string;
  tags: string[];
  difficultyScore: number;
  clickedAt: string | null;
}

/**
 * AlertPage Component
 *
 * Displays a warning when user clicks on a phishing link from Phase 2 (tracking).
 * Fetches recovery data for the token to show template-specific red flags.
 *
 * Route: /alert/{token}
 * Flow: TrackController redirects here → User sees warning → Clicks "Start Training" → Goes to game page
 */
export default function AlertPage() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);

  useEffect(() => {
    if (!token) return;
    recoveryAPI.getRecoveryData(token)
      .then(res => setRecoveryData(res.data))
      .catch(() => { /* non-critical — page still works without recovery data */ });
  }, [token]);

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md p-8 text-center">
          <h1 className="text-xl font-bold text-destructive mb-2">Invalid Link</h1>
          <p className="text-sm text-muted-foreground mb-6">
            The phishing alert link is invalid or has expired.
          </p>
          <Button onClick={() => navigate('/dashboard')} variant="outline">
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const handleStartTraining = () => {
    setIsLoading(true);
    // Navigate to the phishing detective game with the token
    navigate(`/academy/phishing/game?token=${token}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/5 flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 shadow-lg border-destructive/20 bg-card">
          {/* Alert Icon with animation */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex justify-center mb-6"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
          </motion.div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-center text-foreground mb-3">
            Phishing Alert
          </h1>

          {/* Subheading */}
          <p className="text-center text-muted-foreground mb-6 text-sm">
            You just opened a potentially malicious link
          </p>

          {/* Explanation Card */}
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 mb-4">
            <p className="text-sm text-foreground leading-relaxed">
              {recoveryData ? (
                <>
                  You fell for <span className="font-semibold">{recoveryData.templateName}</span> — a simulated phishing email designed to test your media literacy skills.
                </>
              ) : (
                <>This was a simulated phishing email designed to test your media literacy skills.</>
              )}
              <span className="block mt-2 font-semibold text-primary">
                Don't worry — this is a learning opportunity!
              </span>
            </p>
          </div>

          {/* Spoofed email header preview */}
          {recoveryData && (
            <div className="bg-muted/50 border border-border rounded-lg p-3 mb-8 text-xs font-mono space-y-1">
              <p className="text-muted-foreground">
                <span className="text-foreground font-semibold">From: </span>
                {recoveryData.senderName}
              </p>
              <p className="text-muted-foreground">
                <span className="text-foreground font-semibold">Subject: </span>
                {recoveryData.templateSubject}
              </p>
            </div>
          )}

          {/* Red flags from the template */}
          {recoveryData && recoveryData.tags.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Red flags in that email
              </h2>
              <div className="flex flex-wrap gap-2">
                {recoveryData.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive"
                  >
                    {tag.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* What Happened Section */}
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-foreground mb-3">What just happened:</h2>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <motion.li
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex gap-2"
              >
                <span className="text-destructive font-bold">•</span>
                <span>You clicked on a link that appeared legitimate</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-2"
              >
                <span className="text-destructive font-bold">•</span>
                <span>We detected and logged this interaction</span>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex gap-2"
              >
                <span className="text-destructive font-bold">•</span>
                <span>Now it's time to learn why you were targeted</span>
              </motion.li>
            </ul>
          </div>

          {/* Key Message */}
          <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-8">
            <p className="text-xs text-foreground text-center">
              <span className="font-semibold">Remember:</span> Falling for phishing is normal. 
              Real attackers use sophisticated tactics. The good news? You can learn to spot them.
            </p>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleStartTraining}
            disabled={isLoading}
            size="lg"
            className="w-full gap-2 font-semibold"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading training module...
              </>
            ) : (
              <>
                Start Training Module
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          {/* Optional: Skip link */}
          <button
            onClick={() => navigate('/dashboard')}
            disabled={isLoading}
            className="w-full mt-3 text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Skip for now
          </button>
        </Card>

        {/* Reassurance footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          This is a safe, controlled environment. No real damage occurred.
        </p>
      </motion.div>
    </div>
  );
}