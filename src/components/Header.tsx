import { type JSX, useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronDown, LogOut, Moon, Settings, Sun, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from './ui/button';
import { useAppContext } from '../contexts/AppContext';

const FALLBACK_LOGO = (
  <svg className='h-5 w-5 text-primary' viewBox='0 0 20 20' fill='currentColor' aria-hidden='true'>
    <path d='M10.394 2.08a1 1 0 0 0-.788 0l-7 3a1 1 0 0 0 0 1.84l2.644 1.131a1 1 0 0 1 .356-.257l4-1.714a1 1 0 1 1 .788 1.84L7.667 9.088l1.94.831a1 1 0 0 0 .787 0l7-3a1 1 0 0 0 0-1.838zM3.31 9.397 5 10.12v4.102a8.969 8.969 0 0 0-1.05-.174 1 1 0 0 1-.89-.89 11.115 11.115 0 0 1 .25-3.762zM9.3 16.573A9.026 9.026 0 0 0 7 14.935v-3.957l1.818.78a3 3 0 0 0 2.364 0l5.508-2.361a11.026 11.026 0 0 1 .25 3.762 1 1 0 0 1-.89.89 8.968 8.968 0 0 0-5.35 2.524 1 1 0 0 1-1.4 0zM6 18a1 1 0 0 0 1-1v-2.065a8.935 8.935 0 0 0-2-.712V17a1 1 0 0 0 1 1z' />
  </svg>
);

const Header = (): JSX.Element => {
  const {
    theme,
    toggleTheme,
    openConfigModal,
    user,
    authLoading,
    openAuthModal,
    signOut,
    setCurrentPage
  } = useAppContext();

  const [signingOut, setSigningOut] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const today = useMemo(() => {
    const now = new Date();
    return {
      longFormat: format(now, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }),
      shortFormat: format(now, 'd/MM/yyyy', { locale: es })
    };
  }, []);

  const getUserInitials = (email?: string): string => {
    if (!email) {
      return '??';
    }

    return email.substring(0, 2).toUpperCase();
  };

  const handleSignOut = useCallback(async () => {
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

  useEffect(() => {
    if (!dropdownOpen) {
      return undefined;
    }

    const handleClickOutside = (event: MouseEvent) => {
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

  return (
    <header className='sticky top-0 z-40 w-full border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='app-shell flex h-16 items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='group flex cursor-pointer items-center gap-3'>
            <div className='relative'>
              <div className='flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-primary/40 transition-transform duration-300 group-hover:scale-105'>
                {renderLogoContent()}
              </div>
              <div className='pointer-events-none absolute -inset-1 -z-10 rounded-xl border border-primary/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
            </div>
            <div className='hidden sm:block'>
              <h1 className='text-xl font-semibold text-foreground'>Academic Suite</h1>
            </div>
          </div>
        </div>

        <div className='hidden items-center gap-2 rounded-md border bg-muted/30 px-4 py-2 lg:flex'>
          <Calendar className='h-4 w-4 text-muted-foreground' />
          <div className='flex flex-col'>
            <span className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>Hoy</span>
            <span className='text-sm font-semibold text-foreground'>{today.longFormat}</span>
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={toggleTheme}
            className='h-9 w-9 transition-colors hover:bg-muted/80'
            title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
          >
            {theme === 'light' ? <Sun className='h-4 w-4 transition-all' /> : <Moon className='h-4 w-4 transition-all' />}
          </Button>

          {!user && (
            <Button
              variant='ghost'
              size='icon'
              onClick={openConfigModal}
              className='h-9 w-9 transition-colors hover:bg-muted/80'
              title='Configuración'
            >
              <Settings className='h-4 w-4' />
            </Button>
          )}

          {user ? (
            <div className='dropdown-container relative'>
              <Button
                variant='ghost'
                className='flex h-9 items-center gap-2 px-3 transition-colors hover:bg-muted/80'
                onClick={() => setDropdownOpen(prev => !prev)}
                aria-expanded={dropdownOpen}
                aria-haspopup='menu'
              >
                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary'>
                  {getUserInitials(user.email)}
                </div>
                <span className='hidden max-w-[150px] truncate text-sm font-medium md:inline'>{user.email}</span>
                <ChevronDown className={`h-3 w-3 text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </Button>

              {dropdownOpen && (
                <div
                  className='absolute right-0 top-full mt-2 w-56 animate-in fade-in-0 zoom-in-95 rounded-md border border-border bg-popover shadow-lg'
                  role='menu'
                >
                  <div className='p-2'>
                    <div className='mb-2 flex flex-col space-y-1'>
                      <p className='text-sm font-medium leading-none'>Cuenta</p>
                      <p className='text-xs leading-none text-muted-foreground'>{user.email}</p>
                    </div>
                    <hr className='my-2 border-border' />
                    <button
                      className='flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground'
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
                      className='flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground'
                      onClick={() => {
                        openConfigModal();
                        setDropdownOpen(false);
                      }}
                      role='menuitem'
                    >
                      <Settings className='h-4 w-4' />
                      <span>Configuración</span>
                    </button>
                    <hr className='my-2 border-border' />
                    <button
                      className='flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10'
                      onClick={() => {
                        handleSignOut();
                        setDropdownOpen(false);
                      }}
                      disabled={signingOut}
                      role='menuitem'
                    >
                      <LogOut className='h-4 w-4' />
                      <span>{signingOut ? 'Saliendo…' : 'Cerrar sesión'}</span>
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
        <div className='flex items-center justify-center gap-2 text-xs text-muted-foreground'>
          <Calendar className='h-3 w-3' />
          <span className='font-medium'>{today.shortFormat}</span>
        </div>
      </div>
    </header>
  );
};

export { Header };

