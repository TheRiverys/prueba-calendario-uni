import type { Section } from '../types';

export const practicalTipsSection: Section = {
  id: 'practical-tips',
  title: 'Consejos Prácticos',
  subsections: [
    {
      id: 'organization',
      title: 'Organización Efectiva',
      content: (
        <div className='space-y-4'>
          <ol className='text-muted-foreground list-decimal space-y-2 pl-5'>
            <li>
              <strong>Colores por asignatura</strong>: El sistema asigna colores automáticamente
              para diferenciar asignaturas
            </li>
            <li>
              <strong>Prioridades inteligentes</strong>: Usa la prioridad alta solo para entregas
              realmente importantes
            </li>
            <li>
              <strong>Fechas realistas</strong>: Sé honesto con las fechas de entrega para obtener
              mejores sugerencias
            </li>
          </ol>
        </div>
      ),
    },
    {
      id: 'time-management',
      title: 'Gestión del Tiempo',
      content: (
        <div className='space-y-4'>
          <ol className='text-muted-foreground list-decimal space-y-2 pl-5'>
            <li>
              <strong>Planificación temprana</strong>: Añade entregas tan pronto como las conozcas
            </li>
            <li>
              <strong>Revisiones periódicas</strong>: Revisa tu calendario semanalmente
            </li>
            <li>
              <strong>Ajustes flexibles</strong>: Puedes modificar fechas y prioridades según
              evolucione el semestre
            </li>
          </ol>
        </div>
      ),
    },
  ],
};

export const advancedFeaturesSection: Section = {
  id: 'advanced-features',
  title: 'Características Avanzadas',
  subsections: [
    {
      id: 'bulk-import',
      title: 'Importación Masiva',
      content: (
        <div className='space-y-4'>
          <ul className='text-muted-foreground list-disc space-y-1 pl-5'>
            <li>Puedes importar múltiples entregas desde archivos externos</li>
            <li>Formatos soportados: CSV, Excel</li>
            <li>Validación automática de datos importados</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'sync',
      title: 'Sincronización',
      content: (
        <div className='space-y-4'>
          <ul className='text-muted-foreground list-disc space-y-1 pl-5'>
            <li>Los datos se guardan automáticamente en la nube</li>
            <li>Acceso desde múltiples dispositivos</li>
            <li>Backup automático de tu información</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'responsive',
      title: 'Diseño Responsivo',
      content: (
        <div className='space-y-4'>
          <ul className='text-muted-foreground list-disc space-y-1 pl-5'>
            <li>Funciona perfectamente en escritorio, tablet y móvil</li>
            <li>Interfaz adaptativa según el tamaño de pantalla</li>
            <li>Experiencia consistente en todos los dispositivos</li>
          </ul>
        </div>
      ),
    },
  ],
};

export const troubleshootingSection: Section = {
  id: 'troubleshooting',
  title: 'Solución de Problemas',
  subsections: [
    {
      id: 'common-issues',
      title: 'Problemas Comunes',
      content: (
        <div className='space-y-4'>
          <div>
            <h5 className='text-foreground mb-2 font-semibold'>No veo mis entregas</h5>
            <ul className='text-muted-foreground list-disc space-y-1 pl-5'>
              <li>Verifica que estás en la vista correcta (Lista/Calendar/Gantt)</li>
              <li>Comprueba los filtros de asignatura activos</li>
              <li>Asegúrate de que la fecha de inicio del semestre esté configurada</li>
            </ul>
          </div>

          <div>
            <h5 className='text-foreground mb-2 font-semibold'>
              Las fechas de estudio no aparecen
            </h5>
            <ul className='text-muted-foreground list-disc space-y-1 pl-5'>
              <li>Verifica que tienes configuradas las preferencias de estudio</li>
              <li>Asegúrate de que hay entregas con fechas futuras</li>
              <li>Comprueba que el algoritmo de IA está activo</li>
            </ul>
          </div>

          <div>
            <h5 className='text-foreground mb-2 font-semibold'>Problemas de rendimiento</h5>
            <ul className='text-muted-foreground list-disc space-y-1 pl-5'>
              <li>Cierra otras pestañas del navegador</li>
              <li>Reinicia la aplicación si es necesario</li>
              <li>Verifica tu conexión a internet</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'need-help',
      title: '¿Necesitas Ayuda?',
      content: (
        <div className='space-y-4'>
          <ul className='text-muted-foreground list-disc space-y-1 pl-5'>
            <li>Revisa esta guía completa</li>
            <li>Consulta la sección de comentarios en la aplicación</li>
            <li>Contacta al soporte técnico si persiste el problema</li>
          </ul>
        </div>
      ),
    },
  ],
};

export const successTipsSection: Section = {
  id: 'success-tips',
  title: 'Consejos para el Éxito Académico',
  content: (
    <div className='space-y-4'>
      <ol className='text-muted-foreground list-decimal space-y-2 pl-5'>
        <li>
          <strong>Consistencia</strong>: Usa la aplicación diariamente para mantener el hábito
        </li>
        <li>
          <strong>Anticipación</strong>: Añade entregas tan pronto como las conozcas
        </li>
        <li>
          <strong>Realismo</strong>: Sé honesto con tus capacidades y tiempos disponibles
        </li>
        <li>
          <strong>Flexibilidad</strong>: Ajusta fechas y prioridades según sea necesario
        </li>
        <li>
          <strong>Seguimiento</strong>: Marca entregas como completadas para mantener la motivación
        </li>
      </ol>
    </div>
  ),
};

export const conclusionSection: Section = {
  id: 'conclusion',
  title: 'Conclusión',
  content: (
    <div className='space-y-4'>
      <p className='text-muted-foreground leading-relaxed'>
        El Calendario Universitario está diseñado para hacer tu vida académica más organizada y
        menos estresante. Con sus múltiples vistas, funcionalidades inteligentes y diseño intuitivo,
        te ayudará a mantener el control de tu carga académica y mejorar tu rendimiento estudiantil.
      </p>
      <p className='text-foreground text-center text-lg font-semibold'>
        ¡Éxito en tu semestre académico!
      </p>
    </div>
  ),
};
