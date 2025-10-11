/**
 * Página de Política de Privacidad conforme a GDPR
 *
 * Cumple con los requisitos de transparencia del Art. 13 y 14 GDPR
 * Aplica principio de Responsabilidad Única (SRP):
 * - Solo muestra la información legal de privacidad
 */

import { Shield, Mail, FileText, Lock, Eye, Trash2, Download } from 'lucide-react';
import React from 'react';

import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export const PrivacyPolicy: React.FC = () => {
  return (
    <ScrollArea className='h-full'>
      <div className='container mx-auto max-w-4xl space-y-6 p-6'>
        <div className='mb-8'>
          <div className='mb-4 flex items-center gap-3'>
            <Shield className='h-10 w-10 text-blue-600 dark:text-blue-400' />
            <div>
              <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
                Política de Privacidad
              </h1>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                Última actualización: {new Date().toLocaleDateString('es-ES')}
              </p>
              <p className='text-sm text-gray-500 dark:text-gray-400'>Versión: 1.0.0</p>
            </div>
          </div>
          <p className='text-gray-600 dark:text-gray-300'>
            Esta Política de Privacidad describe cómo recopilamos, usamos y protegemos tu
            información personal en cumplimiento del{' '}
            <a
              href='https://eur-lex.europa.eu/legal-content/ES/TXT/?uri=celex:32016R0679'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 hover:underline dark:text-blue-400'
            >
              Reglamento General de Protección de Datos (GDPR)
            </a>
            .
          </p>
        </div>

        <Card className='p-6'>
          <h2 className='mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white'>
            <FileText className='h-6 w-6 text-blue-600 dark:text-blue-400' />
            1. Información que Recopilamos
          </h2>

          <div className='space-y-4'>
            <div>
              <h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>
                1.1 Datos de Cuenta (Base legal: Ejecución de contrato)
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Cuando creas una cuenta, recopilamos:
              </p>
              <ul className='mt-2 list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400'>
                <li>Dirección de correo electrónico</li>
                <li>Contraseña (encriptada)</li>
                <li>Fecha de creación de cuenta</li>
                <li>Fecha de último inicio de sesión</li>
              </ul>
            </div>

            <div>
              <h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>
                1.2 Datos de Uso (Base legal: Consentimiento explícito)
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Con tu consentimiento, recopilamos datos de analítica:
              </p>
              <ul className='mt-2 list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400'>
                <li>ID de usuario anónimo (UUID generado localmente)</li>
                <li>Fecha y hora de primera visita</li>
                <li>Fecha y hora de última visita</li>
                <li>Número total de accesos a la aplicación</li>
                <li>Timestamp y versión del consentimiento dado</li>
              </ul>
            </div>

            <div>
              <h3 className='mb-2 font-semibold text-gray-900 dark:text-white'>
                1.3 Datos de Aplicación (Base legal: Interés legítimo)
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Para proporcionar el servicio, almacenamos:
              </p>
              <ul className='mt-2 list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400'>
                <li>Entregas académicas (nombre, asignatura, fecha límite, etc.)</li>
                <li>Configuración de semestre</li>
                <li>Preferencias de interfaz (tema, vista predeterminada)</li>
              </ul>
            </div>
          </div>
        </Card>

        <Card className='p-6'>
          <h2 className='mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white'>
            <Lock className='h-6 w-6 text-blue-600 dark:text-blue-400' />
            2. Cómo Usamos tu Información
          </h2>

          <div className='space-y-3'>
            <div>
              <h3 className='mb-1 font-semibold text-gray-900 dark:text-white'>
                2.1 Provisión del Servicio
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Usamos tus datos de cuenta y aplicación para proporcionarte acceso a la plataforma y
                gestionar tus entregas académicas.
              </p>
            </div>

            <div>
              <h3 className='mb-1 font-semibold text-gray-900 dark:text-white'>
                2.2 Mejora del Producto
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Los datos de analítica anónimos nos ayudan a entender cómo se usa la aplicación para
                mejorar la experiencia de usuario. Estos datos son completamente anónimos y no te
                identifican personalmente.
              </p>
            </div>

            <div>
              <h3 className='mb-1 font-semibold text-gray-900 dark:text-white'>
                2.3 Comunicaciones
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Podemos usar tu correo electrónico para enviarte notificaciones importantes sobre tu
                cuenta o cambios en el servicio. No enviamos correos de marketing sin tu
                consentimiento explícito.
              </p>
            </div>
          </div>
        </Card>

        <Card className='p-6'>
          <h2 className='mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white'>
            <Shield className='h-6 w-6 text-blue-600 dark:text-blue-400' />
            3. Tus Derechos bajo el GDPR
          </h2>

          <div className='space-y-4'>
            <div className='rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20'>
              <p className='mb-3 font-medium text-blue-900 dark:text-blue-300'>
                Como residente de la UE, tienes los siguientes derechos:
              </p>

              <div className='space-y-3'>
                <div className='flex items-start gap-2'>
                  <Eye className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
                  <div>
                    <h4 className='font-medium text-blue-900 dark:text-blue-300'>
                      Derecho de Acceso (Art. 15 GDPR)
                    </h4>
                    <p className='text-sm text-blue-800 dark:text-blue-400'>
                      Puedes solicitar una copia de todos tus datos personales en formato legible.
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-2'>
                  <Download className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
                  <div>
                    <h4 className='font-medium text-blue-900 dark:text-blue-300'>
                      Derecho de Portabilidad (Art. 20 GDPR)
                    </h4>
                    <p className='text-sm text-blue-800 dark:text-blue-400'>
                      Puedes exportar tus datos en formato JSON estructurado para transferirlos a
                      otro servicio.
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-2'>
                  <FileText className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
                  <div>
                    <h4 className='font-medium text-blue-900 dark:text-blue-300'>
                      Derecho de Rectificación (Art. 16 GDPR)
                    </h4>
                    <p className='text-sm text-blue-800 dark:text-blue-400'>
                      Puedes modificar tus datos personales en cualquier momento desde tu perfil.
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-2'>
                  <Trash2 className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
                  <div>
                    <h4 className='font-medium text-blue-900 dark:text-blue-300'>
                      Derecho al Olvido (Art. 17 GDPR)
                    </h4>
                    <p className='text-sm text-blue-800 dark:text-blue-400'>
                      Puedes solicitar la eliminación completa y permanente de todos tus datos.
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-2'>
                  <Lock className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
                  <div>
                    <h4 className='font-medium text-blue-900 dark:text-blue-300'>
                      Derecho a Limitar el Procesamiento (Art. 18 GDPR)
                    </h4>
                    <p className='text-sm text-blue-800 dark:text-blue-400'>
                      Puedes revocar tu consentimiento para cookies de analítica en cualquier
                      momento.
                    </p>
                  </div>
                </div>
              </div>

              <p className='mt-4 text-sm text-blue-800 dark:text-blue-400'>
                Para ejercer cualquiera de estos derechos, visita la sección de Configuración de
                Privacidad en tu perfil.
              </p>
            </div>
          </div>
        </Card>

        <Card className='p-6'>
          <h2 className='mb-4 text-2xl font-bold text-gray-900 dark:text-white'>
            4. Cookies y Tecnologías de Seguimiento
          </h2>

          <div className='space-y-3'>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Utilizamos cookies para mejorar tu experiencia. Categorizamos nuestras cookies en:
            </p>

            <div className='space-y-2'>
              <div className='rounded-lg border border-gray-200 p-3 dark:border-gray-700'>
                <h4 className='font-medium text-gray-900 dark:text-white'>
                  Cookies Esenciales (Siempre activas)
                </h4>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Necesarias para el funcionamiento básico de la aplicación (autenticación, sesión,
                  consentimiento de cookies).
                </p>
              </div>

              <div className='rounded-lg border border-gray-200 p-3 dark:border-gray-700'>
                <h4 className='font-medium text-gray-900 dark:text-white'>
                  Cookies de Analítica (Requieren consentimiento)
                </h4>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Rastrean el uso de la aplicación de forma completamente anónima para ayudarnos a
                  mejorar el producto.
                </p>
              </div>

              <div className='rounded-lg border border-gray-200 p-3 dark:border-gray-700'>
                <h4 className='font-medium text-gray-900 dark:text-white'>
                  Cookies Funcionales (Requieren consentimiento)
                </h4>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Guardan tus preferencias de interfaz (tema, idioma, vista predeterminada) para
                  mejorar tu experiencia.
                </p>
              </div>
            </div>

            <p className='mt-3 text-sm text-gray-600 dark:text-gray-400'>
              Puedes gestionar tus preferencias de cookies en cualquier momento desde Configuración
              de Privacidad.
            </p>
          </div>
        </Card>

        <Card className='p-6'>
          <h2 className='mb-4 text-2xl font-bold text-gray-900 dark:text-white'>
            5. Almacenamiento y Seguridad de Datos
          </h2>

          <div className='space-y-3'>
            <div>
              <h3 className='mb-1 font-semibold text-gray-900 dark:text-white'>
                5.1 Dónde Almacenamos tus Datos
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Tus datos se almacenan en servidores seguros proporcionados por Supabase
                (PostgreSQL). Todos los servidores están ubicados dentro de la Unión Europea para
                cumplir con el GDPR.
              </p>
            </div>

            <div>
              <h3 className='mb-1 font-semibold text-gray-900 dark:text-white'>
                5.2 Medidas de Seguridad
              </h3>
              <ul className='list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400'>
                <li>Contraseñas encriptadas con bcrypt</li>
                <li>Conexiones HTTPS/TLS en todas las comunicaciones</li>
                <li>Cookies con flags Secure y SameSite</li>
                <li>Autenticación mediante tokens JWT</li>
                <li>Row Level Security (RLS) en base de datos</li>
              </ul>
            </div>

            <div>
              <h3 className='mb-1 font-semibold text-gray-900 dark:text-white'>
                5.3 Retención de Datos
              </h3>
              <p className='text-sm text-gray-600 dark:text-gray-400'>
                Conservamos tus datos mientras mantengas tu cuenta activa. Si eliminas tu cuenta,
                todos tus datos se eliminan permanentemente en un plazo de 30 días.
              </p>
            </div>
          </div>
        </Card>

        <Card className='p-6'>
          <h2 className='mb-4 text-2xl font-bold text-gray-900 dark:text-white'>
            6. Compartir Datos con Terceros
          </h2>

          <div className='space-y-3'>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              No vendemos ni compartimos tus datos personales con terceros para fines de marketing.
              Solo compartimos datos con:
            </p>

            <ul className='list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400'>
              <li>
                <strong>Supabase (Backend):</strong> Para almacenar y gestionar tus datos de forma
                segura
              </li>
              <li>
                <strong>Servicios de Infraestructura:</strong> Para hosting y entrega de contenido
              </li>
            </ul>

            <p className='mt-2 text-sm text-gray-600 dark:text-gray-400'>
              Todos los proveedores de servicios cumplen con el GDPR y tienen acuerdos de
              procesamiento de datos apropiados.
            </p>
          </div>
        </Card>

        <Card className='p-6'>
          <h2 className='mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white'>
            <Mail className='h-6 w-6 text-blue-600 dark:text-blue-400' />
            7. Contacto y Preguntas
          </h2>

          <div className='space-y-3'>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              Si tienes preguntas sobre esta Política de Privacidad o deseas ejercer tus derechos
              GDPR, puedes contactarnos en:
            </p>

            <div className='rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800'>
              <p className='text-sm text-gray-900 dark:text-white'>
                <strong>Correo electrónico:</strong>{' '}
                <a
                  href='mailto:privacy@tu-dominio.com'
                  className='text-blue-600 hover:underline dark:text-blue-400'
                >
                  privacy@tu-dominio.com
                </a>
              </p>
              <p className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
                Responderemos a todas las consultas dentro de 30 días según lo requerido por el
                GDPR.
              </p>
            </div>
          </div>
        </Card>

        <Card className='p-6'>
          <h2 className='mb-4 text-2xl font-bold text-gray-900 dark:text-white'>
            8. Cambios a esta Política
          </h2>

          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Podemos actualizar esta Política de Privacidad ocasionalmente. Si realizamos cambios
            significativos, te notificaremos por correo electrónico y/o mediante un aviso en la
            aplicación. La versión actualizada entrará en vigor 30 días después de la notificación.
          </p>

          <p className='mt-3 text-sm text-gray-600 dark:text-gray-400'>
            El uso continuado del servicio después de los cambios constituye tu aceptación de la
            nueva política.
          </p>
        </Card>

        <Card className='border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/20'>
          <div className='flex items-start gap-3'>
            <Shield className='h-6 w-6 flex-shrink-0 text-blue-600 dark:text-blue-400' />
            <div>
              <h3 className='mb-2 font-semibold text-blue-900 dark:text-blue-300'>
                Tu Privacidad es Nuestra Prioridad
              </h3>
              <p className='text-sm text-blue-800 dark:text-blue-400'>
                Estamos comprometidos con la protección de tus datos personales y el cumplimiento
                total del GDPR. Si tienes alguna preocupación sobre cómo manejamos tus datos, no
                dudes en contactarnos.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </ScrollArea>
  );
};
