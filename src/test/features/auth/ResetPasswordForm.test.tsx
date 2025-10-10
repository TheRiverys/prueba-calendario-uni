import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthContext } from '@/contexts/auth/AuthContext';
import {
  RESET_PASSWORD_MESSAGES,
  ResetPasswordForm,
} from '@/features/auth/components/ResetPasswordForm';

vi.mock('@/contexts/auth/AuthContext');

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

const renderResetPasswordForm = () => {
  const onSwitchMode = vi.fn();
  render(<ResetPasswordForm onSwitchMode={onSwitchMode} />);
  return { onSwitchMode };
};

describe('ResetPasswordForm', () => {
  beforeEach(() => {
    configureAuthContext();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('deshabilita el botón cuando no hay email', () => {
    // Arrange
    renderResetPasswordForm();

    // Act
    const submitButton = screen.getByRole('button', { name: 'Enviar enlace' });

    // Assert
    expect(submitButton).toBeDisabled();
  });

  it('muestra un mensaje de validación al intentar enviar sin email', async () => {
    // Arrange
    renderResetPasswordForm();
    const form = document.querySelector('form');
    if (!form) {
      throw new Error('Form element not found');
    }
    expect(form).not.toBeNull();

    // Act
    fireEvent.submit(form);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(RESET_PASSWORD_MESSAGES.emailRequired)).toBeInTheDocument();
    });
  });

  it('orquesta el flujo de reseteo cuando el backend responde correctamente', async () => {
    // Arrange
    const resetPasswordMock = vi.fn().mockResolvedValue(null);
    configureAuthContext({ resetPassword: resetPasswordMock });
    renderResetPasswordForm();

    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: 'user@example.com' },
    });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    // Assert
    await waitFor(() => {
      expect(resetPasswordMock).toHaveBeenCalledWith('user@example.com');
      expect(screen.getByText(RESET_PASSWORD_MESSAGES.success)).toBeInTheDocument();
    });
  });

  it('expone errores cuando el backend falla', async () => {
    // Arrange
    const resetPasswordMock = vi.fn().mockResolvedValue('No se pudo enviar el correo.');
    configureAuthContext({ resetPassword: resetPasswordMock });
    renderResetPasswordForm();

    fireEvent.change(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: 'user@example.com' },
    });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Enviar enlace' }));

    // Assert
    await waitFor(() => {
      expect(resetPasswordMock).toHaveBeenCalled();
      expect(screen.getByText('No se pudo enviar el correo.')).toBeInTheDocument();
    });
  });

  it('permite navegar a otros modos', () => {
    // Arrange
    const { onSwitchMode } = renderResetPasswordForm();

    // Act
    fireEvent.click(screen.getByText('Volver a iniciar sesión'));
    fireEvent.click(screen.getByText('¿Aún no tienes cuenta? Regístrate'));

    // Assert
    expect(onSwitchMode).toHaveBeenNthCalledWith(1, 'login');
    expect(onSwitchMode).toHaveBeenNthCalledWith(2, 'register');
  });
});
