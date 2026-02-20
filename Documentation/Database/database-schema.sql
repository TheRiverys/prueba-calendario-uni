-- =====================================================
-- SUPABASE SCHEMA - CALENDARIO ENTREGAS UNI
-- =====================================================
-- Last updated: 2026-02-20
-- Target: PostgreSQL (Supabase)
-- This file is the canonical schema used by the app.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  min_study_time INTEGER NOT NULL DEFAULT 2 CHECK (min_study_time BETWEEN 1 AND 6),
  base_study_days INTEGER NOT NULL DEFAULT 4 CHECK (base_study_days >= 1),
  priority_variations JSONB NOT NULL DEFAULT '{"high":1,"normal":0,"low":-1}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.semester_starts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  semester_start DATE NOT NULL,
  new_date_start DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  color TEXT NOT NULL DEFAULT '',
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  completed_manually BOOLEAN,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('sugerencia', 'error', 'comentario')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  email TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.analiticas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  user_id_auth UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  access_count INTEGER NOT NULL DEFAULT 1,
  consent_timestamp TIMESTAMPTZ DEFAULT NULL,
  consent_policy_version TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_configs_user_id ON public.user_configs(user_id);

CREATE INDEX IF NOT EXISTS idx_semester_starts_user_id ON public.semester_starts(user_id);

CREATE INDEX IF NOT EXISTS idx_deliveries_user_id ON public.deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_date ON public.deliveries(date);
CREATE INDEX IF NOT EXISTS idx_deliveries_completed ON public.deliveries(completed);
CREATE INDEX IF NOT EXISTS idx_deliveries_user_completed ON public.deliveries(user_id, completed);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON public.feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analiticas_user_id ON public.analiticas(user_id);
CREATE INDEX IF NOT EXISTS idx_analiticas_user_id_auth ON public.analiticas(user_id_auth);
CREATE INDEX IF NOT EXISTS idx_analiticas_first_seen_at ON public.analiticas(first_seen_at);
CREATE INDEX IF NOT EXISTS idx_analiticas_last_seen_at ON public.analiticas(last_seen_at);

-- =====================================================
-- UPDATED_AT TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_configs_updated_at ON public.user_configs;
CREATE TRIGGER trg_user_configs_updated_at
  BEFORE UPDATE ON public.user_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_semester_starts_updated_at ON public.semester_starts;
CREATE TRIGGER trg_semester_starts_updated_at
  BEFORE UPDATE ON public.semester_starts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_deliveries_updated_at ON public.deliveries;
CREATE TRIGGER trg_deliveries_updated_at
  BEFORE UPDATE ON public.deliveries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_feedback_updated_at ON public.feedback;
CREATE TRIGGER trg_feedback_updated_at
  BEFORE UPDATE ON public.feedback
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_analiticas_updated_at ON public.analiticas;
CREATE TRIGGER trg_analiticas_updated_at
  BEFORE UPDATE ON public.analiticas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- RLS (ROW LEVEL SECURITY)
-- =====================================================

ALTER TABLE public.user_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semester_starts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own configs" ON public.user_configs;
CREATE POLICY "Users can manage their own configs"
  ON public.user_configs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own semester starts" ON public.semester_starts;
CREATE POLICY "Users can manage their own semester starts"
  ON public.semester_starts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own deliveries" ON public.deliveries;
CREATE POLICY "Users can manage their own deliveries"
  ON public.deliveries
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own feedback" ON public.feedback;
CREATE POLICY "Users can view their own feedback"
  ON public.feedback
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert feedback" ON public.feedback;
CREATE POLICY "Users can insert feedback"
  ON public.feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own feedback" ON public.feedback;
CREATE POLICY "Users can update their own feedback"
  ON public.feedback
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own feedback" ON public.feedback;
CREATE POLICY "Users can delete their own feedback"
  ON public.feedback
  FOR DELETE
  USING (auth.uid() = user_id);

-- Note: analiticas has no RLS (analytics are aggregated and accessed via RPC).

-- =====================================================
-- FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_configs (
    user_id,
    min_study_time,
    base_study_days,
    priority_variations
  )
  VALUES (
    NEW.id,
    2,
    4,
    '{"high":1,"normal":0,"low":-1}'::jsonb
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.semester_starts (user_id, semester_start)
  VALUES (NEW.id, CURRENT_DATE)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_user_data(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF p_user_id IS NULL OR p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  DELETE FROM public.analiticas WHERE user_id_auth = p_user_id;
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_user_analytics(
  p_user_id TEXT,
  p_user_id_auth UUID DEFAULT NULL,
  p_consent_timestamp TIMESTAMPTZ DEFAULT NULL,
  p_consent_version TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  analytics_id UUID;
BEGIN
  INSERT INTO public.analiticas (
    user_id,
    user_id_auth,
    first_seen_at,
    last_seen_at,
    access_count,
    consent_timestamp,
    consent_policy_version
  )
  VALUES (
    p_user_id,
    p_user_id_auth,
    NOW(),
    NOW(),
    1,
    p_consent_timestamp,
    p_consent_version
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    user_id_auth = COALESCE(p_user_id_auth, public.analiticas.user_id_auth),
    last_seen_at = NOW(),
    access_count = public.analiticas.access_count + 1,
    updated_at = NOW(),
    consent_timestamp = COALESCE(p_consent_timestamp, public.analiticas.consent_timestamp),
    consent_policy_version = COALESCE(p_consent_version, public.analiticas.consent_policy_version)
  RETURNING id INTO analytics_id;

  RETURN analytics_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_analytics_stats()
RETURNS TABLE (
  total_unique_users BIGINT,
  total_access_count BIGINT,
  avg_access_per_user NUMERIC,
  first_access_ever TIMESTAMPTZ,
  last_access_ever TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) as total_unique_users,
    SUM(access_count) as total_access_count,
    ROUND(AVG(access_count::NUMERIC), 2) as avg_access_per_user,
    MIN(first_seen_at) as first_access_ever,
    MAX(last_seen_at) as last_access_ever
  FROM public.analiticas;
END;
$$;

CREATE OR REPLACE FUNCTION public.associate_anonymous_analytics(
  p_anonymous_user_id TEXT,
  p_registered_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE public.analiticas
  SET user_id_auth = p_registered_user_id
  WHERE user_id = p_anonymous_user_id AND user_id_auth IS NULL;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.insert_feedback(
  p_type TEXT,
  p_title TEXT,
  p_description TEXT,
  p_email TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  feedback_id UUID;
BEGIN
  INSERT INTO public.feedback (user_id, type, title, description, email)
  VALUES (auth.uid(), p_type, p_title, p_description, p_email)
  RETURNING id INTO feedback_id;

  RETURN feedback_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_feedback()
RETURNS TABLE (
  id UUID,
  type TEXT,
  title TEXT,
  description TEXT,
  email TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    f.id,
    f.type,
    f.title,
    f.description,
    f.email,
    f.status,
    f.created_at,
    f.updated_at
  FROM public.feedback f
  WHERE f.user_id = auth.uid()
  ORDER BY f.created_at DESC;
END;
$$;

-- =====================================================
-- END OF SCHEMA
-- =====================================================
