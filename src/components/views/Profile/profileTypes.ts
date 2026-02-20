import type { User } from '@supabase/supabase-js';

export interface ProfileFormState {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type ProfileFormField = keyof ProfileFormState;

export interface PasswordVisibilityState {
  currentPassword: boolean;
  newPassword: boolean;
  confirmPassword: boolean;
}

export interface ProfileStatus {
  loading: boolean;
  error: string | null;
  success: string | null;
}

export interface ProfileAccountSummary {
  user: User | null;
  description: string;
}
