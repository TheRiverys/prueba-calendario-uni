-- ================================================
-- TABLA: FEEDBACK
-- ================================================
-- Esta tabla almacena el feedback de usuarios
-- desde el componente FeedbackPanel.tsx

-- Crear tabla para feedback de usuarios
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable para feedback anónimo
  type TEXT NOT NULL CHECK (type IN ('sugerencia', 'error', 'comentario')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  email TEXT, -- Opcional para respuestas
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_feedback_updated_at
BEFORE UPDATE ON public.feedback
FOR EACH ROW EXECUTE FUNCTION public.update_feedback_updated_at();

-- ================================================
-- RLS (Row Level Security)
-- ================================================
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios autenticados pueden ver su propio feedback
CREATE POLICY "Users can view their own feedback"
  ON public.feedback
  FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuarios autenticados pueden insertar su propio feedback
CREATE POLICY "Users can insert their own feedback"
  ON public.feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Política: Usuarios autenticados pueden actualizar su propio feedback
CREATE POLICY "Users can update their own feedback"
  ON public.feedback
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Política: Usuarios autenticados pueden eliminar su propio feedback
CREATE POLICY "Users can delete their own feedback"
  ON public.feedback
  FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ================================================
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback (user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON public.feedback (type);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON public.feedback (status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.feedback (created_at);

-- ================================================
-- FUNCIONES PARA GESTIÓN DE FEEDBACK
-- ================================================

-- Función para insertar feedback (para usuarios autenticados y anónimos)
CREATE OR REPLACE FUNCTION public.insert_feedback(
  p_type TEXT,
  p_title TEXT,
  p_description TEXT,
  p_email TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  feedback_id UUID;
BEGIN
  -- Insertar el feedback
  INSERT INTO public.feedback (user_id, type, title, description, email)
  VALUES (auth.uid(), p_type, p_title, p_description, p_email)
  RETURNING id INTO feedback_id;

  RETURN feedback_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener feedback del usuario actual
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
) AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- COMENTARIOS DE USO
-- ================================================

/*
INSTRUCCIONES DE USO:

1. Ejecutar este SQL en Supabase SQL Editor para crear la tabla de feedback

2. El componente FeedbackPanel.tsx usará las siguientes funciones:

   // Para enviar feedback
   const result = await supabase.rpc('insert_feedback', {
     p_type: 'sugerencia',
     p_title: 'Título del feedback',
     p_description: 'Descripción del feedback',
     p_email: 'email@ejemplo.com' // opcional
   });

   // Para obtener feedback del usuario
   const { data: feedback } = await supabase.rpc('get_user_feedback');

3. Para desarrollo (limpiar feedback de prueba):
   DELETE FROM public.feedback WHERE user_id IS NULL;

NOTA: Los usuarios anónimos pueden enviar feedback (user_id = NULL)
pero solo los usuarios autenticados pueden ver su propio feedback.
*/
