const STATIC_KEYS = ['deliveries', 'supabase.auth.token'];
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
