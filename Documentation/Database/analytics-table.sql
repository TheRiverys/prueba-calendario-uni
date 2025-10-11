-- ================================================
-- TABLA: ANALITICAS
-- ================================================
-- Esta tabla almacena el conteo de usuarios únicos
-- que acceden a la aplicación en cualquier entorno.
--
-- Columnas de identificación y datos básicos:
--   - id: Identificador único del registro de analítica
--   - user_id: ID único generado localmente para rastreo anónimo
--   - user_id_auth: Referencia al usuario registrado en auth.users (opcional)
--
-- Columnas de seguimiento temporal:
--   - first_seen_at: Timestamp de la primera visita del usuario único
--   - last_seen_at: Timestamp de la última visita del usuario único
--   - access_count: Número total de accesos del usuario único
--
-- Metadatos:
--   - created_at: Fecha de creación del registro
--   - updated_at: Fecha de última actualización
--
-- Características especiales:
--   - Permite rastreo anónimo hasta que el usuario se registra
--   - Asocia automáticamente datos históricos al registrarse
--   - Funciona en cualquier entorno (localhost, producción)
-- ================================================

-- Crear tabla para analíticas de usuarios únicos
CREATE TABLE IF NOT EXISTS public.analiticas (
  -- Identificador único del registro de analítica
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- ID único generado localmente para rastreo anónimo de usuarios
  -- No está relacionado con auth.users hasta que el usuario se registra
  user_id TEXT NOT NULL,

  -- ID del usuario registrado en auth.users (opcional)
  -- Se asocia automáticamente cuando un usuario anónimo se registra
  -- NULL para usuarios que nunca se han registrado
  user_id_auth UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Timestamp de la primera visita del usuario único identificado por user_id
  -- Marca el momento en que se detectó por primera vez este usuario
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Timestamp de la última visita del usuario único identificado por user_id
  -- Se actualiza cada vez que el usuario accede a la aplicación
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Número total de accesos del usuario único identificado por user_id
  -- Se incrementa en cada visita y se usa para calcular métricas de uso
  access_count INTEGER NOT NULL DEFAULT 1,

  -- Fecha de creación del registro de analítica
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Fecha de última actualización del registro
  -- Se actualiza automáticamente por el trigger trg_analiticas_updated_at
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Timestamp del consentimiento de cookies (GDPR)
  -- Se registra cuando el usuario da consentimiento para cookies de analítica
  -- NULL si el usuario no ha dado consentimiento o es anterior a la implementación GDPR
  consent_timestamp TIMESTAMPTZ DEFAULT NULL,

  -- Versión de la política de privacidad aceptada
  -- Permite rastrear qué versión de la política aceptó el usuario
  -- Útil cuando la política se actualiza y necesitas re-obtener consentimiento
  consent_policy_version TEXT DEFAULT NULL,

  -- Restricción de unicidad para evitar duplicados del mismo user_id
  UNIQUE(user_id)
);

-- ================================================
-- TRIGGER AUTOMÁTICO PARA UPDATED_AT
-- ================================================

-- Función genérica para actualizar automáticamente la columna updated_at
-- Se ejecuta antes de cada UPDATE en la tabla analiticas
CREATE OR REPLACE FUNCTION public.update_analiticas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger que ejecuta la función anterior antes de cada UPDATE
CREATE TRIGGER trg_analiticas_updated_at
  BEFORE UPDATE ON public.analiticas
  FOR EACH ROW EXECUTE FUNCTION public.update_analiticas_updated_at();

-- ================================================
-- RLS (Row Level Security) - Deshabilitado para analíticas
-- ================================================
-- Las analíticas son datos agregados y no sensibles,
-- por lo que no necesitamos RLS en esta tabla

-- ================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ================================================
CREATE INDEX IF NOT EXISTS idx_analiticas_user_id ON public.analiticas (user_id);
CREATE INDEX IF NOT EXISTS idx_analiticas_first_seen_at ON public.analiticas (first_seen_at);
CREATE INDEX IF NOT EXISTS idx_analiticas_last_seen_at ON public.analiticas (last_seen_at);

-- ================================================
-- FUNCIONES PARA GESTIÓN DE ANALÍTICAS
-- ================================================

