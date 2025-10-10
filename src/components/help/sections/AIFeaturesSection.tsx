import type { Section } from '../types';

export const aiFeaturesSection: Section = {
  id: 'ai-features',
  title: 'Funcionalidades Inteligentes',
  subsections: [
    {
      id: 'ai-assistant',
      title: 'Asistente de IA para Horarios de Estudio',
      content: (
        <div className='space-y-6'>
          <p className='text-muted-foreground leading-relaxed'>
            El sistema incluye un asistente de inteligencia artificial que te ayuda a organizar tu
            tiempo de estudio de manera óptima. Este asistente analiza tus entregas, sus prioridades
            y las fechas límite para sugerirte cuándo comenzar a estudiar cada tema, evitando que te
            sobrecargues o que dejes todo para el último momento.
          </p>

          <div className='bg-primary/10 border-primary/30 rounded-lg border p-4'>
            <h5 className='text-foreground mb-3 text-base font-semibold'>
              ¿Qué puede hacer por ti?
            </h5>
            <div className='space-y-2'>
              <p className='text-muted-foreground text-sm leading-relaxed'>
                El asistente distribuye inteligentemente tu tiempo de estudio, priorizando las
                entregas más importantes o complejas. También te da consejos personalizados para
                mejorar tu organización y productividad académica.
              </p>
            </div>
          </div>

          <div className='bg-muted/30 rounded-lg p-4'>
            <p className='text-muted-foreground text-sm italic'>
              Nota: Para usar esta funcionalidad necesitas configurar una clave API de OpenAI
              (servicio de inteligencia artificial). Es muy económico: un semestre completo te
              costará menos de 1 dólar.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'openai-api',
      title: 'Cómo Obtener la Clave API de OpenAI',
      content: (
        <div className='space-y-4'>
          <p className='text-muted-foreground leading-relaxed'>
            Para activar el asistente inteligente, necesitas obtener una clave API (una especie de
            contraseña) del servicio OpenAI. No te preocupes, es un proceso sencillo y gratuito
            crear la cuenta:
          </p>

          <div className='bg-muted/30 space-y-4 rounded-lg p-4'>
            <div>
              <h5 className='text-foreground mb-2 flex items-center gap-2 font-semibold'>
                <span className='bg-primary/20 text-primary flex h-6 w-6 items-center justify-center rounded text-xs font-bold'>
                  1
                </span>
                Crear tu cuenta
              </h5>
              <p className='text-muted-foreground ml-8 text-sm leading-relaxed'>
                Ve a{' '}
                <a
                  href='https://platform.openai.com'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-primary hover:underline'
                >
                  platform.openai.com
                </a>{' '}
                y regístrate con tu email o cuenta de Google/Microsoft.
              </p>
            </div>

            <div>
              <h5 className='text-foreground mb-2 flex items-center gap-2 font-semibold'>
                <span className='bg-primary/20 text-primary flex h-6 w-6 items-center justify-center rounded text-xs font-bold'>
                  2
                </span>
                Ir a las claves API
              </h5>
              <p className='text-muted-foreground ml-8 text-sm leading-relaxed'>
                Una vez dentro, haz clic en tu foto de perfil (arriba a la derecha) y selecciona
                &quot;API Keys&quot; del menú.
              </p>
            </div>

            <div>
              <h5 className='text-foreground mb-2 flex items-center gap-2 font-semibold'>
                <span className='bg-primary/20 text-primary flex h-6 w-6 items-center justify-center rounded text-xs font-bold'>
                  3
                </span>
                Crear tu clave
              </h5>
              <p className='text-muted-foreground ml-8 text-sm leading-relaxed'>
                Haz clic en &quot;Create new secret key&quot;, ponle un nombre (por ejemplo:
                &quot;Calendario Universitario&quot;) y copia la clave que empieza con{' '}
                <code className='bg-muted px-1'>sk-...</code>
              </p>
            </div>
          </div>

          <div className='border-destructive/50 bg-destructive/10 rounded-lg border p-4'>
            <h5 className='text-destructive mb-2 flex items-center gap-2 font-semibold'>
              <span>⚠️</span>
              Muy importante
            </h5>
            <p className='text-destructive/90 text-sm leading-relaxed'>
              La clave solo se muestra una vez. Guárdala en un lugar seguro (puedes copiarla en un
              archivo de texto). Nunca compartas esta clave con nadie. Es como una contraseña
              personal que te permite usar el servicio de inteligencia artificial.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'ai-config',
      title: 'Configuración en la Aplicación',
      content: (
        <div className='space-y-4'>
          <p className='text-muted-foreground leading-relaxed'>
            Una vez que tengas tu clave, es momento de configurarla en la aplicación:
          </p>

          <div className='bg-muted/30 space-y-4 rounded-lg p-4'>
            <div>
              <h5 className='text-foreground mb-2 flex items-center gap-2 font-semibold'>
                <span className='bg-primary/20 text-primary flex h-6 w-6 items-center justify-center rounded text-xs font-bold'>
                  1
                </span>
                Abre la configuración
              </h5>
              <p className='text-muted-foreground ml-8 text-sm leading-relaxed'>
                Haz clic en el ícono de engranaje (⚙️) que está en la esquina superior derecha de la
                pantalla y selecciona &quot;Configuración&quot;.
              </p>
            </div>

            <div>
              <h5 className='text-foreground mb-2 flex items-center gap-2 font-semibold'>
                <span className='bg-primary/20 text-primary flex h-6 w-6 items-center justify-center rounded text-xs font-bold'>
                  2
                </span>
                Pega tu clave
              </h5>
              <p className='text-muted-foreground ml-8 text-sm leading-relaxed'>
                Busca la sección que dice &quot;Configuración de IA&quot; y en el campo &quot;Clave
                API de OpenAI&quot; pega la clave que copiaste anteriormente.
              </p>
            </div>

            <div>
              <h5 className='text-foreground mb-2 flex items-center gap-2 font-semibold'>
                <span className='bg-primary/20 text-primary flex h-6 w-6 items-center justify-center rounded text-xs font-bold'>
                  3
                </span>
                Guarda los cambios
              </h5>
              <p className='text-muted-foreground ml-8 text-sm leading-relaxed'>
                Haz clic en &quot;Guardar&quot; y listo. La aplicación verificará que tu clave
                funciona correctamente.
              </p>
            </div>
          </div>

          <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20'>
            <p className='text-muted-foreground text-sm leading-relaxed'>
              💡 <strong>Privacidad</strong>: Tu clave se guarda solo en tu navegador, en tu
              computadora. Nunca la enviamos a nuestros servidores. Es completamente segura y
              privada. Pero recuerda, no debes compartirla con nadie.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'ai-costs',
      title: 'Costos de Uso',
      content: (
        <div className='space-y-4'>
          <p className='text-muted-foreground leading-relaxed'>
            El servicio de inteligencia artificial tiene un costo mínimo. Es importante que lo sepas
            antes de activarlo:
          </p>

          <div className='rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20'>
            <h5 className='text-foreground mb-3 font-semibold'>¿Cuánto cuesta?</h5>
            <div className='space-y-2 text-sm'>
              <p className='text-muted-foreground leading-relaxed'>
                El costo es extremadamente bajo. Para un semestre universitario completo con 20-30
                entregas, gastarás aproximadamente <strong>menos de 1 dólar</strong> (unos 50
                céntimos en promedio).
              </p>
            </div>
          </div>

          <div className='bg-muted/30 rounded-lg p-4'>
            <h5 className='text-foreground mb-3 font-semibold'>Ejemplos específicos</h5>
            <div className='text-muted-foreground space-y-1 text-sm'>
              <p>
                • Crear un plan de estudio completo: aproximadamente <strong>medio centavo</strong>
              </p>
              <p>
                • Pedir consejos de organización: aproximadamente{' '}
                <strong>un décimo de centavo</strong>
              </p>
              <p>
                • Un semestre completo usando el asistente regularmente:{' '}
                <strong>50 centavos - 1 dólar</strong>
              </p>
            </div>
          </div>

          <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20'>
            <h5 className='text-foreground mb-2 font-semibold'>💡 Consejos para ahorrar</h5>
            <ul className='text-muted-foreground list-disc space-y-1 pl-5 text-sm'>
              <li>Puedes revisar tu uso en cualquier momento en la página de OpenAI</li>
              <li>Solo se cobra cuando usas el asistente inteligente</li>
              <li>Si no configuras la clave API, la aplicación funciona perfectamente sin IA</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'ai-troubleshooting',
      title: 'Solución de Problemas con la IA',
      content: (
        <div className='space-y-4'>
          <div>
            <h5 className='text-foreground mb-2 font-semibold'>
              Error común: &quot;Introduce tu clave de API&quot;
            </h5>
            <ul className='text-muted-foreground list-disc space-y-1 pl-5'>
              <li>Asegúrate de que la clave API está correctamente pegada</li>
              <li>Verifica que no hay espacios adicionales al principio o final</li>
              <li>Comprueba que tienes conexión a internet</li>
            </ul>
          </div>

          <div>
            <h5 className='text-foreground mb-2 font-semibold'>La IA no genera sugerencias</h5>
            <ul className='text-muted-foreground list-disc space-y-1 pl-5'>
              <li>Verifica que tienes entregas con fechas futuras</li>
              <li>Asegúrate de que la fecha de inicio del semestre está configurada</li>
              <li>Revisa que tienes suficientes días hasta la primera entrega</li>
            </ul>
          </div>

          <div>
            <h5 className='text-foreground mb-2 font-semibold'>Costos inesperados</h5>
            <ul className='text-muted-foreground list-disc space-y-1 pl-5'>
              <li>Monitorea tu uso en el panel de OpenAI regularmente</li>
              <li>El modelo GPT-5-nano está diseñado para ser económico</li>
              <li>Puedes desactivar la IA temporalmente si es necesario</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'statistics',
      title: 'Estadísticas Generales',
      content: (
        <div className='space-y-4'>
          <h5 className='text-foreground mb-2 font-semibold'>Información Mostrada</h5>
          <ul className='text-muted-foreground list-disc space-y-1 pl-5'>
            <li>
              <strong>Total de entregas</strong>: Cantidad total de tareas pendientes
            </li>
            <li>
              <strong>Próximas entregas</strong>: Tareas que vencen en los próximos días
            </li>
            <li>
              <strong>Entregas vencidas</strong>: Tareas que ya pasaron su fecha límite
            </li>
            <li>
              <strong>Esta semana</strong>: Entregas programadas para la semana actual
            </li>
          </ul>
        </div>
      ),
    },
  ],
};
