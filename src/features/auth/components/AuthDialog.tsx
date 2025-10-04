import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuthContext } from '@/contexts/auth/AuthContext';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ResetPasswordForm } from './ResetPasswordForm';

type AuthMode = 'login' | 'register' | 'reset';

const descriptions: Record<AuthMode, string> = {
  login: 'Accede con tu cuenta para sincronizar tus entregas entre dispositivos.',
  register: 'Crea una cuenta gratuita para guardar tus entregas en la nube.',
  reset: 'Introduce tu correo para recibir un enlace de restablecimiento.',
};

export const AuthDialog: React.FC = () => {
  const { authModalOpen, openAuthModal, closeAuthModal } = useAuthContext();
  const [mode, setMode] = React.useState<AuthMode>('login');

  React.useEffect(() => {
    if (!authModalOpen) {
      setMode('login');
    }
  }, [authModalOpen]);

  const handleSuccess = React.useCallback(() => {
    closeAuthModal();
    setMode('login');
  }, [closeAuthModal]);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (open) {
        openAuthModal();
      } else {
        closeAuthModal();
      }
    },
    [openAuthModal, closeAuthModal]
  );

  const renderForm = () => {
    if (mode === 'login') {
      return <LoginForm onSuccess={handleSuccess} onSwitchMode={setMode} />;
    }
    if (mode === 'register') {
      return <RegisterForm onSuccess={handleSuccess} onSwitchMode={setMode} />;
    }
    return <ResetPasswordForm onSwitchMode={setMode} />;
  };

  return (
    <Dialog open={authModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-[420px] md:max-w-[480px]' aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {mode === 'login'
              ? 'Iniciar sesión'
              : mode === 'register'
                ? 'Crear cuenta'
                : 'Recuperar contraseña'}
          </DialogTitle>
          <DialogDescription>{descriptions[mode]}</DialogDescription>
        </DialogHeader>

        <div className='grid gap-6'>{renderForm()}</div>
      </DialogContent>
    </Dialog>
  );
};
