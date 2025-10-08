import type { User } from '@supabase/supabase-js';
/** Utilidades para manejar información de proveedores OAuth */
export interface OAuthProviderInfo {
  provider: string | null;
  isGoogle: boolean;
  avatarUrl: string | null;
  displayName: string | null;
}

const getMetadataString = (metadata: Record<string, unknown>, key: string): string | null => {
  const value = metadata[key];
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
};
const getSafeMetadata = (metadata: unknown): Record<string, unknown> => {
  return metadata && typeof metadata === 'object' ? (metadata as Record<string, unknown>) : {};
};
/** Determina si el usuario inició sesión con Google basado en los metadatos */
export const getOAuthProviderInfo = (user: User | null | undefined): OAuthProviderInfo => {
  if (!user) {
    return {
      provider: null,
      isGoogle: false,
      avatarUrl: null,
      displayName: null,
    };
  }

  const metadata = getSafeMetadata(user.user_metadata);

  const appMetadata = getSafeMetadata(user.app_metadata);

  const provider =
    getMetadataString(appMetadata, 'provider') ?? getMetadataString(metadata, 'provider');

  const issuer = getMetadataString(metadata, 'issuer');

  const sub = getMetadataString(metadata, 'sub');

  const isGoogle =
    provider === 'google' ||
    issuer === 'https://accounts.google.com' ||
    Boolean(sub && sub.includes('google'));

  const avatarUrl =
    getMetadataString(metadata, 'avatar_url') ??
    getMetadataString(metadata, 'picture') ??
    getMetadataString(metadata, 'photo');

  const displayName =
    getMetadataString(metadata, 'full_name') ??
    getMetadataString(metadata, 'name') ??
    getMetadataString(metadata, 'display_name');

  return {
    provider: provider ?? null,

    isGoogle,

    avatarUrl: avatarUrl ?? null,

    displayName: displayName ?? null,
  };
};

/** Obtiene la URL del avatar del usuario desde diferentes fuentes posibles */
export const getUserAvatarUrl = (user: User | null | undefined): string | null => {
  const providerInfo = getOAuthProviderInfo(user);
  return providerInfo.avatarUrl;
};

export interface ProviderDisplayInfo {
  name: string;
  icon: 'google' | 'mail';
  color: string;
}

/** Obtiene información del proveedor OAuth para mostrar en la UI */
export const getProviderDisplayInfo = (user: User | null | undefined): ProviderDisplayInfo => {
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
