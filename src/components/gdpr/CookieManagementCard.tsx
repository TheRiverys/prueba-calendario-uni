/**
 * Tarjeta de gestión de cookies
 * Componente separado para cumplir con SRP y límites de ESLint
 */

import { Cookie } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CookieCategory } from '@/services/cookieConsent';

interface CookieManagementCardProps {
  readonly customSettings: Record<CookieCategory, boolean>;
  readonly onToggleCategory: (_category: CookieCategory) => void;
  readonly onSavePreferences: () => void;
  readonly onRevokeConsent: () => void;
  readonly getCookiesByCategory: (
    _category: CookieCategory
  ) => Array<{ name: string; description: string }>;
  readonly getCategoryTitle: (_category: CookieCategory) => string;
  readonly getCategoryDescription: (_category: CookieCategory) => string;
}

export const CookieManagementCard: React.FC<CookieManagementCardProps> = ({
  customSettings,
  onToggleCategory,
  onSavePreferences,
  onRevokeConsent,
  getCookiesByCategory,
  getCategoryTitle,
  getCategoryDescription,
}) => {
  return (
    <Card className='p-6'>
      <div className='mb-4 flex items-center gap-3'>
        <Cookie className='h-6 w-6 text-blue-600 dark:text-blue-400' />
        <h2 className='text-xl font-bold text-gray-900 dark:text-white'>Gestión de Cookies</h2>
      </div>

      <p className='mb-4 text-sm text-gray-600 dark:text-gray-400'>
        Controla qué cookies puede usar la aplicación. Los cambios se aplican inmediatamente.
      </p>

      <div className='space-y-4'>
        {Object.values(CookieCategory).map(category => {
          const cookies = getCookiesByCategory(category);
          const isEssential = category === CookieCategory.ESSENTIAL;

          return (
            <div
              key={category}
              className='rounded-lg border border-gray-200 p-4 dark:border-gray-700'
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <h3 className='font-medium text-gray-900 dark:text-white'>
                    {getCategoryTitle(category)}
                  </h3>
                  <p className='mt-1 text-sm text-gray-600 dark:text-gray-400'>
                    {getCategoryDescription(category)}
                  </p>
                  <div className='mt-2 space-y-1'>
                    {cookies.map(cookie => (
                      <div key={cookie.name} className='text-xs text-gray-500 dark:text-gray-500'>
                        • <span className='font-mono'>{cookie.name}</span>: {cookie.description}
                      </div>
                    ))}
                  </div>
                </div>
                <label className='relative ml-3 inline-flex cursor-pointer items-center'>
                  <input
                    type='checkbox'
                    checked={customSettings[category]}
                    onChange={() => onToggleCategory(category)}
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

      <div className='mt-4 flex gap-2'>
        <Button
          onClick={onSavePreferences}
          className='flex-1 bg-blue-600 text-white hover:bg-blue-700'
        >
          Guardar preferencias
        </Button>
        <Button
          onClick={onRevokeConsent}
          variant='outline'
          className='border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
        >
          Revocar todo
        </Button>
      </div>
    </Card>
  );
};
