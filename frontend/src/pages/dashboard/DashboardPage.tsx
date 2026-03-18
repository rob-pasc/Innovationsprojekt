import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Zap,
  TrendingUp,
  Flame,
  BookOpen,
  Play,
  ChevronRight,
  Trophy,
  Target,
  Clock,
} from 'lucide-react';

/**
 * DashboardPage Component
 * 
 * User dashboard with:
 * - Level, XP, Points, Streak stats
 * - Game library (available challenges)
 * - Resume game option
 * - Recent activity
 * - Recommended next challenge
 */

interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: number;
  category: 'phishing' | 'deepfake' | 'media-literacy';
  estimatedTime: number;
  xpReward: number;
  status: 'available' | 'locked' | 'completed';
}

const AVAILABLE_GAMES: Game[] = [
  {
    id: 'phishing-sim-01',
    title: 'Phishing Basics',
    description: 'Identify obvious phishing red flags in email',
    icon: '🎣',
    difficulty: 1,
    category: 'phishing',
    estimatedTime: 5,
    xpReward: 50,
    status: 'available',
  },
  {
    id: 'phishing-sim-02',
    title: 'Advanced Phishing',
    description: 'Spot sophisticated phishing attempts',
    icon: '🎣',
    difficulty: 3,
    category: 'phishing',
    estimatedTime: 10,
    xpReward: 150,
    status: 'available',
  },
  {
    id: 'deepfake-det-01',
    title: 'Image Detection',
    description: 'Identify manipulated and AI-generated images',
    icon: '🖼️',
    difficulty: 2,
    category: 'deepfake',
    estimatedTime: 8,
    xpReward: 100,
    status: 'available',
  },
  {
    id: 'deepfake-det-02',
    title: 'Video Analysis',
    description: 'Spot deepfakes and video manipulation',
    icon: '🎬',
    difficulty: 3,
    category: 'deepfake',
    estimatedTime: 12,
    xpReward: 150,
    status: 'locked',
  },
  {
    id: 'media-lit-01',
    title: 'Source Verification',
    description: 'Learn to verify content sources and claims',
    icon: '📰',
    difficulty: 2,
    category: 'media-literacy',
    estimatedTime: 7,
    xpReward: 100,
    status: 'available',
  },
];

const RECENT_ACTIVITY = [
  { date: 'Today', activity: 'Completed Phishing Basics', xp: 50 },
  { date: 'Yesterday', activity: 'Completed Image Detection', xp: 100 },
  { date: '2 days ago', activity: 'Started learning journey', xp: 0 },
];

interface SaveGameResult {
  xpAwarded: number;
  totalPoints: number;
  expLvl: number;
  isRemediated: boolean;
  message: string;
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Show a celebration banner when returning from a completed recovery training session
  const location = useLocation();
  const levelUpResult = location.state?.levelUp as SaveGameResult | undefined;
  const [showLevelUp, setShowLevelUp] = useState(!!levelUpResult);

  if (!user) return null;

  // Filter games by category if selected
  const displayGames = selectedCategory
    ? AVAILABLE_GAMES.filter((g) => g.category === selectedCategory)
    : AVAILABLE_GAMES;

  const completedGames = AVAILABLE_GAMES.filter((g) => g.status === 'completed');
  const nextRecommendedGame = AVAILABLE_GAMES.find((g) => g.status === 'available');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">

