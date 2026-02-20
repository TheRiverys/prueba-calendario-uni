-- =====================================================
-- ANALYTICS TABLE (ANALITICAS) - SUPABASE
-- =====================================================
-- Last updated: 2026-02-20
-- This file is a subset of Documentation/Database/database-schema.sql
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

CREATE INDEX IF NOT EXISTS idx_analiticas_user_id ON public.analiticas(user_id);
CREATE INDEX IF NOT EXISTS idx_analiticas_user_id_auth ON public.analiticas(user_id_auth);
CREATE INDEX IF NOT EXISTS idx_analiticas_first_seen_at ON public.analiticas(first_seen_at);
CREATE INDEX IF NOT EXISTS idx_analiticas_last_seen_at ON public.analiticas(last_seen_at);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_analiticas_updated_at ON public.analiticas;
CREATE TRIGGER trg_analiticas_updated_at
  BEFORE UPDATE ON public.analiticas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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
