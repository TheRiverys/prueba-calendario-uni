import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SemesterProvider, useSemesterContext } from '@/contexts/semester/SemesterContext';

import type { User } from '@supabase/supabase-js';

interface SupabaseSemesterMock {
  semesterStart: string;
  updateSemesterStart: ReturnType<typeof vi.fn>;
}

const supabaseSemesterMock: SupabaseSemesterMock = {
  semesterStart: '2025-02-01',
  updateSemesterStart: vi.fn(),
};

vi.mock('@/hooks/supabase/useSupabaseSemesterStart', () => ({
  useSupabaseSemesterStart: () => supabaseSemesterMock,
}));

const createWrapper = (user: User | null) => {
  const Wrapper: React.FC<{ readonly children: React.ReactNode }> = ({ children }) => {
    return <SemesterProvider user={user}>{children}</SemesterProvider>;
  };
  return Wrapper;
};

describe('SemesterProvider', () => {
  beforeEach(() => {
    localStorage.removeItem('semester-start-date');
    supabaseSemesterMock.semesterStart = '2025-02-01';
    supabaseSemesterMock.updateSemesterStart = vi.fn();
  });

  it('usa la fecha local de inicio cuando no hay usuario', () => {
    // Arrange
    localStorage.setItem('semester-start-date', '2025-01-15');
    const { result } = renderHook(() => useSemesterContext(), {
      wrapper: createWrapper(null),
    });

    // Act
    act(() => {
      result.current.setSemesterStart('2025-02-20');
    });

    // Assert
    expect(result.current.semesterStart).toBe('2025-02-20');

    // Assert Again
    expect(result.current.semesterStartVersion).toBe(1);
    expect(supabaseSemesterMock.updateSemesterStart).not.toHaveBeenCalled();
  });

  it('prefiere la fecha remota cuando el usuario esta autenticado', async () => {
    // Arrange
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('semester-start-date', today);
    supabaseSemesterMock.semesterStart = '2025-03-01';

    const mockUser = { id: 'user-2', email: 'user@example.com' } as unknown as User;
    const { result } = renderHook(() => useSemesterContext(), {
      wrapper: createWrapper(mockUser),
    });

    // Act
    act(() => {
      result.current.setSemesterStart('2025-03-20');
    });

    // Assert
    expect(result.current.semesterStart).toBe('2025-03-20');

    // Assert Again
    await waitFor(() =>
      expect(supabaseSemesterMock.updateSemesterStart).toHaveBeenCalledWith('2025-03-20')
    );
    expect(result.current.semesterStartVersion).toBeGreaterThan(0);
  });
});
