import '@testing-library/jest-dom';
import React from 'react';
import { vi } from 'vitest';

const toastMock = Object.assign(vi.fn(), {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
});

vi.mock('@/components/ui/sonner', () => ({
  Toaster: () => React.createElement('div'),
  toast: toastMock,
}));
