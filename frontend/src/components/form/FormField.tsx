import type { ReactNode } from 'react';
// import { Controller, FieldPath, FieldValues, Control } from 'react-hook-form';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useState } from 'react';

/**
 * FormField Component
 * 
 * Wrapper for controlled form inputs with:
 * - Label
 * - Input with focus states
 * - Error messaging
 * - Helper text
 */

interface FormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'checkbox';
  error?: string;
  helper?: string;
  disabled?: boolean;
  children?: ReactNode;
}

export function FormField({
  name,
  label,
  placeholder,
  type = 'text',
  error,
  helper,
  disabled,
  children,
}: FormFieldProps) {
  if (type === 'checkbox') {
    return (
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          name={name}
          id={name}
          disabled={disabled}
          className="mt-1 w-4 h-4 rounded border-2 border-border cursor-pointer accent-primary"
        />
        <div className="flex-1 min-w-0">
          <label htmlFor={name} className="text-sm font-medium text-foreground cursor-pointer">
            {label}
          </label>
          {error && (
            <p className="mt-1 text-sm text-destructive flex items-center gap-1">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {children || (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-2 rounded-lg border-2 transition-colors
            ${
              error
                ? 'border-destructive bg-destructive/5 focus:border-destructive'
                : 'border-border bg-background focus:border-primary'
            }
            focus:outline-none focus:ring-2 focus:ring-primary/20
            disabled:opacity-50 disabled:cursor-not-allowed
            text-foreground placeholder:text-muted-foreground
          `}
        />
      )}
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}
      {helper && !error && (
        <p className="text-xs text-muted-foreground">{helper}</p>
      )}
    </div>
  );
}

/**
 * PasswordField Component
 * 
 * Specialized input with:
 * - Show/hide toggle
 * - Strength indicator
 */

interface PasswordFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  error?: string;
  helper?: string;
  showStrength?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export function PasswordField({
  name,
  label,
  placeholder = 'Enter password',
  error,
  helper,
  showStrength = false,
  value = '',
  onChange,
  disabled,
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const getStrengthColor = () => {
    const strength = value.length;
    if (strength < 8) return 'bg-destructive';
    if (strength < 12) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`w-full px-4 py-2 pr-10 rounded-lg border-2 transition-colors
            ${
              error
                ? 'border-destructive bg-destructive/5 focus:border-destructive'
                : 'border-border bg-background focus:border-primary'
            }
            focus:outline-none focus:ring-2 focus:ring-primary/20
            disabled:opacity-50 disabled:cursor-not-allowed
            text-foreground placeholder:text-muted-foreground
          `}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {showStrength && value && (
        <div className="space-y-1">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${getStrengthColor()} transition-all duration-300`}
              style={{ width: `${Math.min((value.length / 16) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {value.length < 8 && 'Password must be at least 8 characters'}
            {value.length >= 8 && value.length < 12 && 'Add more variety for stronger password'}
            {value.length >= 12 && 'Strong password'}
          </p>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </p>
      )}
      {helper && !error && (
        <p className="text-xs text-muted-foreground">{helper}</p>
      )}
    </div>
  );
}
