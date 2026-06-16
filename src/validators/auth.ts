import { z } from "zod";

// Public signup cannot create admins — admins are provisioned out of band.
export const signupRoleEnum = z.enum(["athlete", "parent", "coach"]);

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  role: signupRoleEnum.default("athlete"),
  full_name: z.string().trim().min(1).max(120).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
  redirect_to: z.string().url().optional(),
});

export const passwordUpdateSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
