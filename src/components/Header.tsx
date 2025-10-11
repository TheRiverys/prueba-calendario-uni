import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  BookOpen,
  Calendar,
  ChevronDown,
  HelpCircle,
  LogOut,
  Moon,
  Settings,
  Sun,
  User,
} from 'lucide-react';
import { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { toast } from '@/components/ui/sonner';
import { useAuthContext } from '@/contexts/auth/AuthContext';
import { useConfigContext } from '@/contexts/config/ConfigContext';
import { usePreferencesContext } from '@/contexts/preferences/PreferencesContext';
import { clearLocalUserData } from '@/utils/storage';

import { UserAvatar } from './ui/avatar';
import { Button } from './ui/button';

const FALLBACK_LOGO = (
  <svg className='text-primary h-5 w-5' viewBox='0 0 20 20' fill='currentColor' aria-hidden='true'>
    <path d='M10.394 2.08a1 1 0 0 0-.788 0l-7 3a1 1 0 0 0 0 1.84l2.644 1.131a1 1 0 0 1 .356-.257l4-1.714a1 1 0 1 1 .788 1.84L7.667 9.088l1.94.831a1 1 0 0 0 .787 0l7-3a1 1 0 0 0 0-1.838zM3.31 9.397 5 10.12v4.102a8.969 8.969 0 0 0-1.05-.174 1 1 0 0 1-.89-.89 11.115 11.115 0 0 1 .25-3.762zM9.3 16.573A9.026 9.026 0 0 0 7 14.935v-3.957l1.818.78a3 3 0 0 0 2.364 0l5.508-2.361a11.026 11.026 0 0 1 .25 3.762 1 1 0 0 1-.89.89 8.968 8.968 0 0 0-5.35 2.524 1 1 0 0 1-1.4 0zM6 18a1 1 0 0 0 1-1v-2.065a8.935 8.935 0 0 0-2-.712V17a1 1 0 0 0 1 1z' />
  </svg>
);

const Header = (): JSX.Element => {
  const { theme, toggleTheme, setCurrentPage } = usePreferencesContext();
  const { openConfigModal } = useConfigContext();
  const { user, loading: authLoading, openAuthModal, signOut } = useAuthContext();

  const [signingOut, setSigningOut] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const today = useMemo(() => {
    const now = new Date();
    return {
      longFormat: format(now, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }),
      shortFormat: format(now, 'd/MM/yyyy', { locale: es }),
    };
  }, []);

  const handleSignOut = useCallback(async () => {
    setSigningOut(true);
    try {
      const message = await signOut();
      if (message) {
        toast.error('No se pudo cerrar la sesión.', {
          description: message,
        });
      } else {
        // Limpiar datos locales y redirigir al inicio después del cierre de sesión exitoso
        clearLocalUserData();
        setCurrentPage('dashboard');
        toast.success('Sesión cerrada correctamente.');
      }
    } catch (error) {
      toast.error('Error inesperado al cerrar sesión.', {
        description: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setSigningOut(false);
    }
  }, [signOut, setCurrentPage]);

  useEffect(() => {
    if (!dropdownOpen) {
      return undefined;
    }

    const handleClickOutside = (event: globalThis.MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogoError = () => {
    setLogoFailed(true);
  };

  const renderLogoContent = () => {
    if (logoFailed) {
      return FALLBACK_LOGO;
    }

    return (
      <img
        src='/logo.svg'
        alt='Academic Suite Logo'
        className='h-full w-full object-contain'
        onError={handleLogoError}
      />
    );
  };

  const handleNavigateToDashboard = useCallback(() => {
    setCurrentPage('dashboard');
  }, [setCurrentPage]);

  return (
    <header className='border-border/70 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b backdrop-blur'>
      <div className='app-shell flex h-16 items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div
            className='group flex cursor-pointer items-center gap-3'
            onClick={handleNavigateToDashboard}
            role='button'
            tabIndex={0}
            aria-label='Ir a la página principal'
          >
            <div className='relative'>
              <div className='border-primary/40 flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border transition-transform duration-300 group-hover:scale-105'>
                {renderLogoContent()}
              </div>
              <div className='border-primary/20 pointer-events-none absolute -inset-1 -z-10 rounded-xl border opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
            </div>
            <div className='hidden sm:block'>
              <h1 className='text-foreground text-xl font-semibold'>Academic Suite</h1>
            </div>
          </div>
        </div>

        <div className='bg-muted/30 hidden items-center gap-2 rounded-md border px-4 py-2 lg:flex'>
          <Calendar className='text-muted-foreground h-4 w-4' />
          <div className='flex flex-col'>
            <span className='text-muted-foreground text-xs font-medium tracking-wide uppercase'>
              Hoy
            </span>
            <span className='text-foreground text-sm font-semibold'>{today.longFormat}</span>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            id='wiki-button'
            variant='ghost'
            size='icon'
            onClick={() => setCurrentPage('wiki')}
            className='hover:bg-muted/80 h-9 w-9 transition-colors'
            title='Documentación y recursos'
          >
            <BookOpen className='h-4 w-4' />
          </Button>

          <Button
            id='help-button'
            variant='ghost'
            size='icon'
            onClick={() => setCurrentPage('help')}
            className='hover:bg-muted/80 h-9 w-9 transition-colors'
            title='Ayuda y documentación'
          >
            <HelpCircle className='h-4 w-4' />
          </Button>

          <Button
            variant='ghost'
            size='icon'
            onClick={toggleTheme}
            className='hover:bg-muted/80 h-9 w-9 transition-colors'
            title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
          >
            {theme === 'light' ? (
              <Sun className='h-4 w-4 transition-all' />
            ) : (
              <Moon className='h-4 w-4 transition-all' />
            )}
          </Button>

          {!user && (
            <Button
              id='header-settings-button'
              variant='ghost'
              size='icon'
              onClick={openConfigModal}
              className='hover:bg-muted/80 h-9 w-9 transition-colors'
              title='Configuración'
            >
              <Settings className='h-4 w-4' />
            </Button>
          )}

          {user ? (
            <div className='dropdown-container relative'>
              <Button
                variant='ghost'
                className='hover:bg-muted/80 flex h-9 items-center gap-2 px-3 transition-colors'
                onClick={() => setDropdownOpen(prev => !prev)}
                aria-expanded={dropdownOpen}
                aria-haspopup='menu'
              >
                <UserAvatar user={user} size='sm' className='bg-primary/10 text-primary' />
                <span className='hidden max-w-[150px] truncate text-sm font-medium md:inline'>
                  {user.email}
                </span>
                <ChevronDown
                  className={`text-muted-foreground h-3 w-3 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                />
              </Button>

              {dropdownOpen && (
                <div
                  className='animate-in fade-in-0 zoom-in-95 border-border bg-popover absolute top-full right-0 mt-2 w-56 rounded-md border shadow-lg'
                  role='menu'
                >
                  <div className='p-2'>
                    <div className='mb-2 flex flex-col space-y-1'>
                      <p className='text-sm leading-none font-medium'>Cuenta</p>
                      <p className='text-muted-foreground text-xs leading-none'>{user.email}</p>
                    </div>
                    <hr className='border-border my-2' />
                    <button
                      className='hover:bg-accent hover:text-accent-foreground flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm'
                      onClick={() => {
                        setCurrentPage('profile');
                        setDropdownOpen(false);
                      }}
                      role='menuitem'
                    >
                      <User className='h-4 w-4' />
                      <span>Perfil</span>
                    </button>
                    <button
                      className='hover:bg-accent hover:text-accent-foreground flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm'
                      onClick={() => {
                        setCurrentPage('wiki');
                        setDropdownOpen(false);
                      }}
                      role='menuitem'
                    >
                      <BookOpen className='h-4 w-4' />
                      <span>Documentación</span>
                    </button>
                    <button
                      className='hover:bg-accent hover:text-accent-foreground flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm'
                      onClick={() => {
                        openConfigModal();
                        setDropdownOpen(false);
                      }}
                      role='menuitem'
                    >
                      <Settings className='h-4 w-4' />
                      <span>Configuración</span>
                    </button>
                    <hr className='border-border my-2' />
                    <button
                      className='text-destructive hover:bg-destructive/10 flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm'
                      onClick={() => {
                        handleSignOut();
                        setDropdownOpen(false);
                      }}
                      disabled={signingOut}
                      role='menuitem'
                    >
                      <LogOut className='h-4 w-4' />
                      <span>{signingOut ? 'Saliendo...' : 'Cerrar sesión'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button
              size='sm'
              onClick={openAuthModal}
              disabled={authLoading}
              className='h-9 px-4 font-medium'
            >
              Iniciar sesión
            </Button>
          )}
        </div>
      </div>

      <div className='border-t bg-transparent px-4 py-2 lg:hidden'>
        <div className='text-muted-foreground flex items-center justify-center gap-2 text-xs'>
          <Calendar className='h-3 w-3' />
          <span className='font-medium'>{today.shortFormat}</span>
        </div>
      </div>
    </header>
  );
};

export { Header };
