import { describe, expect, it } from 'vitest';

import { cookieConsentService, CookieCategory } from './cookieConsent';

const setConsentCookie = (payload: unknown) => {
  document.cookie = `cookie_consent=${encodeURIComponent(JSON.stringify(payload))}; path=/`;
};

const clearConsentCookie = () => {
  document.cookie = 'cookie_consent=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
};

describe('cookieConsentService', () => {
  it('invalidates consent when policy version is outdated', () => {
    clearConsentCookie();
    setConsentCookie({
      essential: true,
      analytics: true,
      functional: true,
      timestamp: '2025-01-01T00:00:00.000Z',
      version: '0.9.0',
    });

    expect(cookieConsentService.hasUserRespondedToConsent()).toBe(false);
    expect(cookieConsentService.requiresConsentRenewal()).toBe(true);
    expect(cookieConsentService.hasConsent(CookieCategory.ANALYTICS)).toBe(false);
  });
});
