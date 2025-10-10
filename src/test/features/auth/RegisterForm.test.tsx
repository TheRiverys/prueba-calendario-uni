import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthContext } from '@/contexts/auth/AuthContext';
import { REGISTER_MESSAGES, RegisterForm } from '@/features/auth/components/RegisterForm';
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

const renderRegisterForm = () => {
  const onSuccess = vi.fn();
  const onSwitchMode = vi.fn();

  render(<RegisterForm onSuccess={onSuccess} onSwitchMode={onSwitchMode} />);

  return { onSuccess, onSwitchMode };
};

describe('RegisterForm', () => {
  beforeEach(() => {
    configureAuthContext();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('mantiene el botón deshabilitado mientras falten datos', () => {
    // Arrange
    renderRegisterForm();

    const submitButton = screen.getByRole('button', { name: 'Crear cuenta' });

    // Act
    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: 'usuario@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Contraseña$/i), {
      target: { value: 'password123' },
    });

    // Assert
    expect(submitButton).toBeDisabled();
  });

  it('valida la ausencia de correo electrónico', async () => {
    // Arrange
    renderRegisterForm();
    const form = document.querySelector('form');
    if (!form) {
      throw new Error('Form element not found');
    }
    expect(form).not.toBeNull();

    fireEvent.change(screen.getByLabelText(/^Contraseña$/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/^Confirmar contraseña$/i), {
      target: { value: 'password123' },
    });

    // Act
    fireEvent.submit(form);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(REGISTER_MESSAGES.emailRequired)).toBeInTheDocument();
    });
  });

  it('valida que las contraseñas coincidan', async () => {
    // Arrange
    renderRegisterForm();
    const form = document.querySelector('form');
    if (!form) {
      throw new Error('Form element not found');
    }
    expect(form).not.toBeNull();

    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: 'usuario@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Contraseña$/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/^Confirmar contraseña$/i), {
      target: { value: 'otra' },
    });

    // Act
    fireEvent.submit(form);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(REGISTER_MESSAGES.passwordsDoNotMatch)).toBeInTheDocument();
    });
  });

  it('registra al usuario y expone un mensaje informativo', async () => {
    // Arrange
    const signUpMock = vi.fn().mockResolvedValue(null);
    configureAuthContext({ signUp: signUpMock });
    const { onSuccess } = renderRegisterForm();

    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: 'usuario@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Contraseña$/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/^Confirmar contraseña$/i), {
      target: { value: 'password123' },
    });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    // Assert
    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith('usuario@example.com', 'password123');
      expect(onSuccess).toHaveBeenCalled();
      expect(screen.getByText(REGISTER_MESSAGES.registrationSuccess)).toBeInTheDocument();
    });
  });

  it('permite reenviar el correo de confirmación tras el registro', async () => {
    // Arrange
    const signUpMock = vi.fn().mockResolvedValue(null);
    const resendEmailConfirmationMock = vi.fn().mockResolvedValue(null);
    configureAuthContext({
      signUp: signUpMock,
      resendEmailConfirmation: resendEmailConfirmationMock,
    });
    renderRegisterForm();

    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: 'usuario@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Contraseña$/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/^Confirmar contraseña$/i), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    const resendButton = await screen.findByRole('button', {
      name: 'Reenviar email de confirmación',
    });

    // Act
    fireEvent.click(resendButton);

    // Assert
    await waitFor(() => {
      expect(resendEmailConfirmationMock).toHaveBeenCalledWith('usuario@example.com');
      expect(screen.getByText(REGISTER_MESSAGES.confirmationResent)).toBeInTheDocument();
    });
  });

  it('gestiona la autenticación con Google', async () => {
    // Arrange
    const signInWithGoogleMock = vi.fn().mockResolvedValue(null);
    configureAuthContext({ signInWithGoogle: signInWithGoogleMock });
    const { onSuccess } = renderRegisterForm();

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Continuar con Google' }));

    // Assert
    await waitFor(() => {
      expect(signInWithGoogleMock).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('permite navegar entre modos', () => {
    // Arrange
    const { onSwitchMode } = renderRegisterForm();

    // Act
    fireEvent.click(screen.getByText('¿Ya tienes cuenta? Inicia sesión'));
    fireEvent.click(screen.getByText('¿Olvidaste tu contraseña?'));

    // Assert
    expect(onSwitchMode).toHaveBeenNthCalledWith(1, 'login');
    expect(onSwitchMode).toHaveBeenNthCalledWith(2, 'reset');
  });

  it('expone errores de signUp', async () => {
    // Arrange
    const signUpMock = vi.fn().mockResolvedValue('Error en el registro');
    configureAuthContext({ signUp: signUpMock });
    renderRegisterForm();

    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: 'usuario@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Contraseña$/i), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText(/^Confirmar contraseña$/i), {
      target: { value: 'password123' },
    });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Error en el registro')).toBeInTheDocument();
    });
  });
});
