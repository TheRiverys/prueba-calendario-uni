
import React from 'react';
import { BookOpen, Moon, Sun, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from './ui/button';
import { useAppContext } from '../contexts/AppContext';

export const Header: React.FC = () => {
  const {
    theme,
    toggleTheme,
    openConfigModal,
    user,
    authLoading,
    openAuthModal,
    signOut
  } = useAppContext();

  const [signingOut, setSigningOut] = React.useState(false);

  const handleSignOut = React.useCallback(async () => {
    setSigningOut(true);
    try {
      const message = await signOut();
      if (message) {
        console.error('No se pudo cerrar la sesión:', message);
      }
    } finally {
      setSigningOut(false);
    }
  }, [signOut]);

  const today = React.useMemo(() => {
    const longFormat = format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    const shortFormat = format(new Date(), 'd/MM/yyyy', { locale: es });
    return { longFormat, shortFormat };
  }, []);

  return (
    <header className="border-b bg-card/70 backdrop-blur">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-6 px-4 pb-6 pt-6 sm:px-6 lg:px-10 xl:px-14">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Panel principal</p>
              <h1 className="text-3xl font-semibold text-foreground leading-tight">
                Workspace académico
              </h1>
            </div>
          </div>

          <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
            <div className="hidden md:flex flex-col text-right text-xs text-muted-foreground">
              <span className="uppercase tracking-wide">Hoy</span>
              <span>{today.longFormat}</span>
            </div>
            <div className="md:hidden w-full text-right text-xs text-muted-foreground">
              {today.shortFormat}
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-xs text-muted-foreground max-w-[200px] truncate">
                  {user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  disabled={authLoading || signingOut}
                >
                  {signingOut ? 'Saliendo…' : 'Cerrar sesión'}
                </Button>
              </div>
            ) : (
              <Button size="sm" onClick={openAuthModal} disabled={authLoading}>
                Iniciar sesión
              </Button>
            )}

            <Button variant="outline" size="icon" onClick={openConfigModal} title="Configuración">
              <Settings className="w-4 h-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            >
              {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
