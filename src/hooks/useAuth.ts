import { useEffect, useState } from 'react';

import {
  signInWithEmail,
  signUpWithEmail,
  sendResetPasswordEmail,
  signOut as supabaseSignOut,
  updateProfile,
  deleteAccount,
  signInWithGoogle,
  resendConfirmationEmail,
  isEmailConfirmed,
} from '../features/auth/services/authService';
import { supabase } from '../lib/supabase';

import type { User, Session } from '@supabase/supabase-js';

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

    // Si hay error, devolverlo inmediatamente
    if (error) {
      return { data: null, error: buildError(error) };
    }

    // Verificar si el email está confirmado después del inicio de sesión
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const emailConfirmed = isEmailConfirmed(user);

    if (!emailConfirmed) {
      // Cerrar la sesión si el email no está confirmado
      await supabaseSignOut();
      return {
        data: null,
        error: buildError(
          'Debes confirmar tu correo electrónico antes de poder iniciar sesión. Revisa tu bandeja de entrada.'
        ),
      };
    }

    return { data: null, error: null };
  };

  const signOut = async () => {
    const { error } = await supabaseSignOut();
    return { error: buildError(error) };
  };

  const resetPassword = async (email: string) => {
    const { error } = await sendResetPasswordEmail({ email });
    return { data: null, error: buildError(error) };
  };

  const signInWithGoogleOAuth = async (redirectTo?: string) => {
    const { error } = await signInWithGoogle({ redirectTo });
    return { data: null, error: buildError(error) };
  };

  const resendEmailConfirmation = async (email: string) => {
    const { error } = await resendConfirmationEmail(email);
    return { data: null, error: buildError(error) };
  };

  const checkEmailConfirmation = (user: User | null): boolean => {
    return isEmailConfirmed(user);
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
    signInWithGoogle: signInWithGoogleOAuth,
    resendEmailConfirmation,
    checkEmailConfirmation,
    updateProfile: updateUserProfile,
    deleteAccount: deleteUserAccount,
  };
};
