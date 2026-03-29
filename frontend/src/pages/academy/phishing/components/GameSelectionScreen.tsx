import { motion } from 'framer-motion';
import { Clock, Zap, Mail, Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type GameMode = 'phishing-email-quiz' | 'phishing-forensics';

interface GameOption {
  mode: GameMode;
  icon: React.ReactNode;
  title: string;
  description: string;
  estimatedTime: string;
  maxXP: number;
  tags: string[];
}

const GAME_OPTIONS: GameOption[] = [
  {
    mode: 'phishing-email-quiz',
    icon: <Mail className="w-6 h-6 text-primary" />,
    title: 'Email Detective Quiz',
    description:
      'You\'ll be shown 5 email scenarios. For each one, decide: is it a real email or a phishing attempt?',
    estimatedTime: '~3 min',
    maxXP: 350,
    tags: ['Quick', 'Multiple choice'],
  },
  {
    mode: 'phishing-forensics',
    icon: <Search className="w-6 h-6 text-primary" />,
    title: 'Email Forensics Lab',
    description:
      'Examine one suspicious email up close. Click on anything that looks wrong, identify the threat type, and submit your verdict.',
    estimatedTime: '~5 min',
    maxXP: 350,
    tags: ['Immersive', 'Click & analyse'],
  },
];

interface Props {
  onSelect: (mode: GameMode) => void;
}

export default function GameSelectionScreen({ onSelect }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl space-y-6"
      >
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Choose Your Training Mode</h1>
          <p className="text-sm text-muted-foreground">
            Both modes award the same XP — pick whichever fits your style.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GAME_OPTIONS.map((option, i) => (
            <motion.div
              key={option.mode}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.08 }}
            >
              <Card className="p-6 flex flex-col gap-4 h-full hover:border-primary/40 transition-colors">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {option.icon}
                  </div>
                  <h2 className="font-semibold text-foreground leading-tight">{option.title}</h2>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground flex-1">{option.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {option.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {option.estimatedTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    up to {option.maxXP} XP
                  </span>
                </div>

                <Button className="w-full" onClick={() => onSelect(option.mode)}>
                  Play this mode →
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
