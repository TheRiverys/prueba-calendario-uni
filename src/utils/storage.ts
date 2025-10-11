const STATIC_KEYS = ['deliveries', 'supabase.auth.token', 'analytics_user_id'];
const KEY_PATTERNS = [/user/i, /auth/i, /config/i];

export const clearLocalUserData = (): void => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  const { localStorage } = window;

  try {
    STATIC_KEYS.forEach(key => {
      localStorage.removeItem(key);
    });

    for (let index = localStorage.length - 1; index >= 0; index -= 1) {
      const storageKey = localStorage.key(index);
      if (!storageKey) {
        continue;
      }

      if (STATIC_KEYS.includes(storageKey)) {
        continue;
      }

      if (KEY_PATTERNS.some(pattern => pattern.test(storageKey))) {
        localStorage.removeItem(storageKey);
      }
    }
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('No se pudieron limpiar los datos locales del usuario');
  }
};

// ================================================
// UTILIDADES PARA ANALÍTICAS DE USUARIOS ÚNICOS
// ================================================

/**
 * Genera un UUID v4 único usando el API de crypto para mayor seguridad
 * Lanza un error si no está disponible el API de crypto
 */
export const generateUniqueUserId = (): string => {
  if (typeof window === 'undefined') {
    throw new Error('UUID generation not available in server environment');
  }

  // Verificar que crypto API esté disponible
  const cryptoGlobal = globalThis as typeof globalThis & {
    crypto?: { getRandomValues?: (_array: Uint8Array) => void };
  };
  const cryptoObj = cryptoGlobal.crypto;
  if (!cryptoObj || !cryptoObj.getRandomValues) {
    throw new Error('Crypto API not available for UUID generation');
  }

  try {
    const array = new Uint8Array(16);
    cryptoObj.getRandomValues(array);

    // Establecer versión (4) y variant bits según RFC 4122
    array[6] = (array[6] & 0x0f) | 0x40; // Version 4
    array[8] = (array[8] & 0x3f) | 0x80; // Variant 10

    const hex = Array.from(array, (byte: number) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  } catch (error) {
    throw new Error(
      `Failed to generate UUID: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * Obtiene una cookie por nombre
 */
const getCookie = (name: string): string | null => {
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
};

/**
 * Establece una cookie
 */
const setCookie = (name: string, value: string, days: number): void => {
  if (typeof window === 'undefined') {
    return;
  }

  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);

  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure`;
};

/**
 * Obtiene o crea un ID de analíticas usando cookies en lugar de localStorage
 * Cumple con GDPR al respetar el consentimiento del usuario
 */
export const getOrCreateAnalyticsUserId = (): string => {
  if (typeof window === 'undefined') {
    throw new Error('Analytics user ID generation not available in server environment');
  }

  try {
    // Intentar obtener de cookie primero
    const existingIdFromCookie = getCookie('analytics_user_id');
    if (existingIdFromCookie) {
      return existingIdFromCookie;
    }

    // Migrar de localStorage a cookie si existe
    const existingIdFromStorage = localStorage.getItem('analytics_user_id');
    if (existingIdFromStorage) {
      // Mover a cookie y limpiar localStorage
      setCookie('analytics_user_id', existingIdFromStorage, 365);
      localStorage.removeItem('analytics_user_id');
      return existingIdFromStorage;
    }

    // Crear nuevo ID
    const newId = generateUniqueUserId();
    setCookie('analytics_user_id', newId, 365);
    return newId;
  } catch (error) {
    throw new Error(
      `Failed to get or create analytics user ID: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

/**
 * Registra un acceso de usuario único en la tabla de analíticas de Supabase
 * Esta función es asíncrona y no bloquea la aplicación
 * Respeta el consentimiento GDPR del usuario
 */
export const trackUserAccess = async (): Promise<void> => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    // Verificar consentimiento de cookies de analítica
    const consentCookie = getCookie('cookie_consent');
    if (!consentCookie) {
      // Sin consentimiento, no rastrear
      return;
    }

    let consent;
    try {
      consent = JSON.parse(decodeURIComponent(consentCookie));
    } catch {
      return;
    }

    // Verificar que el usuario haya consentido cookies de analítica
    if (!consent || !consent.analytics) {
      return;
    }

    // Importar supabase dinámicamente para evitar problemas en SSR
    const { supabase } = await import('../lib/supabase');

    const userId = getOrCreateAnalyticsUserId();

    // Verificar si hay un usuario autenticado
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const userIdAuth = user?.id || null;

    // Llamar a la función RPC para insertar/actualizar el registro
    // Incluir información de consentimiento GDPR
    await supabase.rpc('upsert_user_analytics', {
      p_user_id: userId,
      p_user_id_auth: userIdAuth,
      p_consent_timestamp: consent.timestamp || null,
      p_consent_version: consent.version || null,
    });
  } catch {
    // Silenciar errores de analíticas para no interrumpir la aplicación
  }
};

/**
 * Obtiene estadísticas de analíticas (para uso interno/administrativo)
 * Esta función requiere autenticación y permisos apropiados
 */
export const getAnalyticsStats = async (): Promise<{
  total_unique_users: number;
  total_access_count: number;
  avg_access_per_user: number;
  first_access_ever: string;
  last_access_ever: string;
} | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const { supabase } = await import('../lib/supabase');

    const { data, error } = await supabase.rpc('get_analytics_stats');

    if (error) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
};

/**
 * Asocia las estadísticas de un usuario anónimo con un usuario registrado
 * Se debe llamar cuando un usuario se registra exitosamente
 */
export const associateAnonymousAnalyticsWithUser = async (
  anonymousUserId: string,
  registeredUserId: string
): Promise<number> => {
  if (typeof window === 'undefined') {
    return 0;
  }

  try {
    const { supabase } = await import('../lib/supabase');

    const { data, error } = await supabase.rpc('associate_anonymous_analytics', {
      p_anonymous_user_id: anonymousUserId,
      p_registered_user_id: registeredUserId,
    });

    if (error) {
      return 0;
    }

    return data || 0;
  } catch {
    return 0;
  }
};
