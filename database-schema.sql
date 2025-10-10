-- =====================================================
-- SCHEMA COMPLETO DE BASE DE DATOS - CALENDARIO ENTREGAS UNI
-- =====================================================
-- Este archivo documenta la estructura completa de la base de datos
-- para la aplicación de gestión de entregas universitarias.
--
-- Última actualización: Octubre 2025
-- Base de datos: PostgreSQL (Supabase)
-- =====================================================

-- =====================================================
-- EXTENSIONES
-- =====================================================

-- Extensión para generar UUIDs aleatorios
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

-- -----------------------------------------------------
-- Tabla: user_configs
-- -----------------------------------------------------
-- Almacena la configuración personalizada de cada usuario
-- para el algoritmo de planificación de estudio.
--
-- Columnas:
--   - id: Identificador único de la configuración
--   - user_id: Referencia al usuario en auth.users
--   - min_study_time: Tiempo mínimo de estudio por día (1-6 horas)
--   - base_study_days: Días base de estudio para entregas normales
--   - priority_variations: JSON con variaciones de días según prioridad
--   - allocation_window_days: Ventana de días para asignación de estudio (añadido en v2.0)
--   - openai_api_key: Clave API de OpenAI para funciones de IA (opcional, añadido en v2.5)
--   - created_at: Fecha de creación del registro
--   - updated_at: Fecha de última actualización
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  min_study_time INTEGER NOT NULL DEFAULT 2 CHECK (min_study_time BETWEEN 1 AND 6),
  base_study_days INTEGER NOT NULL DEFAULT 4 CHECK (base_study_days >= 1),
  priority_variations JSONB NOT NULL DEFAULT '{"high":1,"normal":0,"low":-1}',
  allocation_window_days INTEGER NOT NULL DEFAULT 30 CHECK (allocation_window_days >= 7),
  openai_api_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_user_configs_user_id ON public.user_configs(user_id);

-- -----------------------------------------------------
-- Tabla: semester_starts
-- -----------------------------------------------------
-- Almacena la fecha de inicio del semestre de cada usuario
-- y la fecha dinámica de recálculo (cuando se completan tareas).
--
-- Columnas:
--   - id: Identificador único del registro
--   - user_id: Referencia al usuario en auth.users
--   - semester_start: Fecha de inicio del semestre
--   - new_date_start: Fecha dinámica de recálculo (cuando se completa una tarea antes de tiempo)
--                     Se usa como punto de partida para recalcular el schedule de tareas pendientes
--                     NULL significa que no hay recálculo activo, usar semester_start
--   - created_at: Fecha de creación del registro
--   - updated_at: Fecha de última actualización
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.semester_starts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  semester_start DATE NOT NULL,
  new_date_start DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_semester_starts_user_id ON public.semester_starts(user_id);

-- -----------------------------------------------------
-- Tabla: deliveries
-- -----------------------------------------------------
-- Almacena todas las entregas/tareas de los usuarios.
--
-- Columnas de identificación y datos básicos:
--   - id: Identificador único de la entrega
--   - user_id: Referencia al usuario propietario
--   - subject: Asignatura/Materia
--   - name: Nombre descriptivo de la entrega
--   - date: Fecha de entrega/vencimiento
--   - priority: Prioridad de la entrega ('low', 'normal', 'high')
--   - color: Color asignado para visualización (formato CSS)
--
-- Columnas de estado:
--   - completed: Indica si la tarea está completada
--   - completed_at: Timestamp de cuándo se completó (NULL si no está completada)
--   - completed_manually: TRUE si fue completada manualmente por el usuario,
--                         FALSE si se marcó como completada automáticamente (por pasar el deadline)
--                         NULL si no está completada
--
-- Columnas de tracking del algoritmo (añadidas en v3.0):
--   - start_date: Fecha de inicio asignada por el algoritmo de planificación
--   - end_date: Fecha de fin asignada por el algoritmo de planificación
--   Estas fechas permiten:
--     1. Cargar el schedule sin recalcular en cada login/recarga
--     2. Rastrear exactamente qué fechas asignó el algoritmo
--     3. Detectar cuándo es necesario recalcular (cuando faltan fechas o son inválidas)
--
-- Metadatos:
--   - created_at: Fecha de creación del registro
--   - updated_at: Fecha de última actualización
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  color TEXT NOT NULL DEFAULT '',
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  -- Columnas de tracking de estado de completado
  completed_at TIMESTAMPTZ,
  completed_manually BOOLEAN,
  -- Columnas de tracking del algoritmo
  start_date DATE,
  end_date DATE,
  -- Metadatos
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para optimizar búsquedas y filtros comunes
CREATE INDEX IF NOT EXISTS idx_deliveries_user_id ON public.deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_date ON public.deliveries(date);
CREATE INDEX IF NOT EXISTS idx_deliveries_completed ON public.deliveries(completed);
CREATE INDEX IF NOT EXISTS idx_deliveries_user_completed ON public.deliveries(user_id, completed);

