import React from 'react';

import { GoogleIcon } from '@/components/GoogleIcon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthContext } from '@/contexts/auth/AuthContext';

type AuthMode = 'login' | 'register' | 'reset';

type FormElement = globalThis.HTMLFormElement;

interface RegisterFormProps {
  readonly onSuccess: () => void;
  readonly onSwitchMode: (_authMode: AuthMode) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchMode }) => {
  const {
    signUp,
    signInWithGoogle,
    loading: authLoading,
    resendEmailConfirmation,
  } = useAuthContext();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [googleSubmitting, setGoogleSubmitting] = React.useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = React.useState(false);
  const [resendingConfirmation, setResendingConfirmation] = React.useState(false);

  const isBusy = submitting || authLoading || googleSubmitting || resendingConfirmation;

  const handleSubmit = async (event: React.FormEvent<FormElement>) => {
    event.preventDefault();
    setError(null);
    setShowConfirmationMessage(false);

    if (!email.trim()) {
      setError('Introduce un correo electrónico válido.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSubmitting(true);
    try {
      const message = await signUp(email.trim(), password);
      if (message) {
        setError(message);
        return;
      }

      // Mostrar mensaje de confirmación después del registro exitoso
      setShowConfirmationMessage(true);
      setError(
        'Cuenta creada exitosamente. Revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      setError('Introduce un correo electrónico válido.');
      return;
    }

    setResendingConfirmation(true);
    setError(null);

    try {
      const message = await resendEmailConfirmation(email.trim());
      if (message) {
        setError(message);
      } else {
        setError('Email de confirmación reenviado. Revisa tu bandeja de entrada.');
      }
    } finally {
      setResendingConfirmation(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
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
  };

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

      {error && (
        <p className='text-destructive bg-destructive/10 rounded-md px-3 py-2 text-sm'>{error}</p>
      )}

      {showConfirmationMessage && (
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
      )}

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

      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <span className='w-full border-t' />
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background text-muted-foreground px-2'>o continúa con</span>
          </div>
        </div>

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
      </div>
    </form>
  );
};
