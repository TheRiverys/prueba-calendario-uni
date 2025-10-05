import { useEffect } from 'react';

import { toast } from '@/components/ui/sonner';

// Declarar la función global para que esté disponible en la consola
declare global {
  interface Window {
    ClearAllData?: () => void;
  }
}

export const useConsoleClear = () => {
  useEffect(() => {
    // Función para limpiar todos los datos
    const clearAllData = () => {
      try {
        // Limpiar localStorage
        localStorage.clear();

        // Limpiar sessionStorage si existe
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.clear();
        }

        toast.success('Datos locales eliminados', {
          description: 'La aplicación se recargará para aplicar los cambios.',
        });

        // Recargar la página para que se apliquen los cambios
        globalThis.setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        toast.error('Error al limpiar los datos', {
          description: error instanceof Error ? error.message : String(error),
        });
      }
    };

    // Hacer la función disponible globalmente en window
    window.ClearAllData = clearAllData;

    // Mensaje de ayuda en la consola
    if (import.meta.env.DEV) {
      toast('Consejo de depuración', {
        description:
          'Ejecuta ClearAllData() en la consola para borrar todos los datos de localStorage.',
      });
    }

    // Cleanup: remover la función global cuando se desmonte el componente
    return () => {
      if (window.ClearAllData) {
        delete window.ClearAllData;
      }
    };
  }, []);
};
