import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
});

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
  full_name: z.string().nullable().optional(),
});

export const oauthLoginSchema = z.object({
  id_token: z.string().min(16),
});

export const tokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
});

export const userResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  is_active: z.boolean(),
  full_name: z.string().nullable().optional(),
});

export const authResponseSchema = z.object({
  user: userResponseSchema,
  token: tokenResponseSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type OAuthLoginInput = z.infer<typeof oauthLoginSchema>;
export type TokenResponse = z.infer<typeof tokenResponseSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;
