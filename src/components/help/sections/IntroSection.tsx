import type { Section } from '../types';

export const introSection: Section = {
  id: 'intro',
  title: '¿Qué es el Calendario Universitario?',
  content: (
    <div className='space-y-4'>
      <p className='text-muted-foreground leading-relaxed'>
        El Calendario Universitario es una herramienta diseñada específicamente para estudiantes que
        necesitan organizar sus entregas académicas (exámenes, trabajos, proyectos, etc.) de forma
        visual e intuitiva. Con múltiples vistas y funcionalidades inteligentes, te ayudará a
        mantener el control de tu carga académica.
      </p>
    </div>
  ),
};

export const quickStartSection: Section = {
  id: 'quick-start',
  title: 'Inicio Rápido',
  content: (
    <div className='space-y-4'>
      <p className='text-muted-foreground leading-relaxed'>
        Comenzar a usar el Calendario Universitario es muy sencillo. Primero, abre la aplicación en
        tu navegador web. A continuación, establece la fecha de inicio de tu semestre en la sección
        de controles superiores. Finalmente, haz clic en el botón{' '}
        <span className='text-foreground font-semibold'>&quot;Nueva entrega&quot;</span> para añadir
        tu primera tarea y comenzar a organizar tu semestre académico.
      </p>
    </div>
  ),
};
