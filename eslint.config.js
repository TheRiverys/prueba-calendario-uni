import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  // Configuración base recomendada de JavaScript
  js.configs.recommended,

  // Configuración global para entorno del navegador
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Variables globales del navegador
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
        File: 'readonly',
        FileReader: 'readonly',
        TextDecoder: 'readonly',
        URL: 'readonly',
        URLSearchParams: 'readonly',
        HTMLElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLButtonElement: 'readonly',
        HTMLDivElement: 'readonly',
        Event: 'readonly',
        EventTarget: 'readonly',
        Node: 'readonly',
        Element: 'readonly',
        // Variables globales de Vite
        import: 'readonly',
      },
    },
  },

  // Configuración específica para archivos TypeScript/React
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'import': importPlugin,
      'prettier': prettierPlugin,
    },
    rules: {
      // Reglas recomendadas de TypeScript
      ...tseslint.configs.recommended.rules,

      // Reglas recomendadas de React
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,

      // Configuración de Prettier para evitar conflictos
      ...prettierConfig.rules,

      // Reglas específicas del proyecto
      'prettier/prettier': 'error',

      // TypeScript estrictas pero prácticas
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // React moderno (React 18+ con Vite)
      'react/react-in-jsx-scope': 'off', // No necesario con el nuevo JSX Transform
      'react/prop-types': 'off', // Usamos TypeScript para tipos
      'react/no-unused-prop-types': 'warn',
      'react/prefer-read-only-props': 'warn',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'error',

      // Hooks de React
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Calidad general de código
      'no-console': 'warn', // Permitir en desarrollo pero advertir
      'no-debugger': 'error',
      'no-alert': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-useless-escape': 'warn',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'no-duplicate-imports': 'error',

      // Mejores prácticas para React/Vite
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'type',
          ],
          pathGroups: [
            { pattern: '@/**', group: 'internal', position: 'after' },
            { pattern: '@/components/**', group: 'internal', position: 'after' },
            { pattern: '@/hooks/**', group: 'internal', position: 'after' },
            { pattern: '@/contexts/**', group: 'internal', position: 'after' },
            { pattern: '@/lib/**', group: 'internal', position: 'after' },
            { pattern: '@/utils/**', group: 'internal', position: 'after' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always',
        },
      ],

      // Límites de complejidad para mantener código mantenible
      'complexity': ['warn', 15], // !No tocar
      'max-depth': ['warn', 4],
      'max-lines': ['warn', 350],
      'max-lines-per-function': ['warn', 120], // !No tocar
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // Configuración para archivos JavaScript (si los hay)
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        navigator: 'readonly',
        fetch: 'readonly',
      },
    },
    plugins: {
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'prettier': prettierPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...prettierConfig.rules,

      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'warn',
      'no-console': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // Archivos de configuración específicos (Vite, etc.)
  {
    files: ['*.config.{js,ts}', 'vite.config.{js,ts}'],
    languageOptions: {
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        require: 'readonly',
        module: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        Buffer: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off',
    },
  },

  // Ignorar archivos específicos
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.husky/_/**',
      'coverage/**',
      '*.min.js',
      '*.config.js',
      '*.config.ts',
      'eslint.config.js',
    ],
  },
];
