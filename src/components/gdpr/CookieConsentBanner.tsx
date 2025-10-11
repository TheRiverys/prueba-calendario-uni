/**
 * Banner de consentimiento de cookies conforme a GDPR
 *
 * Aplica principio de Responsabilidad Única (SRP):
 * - Solo se encarga de mostrar el banner y capturar la decisión del usuario
 */

import { X, Cookie, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGdpr } from '@/contexts/gdpr/GdprContext';
import { usePreferencesContext } from '@/contexts/preferences/PreferencesContext';
import { CookieCategory } from '@/services/cookieConsent';

export const CookieConsentBanner: React.FC = () => {
  const {
    showConsentBanner,
    acceptAll,
    rejectAll,
    setCustomConsent,
    setShowConsentBanner,
    getCookiesByCategory,
  } = useGdpr();
  const { setCurrentPage } = usePreferencesContext();

  const [showDetails, setShowDetails] = useState(false);
  const [customSettings, setCustomSettings] = useState({
    [CookieCategory.ESSENTIAL]: true,
    [CookieCategory.ANALYTICS]: false,
    [CookieCategory.FUNCTIONAL]: false,
  });

  if (!showConsentBanner) {
    return null;
  }

  const handleAcceptAll = () => {
    acceptAll();
  };

  const handleRejectAll = () => {
    rejectAll();
  };

  const handleSaveCustom = () => {
    setCustomConsent(customSettings);
  };

  const handleToggleCategory = (category: CookieCategory) => {
    if (category === CookieCategory.ESSENTIAL) {
      return; // No se puede desactivar
    }

    setCustomSettings(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
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
        return 'Necesarias para el funcionamiento básico de la aplicación. No se pueden desactivar.';
      case CookieCategory.ANALYTICS:
        return 'Nos ayudan a entender cómo usas la aplicación para mejorarla. Completamente anónimas.';
      case CookieCategory.FUNCTIONAL:
        return 'Guardan tus preferencias (tema, vista predeterminada) para mejorar tu experiencia.';
      default:
        return '';
    }
  };

  return (
    <div className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm'>
      <div className='fixed right-0 bottom-0 left-0 p-4 sm:right-auto sm:bottom-4 sm:left-4 sm:max-w-md'>
        <Card className='relative overflow-hidden border-2 bg-white p-6 shadow-2xl dark:bg-gray-900'>
          <button
            onClick={() => setShowConsentBanner(false)}
            className='absolute top-4 right-4 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-300'
            aria-label='Cerrar sin decidir'
          >
            <X className='h-5 w-5' />
          </button>

          <div className='mb-4 flex items-center gap-3'>
            <Cookie className='h-8 w-8 text-blue-600 dark:text-blue-400' />
            <h2 className='text-xl font-bold text-gray-900 dark:text-white'>Gestión de Cookies</h2>
          </div>

          <p className='mb-4 text-sm text-gray-600 dark:text-gray-300'>
            Usamos cookies para mejorar tu experiencia. Puedes aceptar todas, rechazar las no
            esenciales o personalizar tus preferencias.
          </p>

          <div className='mb-4'>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className='flex w-full items-center justify-between rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
            >
              <span className='flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200'>
                <Settings className='h-4 w-4' />
                Personalizar configuración
              </span>
              {showDetails ? (
                <ChevronUp className='h-4 w-4 text-gray-500' />
              ) : (
                <ChevronDown className='h-4 w-4 text-gray-500' />
              )}
            </button>

            {showDetails && (
              <div className='mt-3 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800'>
                {Object.values(CookieCategory).map(category => {
                  const cookies = getCookiesByCategory(category);
                  const isEssential = category === CookieCategory.ESSENTIAL;

                  return (
                    <div key={category} className='space-y-2'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <h3 className='font-medium text-gray-900 dark:text-white'>
                            {getCategoryTitle(category)}
                          </h3>
                          <p className='mt-1 text-xs text-gray-600 dark:text-gray-400'>
                            {getCategoryDescription(category)}
                          </p>
                          <div className='mt-2 space-y-1'>
                            {cookies.map(cookie => (
                              <div
                                key={cookie.name}
                                className='text-xs text-gray-500 dark:text-gray-500'
                              >
                                • {cookie.name}: {cookie.description}
                              </div>
                            ))}
                          </div>
                        </div>
                        <label className='relative ml-3 inline-flex cursor-pointer items-center'>
                          <input
                            type='checkbox'
                            checked={customSettings[category]}
                            onChange={() => handleToggleCategory(category)}
                            disabled={isEssential}
                            className='peer sr-only'
                          />
                          <div
                            className={`peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-600 dark:bg-gray-700 ${
                              isEssential ? 'cursor-not-allowed opacity-50' : ''
                            }`}
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className='flex flex-col gap-2 sm:flex-row'>
            {showDetails ? (
              <>
                <Button
                  onClick={handleSaveCustom}
                  className='flex-1 bg-blue-600 text-white hover:bg-blue-700'
                >
                  Guardar preferencias
                </Button>
                <Button
                  onClick={handleRejectAll}
                  variant='outline'
                  className='flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                >
                  Solo esenciales
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleAcceptAll}
                  className='flex-1 bg-blue-600 text-white hover:bg-blue-700'
                >
                  Aceptar todas
                </Button>
                <Button
                  onClick={handleRejectAll}
                  variant='outline'
                  className='flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                >
                  Rechazar
                </Button>
              </>
            )}
          </div>

          <p className='mt-3 text-center text-xs text-gray-500 dark:text-gray-400'>
            Al continuar navegando sin seleccionar, no usaremos cookies no esenciales.
            <br />
            Lee nuestra{' '}
            <button
              onClick={() => {
                setCurrentPage('privacy-policy');
                setShowConsentBanner(false);
              }}
              className='text-blue-600 underline hover:text-blue-700 dark:text-blue-400'
            >
              Política de Privacidad
            </button>
          </p>
        </Card>
      </div>
    </div>
  );
};
