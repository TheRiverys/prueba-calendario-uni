import React, { useCallback, useState } from 'react';

import { GoogleIcon } from '@/components/GoogleIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthContext } from '@/contexts/auth/AuthContext';

type AuthMode = 'login' | 'register' | 'reset';

interface RegisterFormProps {
  readonly onSuccess: () => void;
  readonly onSwitchMode: (_authMode: AuthMode) => void;
}

export const REGISTER_MESSAGES = {
  emailRequired: 'Introduce un correo electrónico válido.',
  passwordsDoNotMatch: 'Las contraseñas no coinciden.',
  registrationSuccess:
    'Cuenta creada exitosamente. Revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión.',
  confirmationResent: 'Email de confirmación reenviado. Revisa tu bandeja de entrada.',
};

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchMode }) => {
  const {
    signUp,
    signInWithGoogle,
    loading: authLoading,
    resendEmailConfirmation,
  } = useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);

  const isBusy = submitting || authLoading || googleSubmitting || resendingConfirmation;
  const isSubmitDisabled =
    isBusy || email.trim().length === 0 || password.length === 0 || password !== confirmPassword;

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setError(null);
      setFeedback(null);
      setShowConfirmationMessage(false);

      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        setError(REGISTER_MESSAGES.emailRequired);
        return;
      }

      if (password !== confirmPassword) {
        setError(REGISTER_MESSAGES.passwordsDoNotMatch);
        return;
      }

      setSubmitting(true);
      try {
        const message = await signUp(trimmedEmail, password);
        if (message) {
          setError(message);
          return;
        }

        setFeedback(REGISTER_MESSAGES.registrationSuccess);
        setShowConfirmationMessage(true);
        onSuccess();
      } finally {
        setSubmitting(false);
      }
    },
    [confirmPassword, email, onSuccess, password, signUp]
  );

  const handleResendConfirmation = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError(REGISTER_MESSAGES.emailRequired);
      setFeedback(null);
      return;
    }

    setResendingConfirmation(true);
    setError(null);
    setFeedback(null);

    try {
      const message = await resendEmailConfirmation(trimmedEmail);
      if (message) {
        setError(message);
        return;
      }

      setFeedback(REGISTER_MESSAGES.confirmationResent);
    } finally {
      setResendingConfirmation(false);
    }
  }, [email, resendEmailConfirmation]);

  const handleGoogleSignIn = useCallback(async () => {
    setError(null);
    setFeedback(null);
    setGoogleSubmitting(true);

    try {
      const message = await signInWithGoogle();
      if (message) {
        setError(message);
        return;
      }

      onSuccess();
    } finally {
      setGoogleSubmitting(false);
    }
  }, [onSuccess, signInWithGoogle]);

  return (
    <form className='space-y-4' onSubmit={handleSubmit}>
      <div className='space-y-2'>
        <Label htmlFor='register-email'>Correo electrónico</Label>
        <Input
          id='register-email'
          type='email'
          autoComplete='email'
          value={email}
          onChange={event => setEmail(event.target.value)}
          required
          disabled={isBusy}
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='register-password'>Contraseña</Label>
        <Input
          id='register-password'
          type='password'
          autoComplete='new-password'
          value={password}
          onChange={event => setPassword(event.target.value)}
          required
          disabled={isBusy}
          minLength={6}
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='register-confirm'>Confirmar contraseña</Label>
        <Input
          id='register-confirm'
          type='password'
          autoComplete='new-password'
          value={confirmPassword}
          onChange={event => setConfirmPassword(event.target.value)}
          required
          disabled={isBusy}
          minLength={6}
        />
      </div>

      {error ? (
        <p className='text-destructive bg-destructive/10 rounded-md px-3 py-2 text-sm'>{error}</p>
      ) : null}

      {feedback ? (
        <p className='text-primary bg-primary/10 rounded-md px-3 py-2 text-sm'>{feedback}</p>
      ) : null}

      <Button type='submit' className='w-full' disabled={isSubmitDisabled}>
        {submitting ? (
          <>
            <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600' />
            Creando cuenta...
          </>
        ) : (
          'Crear cuenta'
        )}
      </Button>

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
        </div>
        <div className='relative flex justify-center text-xs uppercase'>
          <span className='bg-background text-muted-foreground px-2'>o continúa con</span>
        </div>
      </div>

      <Button
        type='button'
        variant='outline'
        className='w-full'
        disabled={isBusy}
        onClick={handleGoogleSignIn}
      >
        {googleSubmitting ? (
          <>
            <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600' />
            Conectando...
          </>
        ) : (
          <>
            <GoogleIcon className='mr-2 h-4 w-4' />
            Continuar con Google
          </>
        )}
      </Button>

      <div className='text-muted-foreground flex flex-col gap-2 text-sm'>
        <button
          type='button'
          className='hover:text-foreground transition'
          onClick={() => onSwitchMode('login')}
          disabled={isBusy}
        >
          ¿Ya tienes cuenta? Inicia sesión
        </button>
        <button
          type='button'
          className='hover:text-foreground transition'
          onClick={() => onSwitchMode('reset')}
          disabled={isBusy}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {showConfirmationMessage ? (
        <Button
          type='button'
          variant='outline'
          className='w-full'
          disabled={isBusy}
          onClick={handleResendConfirmation}
        >
          {resendingConfirmation ? (
            <>
              <div className='mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600' />
              Enviando...
            </>
          ) : (
            'Reenviar email de confirmación'
          )}
        </Button>
      ) : null}
    </form>
  );
};
