import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useEffect } from 'react';

const TOUR_COMPLETED_KEY = 'app-tour-completed';

export const useAppTour = () => {
  useEffect(() => {
    // Verificar si el tour ya fue completado
    const tourCompleted = localStorage.getItem(TOUR_COMPLETED_KEY);

    // Solo mostrar el tour si no se ha completado antes
    if (!tourCompleted) {
      // Pequeño delay para asegurar que el DOM esté completamente cargado
      const timer = window.setTimeout(() => {
        const driverObj = driver({
          showProgress: true,
          showButtons: ['next', 'previous', 'close'],
          nextBtnText: 'Siguiente',
          prevBtnText: 'Anterior',
          doneBtnText: 'Entendido',
          progressText: '{{current}} de {{total}}',
          // Aumentar el padding para mejor visualización
          padding: 8,
          // Permitir interacción con el elemento resaltado
          allowClose: true,
          // Evitar que el overlay bloquee clicks
          overlayClickNext: false,
          onDestroyStarted: () => {
            // Marcar el tour como completado cuando se cierre
            localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
            driverObj.destroy();
          },
          steps: [
            {
              popover: {
                title: '¡Bienvenido al Calendario Universitario! 🎓',
                description:
                  'Te voy a mostrar rápidamente las funcionalidades principales para que aproveches al máximo la aplicación. Este tour solo aparecerá una vez.',
              },
            },
            {
              element: '#semester-start-control',
              popover: {
                title: 'Fecha de inicio del semestre 📅',
                description:
                  'Aquí configuras cuándo empieza tu semestre. Esto es importante para que el asistente de IA calcule correctamente tus horarios de estudio.',
                side: 'bottom',
                align: 'start',
              },
            },
            {
              element: '#new-delivery-button',
              popover: {
                title: 'Añadir entregas ➕',
                description:
                  'Haz clic aquí para añadir una nueva entrega (examen, trabajo, proyecto, etc.). Puedes añadir todas las que necesites.',
                side: 'bottom',
                align: 'end',
              },
            },
            {
              element: '#view-selector',
              popover: {
                title: 'Cambiar entre vistas 👁️',
                description:
                  'Aquí puedes cambiar cómo visualizar tus entregas: en Lista, Calendario o Gantt. Cada vista tiene sus ventajas según lo que necesites.',
                side: 'bottom',
                align: 'end',
              },
            },
            {
              element: '#stats-overview',
              popover: {
                title: 'Resumen de estadísticas 📊',
                description:
                  'Aquí ves un resumen rápido: total de entregas, próximas, vencidas y las de esta semana. Te ayuda a mantener el control de un vistazo.',
                side: 'top',
                align: 'start',
              },
            },
            {
              element: '#header-settings-button',
              popover: {
                title: 'Configuración ⚙️',
                description:
                  'Desde aquí puedes configurar el asistente de IA, importar entregas desde archivos Excel/CSV, exportar tu calendario, y personalizar la aplicación.',
                side: 'bottom',
                align: 'end',
              },
            },
            {
              element: '#help-button',
              popover: {
                title: 'Ayuda y documentación 📖',
                description:
                  'Si necesitas ayuda más detallada, aquí encontrarás la guía completa de usuario con toda la información paso a paso.',
                side: 'bottom',
                align: 'end',
              },
            },
            {
              popover: {
                title: '¡Listo para empezar! 🚀',
                description:
                  'Ya conoces lo básico. Comienza añadiendo tus primeras entregas y explora las diferentes funcionalidades. ¡Éxito en tu semestre académico!',
              },
            },
          ],
        });

        driverObj.drive();
      }, 1500);

      return () => window.clearTimeout(timer);
    }
  }, []);

  // Función para resetear el tour (útil para testing o soporte)
  const resetTour = () => {
    localStorage.removeItem(TOUR_COMPLETED_KEY);
    window.location.reload();
  };

  return { resetTour };
};
