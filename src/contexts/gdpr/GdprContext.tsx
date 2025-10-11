/**
 * Contexto GDPR para gestionar el estado de consentimiento globalmente
 *
 * Aplica principio de Responsabilidad Única (SRP):
 * - Solo gestiona el estado global de GDPR y consentimiento
 *
 * Aplica principio de Inversión de Dependencias (DIP):
 * - Depende de abstracciones (cookieConsentService) no de implementaciones concretas
 */

import React, {
  type ReactNode,
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';

import {
  cookieConsentService,
  type ConsentState,
  type CookieCategory,
  type CookieConfig,
} from '@/services/cookieConsent';

interface GdprContextValue {
  // Estado de consentimiento
  consent: ConsentState | null;
  hasUserResponded: boolean;

  // Métodos de consentimiento
  acceptAll: () => void;
  rejectAll: () => void;
  setCustomConsent: (_consent: Omit<ConsentState, 'timestamp' | 'version'>) => void;
  revokeConsent: () => void;
  hasConsent: (_category: CookieCategory) => boolean;

  // Registro de cookies
  cookieRegistry: CookieConfig[];
  getCookiesByCategory: (_category: CookieCategory) => CookieConfig[];

  // UI
  showConsentBanner: boolean;
  setShowConsentBanner: (_show: boolean) => void;
}

const GdprContext = createContext<GdprContextValue | undefined>(undefined);

export const GdprProvider: React.FC<{ readonly children: ReactNode }> = ({ children }) => {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [showConsentBanner, setShowConsentBanner] = useState(false);

  // Cargar estado inicial de consentimiento
  useEffect(() => {
    const currentConsent = cookieConsentService.getConsent();
    setConsent(currentConsent);

    // Mostrar banner solo si el usuario no ha respondido
    if (!currentConsent) {
      setShowConsentBanner(true);
    }
  }, []);

  // Escuchar cambios en el consentimiento
  useEffect(() => {
    const handleConsentChange = (event: Event) => {
      const customEvent = event as unknown as { detail: ConsentState };
      setConsent(customEvent.detail);
      setShowConsentBanner(false);
    };

    const handleConsentRevoked = () => {
      setConsent(null);
      setShowConsentBanner(true);
    };

    window.addEventListener('consentChanged', handleConsentChange as never);
    window.addEventListener('consentRevoked', handleConsentRevoked as never);

    return () => {
      window.removeEventListener('consentChanged', handleConsentChange as never);
      window.removeEventListener('consentRevoked', handleConsentRevoked as never);
    };
  }, []);

  const acceptAll = useCallback(() => {
    cookieConsentService.acceptAll();
  }, []);

  const rejectAll = useCallback(() => {
    cookieConsentService.rejectAll();
  }, []);

  const setCustomConsent = useCallback(
    (customConsent: Omit<ConsentState, 'timestamp' | 'version'>) => {
      cookieConsentService.setConsent(customConsent);
    },
    []
  );

  const revokeConsent = useCallback(() => {
    cookieConsentService.revokeAllConsent();
  }, []);

  const hasConsent = useCallback((category: CookieCategory) => {
    return cookieConsentService.hasConsent(category);
  }, []);

  const getCookiesByCategory = useCallback((category: CookieCategory) => {
    return cookieConsentService.getCookiesByCategory(category);
  }, []);

  const hasUserResponded = useMemo(() => {
    return cookieConsentService.hasUserRespondedToConsent();
  }, []);

  const cookieRegistry = useMemo(() => {
    return cookieConsentService.getCookieRegistry();
  }, []);

  const value: GdprContextValue = useMemo(
    () => ({
      consent,
      hasUserResponded,
      acceptAll,
      rejectAll,
      setCustomConsent,
      revokeConsent,
      hasConsent,
      cookieRegistry,
      getCookiesByCategory,
      showConsentBanner,
      setShowConsentBanner,
    }),
    [
      consent,
      hasUserResponded,
      acceptAll,
      rejectAll,
      setCustomConsent,
      revokeConsent,
      hasConsent,
      cookieRegistry,
      getCookiesByCategory,
      showConsentBanner,
    ]
  );

  return <GdprContext.Provider value={value}>{children}</GdprContext.Provider>;
};

/**
 * Hook para usar el contexto GDPR
 */
export const useGdpr = (): GdprContextValue => {
  const context = useContext(GdprContext);

  if (!context) {
    throw new Error('useGdpr debe usarse dentro de GdprProvider');
  }

  return context;
};
