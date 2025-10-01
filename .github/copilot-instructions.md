# Copilot Instructions for University Calendar App

## Project Architecture

This is a **React + TypeScript + Vite** university delivery calendar app with **dual storage** (localStorage + Supabase) and **AI-powered study scheduling**. Core architecture centers around a monolithic `AppContext.tsx` that orchestrates 10+ custom hooks.

### Central State Management
- **`src/contexts/AppContext.tsx`**: Single context provider handling auth, data, AI features, and modal state
- **Storage Strategy**: Dual-mode with automatic switching - localStorage for anonymous users, Supabase for authenticated users
- **Key Pattern**: All CRUD operations have paired hooks (`useDeliveries` + `useSupabaseDeliveries`) with AppContext choosing based on auth state

### Critical Data Flow
```
deliveries → studySchedule (algorithm) → AI overrides → fullSchedule → filtered views
```
- Base algorithm in `useStudySchedule` calculates optimal study periods
- AI can override with custom date ranges via `aiOverrides` Map
- All views consume the final `fullSchedule` from AppContext

## Development Workflow

### Essential Commands
```bash
npm run dev          # Vite dev server on :3000 with HMR
npm run build        # Production build (required before PRs)
npm run preview      # Test production bundle
npm run lint         # TypeScript type check
```

### Environment Setup
- Copy `.env.example` → `.env.local` for Supabase config
- Required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- OpenAI API key stored in localStorage (not env)

## Coding Conventions

### Type System (Strict)
- **Never use `any`** - all interfaces in `src/types/index.ts`
- Core types: `Delivery`, `StudySchedule`, `ConfigSettings`, `AiScheduleResult`
- Database row types: `DeliveryRow`, `UserConfigRow`, etc. map to Supabase schema
- Always type in hooks, components, and context in a `src/types`. And, if is it necessary, create new types there.

### File Organization
- **Views**: `src/components/views/CalendarView.tsx`, `GanttView.tsx`, `DeliveryList.tsx`
- **Features**: Use `src/features/<name>/` with `components/`, `services/`, `hooks/`
- **Shared**: `src/hooks/` for business logic, `src/utils/` for helpers
- **UI**: Radix components in `src/components/ui/`

### Spanish Language Context
- **All user-facing text in Spanish** - comments and variables can be English
- Form validation, error messages, and UI copy must use Spanish
- Date formatting uses `date-fns/locale/es`
- Always respond using Spanish in AI chat.
- Always use Better Comments for comments in the code, like this:
  - `// ! Important`
  - `// ? Question`
  - `// * Highlight`
  - `// TODO:`
  - `// FIXME:`

## Key Integration Patterns

### Supabase Integration
- Client in `src/lib/supabase.ts` with auth persistence
- Row Level Security (RLS) - all tables filter by `user_id`
- Hook pattern: local hook + Supabase hook + AppContext orchestration
- Schema: `deliveries`, `user_configs`, `semester_starts` tables

### AI Features (OpenAI)
- `src/hooks/useAI.ts` + `src/services/ai.ts` for study plan generation
- Uses `@ai-sdk/openai` with structured outputs
- AI overrides stored as `Map<DeliveryId, AiScheduleOverride>` in AppContext
- Pattern: generate plan → apply overrides → merge with base schedule

### Custom Hooks Architecture
Each hook handles one concern:
- `useDeliveries` → localStorage CRUD
- `useSupabaseDeliveries` → remote CRUD  
- `useStudySchedule` → algorithmic computation
- `useAI` → OpenAI integration
- `useAuth` → Supabase auth

## Component Patterns

### View Components
All main views (`CalendarView`, `GanttView`, `DeliveryList`) follow same props pattern:
```tsx
interface ViewProps {
  schedule: StudySchedule[];
  onEdit: (delivery: StudySchedule) => void;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}
```

### Modal System
- Single modal state in AppContext with `modalOpen`, `editingDelivery`, `formData`
- Form data normalized through `handleInputChange` in AppContext
- Pattern: `openModal(delivery?)` → edit or create mode

### Styling Framework
- **Tailwind CSS 4** with custom design tokens
- Dark/light theme with CSS classes on `document.documentElement`
- Color system: `chart-1` through `chart-5` for subject colors
- Component styling: Radix primitives + custom Tailwind classes
- Never use emojis for UI elements or console logs
- Use always color and layout patterns for consistency

## Performance & State Patterns

### Computation Triggers
- `semesterStartTrigger` and `deliveriesTrigger` counters force algorithm recalculation
- `useMemo` for expensive computations (schedule filtering, stats)
- Debounced localStorage writes in custom hooks

### Data Sync Strategy
- **Optimistic updates**: Immediate local state changes
- **Background sync**: Async Supabase calls with error handling
- **Conflict resolution**: Remote data takes precedence on auth state change