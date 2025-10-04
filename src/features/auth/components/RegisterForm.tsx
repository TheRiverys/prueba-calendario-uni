import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthContext } from '@/contexts/auth/AuthContext';

type AuthMode = 'login' | 'register' | 'reset';

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchMode: (mode: AuthMode) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchMode }) => {
  const { signUp, loading: authLoading } = useAuthContext();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const isBusy = submitting || authLoading;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

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
      onSuccess();
    } finally {
      setSubmitting(false);
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
          onChange={(event) => setEmail(event.target.value)}
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
          onChange={(event) => setPassword(event.target.value)}
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
          onChange={(event) => setConfirmPassword(event.target.value)}
          required
          disabled={isBusy}
          minLength={6}
        />
      </div>

      {error && (
        <p className='text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2'>{error}</p>
      )}

      <Button type='submit' className='w-full' disabled={isBusy}>
        {isBusy ? 'Procesando' : 'Registrarme'}
      </Button>

      <div className='flex flex-col gap-2 text-sm text-muted-foreground'>
        <button
          type='button'
          className='transition hover:text-foreground'
          onClick={() => onSwitchMode('login')}
          disabled={isBusy}
        >
          ¿Ya tienes cuenta? Inicia sesión
        </button>
        <button
          type='button'
          className='transition hover:text-foreground'
          onClick={() => onSwitchMode('reset')}
          disabled={isBusy}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>
    </form>
  );
};
