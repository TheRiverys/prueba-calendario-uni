import React, { useEffect } from 'react';

export const BuyMeACoffee: React.FC = () => {
  useEffect(() => {
    // Verificar si el script ya está cargado
    const existingScript = document.querySelector('script[data-name="BMC-Widget"]');
    if (existingScript) return;

    const script = document.createElement('script');
    script.setAttribute('data-name', 'BMC-Widget');
    script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js';
    script.setAttribute('data-id', 'albeertpt'); // ID de usuario de Buy Me a Coffee
    script.setAttribute('data-description', 'Ayúdame en Buy me a coffee!');
    script.setAttribute(
      'data-message',
      'Gracias por visitar! Si esta aplicación te ha ayudado de alguna manera, considera comprarnos un café. ☕✨'
    );
    script.setAttribute('data-color', '#FFDD00');
    script.setAttribute('data-position', 'Right');
    script.setAttribute('data-x_margin', '18');
    script.setAttribute('data-y_margin', '18');
    script.async = true;

    script.onload = function () {
      // Disparar evento para que el widget se inicialice
      const evt = document.createEvent('Event');
      evt.initEvent('DOMContentLoaded', false, false);
      window.dispatchEvent(evt);
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.querySelector('script[data-name="BMC-Widget"]');
      if (scriptToRemove) {
        document.head.removeChild(scriptToRemove);
      }
    };
  }, []);

  return null; // El widget se renderiza dinámicamente por el script
};
