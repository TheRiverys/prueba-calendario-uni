import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
  type FC,
} from 'react';

import { toast } from '@/components/ui/sonner';
import { usePreferencesContext } from '@/contexts/preferences/PreferencesContext';
import { useAuth } from '@/hooks/useAuth';
import {
  clearLocalUserData,
  getOrCreateAnalyticsUserId,
  associateAnonymousAnalyticsWithUser,
} from '@/utils/storage';

import type { User } from '@supabase/supabase-js';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  authModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signIn: (_email: string, _password: string) => Promise<string | null>;
  signUp: (_email: string, _password: string) => Promise<string | null>;
  resetPassword: (_email: string) => Promise<string | null>;
  signInWithGoogle: (_redirectTo?: string) => Promise<string | null>;
  resendEmailConfirmation: (_email: string) => Promise<string | null>;
  checkEmailConfirmation: (_user: User | null) => boolean;
  signOut: () => Promise<string | null>;
  updateProfile: (_email?: string, _password?: string) => Promise<string | null>;
  deleteAccount: (_password: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  readonly children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { setCurrentPage } = usePreferencesContext();

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

      // Si el registro fue exitoso (sin errores), marcar para asociación futura
      if (!error) {
        try {
          const anonymousUserId = getOrCreateAnalyticsUserId();
          // Guardar el ID anónimo para asociarlo cuando el usuario confirme su email
          localStorage.setItem('pending_analytics_association', anonymousUserId);
        } catch {
          // No bloquear el registro por errores de analíticas
        }
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

  const signInWithGoogle = useCallback(
    async (redirectTo?: string) => {
      const { error } = await auth.signInWithGoogle(redirectTo);
      if (error) {
        return error.message;
      }
      setAuthModalOpen(false);
      return null;
    },
    [auth]
  );

  const resendEmailConfirmation = useCallback(
    async (email: string) => {
      const { error } = await auth.resendEmailConfirmation(email);
      if (error) {
        return error.message;
      }
      return null;
    },
    [auth]
  );

  const checkEmailConfirmation = useCallback(
    (user: User | null) => {
      const isConfirmed = auth.checkEmailConfirmation(user);

      // Si el usuario confirmó su email y tenemos un ID pendiente de asociación
      if (isConfirmed && user?.id && typeof window !== 'undefined') {
        const pendingId = localStorage.getItem('pending_analytics_association');
        if (pendingId) {
          // Asociar las analíticas anónimas con el usuario registrado
          associateAnonymousAnalyticsWithUser(pendingId, user.id)
            .then(() => {
              localStorage.removeItem('pending_analytics_association');
            })
            .catch(() => {
              // Silenciar errores de asociación de analíticas
            });
        }
      }

      return isConfirmed;
    },
    [auth]
  );

  const signOut = useCallback(async () => {
    const { error } = await auth.signOut();
    if (error) {
      toast.error('No se pudo cerrar la sesión.', {
        description: error.message,
      });
      return error.message;
    }

    // Limpiar datos locales y redirigir al inicio después del cierre de sesión exitoso
    clearLocalUserData();
    setCurrentPage('dashboard');
    toast.success('Sesión cerrada correctamente.');
    return null;
  }, [auth, setCurrentPage]);

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
      signInWithGoogle,
      resendEmailConfirmation,
      checkEmailConfirmation,
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
      signInWithGoogle,
      resendEmailConfirmation,
      checkEmailConfirmation,
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
