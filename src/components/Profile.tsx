import { type JSX, useState } from 'react';
import { Edit3, Trash2, Eye, EyeOff, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useAuthContext } from '@/contexts/auth/AuthContext';
import { usePreferencesContext } from '@/contexts/preferences/PreferencesContext';

const Profile = (): JSX.Element => {
  const { user, updateProfile, deleteAccount } = useAuthContext();
  const { setCurrentPage } = usePreferencesContext();
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: user?.email ?? '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(null);
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError('El correo electrónico es obligatorio');
      return false;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }

    return true;
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const message = await updateProfile(formData.email, formData.newPassword || undefined);
      if (message) {
        setError(message);
      } else {
        setSuccess('Perfil actualizado exitosamente');
        setFormData((prev) => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
        setIsEditing(false);
      }
    } catch {
      setError('Error inesperado al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!formData.currentPassword) {
      setError('Debes ingresar tu contraseña actual para confirmar la eliminación');
      return;
    }

    if (
      window.confirm(
        '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.'
      )
    ) {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const message = await deleteAccount(formData.currentPassword);
        if (message) {
          setError(message);
        }
      } catch {
        setError('Error inesperado al eliminar la cuenta');
      } finally {
        setLoading(false);
      }
    }
  };

  const getUserInitials = (email?: string): string => {
    if (!email) {
      return '??';
    }
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className='app-shell mt-6 pb-12'>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-8'>
          <div className='mb-6 flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Button variant='ghost' size='sm' onClick={() => setCurrentPage('dashboard')}>
                <ArrowLeft className='mr-2 h-4 w-4' /> Volver al Dashboard
              </Button>
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <h1 className='text-3xl font-bold text-foreground'>Perfil de Usuario</h1>
            <p className='text-base text-muted-foreground'>
              Gestiona tus credenciales y controla la seguridad de tu cuenta.
            </p>
          </div>
        </div>

        <div className='grid gap-6 md:grid-cols-[2fr,3fr]'>
          <Card className='h-fit'>
            <CardHeader className='space-y-2'>
              <CardTitle className='flex items-center gap-3 text-base'>
                <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-medium text-primary'>
                  {getUserInitials(user?.email)}
                </div>
                <div className='flex flex-col gap-1'>
                  <span className='text-base font-semibold text-foreground'>{user?.email}</span>
                  <span className='text-xs text-muted-foreground'>
                    Cuenta sincronizada con Supabase
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 text-sm text-muted-foreground'>
              <div className='flex items-center justify-between'>
                <span>Estado</span>
                <span className='flex items-center gap-2 font-medium text-green-600 dark:text-green-400'>
                  <span className='h-2 w-2 rounded-full bg-green-500' />
                  Activa
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Proveedor</span>
                <span className='font-medium text-foreground'>Correo y contraseña</span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Última actualización</span>
                <span className='font-medium text-foreground'>Sesión actual</span>
              </div>
            </CardContent>
          </Card>

          <Card className='md:col-span-1'>
            <CardHeader className='flex flex-col gap-1'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Edit3 className='h-4 w-4' />
                Seguridad y credenciales
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Correo electrónico</Label>
                <Input
                  id='email'
                  type='email'
                  value={formData.email}
                  onChange={(event) => handleInputChange('email', event.target.value)}
                  disabled={!isEditing || loading}
                />
              </div>

              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='newPassword'>Nueva contraseña</Label>
                  <div className='relative'>
                    <Input
                      id='newPassword'
                      type={showNewPassword ? 'text' : 'password'}
                      value={formData.newPassword}
                      onChange={(event) => handleInputChange('newPassword', event.target.value)}
                      placeholder='••••••'
                      disabled={!isEditing || loading}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                      onClick={() => setShowNewPassword((prev) => !prev)}
                    >
                      {showNewPassword ? (
                        <EyeOff className='h-4 w-4' />
                      ) : (
                        <Eye className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                  <p className='text-xs text-muted-foreground'>Mínimo 6 caracteres.</p>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='confirmPassword'>Confirmar contraseña</Label>
                  <div className='relative'>
                    <Input
                      id='confirmPassword'
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(event) => handleInputChange('confirmPassword', event.target.value)}
                      placeholder='••••••'
                      disabled={!isEditing || loading}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className='h-4 w-4' />
                      ) : (
                        <Eye className='h-4 w-4' />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='currentPassword'>Contraseña actual</Label>
                <div className='relative'>
                  <Input
                    id='currentPassword'
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(event) => handleInputChange('currentPassword', event.target.value)}
                    placeholder='Necesaria para confirmar cambios sensibles'
                    disabled={!isEditing || loading}
                    className='pr-10'
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </Button>
                </div>
              </div>

              {!isEditing && (
                <Button variant='outline' onClick={() => setIsEditing(true)} className='w-full'>
                  Editar credenciales
                </Button>
              )}

              {isEditing && (
                <div className='space-y-4 rounded-md border border-border p-4'>
                  <p className='text-sm text-muted-foreground'>
                    Guarda los cambios para aplicar las nuevas credenciales.
                  </p>
                  <div className='flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end sm:gap-3'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => {
                        setIsEditing(false);
                        setFormData((prev) => ({
                          ...prev,
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: '',
                        }));
                        setError(null);
                        setSuccess(null);
                      }}
                      disabled={loading}
                      className='w-full sm:w-auto'
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={
                        loading ||
                        !formData.newPassword ||
                        formData.newPassword !== formData.confirmPassword
                      }
                      className='w-full sm:w-auto'
                    >
                      {loading ? 'Actualizando...' : 'Guardar contraseña'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className='border-destructive/50 bg-destructive/5'>
            <CardHeader className='pb-4'>
              <CardTitle className='flex items-center gap-2 text-base text-destructive'>
                <Trash2 className='h-4 w-4' />
                Eliminar cuenta permanentemente
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='rounded-lg border border-destructive/20 bg-destructive/10 p-4'>
                <div className='flex items-start gap-3'>
                  <AlertTriangle className='mt-0.5 h-5 w-5 flex-shrink-0 text-destructive' />
                  <div className='space-y-2'>
                    <p className='text-sm font-medium text-destructive'>Acción irreversible</p>
                    <p className='text-sm text-destructive/80'>
                      Al eliminar tu cuenta perderás permanentemente:
                    </p>
                    <ul className='ml-4 space-y-1 text-sm text-destructive/80'>
                      <li> Todas tus entregas y horarios de estudio</li>
                      <li> Tu configuración personalizada</li>
                      <li> Tu historial y estadísticas</li>
                      <li> Acceso a la aplicación con esta cuenta</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='delete-current-password' className='text-sm font-medium'>
                  Confirmar contraseña actual
                </Label>
                <div className='relative'>
                  <Input
                    id='delete-current-password'
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(event) => handleInputChange('currentPassword', event.target.value)}
                    placeholder='Ingresa tu contraseña para confirmar'
                    className='pr-10'
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </Button>
                </div>
              </div>

              <div className='pt-2'>
                <Button
                  variant='destructive'
                  onClick={handleDeleteAccount}
                  disabled={loading || !formData.currentPassword}
                  className='w-full'
                >
                  <Trash2 className='mr-2 h-4 w-4' />
                  {loading ? 'Eliminando cuenta...' : 'Eliminar cuenta permanentemente'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {error && (
        <div className='mt-6 rounded-md border border-destructive/50 bg-destructive/5 p-4'>
          <div className='flex items-center gap-2 text-destructive'>
            <AlertTriangle className='h-4 w-4' />
            <span className='text-sm font-medium'>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className='mt-6 rounded-md border border-green-500/50 bg-green-50 p-4 dark:bg-green-950/50'>
          <div className='flex items-center gap-2 text-green-700 dark:text-green-400'>
            <div className='h-2 w-2 rounded-full bg-green-500' />
            <span className='text-sm font-medium'>{success}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export { Profile };
