import { supabase } from '../../../lib/supabase';

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

type DeleteAccountOptions = {
  password: string;
};

type ResetPasswordOptions = {
  email: string;
  redirectTo?: string;
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
  const updates: any = {};

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
  // Primero verificar la contraseña actual
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: (await supabase.auth.getUser()).data.user?.email || '',
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
