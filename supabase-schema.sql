-- Extensión necesaria para gen_random_uuid()
create extension if not exists "pgcrypto";

-- Tablas
create table if not exists public.user_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  min_study_time integer not null default 2 check (min_study_time between 1 and 6),
  base_study_days integer not null default 4 check (base_study_days >= 1),
  priority_variations jsonb not null default '{"high":1,"normal":0,"low":-1}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.semester_starts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  semester_start date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  name text not null,
  date date not null,
  priority text not null default 'normal' check (priority in ('low','normal','high')),
  color text not null default '',
  completed boolean not null default false,
  study_start date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================
-- Trigger genérico updated_at
-- =========================
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_user_configs_updated_at
before update on public.user_configs
for each row execute function public.update_updated_at_column();

create trigger trg_semester_starts_updated_at
before update on public.semester_starts
for each row execute function public.update_updated_at_column();

create trigger trg_deliveries_updated_at
before update on public.deliveries
for each row execute function public.update_updated_at_column();

-- =========================
-- RLS
-- =========================
alter table public.user_configs enable row level security;
alter table public.semester_starts enable row level security;
alter table public.deliveries enable row level security;

create policy "Users can only access their own configs"
  on public.user_configs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can only access their own semester starts"
  on public.semester_starts
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can only access their own deliveries"
  on public.deliveries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =========================
-- Datos por defecto al crear usuario
-- =========================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_configs (user_id, min_study_time, base_study_days, priority_variations)
  values (new.id, 2, 4, '{"high":1,"normal":0,"low":-1}'::jsonb)
  on conflict (user_id) do nothing;

  insert into public.semester_starts (user_id, semester_start)
  values (new.id, current_date)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Trigger en tabla gestionada por Supabase Auth
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================
-- Índices recomendados
-- =========================
create index if not exists idx_deliveries_user_date on public.deliveries (user_id, date);
create index if not exists idx_deliveries_completed on public.deliveries (user_id, completed);