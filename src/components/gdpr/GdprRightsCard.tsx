/**
 * Tarjeta de derechos GDPR
 * Componente separado para cumplir con SRP y límites de ESLint
 */

import { Shield, Download, Trash2, AlertTriangle, Info } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface GdprRightsCardProps {
  readonly user: { id: string } | null;
  readonly isExporting: boolean;
  readonly isDeleting: boolean;
  readonly showDeleteConfirm: boolean;
  readonly onExportData: () => Promise<void>;
  readonly onDeleteData: () => Promise<void>;
  readonly onShowDeleteConfirm: (_show: boolean) => void;
}

export const GdprRightsCard: React.FC<GdprRightsCardProps> = ({
  user,
  isExporting,
  isDeleting,
  showDeleteConfirm,
  onExportData,
  onDeleteData,
  onShowDeleteConfirm,
}) => {
  return (
    <Card className='p-6'>
      <div className='mb-4 flex items-center gap-3'>
        <Shield className='h-6 w-6 text-green-600 dark:text-green-400' />
        <h2 className='text-xl font-bold text-gray-900 dark:text-white'>
          Derechos de Privacidad (GDPR)
        </h2>
      </div>

      <div className='mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20'>
        <div className='flex items-start gap-2'>
          <Info className='mt-0.5 h-5 w-5 text-blue-600 dark:text-blue-400' />
          <div className='text-sm text-blue-800 dark:text-blue-300'>
            <p className='font-medium'>Tus derechos bajo el GDPR:</p>
            <ul className='mt-2 space-y-1 pl-4'>
              <li>• Acceso: Descargar todos tus datos en formato legible</li>
              <li>• Rectificación: Modificar tus preferencias en cualquier momento</li>
              <li>• Supresión: Eliminar permanentemente todos tus datos</li>
              <li>• Portabilidad: Exportar tus datos en formato estándar</li>
            </ul>
          </div>
        </div>
      </div>

      <div className='space-y-3'>
        <div>
          <Button
            onClick={onExportData}
            disabled={isExporting || !user}
            variant='outline'
            className='w-full justify-start border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
          >
            <Download className='mr-2 h-4 w-4' />
            {isExporting ? 'Exportando...' : 'Descargar mis datos'}
          </Button>
          <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
            {user
              ? 'Exporta todas tus entregas, configuración y datos de analíticas'
              : 'Solo disponible para usuarios registrados'}
          </p>
        </div>

        <div>
          {!showDeleteConfirm ? (
            <>
              <Button
                onClick={() => onShowDeleteConfirm(true)}
                disabled={!user}
                variant='outline'
                className='w-full justify-start border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Eliminar todos mis datos
              </Button>
              <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                {user
                  ? 'Elimina permanentemente tu cuenta y todos los datos asociados'
                  : 'Solo disponible para usuarios registrados'}
              </p>
            </>
          ) : (
            <div className='rounded-lg border-2 border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20'>
              <div className='mb-3 flex items-start gap-2'>
                <AlertTriangle className='mt-0.5 h-5 w-5 text-red-600 dark:text-red-400' />
                <div>
                  <p className='font-medium text-red-900 dark:text-red-300'>¿Estás seguro?</p>
                  <p className='mt-1 text-sm text-red-700 dark:text-red-400'>
                    Esta acción es irreversible. Se eliminarán permanentemente:
                  </p>
                  <ul className='mt-2 space-y-1 text-sm text-red-700 dark:text-red-400'>
                    <li>• Tu cuenta de usuario</li>
                    <li>• Todas tus entregas y configuración</li>
                    <li>• Datos de analíticas asociados</li>
                    <li>• Todas las cookies y preferencias</li>
                  </ul>
                </div>
              </div>
              <div className='flex gap-2'>
                <Button
                  onClick={onDeleteData}
                  disabled={isDeleting}
                  className='flex-1 bg-red-600 text-white hover:bg-red-700'
                >
                  {isDeleting ? 'Eliminando...' : 'Sí, eliminar todo'}
                </Button>
                <Button
                  onClick={() => onShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  variant='outline'
                  className='border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
