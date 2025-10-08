import { getOAuthProviderInfo } from '@/lib/oauthUtils';
import { supabase } from '@/lib/supabase';

import type { User } from '@supabase/supabase-js';

type AuthResponse = { error: string | null };

type SignUpOptions = {
  email: string;
  password: string;
};

type SignInOptions = SignUpOptions;

type UpdateProfileOptions = {
  email?: string;
  password?: string;
};

type UserUpdateData = {
  email?: string;
  password?: string;
  data?: Record<string, unknown>;
};

type DeleteAccountOptions = {
  password: string;
};

type ResetPasswordOptions = {
  email: string;
  redirectTo?: string;
};

type OAuthOptions = {
  redirectTo?: string;
  scopes?: string;
  queryParams?: Record<string, string>;
};

export const signInWithEmail = async ({
  email,
  password,
}: SignInOptions): Promise<AuthResponse> => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error: error?.message ?? null };
};

export const signUpWithEmail = async ({
  email,
  password,
}: SignUpOptions): Promise<AuthResponse> => {
  const { error } = await supabase.auth.signUp({ email, password });
  return { error: error?.message ?? null };
};

export const signOut = async (): Promise<AuthResponse> => {
  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
};

export const updateProfile = async ({
  email,
  password,
}: UpdateProfileOptions): Promise<AuthResponse> => {
  const updates: UserUpdateData = {};

  if (email) {
    updates.email = email;
  }

  if (password) {
    updates.password = password;
  }

  if (Object.keys(updates).length === 0) {
    return { error: 'No se proporcionaron datos para actualizar' };
  }

  const { error } = await supabase.auth.updateUser(updates);
  return { error: error?.message ?? null };
};

export const deleteAccount = async ({ password }: DeleteAccountOptions): Promise<AuthResponse> => {
  const currentUser = (await supabase.auth.getUser()).data.user;

  if (!currentUser) {
    return { error: 'Usuario no autenticado' };
  }

  // Obtener información del proveedor OAuth
  const providerInfo = getOAuthProviderInfo(currentUser);

  // Para usuarios OAuth (como Google), no necesitamos verificar contraseña
  if (providerInfo.isGoogle || providerInfo.provider) {
    // Proceder directamente con la eliminación para usuarios OAuth
    const { error } = await supabase.rpc('delete_user_account');
    return { error: error?.message ?? null };
  }

  // Para usuarios de email/contraseña, verificar la contraseña primero
  if (!password) {
    return { error: 'Contraseña requerida para usuarios de email/contraseña' };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: currentUser.email || '',
    password,
  });

  if (signInError) {
    return { error: 'Contraseña incorrecta' };
  }

  // Si la contraseña es correcta, proceder con la eliminación
  const { error } = await supabase.rpc('delete_user_account');
  return { error: error?.message ?? null };
};

export const sendResetPasswordEmail = async ({
  email,
  redirectTo,
}: ResetPasswordOptions): Promise<AuthResponse> => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });
  return { error: error?.message ?? null };
};

export const signInWithGoogle = async (options?: OAuthOptions): Promise<AuthResponse> => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: options?.redirectTo,
      scopes: options?.scopes,
      queryParams: options?.queryParams,
    },
  });
  return { error: error?.message ?? null };
};

export const resendConfirmationEmail = async (email: string): Promise<AuthResponse> => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
  });
  return { error: error?.message ?? null };
};

export const isEmailConfirmed = (user: User | null | undefined): boolean => {
  if (!user) {
    return false;
  }

  // Los usuarios que inician sesión con Google u otros proveedores OAuth
  // típicamente tienen el email confirmado automáticamente
  const providerInfo = getOAuthProviderInfo(user);
  if (providerInfo.isGoogle || providerInfo.provider) {
    return true; // Los proveedores OAuth verifican automáticamente el email
  }

  // Para usuarios de email/contraseña, verificar campos de confirmación
  return !!(user.email_confirmed_at || user.confirmed_at);
};
