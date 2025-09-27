# Repository Guidelines

## Project Structure & File Layout
- `src/main.jsx` mounts `<App />` into `index.html` and keeps the Vite entry lean.
- `src/App.jsx` coordinates view state, the CRUD modal, and `localStorage` sync for `deliveries`.
- `src/components/` stores `CalendarView.jsx`, `GanttView.jsx`, `DeliveryList.jsx`; move shared helpers into `src/utils/` and re-export via `src/utils/index.js`.
- New initiatives live in `src/features/<feature>/` with `components/`, `hooks/`, `services/`, and a local `index.js` barrel to standardise imports.

## Build & Development
- `npm install` pulls React, date-fns, lucide-react, and the Tailwind toolchain.
- `npm run dev` serves the app on `http://localhost:3000` with hot-module reload.
- `npm run build` outputs an optimised bundle under `dist/`; run it before requesting reviews.
- `npm run preview` serves the production bundle to double-check routing and assets.

## Technology Baseline
- TODA contribución debe entregarse con **React + TypeScript + Tailwind CSS 4**; migra componentes `.jsx` a `.tsx` en cuanto los toques y documenta cualquier excepción.
- Documenta decisiones de Tailwind CSS 4 (tokens, capas, presets) en cada feature para asegurar consistencia.
- Keep `tsconfig.json` aligned with `strict` mode and leverage Vite's type-check integrations.

## Coding Standards & Principles
- Use 2-space indentation, single quotes, and trailing semicolons; align your formatter/linter with these defaults.
- Files and components use PascalCase, hooks and utilities use camelCase, and shared constants use SCREAMING_SNAKE_CASE.
- Enforce SOLID strictly: single-responsibility components, dependency inversion via props/context, explicit prop contracts, and open/closed extensions through composition.
- Keep business logic pure and testable inside helpers or services; contain side effects (storage, events) inside specialised hooks.
- NUNCA utilices el tipo `any`; tipa cada prop, estado y retorno con interfaces o tipos explícitos, y comparte los contratos de dominio (p.ej. `Delivery`, `StudyPeriod`) desde `src/types/`.

## Testing Practices
- When tests arrive, place Vitest + React Testing Library suites in `src/__tests__/` or beside components as `Component.test.tsx`.
- Until then, record manual QA in each PR: CRUD flows, timeline calculations, calendar rendering, and persistence after reloads.
- Provide reproduction steps, screenshots, or console traces whenever you fix a regression.

## Performance & Code Splitting
- Split bundles by view: keep `CalendarView`, `GanttView`, `DeliveryList` in dedicated modules and optionally re-export them through `src/components/index.js`.
- Use dynamic `import()` for heavy admin panels or analytics pages; lazy loading is optional now but prepare modules for future chunking.
- Centralise shared stores and helpers in `src/utils/` to avoid duplicating logic across chunks.

## Workflow & Reviews
- Write present-tense, focused commits such as `feat: add priority filter` and keep diffs scoped.
- Each PR should include a short summary, screenshots or GIFs for UI work, the latest `npm run build` result, and links to related issues.
- Before asking for review, ensure copy remains in Spanish where expected and colour/tag conventions stay consistent across views.
