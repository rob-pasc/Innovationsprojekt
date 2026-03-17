import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField, PasswordField } from '@/components/form/FormField';
import { loginSchema, type LoginFormData } from '@/lib/schemas';
import { useAuthStore } from '@/store/useAuthStore';
import { authAPI } from '@/lib/api';

/**
 * LoginPage Component
 * 
 * Secure login form with:
 * - Email/password validation
 * - Loading and error states
 * - Remember me option
 * - Link to registration
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser, setToken, setLoading: setAuthLoading, setError: setAuthError } = useAuthStore();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    setAuthLoading(true);

    try {
      const response = await authAPI.login(data.email, data.password);
      
      // Assuming your API returns: { user: User, token: string }
      const { user, token } = response.data;
      
      setUser(user);
      setToken(token);
      setAuthLoading(false);
      
      // Redirect based on onboarding status
      if (user.onboardingCompleted) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      setApiError(message);
      setAuthError(message);
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px-280px)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md p-8 space-y-6">
        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xl">
              🔐
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to continue learning and spot the fakes
          </p>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">{apiError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Email Address"
            placeholder="you@example.com"
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <PasswordField
            label="Password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register('password')}
          />

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rememberMe"
              className="w-4 h-4 rounded border-2 border-border cursor-pointer accent-primary"
              {...register('rememberMe')}
            />
            <label htmlFor="rememberMe" className="text-sm text-muted-foreground cursor-pointer">
              Remember me for 30 days
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full gap-2"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 bg-background text-muted-foreground">Or</span>
          </div>
        </div>

        {/* Footer Link */}
        <div className="space-y-3 text-center text-sm">
          <p className="text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Create one now
            </Link>
          </p>

          <a
            href="#"
            className="block text-primary hover:underline font-medium"
          >
            Forgot password?
          </a>
        </div>
      </Card>
    </div>
  );
}