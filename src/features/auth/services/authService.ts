
import { supabase } from '../../../lib/supabase';

type AuthResponse = { error: string | null };

type SignUpOptions = {
  email: string;
  password: string;
};

type SignInOptions = SignUpOptions;

type ResetPasswordOptions = {
  email: string;
  redirectTo?: string;
};

export const signInWithEmail = async ({ email, password }: SignInOptions): Promise<AuthResponse> => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
};

export const signUpWithEmail = async ({ email, password }: SignUpOptions): Promise<AuthResponse> => {
  const { error } = await supabase.auth.signUp({ email, password });
  return { error: error?.message ?? null };
};

export const signOut = async (): Promise<AuthResponse> => {
  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
};

export const sendResetPasswordEmail = async ({ email, redirectTo }: ResetPasswordOptions): Promise<AuthResponse> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo
  });
  return { error: error?.message ?? null };
};
