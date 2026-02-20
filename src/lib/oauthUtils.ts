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

const getFirstStringByKeys = (metadata: Record<string, unknown>, keys: string[]): string | null => {
  for (const key of keys) {
    const value = getMetadataString(metadata, key);
    if (value) {
      return value;
    }
  }
  return null;
};

const getFirstIdentityData = (user: User): Record<string, unknown> => {
  const identities = (user as unknown as { identities?: unknown[] }).identities;
  if (!Array.isArray(identities) || identities.length === 0) {
    return {};
  }

  for (const identity of identities) {
    const safeIdentity = getSafeMetadata(identity);
    const identityData = getSafeMetadata(safeIdentity.identity_data);
    if (Object.keys(identityData).length > 0) {
      return identityData;
    }
  }

  return {};
};

const isGoogleSession = (
  provider: string | null,
  metadata: Record<string, unknown>,
  identityData: Record<string, unknown>
): boolean => {
  if (provider === 'google') {
    return true;
  }

  const issuer = getMetadataString(metadata, 'issuer') ?? getMetadataString(identityData, 'iss');
  if (issuer === 'https://accounts.google.com') {
    return true;
  }

  const sub = getMetadataString(metadata, 'sub') ?? getMetadataString(identityData, 'sub');
  return Boolean(sub && sub.includes('google'));
};

const resolveAvatarUrl = (
  metadata: Record<string, unknown>,
  rawMetadata: Record<string, unknown>,
  identityData: Record<string, unknown>
): string | null => {
  const avatarKeys = ['avatar_url', 'picture', 'photo'];
  return (
    getFirstStringByKeys(metadata, avatarKeys) ??
    getFirstStringByKeys(rawMetadata, avatarKeys) ??
    getFirstStringByKeys(identityData, avatarKeys)
  );
};

const resolveDisplayName = (
  metadata: Record<string, unknown>,
  rawMetadata: Record<string, unknown>,
  identityData: Record<string, unknown>
): string | null => {
  return (
    getFirstStringByKeys(metadata, ['full_name', 'name', 'display_name']) ??
    getFirstStringByKeys(rawMetadata, ['full_name', 'name', 'display_name']) ??
    getFirstStringByKeys(identityData, ['full_name', 'name'])
  );
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
  const identityData = getFirstIdentityData(user);
  const rawMetadata = getSafeMetadata(
    (user as unknown as { raw_user_meta_data?: unknown }).raw_user_meta_data
  );

  const provider =
    getMetadataString(appMetadata, 'provider') ?? getMetadataString(metadata, 'provider');

  const isGoogle = isGoogleSession(provider, metadata, identityData);
  const avatarUrl = resolveAvatarUrl(metadata, rawMetadata, identityData);
  const displayName = resolveDisplayName(metadata, rawMetadata, identityData);

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
