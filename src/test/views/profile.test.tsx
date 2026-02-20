import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Profile } from '@/components/Profile';
import { useAuthContext } from '@/contexts/auth/AuthContext';
import { GdprProvider } from '@/contexts/gdpr/GdprContext';
import { usePreferencesContext } from '@/contexts/preferences/PreferencesContext';

import type { User } from '@supabase/supabase-js';

vi.mock('@/components/ui/sonner', () => ({
  toast: {
    success: toastSuccessMock,
  },
}));

vi.mock('@/utils/storage', () => ({
  clearLocalUserData: clearLocalUserDataMock,
}));

vi.mock('@/contexts/auth/AuthContext');
vi.mock('@/contexts/preferences/PreferencesContext');

const {
  toastSuccessMock,
  clearLocalUserDataMock,
  updateProfileMock,
  deleteAccountMock,
  signOutMock,
  setCurrentPageMock,
} = vi.hoisted(() => ({
  toastSuccessMock: vi.fn(),
  clearLocalUserDataMock: vi.fn(),
  updateProfileMock: vi.fn(),
  deleteAccountMock: vi.fn(),
  signOutMock: vi.fn(),
  setCurrentPageMock: vi.fn(),
}));

const useAuthContextMock = vi.mocked(useAuthContext);
const usePreferencesContextMock = vi.mocked(usePreferencesContext);

const buildUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 'user-1',
    app_metadata: {},
    aud: 'authenticated',
    confirmation_sent_at: '2024-01-01T00:00:00Z',
    confirmation_token: null,
    confirmed_at: '2024-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    email: 'usuario@example.com',
    email_confirmed_at: '2024-01-01T00:00:00Z',
    email_change: null,
    email_change_confirm_status: 0,
    email_change_email: null,
    email_change_sent_at: null,
    email_change_token_current: null,
    email_change_token_new: null,
    factor_ids: [],
    identities: [],
    instance_id: 'instance',
    invited_at: null,
    is_anonymous: false,
    last_sign_in_at: '2024-01-01T00:00:00Z',
    phone: '',
    phone_change: '',
    phone_change_sent_at: null,
    phone_change_token: null,
    phone_confirmed_at: null,
    raw_app_meta_data: {},
    raw_user_meta_data: {},
    recovery_sent_at: null,
    rehype_version: null,
    role: 'authenticated',
    updated_at: '2024-01-01T00:00:00Z',
    user_metadata: {},
    ...overrides,
  }) as unknown as User;

const buildAuthContext = () => ({
  user: buildUser(),
  updateProfile: updateProfileMock,
  deleteAccount: deleteAccountMock,
  signOut: signOutMock,
  loading: false,
  authModalOpen: false,
  openAuthModal: vi.fn(),
  closeAuthModal: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
  resetPassword: vi.fn(),
  confirmPasswordReset: vi.fn(),
  signInWithGoogle: vi.fn(),
  resendEmailConfirmation: vi.fn(),
  checkEmailConfirmation: vi.fn(),
});

const configureAuthContext = (overrides: Partial<ReturnType<typeof buildAuthContext>> = {}) => {
  useAuthContextMock.mockReturnValue({
    ...buildAuthContext(),
    ...overrides,
  } as never);
};

const configurePreferencesContext = () => {
  usePreferencesContextMock.mockReturnValue({
    activeView: 'list',
    setActiveView: vi.fn(),
    currentPage: 'dashboard',
    setCurrentPage: setCurrentPageMock,
    selectedSubject: 'all',
    setSelectedSubject: vi.fn(),
    sortBy: 'algorithm',
    setSortBy: vi.fn(),
    theme: 'light',
    toggleTheme: vi.fn(),
  });
};

const renderProfile = () => {
  render(
    <GdprProvider>
      <Profile />
    </GdprProvider>
  );
};

describe('Profile', () => {
  beforeEach(() => {
    updateProfileMock.mockResolvedValue(null);
    deleteAccountMock.mockResolvedValue(null);
    signOutMock.mockResolvedValue(null);
    clearLocalUserDataMock.mockClear();
    toastSuccessMock.mockClear();
    setCurrentPageMock.mockClear();

    configureAuthContext();
    configurePreferencesContext();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('habilita el modo edición al solicitarlo', () => {
    // Arrange
    renderProfile();

    const emailInput = screen.getByLabelText('Correo electrónico') as HTMLInputElement;
    expect(emailInput).toBeDisabled();

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Editar credenciales' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Guardar cambios' })).toBeInTheDocument();
    expect(emailInput).not.toBeDisabled();
  });

  it('actualiza las credenciales con datos válidos', async () => {
    // Arrange
    renderProfile();

    fireEvent.click(screen.getByRole('button', { name: 'Editar credenciales' }));

    const newPasswordInput = await screen.findByLabelText('Nueva contraseña');
    const confirmPasswordInput = screen.getByLabelText('Confirmar contraseña');

    fireEvent.change(newPasswordInput, { target: { value: 'Secreta123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Secreta123' } });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }));

    // Assert
    await waitFor(() => {
      expect(updateProfileMock).toHaveBeenCalledWith('usuario@example.com', 'Secreta123');
      expect(screen.getByText('Perfil actualizado exitosamente')).toBeInTheDocument();
    });
  });

  it('mantiene deshabilitada la eliminación si falta la contraseña actual', () => {
    // Arrange
    renderProfile();

    // Act
    const deleteButton = screen.getByRole('button', { name: 'Eliminar cuenta permanentemente' });

    // Assert
    expect(deleteButton).toBeDisabled();
  });

  it('solicita confirmación adicional para cuentas OAuth', () => {
    // Arrange
    configureAuthContext({
      user: buildUser({ app_metadata: { provider: 'google' } }),
    });
    renderProfile();

    const deleteButton = screen.getByRole('button', { name: 'Eliminar cuenta permanentemente' });

    // Act
    fireEvent.click(deleteButton);

    // Assert
    expect(screen.getByText('Confirmar eliminación de cuenta')).toBeInTheDocument();
    expect(screen.queryByText('Editar credenciales')).not.toBeInTheDocument();
  });

  it('no muestra campos informativos irrelevantes en el resumen de cuenta', () => {
    renderProfile();

    expect(screen.queryByText('Estado')).not.toBeInTheDocument();
    expect(screen.queryByText('Email confirmado')).not.toBeInTheDocument();
    expect(screen.queryByText('Última actualización')).not.toBeInTheDocument();
    expect(screen.queryByText('Proveedor')).not.toBeInTheDocument();
  });

  it('ejecuta el flujo completo de eliminación de cuenta', async () => {
    // Arrange
    renderProfile();

    fireEvent.change(screen.getByLabelText('Confirmar contraseña actual'), {
      target: { value: 'MiSecreta123' },
    });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar cuenta permanentemente' }));

    // Assert
    await waitFor(() => {
      expect(deleteAccountMock).toHaveBeenCalledWith('MiSecreta123');
      expect(signOutMock).toHaveBeenCalled();
      expect(clearLocalUserDataMock).toHaveBeenCalled();
      expect(setCurrentPageMock).toHaveBeenCalledWith('dashboard');
      expect(toastSuccessMock).toHaveBeenCalledWith('Cuenta eliminada exitosamente');
    });
  });
});
