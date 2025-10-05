/**
 * Utilidades para manejar información de proveedores OAuth
 */

export interface OAuthProviderInfo {
  provider: string | null;
  isGoogle: boolean;
  avatarUrl: string | null;
  displayName: string | null;
}

/**
 * Determina si el usuario inició sesión con Google basado en los metadatos
 */
export const getOAuthProviderInfo = (user: any): OAuthProviderInfo => {
  if (!user) {
    return {
      provider: null,
      isGoogle: false,
      avatarUrl: null,
      displayName: null,
    };
  }

  const metadata = user.user_metadata || {};
  const appMetadata = user.app_metadata || {};

  // Determinar el proveedor basado en app_metadata o user_metadata
  const provider = appMetadata.provider || metadata.provider || null;

  // Verificar si es Google
  const isGoogle =
    provider === 'google' ||
    (metadata &&
      (metadata.issuer === 'https://accounts.google.com' || metadata.sub?.includes('google')));

  // Obtener avatar URL - Google suele ponerlo en diferentes campos
  const avatarUrl = metadata.avatar_url || metadata.picture || metadata.photo || null;

  // Si no hay avatar pero es Google, intentar construir URL de Google
  if (!avatarUrl && isGoogle && metadata.sub) {
    // Para usuarios de Google, podemos intentar construir la URL del avatar
    // aunque esto puede no funcionar debido a restricciones de CORS
    // avatarUrl = `https://lh3.googleusercontent.com/a/${metadata.sub}`;
  }

  // Obtener nombre de usuario
  const displayName = metadata.full_name || metadata.name || metadata.display_name || null;

  return {
    provider,
    isGoogle,
    avatarUrl,
    displayName,
  };
};

/**
 * Obtiene la URL del avatar del usuario desde diferentes fuentes posibles
 */
export const getUserAvatarUrl = (user: any): string | null => {
  const providerInfo = getOAuthProviderInfo(user);
  return providerInfo.avatarUrl;
};

/**
 * Obtiene información del proveedor OAuth para mostrar en la UI
 */
export const getProviderDisplayInfo = (user: any) => {
  const providerInfo = getOAuthProviderInfo(user);

  if (providerInfo.isGoogle) {
    return {
      name: 'Google',
      icon: 'google',
      color: 'text-red-600',
    };
  }

  return {
    name: 'Correo y contraseña',
    icon: 'mail',
    color: 'text-muted-foreground',
  };
};
