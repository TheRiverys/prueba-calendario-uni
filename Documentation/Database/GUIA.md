# Guia de base de datos (Supabase)

Este documento describe el esquema real que usa la app y como aplicarlo en Supabase.

**Uso recomendado**
1. Abre tu proyecto en Supabase.
2. Ve a `SQL Editor`.
3. Ejecuta `Documentation/Database/database-schema.sql`.
4. Verifica que las tablas y funciones aparezcan en `Database`.

**Archivos disponibles**
- `Documentation/Database/database-schema.sql`: esquema completo y recomendado.
- `Documentation/Database/analytics-table.sql`: solo analiticas y funciones relacionadas.
- `Documentation/Database/feedback-table.sql`: solo feedback y funciones relacionadas.

**Tablas usadas por la app**
- `public.user_configs`: configuracion base del planificador por usuario.
- `public.semester_starts`: fecha de inicio del semestre y fecha dinamica.
- `public.deliveries`: entregas con estado y fechas calculadas.
- `public.feedback`: feedback del usuario (tipo, titulo, descripcion, estado).
- `public.analiticas`: metricas de uso anonimas y asociadas al usuario.

**Funciones RPC usadas**
- `upsert_user_analytics(p_user_id, p_user_id_auth, p_consent_timestamp, p_consent_version)`
- `associate_anonymous_analytics(p_anonymous_user_id, p_registered_user_id)`
- `get_analytics_stats()`
- `insert_feedback(p_type, p_title, p_description, p_email)`
- `get_user_feedback()`
- `delete_user_account()`
- `delete_user_data(p_user_id)`

**Datos que no viven en la base**
- `openaiApiKey` se guarda localmente por privacidad.
- Preferencias de UI y consentimiento de cookies se guardan en `localStorage` o cookies.

**RLS (seguridad por fila)**
- Activo en `user_configs`, `semester_starts`, `deliveries` y `feedback`.
- `analiticas` se deja sin RLS para permitir inserciones por RPC.

**Notas sobre tipos de fecha**
- `semester_starts.semester_start` y `semester_starts.new_date_start` son `DATE`.
- La app puede enviar ISO con hora; Postgres lo castea a `DATE`.

**Verificacion rapida**
- Crea un usuario y valida que existan filas en `user_configs` y `semester_starts`.
- Inserta una entrega y valida columnas `start_date`, `end_date`, `completed_at`.
- Envía feedback desde la app y valida la fila en `feedback`.
- Acepta cookies y valida una fila en `analiticas`.
