
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/contexts/AppContext';

type AuthMode = 'login' | 'register' | 'reset';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchMode: (mode: AuthMode) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchMode }) => {
  const { signIn, authLoading } = useAppContext();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
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

    setSubmitting(true);
    try {
      const message = await signIn(email.trim(), password);
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
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="login-email">Correo electrónico</Label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={event => setEmail(event.target.value)}
          required
          disabled={isBusy}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-password">Contraseña</Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={event => setPassword(event.target.value)}
          required
          disabled={isBusy}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={isBusy}>
        {isBusy ? 'Procesando…' : 'Entrar'}
      </Button>

      <div className="flex flex-col gap-2 text-sm text-muted-foreground">
        <button
          type="button"
          className="hover:text-foreground transition"
          onClick={() => onSwitchMode('register')}
          disabled={isBusy}
        >
          ¿Aún no tienes cuenta? Regístrate gratis
        </button>
        <button
          type="button"
          className="hover:text-foreground transition"
          onClick={() => onSwitchMode('reset')}
          disabled={isBusy}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>
    </form>
  );
};