-- ================================================
-- FUNCIÓN: UPSERT_USER_ANALYTICS
-- ================================================
-- Inserta o actualiza un registro de usuario único en la tabla analiticas
--
-- Parámetros:
--   - p_user_id: ID único generado localmente para el usuario
--   - p_user_id_auth: ID del usuario registrado (opcional, puede ser NULL)
--   - p_consent_timestamp: Timestamp del consentimiento GDPR (opcional)
--   - p_consent_version: Versión de la política aceptada (opcional)
--
-- Funcionamiento:
--   - Si el user_id no existe: crea nuevo registro con access_count = 1
--   - Si el user_id existe: incrementa access_count y actualiza last_seen_at
--   - Si se proporciona p_user_id_auth, asocia el registro con el usuario registrado
--   - Mantiene el user_id_auth existente si ya estaba asociado
--   - Registra el consentimiento GDPR si se proporciona
--
-- Retorna el ID del registro creado o actualizado
CREATE OR REPLACE FUNCTION public.upsert_user_analytics(
  p_user_id TEXT,
  p_user_id_auth UUID DEFAULT NULL,
  p_consent_timestamp TIMESTAMPTZ DEFAULT NULL,
  p_consent_version TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  analytics_id UUID;
BEGIN
  -- Intentar insertar nuevo registro o actualizar existente
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
    user_id_auth = COALESCE(p_user_id_auth, public.analiticas.user_id_auth), -- Mantener user_id_auth si ya existe
    last_seen_at = NOW(),
    access_count = public.analiticas.access_count + 1,
    updated_at = NOW(),
    -- Actualizar consentimiento solo si se proporciona un nuevo timestamp
    consent_timestamp = COALESCE(p_consent_timestamp, public.analiticas.consent_timestamp),
    consent_policy_version = COALESCE(p_consent_version, public.analiticas.consent_policy_version)
  RETURNING id INTO analytics_id;

  RETURN analytics_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- FUNCIÓN: GET_ANALYTICS_STATS
-- ================================================
-- Obtiene estadísticas agregadas de usuarios únicos de la tabla analiticas
--
-- Retorna una tabla con métricas generales:
--   - total_unique_users: Número total de usuarios únicos identificados
--   - total_access_count: Número total de accesos registrados
--   - avg_access_per_user: Promedio de accesos por usuario (redondeado a 2 decimales)
--   - first_access_ever: Timestamp del primer acceso registrado en la tabla
--   - last_access_ever: Timestamp del último acceso registrado en la tabla
--
-- Esta función es útil para dashboards internos y análisis de uso de la aplicación
CREATE OR REPLACE FUNCTION public.get_analytics_stats()
RETURNS TABLE (
  total_unique_users BIGINT,
  total_access_count BIGINT,
  avg_access_per_user NUMERIC,
  first_access_ever TIMESTAMPTZ,
  last_access_ever TIMESTAMPTZ
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- FUNCIÓN: ASSOCIATE_ANONYMOUS_ANALYTICS
-- ================================================
-- Asocia las estadísticas de un usuario anónimo con un usuario registrado
-- Esta función se ejecuta automáticamente cuando un usuario se registra exitosamente
--
-- Parámetros:
--   - p_anonymous_user_id: ID único generado localmente del usuario anónimo
--   - p_registered_user_id: ID real del usuario registrado en auth.users
--
-- Funcionamiento:
--   - Busca todos los registros con el p_anonymous_user_id que no tengan user_id_auth asociado
--   - Asocia estos registros con el usuario registrado (establece user_id_auth)
--   - Retorna el número de registros que fueron actualizados
--
-- Esto permite preservar el historial de uso anónimo cuando el usuario se registra
CREATE OR REPLACE FUNCTION public.associate_anonymous_analytics(
  p_anonymous_user_id TEXT,
  p_registered_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Actualizar todos los registros anónimos del usuario con el ID registrado
  -- Solo actualiza registros que no tienen user_id_auth asociado (para evitar sobrescribir)
  UPDATE public.analiticas
  SET user_id_auth = p_registered_user_id
  WHERE user_id = p_anonymous_user_id AND user_id_auth IS NULL;

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- COMENTARIOS DE USO
-- ================================================

/*
========================================================================
INSTRUCCIONES DE USO Y FUNCIONAMIENTO DEL SISTEMA DE ANALÍTICAS
========================================================================

DESCRIPCIÓN GENERAL:
-------------------
Este sistema permite rastrear usuarios únicos en cualquier entorno (localhost,
producción) y asociar automáticamente las estadísticas históricas cuando
un usuario anónimo se registra.

FLUJOS DE USO:
--------------

1. REGISTRO AUTOMÁTICO DE ACCESOS:
   - Se ejecuta automáticamente al cargar la aplicación
   - Genera o recupera un ID único por usuario (localStorage)
   - Registra cada acceso con timestamp y contador

2. ASOCIACIÓN AUTOMÁTICA AL REGISTRO:
   - Cuando un usuario se registra exitosamente
   - Se asocian todos sus datos históricos anónimos
   - Se mantiene la continuidad del historial de uso

3. CONSULTA DE ESTADÍSTICAS:
   - Para dashboards internos y análisis de uso
   - Métricas agregadas de toda la aplicación

EJEMPLOS DE USO EN EL CÓDIGO:
-----------------------------

// Registro automático (se ejecuta en App.tsx al iniciar)
const userId = getOrCreateAnalyticsUserId();
await supabase.rpc('upsert_user_analytics', {
  p_user_id: userId,
  p_user_id_auth: user?.id || null // null si no está autenticado
});

// Asociación automática (se ejecuta en AuthContext al registrarse)
await supabase.rpc('associate_anonymous_analytics', {
  p_anonymous_user_id: anonymousId,
  p_registered_user_id: user.id
});

// Consulta de estadísticas (opcional, para administración)
const { data: stats } = await supabase.rpc('get_analytics_stats');

CONSIDERACIONES TÉCNICAS:
------------------------
- ✅ Funciona sin autenticación (usuarios anónimos)
- ✅ Compatible con cualquier entorno (localhost, producción)
- ✅ Preserva privacidad hasta el registro
- ✅ Mantiene historial completo al registrarse
- ✅ No bloquea la aplicación si hay errores
- ✅ Datos completamente anónimos hasta asociación

LIMPIEZA Y MANTENIMIENTO:
------------------------
-- Para desarrollo (limpiar datos antiguos):
DELETE FROM public.analiticas WHERE first_seen_at < NOW() - INTERVAL '30 days';

-- Para limpiar datos de prueba específicos:
DELETE FROM public.analiticas WHERE user_id_auth IS NULL;

SEGURIDAD Y PRIVACIDAD:
-----------------------
- Datos anónimos hasta que el usuario se registra
- No se almacenan datos personales identificables
- Asociación solo ocurre con consentimiento implícito (registro)
- Cumple con estándares de privacidad modernos

========================================================================
*/
