import { z } from 'zod';

/**
 * Zod Schemas for Authentication Forms
 * 
 * Provides type-safe validation with clear error messages.
 * Schemas can be inferred to TypeScript types.
 */

// Password validation rules: 8+ chars, 1 uppercase, 1 number, 1 special char
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter (A-Z)')
  .regex(/[0-9]/, 'Password must contain at least 1 number (0-9)')
  .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, 'Password must contain 1 special character (!@#$%^&*)')
  .describe('Secure password');

// Login form schema
export const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .describe('Email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .describe('Password'),
  rememberMe: z.boolean().default(false).optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register form schema
export const registerSchema = z
  .object({
    email: z
      .string()
      .email('Please enter a valid email address')
      .describe('Email address'),
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password')
      .describe('Confirm password'),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, 'You must accept the terms and privacy policy')
      .describe('Accept terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Password strength checker (for real-time feedback)
export function getPasswordStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;

  // Scoring: 1-2 = Weak, 3 = Fair, 4 = Strong
  if (score <= 2) return { score, label: 'Weak', color: 'text-destructive' };
  if (score === 3) return { score, label: 'Fair', color: 'text-yellow-600' };
  return { score, label: 'Strong', color: 'text-green-600' };
}