import React, { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthContext } from '@/contexts/auth/AuthContext';

type AuthMode = 'login' | 'register' | 'reset';

interface ResetPasswordFormProps {
  readonly onSwitchMode: (_authMode: AuthMode) => void;
}

export const RESET_PASSWORD_MESSAGES = {
  emailRequired: 'Introduce un correo electrónico válido.',
  success: 'Te hemos enviado un enlace para restablecer tu contraseña. Revisa tu correo.',
};

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSwitchMode }) => {
  const { resetPassword, loading: authLoading } = useAuthContext();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isBusy = authLoading || submitting;
  const isSubmitDisabled = isBusy || email.trim().length === 0;

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setError(null);
      setFeedback(null);

      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        setError(RESET_PASSWORD_MESSAGES.emailRequired);
        return;
      }

      setSubmitting(true);
      try {
        const message = await resetPassword(trimmedEmail);
        if (message) {
          setError(message);
          return;
        }

        setFeedback(RESET_PASSWORD_MESSAGES.success);
      } finally {
        setSubmitting(false);
      }
    },
    [email, resetPassword]
  );

  return (
    <form className='space-y-4' onSubmit={handleSubmit}>
      <div className='space-y-2'>
        <Label htmlFor='reset-email'>Correo electrónico</Label>
        <Input
          id='reset-email'
          type='email'
          autoComplete='email'
          value={email}
          onChange={event => setEmail(event.target.value)}
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
        {submitting ? 'Procesando' : 'Enviar enlace'}
      </Button>

      <div className='text-muted-foreground flex flex-col gap-2 text-sm'>
        <button
          type='button'
          className='hover:text-foreground transition'
          onClick={() => onSwitchMode('login')}
          disabled={isBusy}
        >
          Volver a iniciar sesión
        </button>
        <button
          type='button'
          className='hover:text-foreground transition'
          onClick={() => onSwitchMode('register')}
          disabled={isBusy}
        >
          ¿Aún no tienes cuenta? Regístrate
        </button>
      </div>
    </form>
  );
};
