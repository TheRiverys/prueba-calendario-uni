import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ConfigProvider, useConfigContext } from '@/contexts/config/ConfigContext';
import type { ConfigSettings } from '@/types';

import type { User } from '@supabase/supabase-js';

interface SupabaseConfigMock {
  config: ConfigSettings | null;
  updateConfig: ReturnType<typeof vi.fn>;
  resetConfig: ReturnType<typeof vi.fn>;
  loading: boolean;
  error: string | null;
  refetch: ReturnType<typeof vi.fn>;
}

const supabaseConfigMock: SupabaseConfigMock = {
  config: null,
  updateConfig: vi.fn(),
  resetConfig: vi.fn(),
  loading: false,
  error: null,
  refetch: vi.fn(),
};

vi.mock('@/hooks/supabase/useSupabaseConfig', () => ({
  useSupabaseConfig: () => supabaseConfigMock,
}));

const createWrapper = (user: User | null) => {
  const Wrapper: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => {
    return <ConfigProvider user={user}>{children}</ConfigProvider>;
  };
  return Wrapper;
};

describe('ConfigProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    supabaseConfigMock.config = null;
    supabaseConfigMock.updateConfig = vi.fn();
    supabaseConfigMock.resetConfig = vi.fn();
    supabaseConfigMock.refetch = vi.fn();
  });

  it('mantiene la configuracion local cuando el usuario es anonimo', async () => {
    // Arrange
    const { result } = renderHook(() => useConfigContext(), {
      wrapper: createWrapper(null),
    });

    // Act
    await act(async () => {
      result.current.updateConfig({ baseStudyDays: 8 });
    });

    // Assert
    await waitFor(() => expect(result.current.config.baseStudyDays).toBe(8));

    // Assert Again
    expect(supabaseConfigMock.updateConfig).not.toHaveBeenCalled();
  });

  it('usa configuracion remota y sincroniza cambios cuando el usuario esta autenticado', async () => {
    // Arrange
    supabaseConfigMock.config = {
      baseStudyDays: 6,
      minStudyTime: 2,
      priorityVariations: { high: 1, normal: 0, low: -1 },
      openaiApiKey: '',
      allocationWindowDays: 30,
    } satisfies ConfigSettings;

    const mockUser = {
      id: 'user-1',
      email: 'mock@example.com',
    } as unknown as User;

    const { result } = renderHook(() => useConfigContext(), {
      wrapper: createWrapper(mockUser),
    });

    // Act
    await act(async () => {
      result.current.updateConfig({ minStudyTime: 5 });
    });

    // Assert
    expect(result.current.config.baseStudyDays).toBe(6);
    await waitFor(() =>
      expect(supabaseConfigMock.updateConfig).toHaveBeenCalledWith({ minStudyTime: 5 })
    );

    // Assert Again
    await act(async () => {
      result.current.resetConfig();
    });
    await waitFor(() => expect(supabaseConfigMock.resetConfig).toHaveBeenCalled());
  });
});
