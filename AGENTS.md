# Repository Guidelines

## Project Structure & File Layout

- `src/main.tsx` mounts `<App />` into `index.html` and keeps the Vite entry
  lean.
- `src/App.tsx` coordinates view state, the CRUD modal, and `localStorage` sync
  for `deliveries`.
- `src/components/` stores `CalendarView.tsx`, `GanttView.tsx`,
  `DeliveryList.tsx`; move shared helpers into `src/utils/` and re-export via
  `src/utils/index.ts`.
- **TODOS los archivos React deben usar extensión `.tsx`** (no `.jsx`)
- New initiatives live in `src/features/<feature>/` with `components/`,
  `hooks/`, `services/`, and a local `index.ts` barrel to standardise imports.

## Build & Development

- `npm install` pulls React, date-fns, lucide-react, and the Tailwind toolchain.
- `npm run dev` serves the app on `http://localhost:3000` with hot-module
  reload.
- `npm run build` outputs an optimised bundle under `dist/`; run it before
  requesting reviews.
- `npm run preview` serves the production bundle to double-check routing and
  assets.

## Technology Baseline

- TODA contribución debe entregarse con **React + TypeScript + Tailwind CSS 4**;
  migra componentes `.jsx` a `.tsx` en cuanto los toques y documenta cualquier
  excepción.
- Documenta decisiones de Tailwind CSS 4 (tokens, capas, presets) en cada
  feature para asegurar consistencia.
- Keep `tsconfig.json` aligned with `strict` mode and leverage Vite's type-check
  integrations.

## Coding Standards & Principles

- Use 2-space indentation, single quotes, and trailing semicolons; align your
  formatter/linter with these defaults.
- Files and components use PascalCase, hooks and utilities use camelCase, and
  shared constants use SCREAMING_SNAKE_CASE.
- Enforce SOLID strictly: single-responsibility components, dependency inversion
  via props/context, explicit prop contracts, and open/closed extensions through
  composition.
- Keep business logic pure and testable inside helpers or services; contain side
  effects (storage, events) inside specialised hooks.
- NUNCA utilices el tipo `any`; tipa cada prop, estado y retorno con interfaces
  o tipos explícitos, y comparte los contratos de dominio (p.ej. `Delivery`,
  `StudyPeriod`) desde `src/types/`.

## Code Quality & Formatting Tools

### ESLint Configuration

- **Configuración estricta habilitada**: Ejecuta `npm run lint` antes de cada commit
- **Errores críticos**: `no-console`, `no-debugger`, `no-unused-vars`, `react-hooks/exhaustive-deps`
- **Reglas personalizadas**:
  - Máximo 100 líneas por función (arrow functions)
  - Complejidad máxima de 15 por función
  - Límites de líneas por archivo (500 líneas máximo)
- **Auto-fix disponible**: Usa `npm run lint:fix` para correcciones automáticas
- **Pre-commit hooks**: Configurados con Husky para ejecutar linting automático

### Prettier Configuration

- **Formateo automático**: Integrado con ESLint en `npm run lint:fix`
- **Reglas estándar**:
  - Comillas simples obligatorias
  - Punto y coma obligatorio
  - Indentación de 2 espacios
  - Líneas máximas de 120 caracteres (más apropiado para código moderno)
  - Saltos de línea en operadores TSX complejos
- **Pre-commit integration**: Ejecuta automáticamente antes de cada commit
- **Editor integration**: Configura tu editor para formateo en guardado

### Tailwind CSS 4 Standards

- **Arquitectura recomendada**:
  ```css
  /* src/index.css */
  @import "tailwindcss";
  @layer base, components, utilities;
  ```
- **Tokens personalizados** en cada feature:
  ```css
  /* Documentar colores, espaciado y tipografía específicos */
  @layer components {
    .custom-card {
      @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm;
    }
  }
  ```
- **Responsive design primero**: Usa clases móviles primero (`sm:`, `md:`, `lg:`)
- **Colores semánticos**: Define colores por propósito, no por apariencia
- **Consistencia visual**: Documenta decisiones de diseño en cada componente

### Development Workflow

1. **Antes de desarrollar**:
   ```bash
   npm run lint  # Verificar estado actual
   npm run lint:fix  # Corregir problemas automáticos
   ```

2. **Durante desarrollo**:
   - Formateo automático en guardado (editor config)
   - Linting en tiempo real (ESLint extensión)
   - Preview de cambios con `npm run dev`

3. **Antes de commit**:
   ```bash
   npm run lint        # Verificar todos los problemas
   npm run lint:fix    # Corregir lo posible automáticamente
   npm run build       # Verificar que el build funciona
   ```

4. **Pre-commit automático**:
   - ESLint y Prettier se ejecutan automáticamente
   - Los commits son rechazados si hay problemas críticos
   - Solo se permiten commits con código formateado correctamente

## Testing Practices

- When tests arrive, place Vitest + React Testing Library suites in
  `src/__tests__/` or beside components as `Component.test.tsx`.
- Until then, record manual QA in each PR: CRUD flows, timeline calculations,
  calendar rendering, and persistence after reloads.
- Provide reproduction steps, screenshots, or console traces whenever you fix a
  regression.

## Performance & Code Splitting

- Split bundles by view: keep `CalendarView`, `GanttView`, `DeliveryList` in
  dedicated modules and optionally re-export them through
  `src/components/index.ts`.
- Use dynamic `import()` for heavy admin panels or analytics pages; lazy loading
  is optional now but prepare modules for future chunking.
- Centralise shared stores and helpers in `src/utils/` to avoid duplicating
  logic across chunks.

## Workflow & Reviews

- Write present-tense, focused commits such as `feat: add priority filter` and
  keep diffs scoped.
- Each PR should include a short summary, screenshots or GIFs for UI work, the
  latest `npm run build` result, and links to related issues.
- Before asking for review, ensure copy remains in Spanish where expected and
  colour/tag conventions stay consistent across views.
