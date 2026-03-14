import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * OnboardingPage Component
 * 
 * Multi-step onboarding for new users:
 * 1. Welcome screen
 * 2. Learning goals selection
 * 3. Difficulty preference
 * 4. Completion & redirect to dashboard
 */

type OnboardingStep = 'welcome' | 'goals' | 'difficulty' | 'complete';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  // Redirect if no authenticated user
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleGoalToggle = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // TODO: Call API to mark onboarding as complete
      // await userAPI.completeOnboarding({ goals: selectedGoals, difficulty: selectedDifficulty });

      // Update local user state
      if (user) {
        setUser({
          ...user,
          onboarding_completed: true,
        });
      }

      setCurrentStep('complete');
      
      // Redirect to dashboard after showing completion
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Onboarding error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px-280px)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-2xl p-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-muted-foreground">
              Step {currentStep === 'welcome' ? 1 : currentStep === 'goals' ? 2 : currentStep === 'difficulty' ? 3 : 4} of 4
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  currentStep === 'welcome'
                    ? '25%'
                    : currentStep === 'goals'
                    ? '50%'
                    : currentStep === 'difficulty'
                    ? '75%'
                    : '100%'
                }%`,
              }}
            />
          </div>
        </div>

        {/* Welcome Step */}
        {currentStep === 'welcome' && (
          <WelcomeStep
            email={user.email}
            onNext={() => setCurrentStep('goals')}
          />
        )}

        {/* Goals Step */}
        {currentStep === 'goals' && (
          <GoalsStep
            selectedGoals={selectedGoals}
            onToggle={handleGoalToggle}
            onNext={() => setCurrentStep('difficulty')}
            onBack={() => setCurrentStep('welcome')}
          />
        )}

        {/* Difficulty Step */}
        {currentStep === 'difficulty' && (
          <DifficultyStep
            selectedDifficulty={selectedDifficulty}
            onSelect={setSelectedDifficulty}
            onNext={handleComplete}
            onBack={() => setCurrentStep('goals')}
            isLoading={isLoading}
          />
        )}

        {/* Complete Step */}
        {currentStep === 'complete' && <CompleteStep email={user.email} />}
      </Card>
    </div>
  );
}

/**
 * WelcomeStep Component
 */
function WelcomeStep({ email, onNext }: { email: string; onNext: () => void }) {
  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          Welcome to MediaShield! 🎉
        </h1>
        <p className="text-lg text-muted-foreground">
          Let's personalize your learning experience
        </p>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-left space-y-3">
        <h2 className="font-semibold text-foreground">What You'll Learn</h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span className="text-primary">✓</span>
            Identify deepfakes and manipulated media
          </li>
          <li className="flex gap-2">
            <span className="text-primary">✓</span>
            Recognize phishing and social engineering
          </li>
          <li className="flex gap-2">
            <span className="text-primary">✓</span>
            Verify content sources and claims
          </li>
          <li className="flex gap-2">
            <span className="text-primary">✓</span>
            Build critical thinking skills
          </li>
        </ul>
      </div>

      <p className="text-sm text-muted-foreground">
        You're logged in as <span className="font-medium text-foreground">{email}</span>
      </p>

      <Button onClick={onNext} className="w-full gap-2" size="lg">
        Get Started <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

/**
 * GoalsStep Component
 */
function GoalsStep({
  selectedGoals,
  onToggle,
  onNext,
  onBack,
}: {
  selectedGoals: string[];
  onToggle: (goal: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const goals = [
    {
      id: 'professional',
      icon: '💼',
      title: 'Professional Development',
      description: 'Protect myself and my organization from cyber threats',
    },
    {
      id: 'personal',
      icon: '🛡️',
      title: 'Personal Security',
      description: 'Keep my personal data and accounts safe online',
    },
    {
      id: 'critical-thinking',
      icon: '🧠',
      title: 'Critical Thinking',
      description: 'Develop better media literacy and verification skills',
    },
    {
      id: 'curiosity',
      icon: '🔬',
      title: 'Curiosity',
      description: 'Understand AI and how it creates convincing fakes',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          What's Your Learning Goal?
        </h2>
        <p className="text-muted-foreground">Select all that apply</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => onToggle(goal.id)}
            className={`p-4 rounded-lg border-2 text-left transition-all ${
              selectedGoals.includes(goal.id)
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{goal.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{goal.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {goal.description}
                </p>
              </div>
              {selectedGoals.includes(goal.id) && (
                <Check className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={selectedGoals.length === 0}
          className="flex-1 gap-2"
        >
          Continue <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

/**
 * DifficultyStep Component
 */
function DifficultyStep({
  selectedDifficulty,
  onSelect,
  onNext,
  onBack,
  isLoading,
}: {
  selectedDifficulty: string | null;
  onSelect: (difficulty: string) => void;
  onNext: () => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const difficulties = [
    {
      id: 'beginner',
      title: 'Beginner',
      description: 'Just starting my media literacy journey',
      emoji: '🌱',
    },
    {
      id: 'intermediate',
      title: 'Intermediate',
      description: 'I have some basic security knowledge',
      emoji: '🌿',
    },
    {
      id: 'advanced',
      title: 'Advanced',
      description: 'I want challenging, sophisticated scenarios',
      emoji: '🌲',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          What's Your Experience Level?
        </h2>
        <p className="text-muted-foreground">We'll tailor challenges to match</p>
      </div>

      <div className="space-y-3">
        {difficulties.map((diff) => (
          <button
            key={diff.id}
            onClick={() => onSelect(diff.id)}
            className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
              selectedDifficulty === diff.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{diff.emoji}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{diff.title}</h3>
                <p className="text-sm text-muted-foreground">{diff.description}</p>
              </div>
              {selectedDifficulty === diff.id && (
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!selectedDifficulty || isLoading}
          className="flex-1 gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Setting up...
            </>
          ) : (
            <>
              Complete Setup <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/**
 * CompleteStep Component
 */
function CompleteStep({ email }: { email: string }) {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <div className="text-6xl mb-4">✨</div>
        <h2 className="text-2xl font-bold text-foreground">All Set!</h2>
        <p className="text-muted-foreground">
          Your profile is ready, {email.split('@')[0]}
        </p>
      </div>

      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 text-left space-y-3">
        <p className="text-sm text-foreground font-semibold">Next Steps:</p>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <Check className="w-4 h-4 text-primary flex-shrink-0" />
            Take your first challenge
          </li>
          <li className="flex gap-2">
            <Check className="w-4 h-4 text-primary flex-shrink-0" />
            Earn XP and climb levels
          </li>
          <li className="flex gap-2">
            <Check className="w-4 h-4 text-primary flex-shrink-0" />
            Build a learning streak
          </li>
        </ul>
      </div>

      <p className="text-sm text-muted-foreground">
        Redirecting to your dashboard...
      </p>
    </div>
  );
}