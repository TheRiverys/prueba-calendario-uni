import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from 'react';
import type { User } from '@supabase/supabase-js';
import { useAuth } from '@/hooks/useAuth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  resetPassword: (email: string) => Promise<string | null>;
  signOut: () => Promise<string | null>;
  updateProfile: (email?: string, password?: string) => Promise<string | null>;
  deleteAccount: (password: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const openAuthModal = useCallback(() => {
    setAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setAuthModalOpen(false);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await auth.signIn(email, password);
      if (error) {
        return error.message;
      }
      setAuthModalOpen(false);
      return null;
    },
    [auth]
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      const { error } = await auth.signUp(email, password);
      if (error) {
        return error.message;
      }
      setAuthModalOpen(false);
      return null;
    },
    [auth]
  );

  const resetPassword = useCallback(
    async (email: string) => {
      const { error } = await auth.resetPassword(email);
      if (error) {
        return error.message;
      }
      return null;
    },
    [auth]
  );

  const signOut = useCallback(async () => {
    const { error } = await auth.signOut();
    if (error) {
      return error.message;
    }
    return null;
  }, [auth]);

  const updateProfile = useCallback(
    async (email?: string, password?: string) => {
      const { error } = await auth.updateProfile(email, password);
      if (error) {
        return error.message;
      }
      return null;
    },
    [auth]
  );

  const deleteAccount = useCallback(
    async (password: string) => {
      const { error } = await auth.deleteAccount(password);
      if (error) {
        return error.message;
      }
      return null;
    },
    [auth]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user: auth.user,
      loading: auth.loading,
      authModalOpen,
      openAuthModal,
      closeAuthModal,
      signIn,
      signUp,
      resetPassword,
      signOut,
      updateProfile,
      deleteAccount,
    }),
    [
      auth.user,
      auth.loading,
      authModalOpen,
      openAuthModal,
      closeAuthModal,
      signIn,
      signUp,
      resetPassword,
      signOut,
      updateProfile,
      deleteAccount,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
