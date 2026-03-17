import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Shield,
  Brain,
  Zap,
  // TrendingUp,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

/**
 * HomePage Component
 * 
 * Landing page that adapts based on authentication status:
 * - Not authenticated: Show product benefits + sign up CTA
 * - Authenticated: Show quick dashboard access + learning streak
 */
export default function HomePage() {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    return <DashboardRedirect user={user} />;
  }

  return <LandingPage />;
}

// Authenticated users see a quick dashboard redirect
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function DashboardRedirect({ user }: { user: any }) {
  // If onboarding not completed, redirect to onboarding
  if (!user.onboarding_completed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-foreground">
              Welcome, {user.email.split('@')[0]}! 👋
            </h1>
            <p className="text-lg text-muted-foreground">
              Let's set up your profile to get started
            </p>
          </div>

          <div className="space-y-3">
            <Link to="/onboarding">
              <Button size="lg" className="gap-2">
                Complete Setup <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If onboarding completed, show dashboard redirect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Welcome back, {user.email.split('@')[0]}! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            You're at level {user.exp_lvl} with {user.total_points} points
          </p>
        </div>

        <div className="space-y-3">
          <Link to="/dashboard">
            <Button size="lg" className="gap-2">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            Or keep learning with our games
          </p>
        </div>
      </div>
    </div>
  );
}

// Non-authenticated users see the full landing page
function LandingPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-20 sm:py-32 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-8 text-center">
            {/* Badge */}
            <div className="inline-block">
              <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2 w-fit mx-auto">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Gamified Learning Platform
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl font-bold text-foreground leading-tight">
                Master Media Literacy.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                  Spot the Fakes.
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Learn to identify AI-generated content, deepfakes, and phishing attempts through interactive games. No boring lectures. Just learning that sticks.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link to="/register">
                <Button size="lg" className="gap-2">
                  Start Learning Now <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-foreground">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why MediaShield Works
            </h2>
            <p className="text-lg text-muted-foreground">
              We combine game mechanics with real security knowledge
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="p-8 space-y-4 border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Active Learning
              </h3>
              <p className="text-muted-foreground">
                We teach by doing. You encounter real scenarios and learn from mistakes immediately.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-8 space-y-4 border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Gamified Engagement
              </h3>
              <p className="text-muted-foreground">
                Earn XP, climb levels, maintain streaks. Learning feels like play, not punishment.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-8 space-y-4 border border-border hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Privacy First
              </h3>
              <p className="text-muted-foreground">
                GDPR-compliant. No access to personal emails or sensitive data. Your privacy is safe.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* What You Learn Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 border-b border-border bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              What You'll Master
            </h2>
            <p className="text-lg text-muted-foreground">
              Skills for the digital age
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                title: 'Deepfake Detection',
                description:
                  'Learn to spot manipulated images, videos, and voice recordings before they fool you.',
              },
              {
                title: 'Phishing Recognition',
                description:
                  'Identify the red flags in emails: spoofed domains, urgency tactics, suspicious links.',
              },
              {
                title: 'Media Analysis',
                description:
                  'Develop critical thinking skills to verify content sources and check claims.',
              },
              {
                title: 'AI Content Detection',
                description:
                  'Recognize patterns unique to AI-generated text, images, and audio.',
              },
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-primary mt-1" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-foreground mb-1">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 border-b border-border">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl sm:text-5xl font-bold text-primary mb-2">
                95%
              </p>
              <p className="text-muted-foreground">
                Retention rate through gamification
              </p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-bold text-primary mb-2">
                4 weeks
              </p>
              <p className="text-muted-foreground">
                Average time to mastery
              </p>
            </div>
            <div>
              <p className="text-4xl sm:text-5xl font-bold text-primary mb-2">
                10K+
              </p>
              <p className="text-muted-foreground">
                Users learning media literacy
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 sm:py-32 bg-muted/30">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Ready to level up your media literacy?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands learning to spot fakes. Start free, no credit card required.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="gap-2">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-foreground">
                Already have an account?
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            No credit card required. GDPR-compliant. Privacy guaranteed.
          </p>
        </div>
      </section>
    </div>
  );
}