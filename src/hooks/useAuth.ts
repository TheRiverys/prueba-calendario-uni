import { useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import {
  signInWithEmail,
  signUpWithEmail,
  sendResetPasswordEmail,
  signOut as supabaseSignOut,
  updateProfile,
  deleteAccount,
} from '../features/auth/services/authService';
import { supabase } from '../lib/supabase';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const buildError = (message: string | null): Error | null => {
  return message ? new Error(message) : null;
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await signUpWithEmail({ email, password });
    return { data: null, error: buildError(error) };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await signInWithEmail({ email, password });
    return { data: null, error: buildError(error) };
  };

  const signOut = async () => {
    const { error } = await supabaseSignOut();
    return { error: buildError(error) };
  };

  const resetPassword = async (email: string) => {
    const { error } = await sendResetPasswordEmail({ email });
    return { data: null, error: buildError(error) };
  };

  const updateUserProfile = async (email?: string, password?: string) => {
    const { error } = await updateProfile({ email, password });
    return { data: null, error: buildError(error) };
  };

  const deleteUserAccount = async (password: string) => {
    const { error } = await deleteAccount({ password });
    return { data: null, error: buildError(error) };
  };

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile: updateUserProfile,
    deleteAccount: deleteUserAccount,
  };
};
