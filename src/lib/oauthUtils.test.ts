import { describe, expect, it } from 'vitest';

import { getOAuthProviderInfo } from './oauthUtils';

import type { User } from '@supabase/supabase-js';

const buildUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 'user-1',
    app_metadata: {},
    aud: 'authenticated',
    confirmation_sent_at: '2024-01-01T00:00:00Z',
    confirmation_token: null,
    confirmed_at: '2024-01-01T00:00:00Z',
    created_at: '2024-01-01T00:00:00Z',
    email: 'usuario@example.com',
    email_confirmed_at: '2024-01-01T00:00:00Z',
    email_change: null,
    email_change_confirm_status: 0,
    email_change_email: null,
    email_change_sent_at: null,
    email_change_token_current: null,
    email_change_token_new: null,
    factor_ids: [],
    identities: [],
    instance_id: 'instance',
    invited_at: null,
    is_anonymous: false,
    last_sign_in_at: '2024-01-01T00:00:00Z',
    phone: '',
    phone_change: '',
    phone_change_sent_at: null,
    phone_change_token: null,
    phone_confirmed_at: null,
    raw_app_meta_data: {},
    raw_user_meta_data: {},
    recovery_sent_at: null,
    rehype_version: null,
    role: 'authenticated',
    updated_at: '2024-01-01T00:00:00Z',
    user_metadata: {},
    ...overrides,
  }) as unknown as User;

describe('getOAuthProviderInfo', () => {
  it('usa avatar desde identities.identity_data cuando user_metadata no lo trae', () => {
    const user = buildUser({
      app_metadata: { provider: 'google' },
      user_metadata: {},
      identities: [
        {
          provider: 'google',
          identity_data: {
            avatar_url: 'https://example.com/google-avatar.png',
            full_name: 'Usuario Google',
          },
        },
      ] as unknown as User['identities'],
    });

    const result = getOAuthProviderInfo(user);

    expect(result.isGoogle).toBe(true);
    expect(result.avatarUrl).toBe('https://example.com/google-avatar.png');
    expect(result.displayName).toBe('Usuario Google');
  });
});