      {/* ── Level-Up Banner ── shown after completing a recovery training session */}
      {showLevelUp && levelUpResult && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 right-4 z-50 max-w-sm w-full"
        >
          <Card className="p-4 border-primary bg-primary/10 shadow-lg">
            <div className="flex items-start gap-3">
              <Trophy className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground">Training Complete! 🎉</p>
                <p className="text-xs text-muted-foreground mt-1">
                  +{levelUpResult.xpAwarded} XP earned — you are now Level {levelUpResult.expLvl}
                </p>
              </div>
              <button
                onClick={() => setShowLevelUp(false)}
                className="text-muted-foreground hover:text-foreground text-xs leading-none mt-0.5"
              >
                ✕
              </button>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
            Welcome back, {user.email.split('@')[0]}! 👋
          </h1>
          <p className="text-muted-foreground">Keep learning and master media literacy</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Level"
            value={user.expLvl}
            color="bg-blue-500"
          />
          <StatCard
            icon={<Zap className="w-5 h-5" />}
            label="XP"
            value={user.totalPoints}
            color="bg-yellow-500"
          />
          <StatCard
            icon={<Flame className="w-5 h-5" />}
            label="Streak"
            value={7}
            color="bg-red-500"
            suffix=" days"
          />
          <StatCard
            icon={<Trophy className="w-5 h-5" />}
            label="Completed"
            value={completedGames.length}
            color="bg-green-500"
            suffix=" games"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Recommended & Resume */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recommended Challenge */}
            {nextRecommendedGame && (
              <Card className="overflow-hidden border border-border">
                <div className="bg-gradient-to-r from-primary to-primary/70 px-6 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary-foreground" />
                    <span className="text-xs font-semibold text-primary-foreground uppercase">
                      Recommended Next
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-primary-foreground mb-1">
                    {nextRecommendedGame.title}
                  </h2>
                  <p className="text-sm text-primary-foreground/90">
                    {nextRecommendedGame.description}
                  </p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {nextRecommendedGame.estimatedTime}
                      </p>
                      <p className="text-xs text-muted-foreground">minutes</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {nextRecommendedGame.xpReward}
                      </p>
                      <p className="text-xs text-muted-foreground">XP</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {nextRecommendedGame.difficulty}/5
                      </p>
                      <p className="text-xs text-muted-foreground">difficulty</p>
                    </div>
                  </div>
                  <Button className="w-full gap-2" size="lg">
                    <Play className="w-4 h-4" />
                    Start Challenge
                  </Button>
                </div>
              </Card>
            )}

            {/* Game Library */}
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    All Challenges
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {displayGames.length} available
                  </span>
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === null
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedCategory('phishing')}
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === 'phishing'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    🎣 Phishing
                  </button>
                  <button
                    onClick={() => setSelectedCategory('deepfake')}
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === 'deepfake'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    🖼️ Deepfake
                  </button>
                  <button
                    onClick={() => setSelectedCategory('media-literacy')}
                    className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === 'media-literacy'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    📰 Media
                  </button>
                </div>
              </div>

              {/* Games Grid */}
              <div className="grid grid-cols-1 gap-3">
                {displayGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Activity & Progress */}
          <div className="space-y-6">
            {/* Level Progress */}
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-foreground">Level Progress</h3>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Current XP</span>
                  <span className="font-semibold text-foreground">
                    {user.totalPoints % 500} / 500
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-primary to-primary/70 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${((user.totalPoints % 500) / 500) * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {500 - (user.totalPoints % 500)} XP until next level
              </p>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6 space-y-4">
              <h3 className="font-bold text-foreground">Recent Activity</h3>
              <div className="space-y-3">
                {RECENT_ACTIVITY.map((item, idx) => (
                  <div key={idx} className="text-sm">
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-foreground">{item.activity}</p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                      {item.xp > 0 && (
                        <span className="text-xs font-semibold text-primary">+{item.xp} XP</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Call to Action */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 space-y-3">
              <p className="text-sm font-semibold text-foreground">
                Complete 3 challenges this week
              </p>
              <p className="text-xs text-muted-foreground">
                Keep your streak alive and earn bonus XP!
              </p>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: '33%' }}
                />
              </div>
              <p className="text-xs text-muted-foreground">1 of 3 completed</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * StatCard Component - Individual stat display
 */
function StatCard({
  icon,
  label,
  value,
  color,
  suffix,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  suffix?: string;
}) {
  return (
    <Card className="p-4 text-center space-y-2">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center text-white mx-auto`}>
        {icon}
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-foreground">
        {value}{suffix}
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </Card>
  );
}

/**
 * GameCard Component - Individual game card
 */
function GameCard({ game }: { game: Game }) {
  const isLocked = game.status === 'locked';
  const isCompleted = game.status === 'completed';

  return (
    <Link
      to={isLocked ? '#' : `/game/${game.id}`}
      className={`block transition-all ${isLocked ? 'pointer-events-none opacity-50' : ''}`}
    >
      <Card className={`p-4 hover:border-primary transition-colors ${
        isCompleted ? 'bg-primary/5' : ''
      }`}>
        <div className="flex items-start gap-4">
          <div className="text-3xl">{game.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground">{game.title}</h4>
              {isCompleted && <span className="text-xs px-2 py-1 bg-green-500/20 text-green-600 rounded">
                Completed
              </span>}
              {isLocked && <span className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded">
                Locked
              </span>}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{game.description}</p>
            <div className="flex flex-wrap gap-3 text-xs">
              <span className="text-muted-foreground">⏱️ {game.estimatedTime} min</span>
              <span className="text-muted-foreground">⚡ {game.xpReward} XP</span>
              <span className="text-muted-foreground">📊 {game.difficulty}/5</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </div>
      </Card>
    </Link>
  );
}