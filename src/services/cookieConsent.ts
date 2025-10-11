/**
 * Servicio de gestión de consentimiento de cookies siguiendo GDPR
 *
 * Aplica principio de Responsabilidad Única (SRP):
 * - Solo se encarga de la gestión de consentimiento de cookies
 *
 * Aplica principio de Inversión de Dependencias (DIP):
 * - Expone interfaces claras que pueden ser implementadas de diferentes formas
 */

// Categorías de cookies según GDPR
export enum CookieCategory {
  // eslint-disable-next-line no-unused-vars
  ESSENTIAL = 'essential',
  // eslint-disable-next-line no-unused-vars
  ANALYTICS = 'analytics',
  // eslint-disable-next-line no-unused-vars
  FUNCTIONAL = 'functional',
}

// Configuración de una cookie individual
export interface CookieConfig {
  name: string;
  category: CookieCategory;
  duration: number; // En días
  description: string;
}

// Estado de consentimiento del usuario
export interface ConsentState {
  [CookieCategory.ESSENTIAL]: boolean; // Siempre true
  [CookieCategory.ANALYTICS]: boolean;
  [CookieCategory.FUNCTIONAL]: boolean;
  timestamp: string; // ISO 8601
  version: string; // Versión de la política de privacidad
}

// Registro de cookies que usa la aplicación
const COOKIE_REGISTRY: CookieConfig[] = [
  {
    name: 'analytics_user_id',
    category: CookieCategory.ANALYTICS,
    duration: 365,
    description: 'Identificador único para analíticas anónimas de uso',
  },
  {
    name: 'pending_analytics_association',
    category: CookieCategory.ANALYTICS,
    duration: 30,
    description: 'Asociación temporal entre usuario anónimo y registrado',
  },
  {
    name: 'cookie_consent',
    category: CookieCategory.ESSENTIAL,
    duration: 365,
    description: 'Almacena tus preferencias de consentimiento de cookies',
  },
  {
    name: 'user_preferences',
    category: CookieCategory.FUNCTIONAL,
    duration: 365,
    description: 'Preferencias de la aplicación (tema, vista predeterminada, etc.)',
  },
];

/**
 * Servicio principal de gestión de consentimiento
 *
 * Aplica SRP: Una única responsabilidad de gestionar el consentimiento
 */
class CookieConsentService {
  private readonly CONSENT_COOKIE_NAME = 'cookie_consent';
  private readonly POLICY_VERSION = '1.0.0';

  /**
   * Obtiene el estado actual de consentimiento
   */
  public getConsent(): ConsentState | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const consentCookie = this.getCookie(this.CONSENT_COOKIE_NAME);
    if (!consentCookie) {
      return null;
    }

    try {
      return JSON.parse(decodeURIComponent(consentCookie));
    } catch {
      return null;
    }
  }

  /**
   * Guarda el estado de consentimiento
   */
  public setConsent(consent: Omit<ConsentState, 'timestamp' | 'version'>): void {
    if (typeof window === 'undefined') {
      return;
    }

    const fullConsent: ConsentState = {
      ...consent,
      timestamp: new Date().toISOString(),
      version: this.POLICY_VERSION,
      [CookieCategory.ESSENTIAL]: true, // Siempre habilitadas
    };

    this.setCookie(this.CONSENT_COOKIE_NAME, encodeURIComponent(JSON.stringify(fullConsent)), 365);

    // Limpiar cookies de categorías no consentidas
    this.cleanupNonConsentedCookies(fullConsent);

    // Disparar evento personalizado para que la app reaccione
    // eslint-disable-next-line no-undef
    const event = new CustomEvent('consentChanged', { detail: fullConsent });
    window.dispatchEvent(event);
  }

  /**
   * Verifica si una categoría de cookie tiene consentimiento
   */
  public hasConsent(category: CookieCategory): boolean {
    const consent = this.getConsent();

    // Las cookies esenciales siempre están permitidas
    if (category === CookieCategory.ESSENTIAL) {
      return true;
    }

    // Si no hay consentimiento guardado, no hay permiso
    if (!consent) {
      return false;
    }

    return consent[category] === true;
  }

  /**
   * Verifica si el usuario ya ha dado o rechazado el consentimiento
   */
  public hasUserRespondedToConsent(): boolean {
    return this.getConsent() !== null;
  }

  /**
   * Acepta todas las cookies
   */
  public acceptAll(): void {
    this.setConsent({
      [CookieCategory.ESSENTIAL]: true,
      [CookieCategory.ANALYTICS]: true,
      [CookieCategory.FUNCTIONAL]: true,
    });
  }

  /**
   * Rechaza todas las cookies no esenciales
   */
  public rejectAll(): void {
    this.setConsent({
      [CookieCategory.ESSENTIAL]: true,
      [CookieCategory.ANALYTICS]: false,
      [CookieCategory.FUNCTIONAL]: false,
    });
  }

  /**
   * Revoca todo el consentimiento y elimina todas las cookies
   */
  public revokeAllConsent(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Eliminar todas las cookies
    COOKIE_REGISTRY.forEach(config => {
      this.deleteCookie(config.name);
    });

    // Eliminar también datos de localStorage relacionados
    localStorage.removeItem('analytics_user_id');
    localStorage.removeItem('pending_analytics_association');
    localStorage.removeItem('user_preferences');

    // Eliminar el consentimiento
    this.deleteCookie(this.CONSENT_COOKIE_NAME);

    // Disparar evento
    // eslint-disable-next-line no-undef
    const event2 = new CustomEvent('consentRevoked');
    window.dispatchEvent(event2);
  }

  /**
   * Obtiene el registro de cookies
   */
  public getCookieRegistry(): CookieConfig[] {
    return COOKIE_REGISTRY;
  }

  /**
   * Obtiene cookies por categoría
   */
  public getCookiesByCategory(category: CookieCategory): CookieConfig[] {
    return COOKIE_REGISTRY.filter(c => c.category === category);
  }

  // --- Métodos privados ---

  private getCookie(name: string): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);

    if (parts.length === 2) {
      const cookieValue = parts.pop();
      return cookieValue ? cookieValue.split(';').shift() || null : null;
    }

    return null;
  }

  private setCookie(name: string, value: string, days: number): void {
    if (typeof window === 'undefined') {
      return;
    }

    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure`;
  }

  private deleteCookie(name: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  private cleanupNonConsentedCookies(consent: ConsentState): void {
    COOKIE_REGISTRY.forEach(config => {
      // No eliminar cookies esenciales
      if (config.category === CookieCategory.ESSENTIAL) {
        return;
      }

      // Eliminar si no hay consentimiento para esta categoría
      if (!consent[config.category]) {
        this.deleteCookie(config.name);
      }
    });
  }
}

// Exportar instancia única (Singleton pattern)
export const cookieConsentService = new CookieConsentService();
