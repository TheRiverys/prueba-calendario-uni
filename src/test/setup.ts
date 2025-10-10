import * as matchers from '@testing-library/jest-dom/matchers';
import { cleanup } from '@testing-library/react';
import { expect, afterEach } from 'vitest';

// Extiende expect con los matchers de testing-library
expect.extend(matchers);

// Limpia después de cada test
afterEach(() => {
  cleanup();
});

// Mock de localStorage global
const localStorageMock = {
  getItem: (key: string) => {
    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    return localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    return localStorage.removeItem(key);
  },
  clear: () => {
    return localStorage.clear();
  },
};

// Usa localStorage real si está disponible (en jsdom), sino usa el mock
Object.defineProperty(window, 'localStorage', {
  value: typeof localStorage !== 'undefined' ? localStorage : localStorageMock,
});

// Mock de sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: typeof sessionStorage !== 'undefined' ? sessionStorage : localStorageMock,
});

// Mock básico de ResizeObserver
Object.defineProperty(globalThis, 'ResizeObserver', {
  writable: true,
  value: class ResizeObserver {
    constructor(_cb: (_entries: unknown[], _observer: unknown) => void) {
      // Mock implementation
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  },
});
