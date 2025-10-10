import React, { useCallback, useState } from 'react';

import { GoogleIcon } from '@/components/GoogleIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthContext } from '@/contexts/auth/AuthContext';

type AuthMode = 'login' | 'register' | 'reset';

interface LoginFormProps {
  readonly onSuccess: () => void;
  readonly onSwitchMode: (_authMode: AuthMode) => void;
}

export const LOGIN_MESSAGES = {
  emailRequired: 'Introduce un correo electrónico válido.',
  confirmationReminderSnippet: 'confirmar tu correo electrónico',
  confirmationEmailSent: 'Email de confirmación enviado. Revisa tu bandeja de entrada.',
};

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchMode }) => {
  const {
    signIn,
    signInWithGoogle,
    loading: authLoading,
    resendEmailConfirmation,
  } = useAuthContext();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [showResendConfirmation, setShowResendConfirmation] = useState(false);
  const [resendingConfirmation, setResendingConfirmation] = useState(false);

  const isBusy = authLoading || submitting || googleSubmitting || resendingConfirmation;
  const isSubmitDisabled = isBusy || email.trim().length === 0 || password.length === 0;

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setError(null);
      setFeedback(null);
      setShowResendConfirmation(false);

      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        setError(LOGIN_MESSAGES.emailRequired);
        return;
      }

      setSubmitting(true);
      try {
        const message = await signIn(trimmedEmail, password);
        if (message) {
          if (message.includes(LOGIN_MESSAGES.confirmationReminderSnippet)) {
            setShowResendConfirmation(true);
          }
          setError(message);
          return;
        }

        onSuccess();
      } finally {
        setSubmitting(false);
      }
    },
    [email, password, signIn, onSuccess]
  );

  const handleResendConfirmation = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError(LOGIN_MESSAGES.emailRequired);
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

      setFeedback(LOGIN_MESSAGES.confirmationEmailSent);
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
        <Label htmlFor='login-email'>Correo electrónico</Label>
        <Input
          id='login-email'
          type='email'
          autoComplete='email'
          value={email}
          onChange={event => setEmail(event.target.value)}
          required
          disabled={isBusy}
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='login-password'>Contraseña</Label>
        <Input
          id='login-password'
          type='password'
          autoComplete='current-password'
          value={password}
          onChange={event => setPassword(event.target.value)}
          required
          disabled={isBusy}
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
            Iniciando sesión...
          </>
        ) : (
          'Iniciar sesión'
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
          onClick={() => onSwitchMode('register')}
          disabled={isBusy}
        >
          ¿Aún no tienes cuenta? Regístrate gratis
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

      {showResendConfirmation ? (
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
