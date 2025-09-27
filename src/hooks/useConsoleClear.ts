import { useEffect } from 'react';

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

        console.log('✅ Todos los datos de localStorage han sido eliminados');
        console.log('🔄 La aplicación se recargará para aplicar los cambios...');

        // Recargar la página para que se apliquen los cambios
        setTimeout(() => {
          window.location.reload();
        }, 1000);

      } catch (error) {
        console.error('❌ Error al limpiar los datos:', error);
      }
    };

    // Hacer la función disponible globalmente en window
    window.ClearAllData = clearAllData;

    // Mensaje de ayuda en la consola
    console.log('💡 Consejo: Escribe ClearAllData() en la consola para borrar todos los datos de localStorage');

    // Cleanup: remover la función global cuando se desmonte el componente
    return () => {
      if (window.ClearAllData) {
        delete window.ClearAllData;
      }
    };
  }, []);
};
