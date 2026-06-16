import type { AuthError, Session, User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  AppError,
  ConflictError,
  RateLimitError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";
import { publicEnv } from "@/lib/env";
import type { LoginInput, SignupInput } from "@/validators/auth";

function mapAuthError(error: AuthError): AppError {
  switch (error.code) {
    case "invalid_credentials":
      return new UnauthorizedError("Invalid email or password");
    case "email_exists":
    case "user_already_exists":
      return new ConflictError("An account with this email already exists");
    case "weak_password":
      return new ValidationError(error.message);
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return new RateLimitError(60, "Too many attempts, please try again later");
    case "email_not_confirmed":
      return new UnauthorizedError("Please confirm your email before signing in");
    default:
      return new AppError(error.message || "Authentication error", error.status ?? 400, "UNPROCESSABLE");
  }
}

export const authService = {
  async signUp(input: SignupInput): Promise<{ user: User | null; session: Session | null }> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        // Read by the handle_new_user() trigger to provision public.users and
        // mirror the role into the JWT app_metadata.
        data: { role: input.role, full_name: input.full_name ?? null },
      },
    });
    if (error) throw mapAuthError(error);
    return { user: data.user, session: data.session };
  },

  async signIn(input: LoginInput): Promise<{ user: User; session: Session }> {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });
    if (error) throw mapAuthError(error);
    return { user: data.user, session: data.session };
  },

  async signOut(): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw mapAuthError(error);
  },

  /** Always succeeds from the caller's perspective (no account enumeration). */
  async requestPasswordReset(email: string, redirectTo?: string): Promise<void> {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo ?? `${publicEnv.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    });
  },

  /** Requires an active (recovery) session. */
  async updatePassword(password: string): Promise<void> {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new UnauthorizedError("A valid session is required to update your password");

    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw mapAuthError(error);
  },
};
