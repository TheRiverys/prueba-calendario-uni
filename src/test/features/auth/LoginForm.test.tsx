import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthContext } from '@/contexts/auth/AuthContext';
import { LoginForm, LOGIN_MESSAGES } from '@/features/auth/components/LoginForm';
vi.mock('@/contexts/auth/AuthContext');
vi.mock('@/components/GoogleIcon', () => ({
  GoogleIcon: ({ className }: { readonly className?: string }) => (
    <span data-testid='google-icon' className={className} />
  ),
}));

const useAuthContextMock = vi.mocked(useAuthContext);

const buildAuthContext = () => ({
  authModalOpen: false,
  checkEmailConfirmation: vi.fn(),
  closeAuthModal: vi.fn(),
  confirmPasswordReset: vi.fn(),
  deleteAccount: vi.fn(),
  loading: false,
  openAuthModal: vi.fn(),
  resendEmailConfirmation: vi.fn(),
  resetPassword: vi.fn(),
  signIn: vi.fn(),
  signInWithGoogle: vi.fn(),
  signOut: vi.fn(),
  signUp: vi.fn(),
  updateProfile: vi.fn(),
  user: null,
});

const configureAuthContext = (overrides: Partial<ReturnType<typeof buildAuthContext>> = {}) => {
  useAuthContextMock.mockReturnValue({
    ...buildAuthContext(),
    ...overrides,
  } as never);
};

const renderLoginForm = () => {
  const onSuccess = vi.fn();
  const onSwitchMode = vi.fn();

  render(<LoginForm onSuccess={onSuccess} onSwitchMode={onSwitchMode} />);

  return { onSuccess, onSwitchMode };
};

describe('LoginForm', () => {
  beforeEach(() => {
    configureAuthContext();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('mantiene el botón deshabilitado hasta completar los campos requeridos', () => {
    // Arrange
    renderLoginForm();

    // Act
    const submitButton = screen.getByRole('button', { name: 'Iniciar sesión' });
    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: 'usuario@example.com' },
    });

    // Assert
    expect(submitButton).toBeDisabled();

    // Act
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: 'supersecret' },
    });

    // Assert
    expect(submitButton).toBeEnabled();
  });

  it('muestra un mensaje de validación cuando el email falta', async () => {
    // Arrange
    renderLoginForm();
    const form = document.querySelector('form');
    if (!form) {
      throw new Error('Form element not found');
    }
    expect(form).not.toBeNull();

    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: 'password123' },
    });

    // Act
    fireEvent.submit(form);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(LOGIN_MESSAGES.emailRequired)).toBeInTheDocument();
    });
  });

  it('habilita el reenvío de confirmación cuando el backend lo solicita', async () => {
    // Arrange
    const signInMock = vi
      .fn()
      .mockResolvedValue('Debes confirmar tu correo electrónico antes de iniciar sesión');
    configureAuthContext({ signIn: signInMock });
    renderLoginForm();

    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: 'sinconfirmar@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: 'password123' },
    });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    // Assert
    const resendButton = await screen.findByRole('button', {
      name: 'Reenviar email de confirmación',
    });
    expect(resendButton).toBeEnabled();
  });

  it('reenvía la confirmación y muestra un mensaje informativo', async () => {
    // Arrange
    const signInMock = vi
      .fn()
      .mockResolvedValue('Debes confirmar tu correo electrónico antes de iniciar sesión');
    const resendEmailConfirmationMock = vi.fn().mockResolvedValue(null);
    configureAuthContext({
      signIn: signInMock,
      resendEmailConfirmation: resendEmailConfirmationMock,
    });
    renderLoginForm();

    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: 'sinconfirmar@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    const resendButton = await screen.findByRole('button', {
      name: 'Reenviar email de confirmación',
    });

    // Act
    fireEvent.click(resendButton);

    // Assert
    await waitFor(() => {
      expect(resendEmailConfirmationMock).toHaveBeenCalledWith('sinconfirmar@example.com');
      expect(screen.getByText(LOGIN_MESSAGES.confirmationEmailSent)).toBeInTheDocument();
    });
  });

  it('ejecuta el inicio de sesión y llama a onSuccess', async () => {
    // Arrange
    const signInMock = vi.fn().mockResolvedValue(null);
    configureAuthContext({ signIn: signInMock });
    const { onSuccess } = renderLoginForm();

    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: 'usuario@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Contraseña/i), {
      target: { value: 'password123' },
    });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    // Assert
    await waitFor(() => {
      expect(signInMock).toHaveBeenCalledWith('usuario@example.com', 'password123');
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('authentica con Google cuando se solicita', async () => {
    // Arrange
    const signInWithGoogleMock = vi.fn().mockResolvedValue(null);
    configureAuthContext({ signInWithGoogle: signInWithGoogleMock });
    const { onSuccess } = renderLoginForm();

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Continuar con Google' }));

    // Assert
    await waitFor(() => {
      expect(signInWithGoogleMock).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });
});
