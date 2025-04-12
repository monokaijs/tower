import {z} from 'zod';

export const registerSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters" }).max(30, { message: "Full name must not exceed 30 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters" }),
  termsAccepted: z.boolean().refine(val => val === true, { message: "You must accept the terms and conditions" }),
}).strict()
.refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const oAuthSignInSchema = z.object({
  issuer: z.enum(['web', 'mobile']).default('web'),
  code: z.string().optional(),
  idToken: z.string().optional(),
}).strict();

export const loginSchema = z.object({
  identifier: z.string(),
  password: z.string().min(6),
  issuer: z.enum(['web', 'mobile']).default('web').optional(),
}).strict();

export const resetPasswordSchema = z.object({
  email: z.string().email(),
}).strict();

export const resetPasswordSubmissionSchema = z.object({
  newPassword: z.string().min(6),
  code: z.string(),
}).strict();

export const changePasswordSchema = z.object({
  newPassword: z.string().min(6),
  oldPassword: z.string().min(6),
}).strict();

export interface QuerySsoUser {
  googleId?: string;
  appleId?: string;
}

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type OAuthSignInSchema = z.infer<typeof oAuthSignInSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type ResetPasswordSubmissionSchema = z.infer<typeof resetPasswordSubmissionSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

// Registration form schema (without confirmPassword and termsAccepted for database storage)
export const registrationFormSchema = z.object({
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters" }).max(30, { message: "Full name must not exceed 30 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
}).strict();

export type RegistrationFormSchema = z.infer<typeof registrationFormSchema>;
