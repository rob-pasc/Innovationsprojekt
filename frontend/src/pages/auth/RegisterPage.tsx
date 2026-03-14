import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, UserPlus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField, PasswordField } from '@/components/form/FormField';
import { registerSchema, type RegisterFormData } from '@/lib/schemas';
import { useAuthStore } from '@/store/useAuthStore';
import { authAPI } from '@/lib/api';

/**
 * RegisterPage Component
 * 
 * Registration form with:
 * - Email validation
 * - Strong password requirements
 * - Password strength indicator
 * - Terms & privacy acceptance
 * - Error handling
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { setUser, setToken, setLoading: setAuthLoading, setError: setAuthError } = useAuthStore();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const passwordValue = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    setAuthLoading(true);

    try {
      const response = await authAPI.register(data.email, data.password);
      
      // Assuming your API returns: { user: User, token: string }
      const { user, token } = response.data;
      
      setUser(user);
      setToken(token);
      setAuthLoading(false);
      
      // New users always go through onboarding
      navigate('/onboarding');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
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
              🚀
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Start Learning</h1>
          <p className="text-sm text-muted-foreground">
            Create your account to begin spotting fakes
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

          <div>
            <PasswordField
              label="Password"
              placeholder="Create a strong password"
              error={errors.password?.message}
              showStrength={true}
              value={passwordValue}
              {...register('password')}
            />
            
            {/* Password Requirements Checklist */}
            {passwordValue && (
              <div className="mt-4 p-4 rounded-lg bg-muted/30 space-y-2">
                <p className="text-xs font-semibold text-foreground mb-3">Password Requirements:</p>
                <div className="space-y-1">
                  <PasswordRequirement
                    met={passwordValue.length >= 8}
                    text="8+ characters"
                  />
                  <PasswordRequirement
                    met={/[A-Z]/.test(passwordValue)}
                    text="Uppercase letter"
                  />
                  <PasswordRequirement
                    met={/[0-9]/.test(passwordValue)}
                    text="Number"
                  />
                  <PasswordRequirement
                    met={/[!@#$%^&*]/.test(passwordValue)}
                    text="Special character (!@#$%^&*)"
                  />
                </div>
              </div>
            )}
          </div>

          <FormField
            label="Confirm Password"
            placeholder="Re-enter your password"
            type="password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {/* Terms Acceptance */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="acceptTerms"
              className="mt-1 w-4 h-4 rounded border-2 border-border cursor-pointer accent-primary"
              {...register('acceptTerms')}
            />
            <label htmlFor="acceptTerms" className="text-xs text-muted-foreground cursor-pointer">
              I agree to the{' '}
              <a href="#" className="text-primary hover:underline font-medium">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="#" className="text-primary hover:underline font-medium">
                Privacy Policy
              </a>
            </label>
          </div>
          {errors.acceptTerms && (
            <p className="text-xs text-destructive">{errors.acceptTerms.message}</p>
          )}

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
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Account
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
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-medium">
            Sign in instead
          </Link>
        </p>
      </Card>
    </div>
  );
}

/**
 * PasswordRequirement Component
 * 
 * Reusable checklist item for password requirements
 */
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <div
      className={`flex items-center gap-2 text-xs transition-colors ${
        met ? 'text-green-600' : 'text-muted-foreground'
      }`}
    >
      {met ? (
        <Check className="w-4 h-4 flex-shrink-0" />
      ) : (
        <div className="w-4 h-4 rounded-full border border-current flex-shrink-0" />
      )}
      {text}
    </div>
  );
}