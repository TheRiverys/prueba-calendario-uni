import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { OAuthProviderInfo } from '@/lib/oauthUtils';

import type { FC } from 'react';

interface DeleteAccountModalProps {
  readonly open: boolean;
  readonly oauthInfo: OAuthProviderInfo;
  readonly loading: boolean;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

const DeleteAccountModal: FC<DeleteAccountModalProps> = ({
  open,
  oauthInfo,
  loading,
  onCancel,
  onConfirm,
}) => {
  if (!open) {
    return null;
  }

  const providerName = oauthInfo.isGoogle ? 'Google' : 'OAuth';

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4'>
      <div className='border-border/60 bg-card w-full max-w-md rounded-xl border p-6 shadow-xl'>
        <div className='mb-4 flex items-center gap-3'>
          <AlertTriangle className='text-destructive h-6 w-6' />
          <h3 className='text-foreground text-lg font-semibold'>Confirmar eliminación de cuenta</h3>
        </div>
        <p className='text-muted-foreground text-sm'>
          Tu cuenta vinculada con {providerName} se eliminará permanentemente. Esta acción no se
          puede deshacer y perderás todos tus datos almacenados.
        </p>
        <div className='border-destructive/20 bg-destructive/10 text-destructive/90 mt-4 rounded-lg border p-3 text-sm'>
          <p className='font-medium'>Se eliminará de forma definitiva:</p>
          <ul className='list-disc space-y-1 pl-5'>
            <li>Horarios y entregas planificadas</li>
            <li>Preferencias personalizadas</li>
            <li>Historial y estadísticas asociadas</li>
          </ul>
        </div>
        <div className='mt-6 flex flex-col gap-2 sm:flex-row'>
          <Button
            type='button'
            variant='outline'
            className='w-full sm:flex-1'
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type='button'
            variant='destructive'
            className='w-full sm:flex-1'
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Eliminando…' : 'Eliminar cuenta'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export { DeleteAccountModal };