-- -----------------------------------------------------
-- Tabla: feedback
-- -----------------------------------------------------
-- Almacena el feedback de los usuarios sobre la aplicación.
--
-- Columnas:
--   - id: Identificador único del feedback
--   - user_id: Referencia al usuario (opcional, puede ser anónimo)
--   - rating: Calificación numérica (1-5 estrellas)
--   - message: Mensaje/comentario del usuario
--   - created_at: Fecha de creación del feedback
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para consultas de feedback
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback(created_at DESC);

-- =====================================================
-- TRIGGERS AUTOMÁTICOS
-- =====================================================

-- -----------------------------------------------------
-- Función: update_updated_at_column
-- -----------------------------------------------------
-- Función genérica para actualizar automáticamente
-- la columna updated_at en todas las tablas.
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers para updated_at en cada tabla
CREATE TRIGGER trg_user_configs_updated_at
  BEFORE UPDATE ON public.user_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_semester_starts_updated_at
  BEFORE UPDATE ON public.semester_starts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_deliveries_updated_at
  BEFORE UPDATE ON public.deliveries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Implementa seguridad a nivel de fila para que cada usuario
-- solo pueda acceder a sus propios datos.
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.user_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semester_starts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- Políticas RLS para user_configs
-- -----------------------------------------------------
CREATE POLICY "Users can only access their own configs"
  ON public.user_configs
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------
-- Políticas RLS para semester_starts
-- -----------------------------------------------------
CREATE POLICY "Users can only access their own semester starts"
  ON public.semester_starts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------
-- Políticas RLS para deliveries
-- -----------------------------------------------------
CREATE POLICY "Users can only access their own deliveries"
  ON public.deliveries
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------
-- Políticas RLS para feedback
-- -----------------------------------------------------
-- Los usuarios pueden ver su propio feedback
CREATE POLICY "Users can view their own feedback"
  ON public.feedback
  FOR SELECT
  USING (auth.uid() = user_id);

-- Los usuarios pueden insertar feedback (propio o anónimo)
CREATE POLICY "Users can insert feedback"
  ON public.feedback
  FOR INSERT
  WITH CHECK (
    -- Si no hay user_id (feedback anónimo), permitir
    user_id IS NULL OR
    -- Si hay user_id, debe ser el usuario autenticado
    auth.uid() = user_id
  );

-- Los usuarios solo pueden actualizar su propio feedback
CREATE POLICY "Users can update their own feedback"
  ON public.feedback
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios solo pueden eliminar su propio feedback
CREATE POLICY "Users can delete their own feedback"
  ON public.feedback
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- FUNCIONES DE UTILIDAD
-- =====================================================

