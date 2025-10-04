import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthContext } from '@/contexts/auth/AuthContext';

type AuthMode = 'login' | 'register' | 'reset';

interface ResetPasswordFormProps {
  onSwitchMode: (mode: AuthMode) => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSwitchMode }) => {
  const { resetPassword, loading: authLoading } = useAuthContext();
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const isBusy = submitting || authLoading;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFeedback(null);

    if (!email.trim()) {
      setError('Introduce un correo electrónico válido.');
      return;
    }

    setSubmitting(true);
    try {
      const message = await resetPassword(email.trim());
      if (message) {
        setError(message);
        return;
      }
      setFeedback('Te hemos enviado un enlace para restablecer tu contraseña. Revisa tu correo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className='space-y-4' onSubmit={handleSubmit}>
      <div className='space-y-2'>
        <Label htmlFor='reset-email'>Correo electrónico</Label>
        <Input
          id='reset-email'
          type='email'
          autoComplete='email'
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          disabled={isBusy}
        />
      </div>

      {error && (
        <p className='text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2'>{error}</p>
      )}

      {feedback && (
        <p className='text-sm text-primary bg-primary/10 rounded-md px-3 py-2'>{feedback}</p>
      )}

      <Button type='submit' className='w-full' disabled={isBusy}>
        {isBusy ? 'Procesando' : 'Enviar enlace'}
      </Button>

      <div className='flex flex-col gap-2 text-sm text-muted-foreground'>
        <button
          type='button'
          className='transition hover:text-foreground'
          onClick={() => onSwitchMode('login')}
          disabled={isBusy}
        >
          Volver a iniciar sesión
        </button>
        <button
          type='button'
          className='transition hover:text-foreground'
          onClick={() => onSwitchMode('register')}
          disabled={isBusy}
        >
          ¿Aún no tienes cuenta? Regístrate
        </button>
      </div>
    </form>
  );
};
