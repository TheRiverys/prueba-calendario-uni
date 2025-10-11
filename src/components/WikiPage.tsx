import React from 'react';

/**
 * Página Wiki que muestra contenido de Notion mediante iframe
 * El iframe ocupa toda la página disponible debajo del header sin scroll
 */
export const WikiPage: React.FC = () => {
  return (
    <div className='fixed inset-0 top-16 h-[calc(100vh-4rem)] w-full overflow-hidden'>
      <iframe
        src='https://optistudy.notion.site/ebd/3d178cb80be845948f6674203239f510'
        width='100%'
        height='100%'
        allowFullScreen
        className='h-full w-full'
        title='Documentación OptiStudy'
        style={{
          minHeight: 'calc(100vh - 4rem)',
          height: 'calc(100vh - 4rem)',
          maxHeight: 'calc(100vh - 4rem)',
        }}
      />
    </div>
  );
};