-- -----------------------------------------------------
-- Función: handle_new_user
-- -----------------------------------------------------
-- Se ejecuta automáticamente cuando se crea un nuevo usuario.
-- Inicializa las configuraciones por defecto y la fecha de inicio
-- del semestre.
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Crear configuración por defecto
  INSERT INTO public.user_configs (
    user_id,
    min_study_time,
    base_study_days,
    priority_variations,
    allocation_window_days
  )
  VALUES (
    NEW.id,
    2,  -- 2 horas mínimas por día
    4,  -- 4 días base de estudio
    '{"high":1,"normal":0,"low":-1}'::jsonb,  -- Variaciones de prioridad
    30  -- Ventana de 30 días para asignación
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Crear fecha de inicio de semestre por defecto (fecha actual)
  INSERT INTO public.semester_starts (user_id, semester_start)
  VALUES (NEW.id, CURRENT_DATE)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger para ejecutar handle_new_user al crear usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------
-- Función: delete_user_account
-- -----------------------------------------------------
-- Elimina completamente la cuenta del usuario actual.
-- Gracias a las restricciones CASCADE, todos los datos relacionados
-- (configs, deliveries, semester_starts, feedback) se eliminan automáticamente.
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Eliminar al usuario actual de auth.users
  -- Las restricciones ON DELETE CASCADE eliminan automáticamente
  -- todos los registros relacionados en las demás tablas
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

-- =====================================================
-- NOTAS DE IMPLEMENTACIÓN Y DISEÑO
-- =====================================================

-- -----------------------------------------------------
-- Flujo de datos del algoritmo de planificación
-- -----------------------------------------------------
-- 1. El usuario configura sus preferencias en user_configs
-- 2. Establece la fecha de inicio del semestre en semester_starts
-- 3. Crea entregas en deliveries
-- 4. El algoritmo calcula start_date y end_date para cada entrega pendiente
-- 5. Estas fechas se persisten en deliveries.start_date y deliveries.end_date
-- 6. En login/recarga, si todas las entregas tienen fechas válidas, NO se recalcula
-- 7. Solo se recalcula cuando:
--    - Se añaden nuevas entregas (sin start_date/end_date)
--    - Se modifican fechas de entrega existentes
--    - Se cambian prioridades
--    - Se completa una tarea manualmente (se actualiza new_date_start)

-- -----------------------------------------------------
-- Sistema de fecha dinámica (new_date_start)
-- -----------------------------------------------------
-- Cuando un usuario completa una tarea antes de tiempo:
-- 1. Se guarda completed_at (timestamp actual)
-- 2. Se guarda completed_manually = TRUE
-- 3. Se calcula new_date_start = día siguiente a medianoche UTC
-- 4. Se guarda en semester_starts.new_date_start
-- 5. El algoritmo usa new_date_start como punto de inicio para recalcular
-- 6. Las tareas pendientes se redistribuyen desde esa nueva fecha
--
-- Al desmarcar una tarea como completada:
-- 1. Se limpia completed_at (NULL)
-- 2. Se limpia completed_manually (NULL)
-- 3. Se limpia new_date_start (NULL) en semester_starts
-- 4. El algoritmo vuelve a usar semester_start como punto de inicio

-- -----------------------------------------------------
-- Tracking de estado de completado
-- -----------------------------------------------------
-- La combinación de completed + completed_at + completed_manually permite:
-- - Saber exactamente cuándo se completó cada tarea
-- - Distinguir entre completado manual vs automático (por pasar deadline)
-- - Generar estadísticas precisas de productividad
-- - Implementar futuros dashboards de análisis de rendimiento

-- -----------------------------------------------------
-- Estrategia de persistencia y optimización
-- -----------------------------------------------------
-- La persistencia de start_date y end_date en deliveries optimiza el rendimiento:
-- - Reduce recálculos innecesarios del algoritmo
-- - Permite carga rápida del schedule en login/recarga
-- - Mantiene trazabilidad de las fechas asignadas históricamente
-- - Facilita debugging y análisis de cambios en el schedule
--
-- El sistema detecta automáticamente cuándo necesita recalcular:
-- 1. Verifica si todas las entregas pendientes tienen start_date y end_date válidos
-- 2. Si SÍ → usa fechas persistidas (rápido, sin recálculo)
-- 3. Si NO → ejecuta el algoritmo y persiste las nuevas fechas

-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================

