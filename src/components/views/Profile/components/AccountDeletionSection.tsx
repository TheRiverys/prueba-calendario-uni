import { AlertTriangle, Eye, EyeOff, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { OAuthProviderInfo } from '@/lib/oauthUtils';

import type { ProfileFormField } from '../profileTypes';
import type { FC } from 'react';

interface AccountDeletionSectionProps {
  readonly currentPassword: string;
  readonly passwordVisible: boolean;
  readonly loading: boolean;
  readonly isOAuthAccount: boolean;
  readonly oauthInfo: OAuthProviderInfo;
  readonly onFieldChange: (_field: ProfileFormField, _value: string) => void;
  readonly onTogglePassword: () => void;
  readonly onDelete: () => void;
}

const AccountDeletionSection: FC<AccountDeletionSectionProps> = ({
  currentPassword,
  passwordVisible,
  loading,
  isOAuthAccount,
  oauthInfo,
  onFieldChange,
  onTogglePassword,
  onDelete,
}) => {
  const disablePasswordInput = isOAuthAccount;
  const deleteButtonDisabled = loading || (!isOAuthAccount && !currentPassword.trim());
  const providerName = oauthInfo.isGoogle ? 'Google' : 'OAuth';

  return (
    <Card className='border-destructive/40 bg-destructive/5 rounded-xl border shadow-sm backdrop-blur'>
      <CardHeader className='pb-4'>
        <CardTitle className='text-destructive flex items-center gap-2 text-base'>
          <Trash2 className='h-4 w-4' /> Eliminar cuenta permanentemente
        </CardTitle>
        <p className='text-destructive/90 text-xs'>
          Esta acción no se puede deshacer. Asegúrate de comprender el impacto.
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='border-destructive/30 bg-destructive/10 rounded-lg border p-4'>
          <div className='flex items-start gap-3'>
            <AlertTriangle className='text-destructive mt-1 h-5 w-5 flex-shrink-0' />
            <div className='text-destructive/90 space-y-2 text-sm'>
              <p className='font-medium'>Perderás permanentemente:</p>
              <ul className='list-disc space-y-1 pl-5'>
                <li>Todas tus entregas y horarios de estudio</li>
                <li>Tu configuración personalizada</li>
                <li>Historial y estadísticas guardadas</li>
                <li>Acceso a la aplicación con esta cuenta</li>
              </ul>
            </div>
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='delete-current-password' className='text-sm font-medium'>
            {isOAuthAccount ? 'Confirmación de eliminación' : 'Confirmar contraseña actual'}
          </Label>
          <div className='relative'>
            <Input
              id='delete-current-password'
              type={passwordVisible ? 'text' : 'password'}
              value={currentPassword}
              onChange={event => onFieldChange('currentPassword', event.target.value)}
              placeholder={
                isOAuthAccount
                  ? 'No se requiere contraseña para usuarios ' + providerName
                  : 'Ingresa tu contraseña para continuar'
              }
              disabled={disablePasswordInput}
              className='pr-10'
            />
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='absolute inset-y-0 right-0 h-full px-3 hover:bg-transparent'
              onClick={onTogglePassword}
              disabled={disablePasswordInput}
            >
              {passwordVisible ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
            </Button>
          </div>
          <p className='text-muted-foreground text-xs'>
            {isOAuthAccount
              ? 'Como usuario de ' +
                providerName +
                ', confirmaremos esta acción con un paso adicional.'
              : 'Confirma tu identidad introduciendo tu contraseña actual.'}
          </p>
        </div>

        <Button
          type='button'
          variant='destructive'
          className='w-full sm:w-auto'
          onClick={onDelete}
          disabled={deleteButtonDisabled}
        >
          {loading ? 'Eliminando cuenta…' : 'Eliminar cuenta permanentemente'}
        </Button>
      </CardContent>
    </Card>
  );
};

export { AccountDeletionSection };
