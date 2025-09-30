import { type JSX, useState } from 'react';
import { Edit3, Trash2, Eye, EyeOff, AlertTriangle, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAppContext } from '../contexts/AppContext';

const Profile = (): JSX.Element => {
  const { user, updateProfile, deleteAccount, setCurrentPage } = useAppContext();
  const [isEditing, setIsEditing] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const error = await updateProfile(formData.email, formData.newPassword || undefined);
      if (error) {
        setError(error);
      } else {
        setSuccess('Perfil actualizado exitosamente');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        setIsEditing(false);
      }
    } catch (err) {
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

    if (window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const error = await deleteAccount(formData.currentPassword);
        if (error) {
          setError(error);
        } else {
          // La eliminación fue exitosa, el usuario será redirigido automáticamente
        }
      } catch (err) {
        setError('Error inesperado al eliminar la cuenta');
      } finally {
        setLoading(false);
      }
    }
  };

  const getUserInitials = (email?: string): string => {
    if (!email) return '??';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className='app-shell mt-6 pb-12'>
      <div className='max-w-4xl mx-auto'>
        {/* Encabezado */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-4'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setCurrentPage('dashboard')}
              >
                ← Volver al Dashboard
              </Button>
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <h1 className='text-3xl font-bold text-foreground'>Perfil de Usuario</h1>
            <p className='text-base text-muted-foreground'>
              Gestiona tu información personal y configuración de cuenta
            </p>
          </div>
        </div>

        <div className='space-y-6'>
          {/* Información Personal */}
          <Card className='bg-card border-border shadow-sm'>
            <CardHeader className='pb-4'>
              <CardTitle className='flex items-center gap-3 text-base'>
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary'>
                  {getUserInitials(user?.email)}
                </div>
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='space-y-2'>
                  <Label htmlFor='email' className='text-sm font-medium'>Correo Electrónico</Label>
                  <Input
                    id='email'
                    type='email'
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    className={isEditing ? '' : 'bg-muted/50'}
                  />
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-medium text-muted-foreground'>Estado de la cuenta</Label>
                  <div className='flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md'>
                    <div className='h-2 w-2 bg-green-500 rounded-full'></div>
                    <span className='text-sm text-green-700 dark:text-green-400'>Cuenta activa</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Seguridad */}
          <Card className='bg-card border-border shadow-sm'>
            <CardHeader className='pb-4'>
              <CardTitle className='flex items-center gap-2 text-base'>
                <Edit3 className='h-4 w-4' />
                Cambiar contraseña
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {!isEditing ? (
                <div className='flex flex-col gap-3'>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant='outline'
                    className='w-full sm:w-auto'
                  >
                    <Edit3 className='h-4 w-4 mr-2' />
                    Cambiar contraseña
                  </Button>
                </div>
              ) : (
                <div className='space-y-4'>
                  <div className='grid gap-4 sm:grid-cols-2'>
                    <div className='space-y-2'>
                      <Label htmlFor='newPassword' className='text-sm font-medium'>
                        Nueva contraseña
                      </Label>
                      <div className='relative'>
                        <Input
                          id='newPassword'
                          type={showNewPassword ? 'text' : 'password'}
                          value={formData.newPassword}
                          onChange={(e) => handleInputChange('newPassword', e.target.value)}
                          placeholder='Mínimo 6 caracteres'
                          className='pr-10'
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                        </Button>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='confirmPassword' className='text-sm font-medium'>
                        Confirmar contraseña
                      </Label>
                      <div className='relative'>
                        <Input
                          id='confirmPassword'
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          placeholder='Repite la contraseña'
                          className='pr-10'
                        />
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className='flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end sm:gap-3'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => {
                        setIsEditing(false);
                        setFormData(prev => ({
                          ...prev,
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
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
                      disabled={loading || !formData.newPassword || formData.newPassword !== formData.confirmPassword}
                      className='w-full sm:w-auto'
                    >
                      {loading ? 'Actualizando...' : 'Guardar contraseña'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Zona de Peligro */}
          <Card className='border-destructive/50 bg-destructive/5'>
            <CardHeader className='pb-4'>
              <CardTitle className='flex items-center gap-2 text-base text-destructive'>
                <Trash2 className='h-4 w-4' />
                Eliminar cuenta permanentemente
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='p-4 bg-destructive/10 border border-destructive/20 rounded-lg'>
                <div className='flex items-start gap-3'>
                  <AlertTriangle className='h-5 w-5 text-destructive mt-0.5 flex-shrink-0' />
                  <div className='space-y-2'>
                    <p className='text-sm font-medium text-destructive'>
                      Acción irreversible
                    </p>
                    <p className='text-sm text-destructive/80'>
                      Al eliminar tu cuenta perderás permanentemente:
                    </p>
                    <ul className='text-sm text-destructive/80 space-y-1 ml-4'>
                      <li>• Todas tus entregas y horarios de estudio</li>
                      <li>• Tu configuración personalizada</li>
                      <li>• Tu historial y estadísticas</li>
                      <li>• Acceso a la aplicación con esta cuenta</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='currentPassword' className='text-sm font-medium'>
                  Confirmar contraseña actual
                </Label>
                <div className='relative'>
                  <Input
                    id='currentPassword'
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    placeholder='Ingresa tu contraseña para confirmar'
                    className='pr-10'
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='absolute right-0 top-0 h-full px-3 hover:bg-transparent'
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
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
                  <Trash2 className='h-4 w-4 mr-2' />
                  {loading ? 'Eliminando cuenta...' : 'Eliminar cuenta permanentemente'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <div className='mt-6 p-4 border border-destructive/50 bg-destructive/5 rounded-md'>
          <div className='flex items-center gap-2 text-destructive'>
            <AlertTriangle className='h-4 w-4' />
            <span className='text-sm font-medium'>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className='mt-6 p-4 border border-green-500/50 bg-green-50 dark:bg-green-950/50 rounded-md'>
          <div className='flex items-center gap-2 text-green-700 dark:text-green-400'>
            <div className='h-2 w-2 bg-green-500 rounded-full'></div>
            <span className='text-sm font-medium'>{success}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export { Profile };
