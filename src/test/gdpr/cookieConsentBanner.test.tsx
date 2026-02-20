import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CookieConsentBanner } from '@/components/gdpr/CookieConsentBanner';
import { useGdpr } from '@/contexts/gdpr/GdprContext';
import { usePreferencesContext } from '@/contexts/preferences/PreferencesContext';
import { CookieCategory } from '@/services/cookieConsent';

vi.mock('@/contexts/gdpr/GdprContext');
vi.mock('@/contexts/preferences/PreferencesContext');

const useGdprMock = vi.mocked(useGdpr);
const usePreferencesContextMock = vi.mocked(usePreferencesContext);

describe('CookieConsentBanner', () => {
  it('does not allow dismissing without explicit consent action', () => {
    const setCurrentPageMock = vi.fn();

    usePreferencesContextMock.mockReturnValue({
      activeView: 'list',
      setActiveView: vi.fn(),
      currentPage: 'dashboard',
      setCurrentPage: setCurrentPageMock,
      selectedSubject: 'all',
      setSelectedSubject: vi.fn(),
      sortBy: 'algorithm',
      setSortBy: vi.fn(),
      theme: 'light',
      toggleTheme: vi.fn(),
    });

    useGdprMock.mockReturnValue({
      consent: null,
      hasUserResponded: false,
      acceptAll: vi.fn(),
      rejectAll: vi.fn(),
      setCustomConsent: vi.fn(),
      revokeConsent: vi.fn(),
      hasConsent: vi.fn(),
      cookieRegistry: [],
      getCookiesByCategory: vi.fn(() => []),
      showConsentBanner: true,
      setShowConsentBanner: vi.fn(),
    });

    render(<CookieConsentBanner />);

    expect(screen.queryByLabelText('Cerrar sin decidir')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Rechazar no esenciales' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Política de Privacidad' }));
    expect(setCurrentPageMock).toHaveBeenCalledWith('privacy-policy');
  });

  it('does not render when banner is hidden', () => {
    usePreferencesContextMock.mockReturnValue({
      activeView: 'list',
      setActiveView: vi.fn(),
      currentPage: 'dashboard',
      setCurrentPage: vi.fn(),
      selectedSubject: 'all',
      setSelectedSubject: vi.fn(),
      sortBy: 'algorithm',
      setSortBy: vi.fn(),
      theme: 'light',
      toggleTheme: vi.fn(),
    });

    useGdprMock.mockReturnValue({
      consent: {
        [CookieCategory.ESSENTIAL]: true,
        [CookieCategory.ANALYTICS]: false,
        [CookieCategory.FUNCTIONAL]: false,
        timestamp: '2025-01-01T00:00:00.000Z',
        version: '1.0.0',
      },
      hasUserResponded: true,
      acceptAll: vi.fn(),
      rejectAll: vi.fn(),
      setCustomConsent: vi.fn(),
      revokeConsent: vi.fn(),
      hasConsent: vi.fn(),
      cookieRegistry: [],
      getCookiesByCategory: vi.fn(() => []),
      showConsentBanner: false,
      setShowConsentBanner: vi.fn(),
    });

    render(<CookieConsentBanner />);
    expect(screen.queryByText('Gestión de Cookies')).not.toBeInTheDocument();
  });
});
