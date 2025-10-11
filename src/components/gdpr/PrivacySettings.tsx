/**
 * Panel de configuración de privacidad para usuarios
 *
 * Implementa los derechos GDPR:
 * - Derecho de acceso (descargar datos)
 * - Derecho al olvido (eliminar datos)
 * - Derecho de rectificación (modificar consentimiento)
 *
 * Aplica principio de Responsabilidad Única (SRP):
 * - Solo gestiona la orquestación de componentes de privacidad
 */

import { CheckCircle, AlertTriangle } from 'lucide-react';
import React, { useState } from 'react';

import { Card } from '@/components/ui/card';
import { useGdpr } from '@/contexts/gdpr/GdprContext';
import { useAuth } from '@/hooks/useAuth';
import { CookieCategory } from '@/services/cookieConsent';

import { CookieManagementCard } from './CookieManagementCard';
import { GdprRightsCard } from './GdprRightsCard';

interface PrivacySettingsProps {
  readonly onExportData?: () => Promise<void>;
  readonly onDeleteData?: () => Promise<void>;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({ onExportData, onDeleteData }) => {
  const { consent, setCustomConsent, revokeConsent, getCookiesByCategory } = useGdpr();

  const { user } = useAuth();

  const [customSettings, setCustomSettings] = useState({
    [CookieCategory.ESSENTIAL]: true,
    [CookieCategory.ANALYTICS]: consent?.analytics || false,
    [CookieCategory.FUNCTIONAL]: consent?.functional || false,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleToggleCategory = (category: CookieCategory) => {
    if (category === CookieCategory.ESSENTIAL) {
      return;
    }

    setCustomSettings(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSavePreferences = () => {
    setCustomConsent(customSettings);
    setActionMessage({
      type: 'success',
      text: 'Preferencias guardadas correctamente',
    });

    window.setTimeout(() => setActionMessage(null), 3000);
  };

  const handleExportData = async () => {
    if (!onExportData) {
      return;
    }

    setIsExporting(true);
    setActionMessage(null);

    try {
      await onExportData();
      setActionMessage({
        type: 'success',
        text: 'Datos exportados correctamente',
      });
    } catch {
      setActionMessage({
        type: 'error',
        text: 'Error al exportar datos',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteData = async () => {
    if (!onDeleteData) {
      return;
    }

    setIsDeleting(true);
    setActionMessage(null);

    try {
      await onDeleteData();
      revokeConsent();
      setActionMessage({
        type: 'success',
        text: 'Todos tus datos han sido eliminados',
      });
      setShowDeleteConfirm(false);
    } catch {
      setActionMessage({
        type: 'error',
        text: 'Error al eliminar datos',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRevokeConsent = () => {
    revokeConsent();
    setCustomSettings({
      [CookieCategory.ESSENTIAL]: true,
      [CookieCategory.ANALYTICS]: false,
      [CookieCategory.FUNCTIONAL]: false,
    });
    setActionMessage({
      type: 'success',
      text: 'Consentimiento revocado y cookies eliminadas',
    });

    window.setTimeout(() => setActionMessage(null), 3000);
  };

  const getCategoryTitle = (category: CookieCategory): string => {
    switch (category) {
      case CookieCategory.ESSENTIAL:
        return 'Cookies Esenciales';
      case CookieCategory.ANALYTICS:
        return 'Cookies de Analítica';
      case CookieCategory.FUNCTIONAL:
        return 'Cookies Funcionales';
      default:
        return category;
    }
  };

  const getCategoryDescription = (category: CookieCategory): string => {
    switch (category) {
      case CookieCategory.ESSENTIAL:
        return 'Necesarias para el funcionamiento básico. No se pueden desactivar.';
      case CookieCategory.ANALYTICS:
        return 'Analíticas completamente anónimas para mejorar la aplicación.';
      case CookieCategory.FUNCTIONAL:
        return 'Guardan tus preferencias de interfaz y configuración.';
      default:
        return '';
    }
  };

  return (
    <div className='space-y-6'>
      {actionMessage && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-4 ${
            actionMessage.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300'
              : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle className='h-5 w-5' />
          ) : (
            <AlertTriangle className='h-5 w-5' />
          )}
          <span className='text-sm font-medium'>{actionMessage.text}</span>
        </div>
      )}

      <CookieManagementCard
        customSettings={customSettings}
        onToggleCategory={handleToggleCategory}
        onSavePreferences={handleSavePreferences}
        onRevokeConsent={handleRevokeConsent}
        getCookiesByCategory={getCookiesByCategory}
        getCategoryTitle={getCategoryTitle}
        getCategoryDescription={getCategoryDescription}
      />

      <GdprRightsCard
        user={user}
        isExporting={isExporting}
        isDeleting={isDeleting}
        showDeleteConfirm={showDeleteConfirm}
        onExportData={handleExportData}
        onDeleteData={handleDeleteData}
        onShowDeleteConfirm={setShowDeleteConfirm}
      />

      {consent && (
        <Card className='p-4'>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            <span className='font-medium'>Última actualización de consentimiento:</span>{' '}
            {new Date(consent.timestamp).toLocaleString('es-ES')}
            <br />
            <span className='font-medium'>Versión de política:</span> {consent.version}
          </p>
        </Card>
      )}
    </div>
  );
};
