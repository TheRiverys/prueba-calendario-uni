import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthContext } from '@/contexts/auth/AuthContext';
import { AuthDialog } from '@/features/auth/components/AuthDialog';

const closeAuthModalMock = vi.fn();
const openAuthModalMock = vi.fn();

vi.mock('@/contexts/auth/AuthContext');

vi.mock('@/features/auth/components/LoginForm', () => ({
  LoginForm: ({
    onSwitchMode,
    onSuccess,
  }: {
    readonly onSwitchMode: (_mode: 'register' | 'reset') => void;
    readonly onSuccess: () => void;
  }) => (
    <div data-testid='login-form'>
      <button onClick={() => onSwitchMode('register')}>go-register</button>
      <button onClick={() => onSwitchMode('reset')}>go-reset</button>
      <button onClick={onSuccess}>login-success</button>
    </div>
  ),
}));

vi.mock('@/features/auth/components/RegisterForm', () => ({
  RegisterForm: ({ onSwitchMode }: { readonly onSwitchMode: (_mode: 'login') => void }) => (
    <div data-testid='register-form'>
      <button onClick={() => onSwitchMode('login')}>go-login</button>
    </div>
  ),
}));

vi.mock('@/features/auth/components/ResetPasswordForm', () => ({
  ResetPasswordForm: ({
    onSwitchMode,
  }: {
    readonly onSwitchMode: (_mode: 'login' | 'register') => void;
  }) => (
    <div data-testid='reset-form'>
      <button onClick={() => onSwitchMode('login')}>reset-go-login</button>
      <button onClick={() => onSwitchMode('register')}>reset-go-register</button>
    </div>
  ),
}));

const useAuthContextMock = vi.mocked(useAuthContext);

const buildAuthContext = () => ({
  authModalOpen: false,
  openAuthModal: openAuthModalMock,
  closeAuthModal: closeAuthModalMock,
  signIn: vi.fn(),
  signUp: vi.fn(),
  resetPassword: vi.fn(),
  signInWithGoogle: vi.fn(),
  resendEmailConfirmation: vi.fn(),
  checkEmailConfirmation: vi.fn(),
  confirmPasswordReset: vi.fn(),
  updateProfile: vi.fn(),
  deleteAccount: vi.fn(),
  signOut: vi.fn(),
  loading: false,
  user: null,
});

const configureAuthContext = (overrides: Partial<ReturnType<typeof buildAuthContext>> = {}) => {
  useAuthContextMock.mockReturnValue({
    ...buildAuthContext(),
    ...overrides,
  } as never);
};

const renderAuthDialog = () => {
  render(<AuthDialog />);
};

describe('AuthDialog', () => {
  beforeEach(() => {
    configureAuthContext();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('no renderiza el modal cuando está cerrado', () => {
    // Arrange & Act
    renderAuthDialog();

    // Assert
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('muestra el formulario de login cuando el modal está abierto', async () => {
    // Arrange
    configureAuthContext({ authModalOpen: true });

    // Act
    renderAuthDialog();

    // Assert
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument();
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('permite cambiar al modo registro', async () => {
    // Arrange
    configureAuthContext({ authModalOpen: true });
    renderAuthDialog();

    // Act
    fireEvent.click(await screen.findByText('go-register'));

    // Assert
    expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeInTheDocument();
    expect(screen.getByTestId('register-form')).toBeInTheDocument();
  });

  it('permite cambiar al modo recuperación', async () => {
    // Arrange
    configureAuthContext({ authModalOpen: true });
    renderAuthDialog();

    // Act
    fireEvent.click(await screen.findByText('go-reset'));

    // Assert
    expect(screen.getByRole('heading', { name: 'Recuperar contraseña' })).toBeInTheDocument();
    expect(screen.getByTestId('reset-form')).toBeInTheDocument();
  });

  it('cierra el modal cuando un formulario reporta éxito', async () => {
    // Arrange
    configureAuthContext({ authModalOpen: true });
    renderAuthDialog();

    // Act
    fireEvent.click(await screen.findByText('login-success'));

    // Assert
    await waitFor(() => {
      expect(closeAuthModalMock).toHaveBeenCalled();
    });
  });
});
