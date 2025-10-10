import type { Section } from '../types';

export const mainFeaturesSection: Section = {
  id: 'main-features',
  title: 'Funcionalidades Principales',
  subsections: [
    {
      id: 'deliveries-management',
      title: 'Gestión de Entregas',
      content: (
        <div className='space-y-6'>
          <div>
            <h5 className='text-foreground mb-3 text-base font-semibold'>
              Crear una Nueva Entrega
            </h5>
            <p className='text-muted-foreground mb-3 leading-relaxed'>
              Para añadir una nueva entrega, haz clic en el botón{' '}
              <span className='text-foreground font-semibold'>&quot;Nueva entrega&quot;</span>{' '}
              ubicado en la parte superior derecha. Se abrirá un formulario donde deberás completar
              la información de tu tarea:
            </p>
            <div className='bg-muted/30 space-y-2 rounded-lg p-4'>
              <div className='flex gap-3'>
                <span className='text-primary font-semibold'>Asignatura:</span>
                <span className='text-muted-foreground'>
                  Selecciona o escribe el nombre de la materia
                </span>
              </div>
              <div className='flex gap-3'>
                <span className='text-primary font-semibold'>Nombre:</span>
                <span className='text-muted-foreground'>
                  Describe la entrega (ej: &quot;Examen final&quot;, &quot;Trabajo práctico 3&quot;)
                </span>
              </div>
              <div className='flex gap-3'>
                <span className='text-primary font-semibold'>Fecha:</span>
                <span className='text-muted-foreground'>Establece la fecha límite</span>
              </div>
              <div className='flex gap-3'>
                <span className='text-primary font-semibold'>Prioridad:</span>
                <span className='text-muted-foreground'>
                  Elige entre Baja, Normal o Alta según la importancia
                </span>
              </div>
            </div>
          </div>

          <div>
            <h5 className='text-foreground mb-3 text-base font-semibold'>Editar una Entrega</h5>
            <p className='text-muted-foreground leading-relaxed'>
              Puedes modificar cualquier entrega en cualquier momento haciendo clic en el botón de
              edición que aparece junto a ella. Realiza los cambios necesarios en el formulario y
              guarda para actualizar la información.
            </p>
          </div>

          <div>
            <h5 className='text-foreground mb-3 text-base font-semibold'>Marcar como Completada</h5>
            <p className='text-muted-foreground leading-relaxed'>
              Cuando termines una entrega, marca el checkbox junto a ella para indicar que está
              completada. Las entregas completadas se mostrarán con un estilo visual diferente,
              ayudándote a distinguir rápidamente tu progreso.
            </p>
          </div>

          <div>
            <h5 className='text-foreground mb-3 text-base font-semibold'>Eliminar una Entrega</h5>
            <p className='text-muted-foreground leading-relaxed'>
              Si necesitas eliminar una entrega, haz clic en el botón de eliminar correspondiente.
              El sistema te pedirá confirmación antes de proceder para evitar eliminaciones
              accidentales.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'views',
      title: 'Vistas Disponibles',
      content: (
        <div className='space-y-6'>
          <p className='text-muted-foreground leading-relaxed'>
            La aplicación ofrece tres formas diferentes de visualizar tus entregas, cada una
            diseñada para diferentes necesidades y preferencias. Puedes cambiar entre ellas usando
            el selector de vistas en la parte superior.
          </p>

          <div className='bg-muted/30 space-y-4 rounded-lg p-4'>
            <div>
              <h5 className='text-foreground mb-2 flex items-center gap-2 text-base font-semibold'>
                <span className='bg-primary/20 text-primary flex h-6 w-6 items-center justify-center rounded text-xs font-bold'>
                  1
                </span>
                Vista de Lista
              </h5>
              <p className='text-muted-foreground ml-8 leading-relaxed'>
                Muestra todas tus entregas en formato de tabla ordenada. Ideal para tener una visión
                general rápida con opciones de filtrado por asignatura y ordenamiento por fecha,
                prioridad o estado.
              </p>
            </div>

            <div>
              <h5 className='text-foreground mb-2 flex items-center gap-2 text-base font-semibold'>
                <span className='bg-primary/20 text-primary flex h-6 w-6 items-center justify-center rounded text-xs font-bold'>
                  2
                </span>
                Vista de Calendario
              </h5>
              <p className='text-muted-foreground ml-8 leading-relaxed'>
                Visualización mensual que te permite navegar por meses y ver la distribución
                temporal de tus entregas. Cada asignatura se muestra con un color diferente para
                facilitar la identificación.
              </p>
            </div>

            <div>
              <h5 className='text-foreground mb-2 flex items-center gap-2 text-base font-semibold'>
                <span className='bg-primary/20 text-primary flex h-6 w-6 items-center justify-center rounded text-xs font-bold'>
                  3
                </span>
                Vista de Gantt
              </h5>
              <p className='text-muted-foreground ml-8 leading-relaxed'>
                Diagrama de línea de tiempo horizontal que muestra la duración de cada entrega con
                barras visuales. Perfecta para identificar solapamientos entre tareas y planificar
                tu tiempo de estudio.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'semester-config',
      title: 'Configuración del Semestre',
      content: (
        <div className='space-y-4'>
          <p className='text-muted-foreground leading-relaxed'>
            La fecha de inicio del semestre es fundamental para el funcionamiento óptimo del
            sistema. Puedes encontrar este control en la parte superior izquierda de la pantalla
            principal. Esta configuración afecta directamente los cálculos del algoritmo de IA para
            generar horarios de estudio sugeridos, asegurando que las recomendaciones se ajusten al
            tiempo real disponible en tu semestre académico.
          </p>
        </div>
      ),
    },
    {
      id: 'profile-management',
      title: 'Gestión de Perfil',
      content: (
        <div className='space-y-6'>
          <p className='text-muted-foreground leading-relaxed'>
            Para acceder a tu perfil, haz clic en tu foto de perfil o nombre de usuario ubicado en
            la esquina superior derecha de la pantalla. Desde allí, selecciona la opción
            &quot;Perfil&quot; para acceder a toda tu configuración personal.
          </p>

          <div className='bg-muted/30 space-y-3 rounded-lg p-4'>
            <div>
              <h5 className='text-foreground mb-2 text-base font-semibold'>Información Personal</h5>
              <p className='text-muted-foreground leading-relaxed'>
                En esta sección puedes modificar tu información personal como nombre y email,
                cambiar tu contraseña de acceso para mayor seguridad, y ajustar tus preferencias
                personales de la aplicación.
              </p>
            </div>

            <div className='border-destructive/30 bg-destructive/5 rounded-lg border p-3'>
              <h5 className='text-destructive mb-2 flex items-center gap-2 text-base font-semibold'>
                <span>⚠️</span>
                Eliminación de Cuenta
              </h5>
              <p className='text-destructive/90 text-sm leading-relaxed'>
                Esta es una acción irreversible que eliminará completamente tu cuenta y todos tus
                datos. El proceso requiere confirmación de contraseña y verificación adicional para
                garantizar la seguridad.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ],
};
