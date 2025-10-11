# 🔧 Solución de Problemas Comunes

Esta guía proporciona soluciones detalladas para los problemas más frecuentes que pueden ocurrir durante el desarrollo y uso de Academic Suite.

## 🚨 Problemas de Instalación

### Error: "Cannot resolve module"

**Síntomas**:
- Importaciones fallidas durante instalación
- Mensajes como `Cannot resolve module 'react'` o módulos similares

**Causas comunes**:
1. **Dependencias corruptas**
2. **Versión de Node.js incompatible**
3. **Cache de npm dañado**

**Soluciones**:

#### Solución 1: Limpiar cache y reinstalar
```bash
# Limpiar todos los caches
npm cache clean --force
rm -rf node_modules package-lock.json

# Reinstalar dependencias
npm install
```

#### Solución 2: Verificar versión de Node.js
```bash
# Verificar versión actual
node --version

# Si es inferior a 18.0.0, actualizar
# Usar nvm para gestión de versiones
nvm install 18
nvm use 18
```

#### Solución 3: Verificar integridad de archivos
```bash
# Verificar que package.json no tiene errores de sintaxis
cat package.json | jq .

# Si no tienes jq instalado, verificar manualmente la estructura
```

### Error: "Port already in use"

**Síntomas**:
- `Error: listen EADDRINUSE: address already in use :::3000`
- Servidor de desarrollo no inicia

**Soluciones**:

#### Solución 1: Encontrar y matar proceso
```bash
# Encontrar proceso usando el puerto (Linux/macOS)
lsof -ti:3000

# Matar proceso encontrado
kill -9 <PID_NUMBER>

# Alternativa: usar otro puerto
PORT=3001 npm run dev
```

#### Solución 2: Reiniciar servicios (Windows)
```bash
# Abrir administrador de tareas
# Buscar procesos de Node.js y terminarlos
# O reiniciar la computadora
```

### Error: "Supabase connection failed"

**Síntomas**:
- Aplicación no puede conectar con la base de datos
- Errores de autenticación o consultas fallidas

**Causas comunes**:
1. **Variables de entorno incorrectas**
2. **Proyecto Supabase mal configurado**
3. **Políticas RLS demasiado restrictivas**

**Soluciones**:

#### Solución 1: Verificar variables de entorno
```bash
# Verificar archivo .env
cat .env

# Debe contener:
# VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
# VITE_SUPABASE_ANON_KEY=tu-clave-anonima

# Probar conexión manualmente
curl -H "apikey: $VITE_SUPABASE_ANON_KEY" "$VITE_SUPABASE_URL/rest/v1/"
```

#### Solución 2: Configurar políticas RLS correctamente

**En Supabase Dashboard → SQL Editor**:
```sql
-- Ver políticas actuales
SELECT * FROM pg_policies WHERE tablename = 'deliveries';

-- Si no hay políticas o son muy restrictivas, ajustar:
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Política básica para desarrollo
CREATE POLICY "Users can access own deliveries" ON deliveries
  FOR ALL USING (auth.uid() = user_id);
```

## 🐛 Problemas de Funcionamiento

### Entregas no se guardan correctamente

**Síntomas**:
- Datos se pierden al recargar la página
- Operaciones CRUD fallan silenciosamente

**Causas comunes**:
1. **Usuario no autenticado**
2. **Políticas RLS bloqueando operaciones**
3. **Errores de red o timeout**

**Soluciones paso a paso**:

1. **Verificar autenticación**:
   ```typescript
   // En consola del navegador
   console.log('Usuario autenticado:', !!currentUser);
   ```

2. **Verificar políticas RLS**:
   ```sql
   -- En Supabase Dashboard
   SELECT * FROM deliveries WHERE user_id = auth.uid();
   ```

3. **Verificar logs de red**:
   - Abrir DevTools → Network
   - Buscar requests a Supabase
   - Verificar códigos de respuesta (200 = OK, 401 = Unauthorized)

### Problemas de rendimiento

**Síntomas**:
- Aplicación lenta o congelada
- Carga excesiva del procesador
- Memoria consumiéndose constantemente

**Causas comunes**:
1. **Re-renders excesivos**
2. **Memory leaks en componentes**
3. **Consultas ineficientes a Supabase**

**Soluciones**:

#### Profiling de React
```typescript
// En desarrollo, usar React DevTools Profiler
// 1. Instalar React DevTools
// 2. Abrir Profiler tab
// 3. Buscar componentes con re-renders excesivos
```

#### Optimización de consultas
```typescript
// Antes (posiblemente ineficiente)
const { data } = await supabase.from('deliveries').select('*');

// Después (más eficiente)
const { data } = await supabase
  .from('deliveries')
  .select('id, subject, name, date, priority')
  .eq('user_id', userId)
  .order('date');
```

### Problemas de colores automáticos

**Síntomas**:
- Colores no se asignan correctamente por asignatura
- Múltiples asignaturas tienen el mismo color
- Colores poco accesibles o difíciles de distinguir

**Causas comunes**:
1. **Algoritmo de colores con conflictos**
2. **Datos corruptos en localStorage**
3. **Límite de colores alcanzado**

**Soluciones**:

#### Resetear colores manualmente
```typescript
// En consola del navegador
localStorage.removeItem('subjectColors');
location.reload();
```

#### Verificar algoritmo de colores
```typescript
// El algoritmo está en src/utils/colors.ts
// Verificar función pickColorForSubject
import { pickColorForSubject } from '@/utils/colors';
console.log(pickColorForSubject('Nueva Asignatura', []));
```

#### Consejos de uso
- Usa **nombres consistentes** para asignaturas (ej: siempre "Matemáticas II")
- El algoritmo selecciona colores automáticamente al crear la primera entrega
- Más de **20 colores únicos** disponibles en la paleta

## 🔧 Problemas de Configuración

### Configuración del algoritmo no se aplica

**Síntomas**:
- Cambios en configuración no afectan el comportamiento
- Valores por defecto se mantienen a pesar de cambios

**Causas comunes**:
1. **Cache de configuración no limpiado**
2. **Usuario no autenticado (configuración por usuario)**
3. **Errores de validación silenciosos**

**Soluciones**:

1. **Verificar configuración activa**:
   ```typescript
   // En consola del navegador
   import { useConfig } from '@/contexts/config/ConfigContext';
   const config = useConfig();
   console.log('Config actual:', config);
   ```

2. **Forzar recarga de configuración**:
   ```typescript
   // Limpiar cache local
   localStorage.removeItem('userConfig');
   location.reload();
   ```

### Problemas con temas oscuros

**Síntomas**:
- Tema oscuro no se aplica correctamente
- Algunos componentes quedan con tema claro
- Problemas de contraste o legibilidad

**Causas comunes**:
1. **Configuración CSS incorrecta**
2. **Componentes sin soporte para tema oscuro**
3. **Sistema operativo con configuración especial**

**Soluciones**:

1. **Verificar configuración de tema**:
   ```css
   /* En src/index.css */
   :root {
     /* Variables de tema claro */
   }

   .dark {
     /* Variables de tema oscuro */
   }
   ```

2. **Forzar aplicación de tema**:
   ```typescript
   // Temporalmente forzar tema oscuro para debugging
   document.documentElement.classList.add('dark');
   ```

## 🚨 Problemas de Producción

### Build falla en producción

**Síntomas**:
- `npm run build` termina con errores
- Aplicación funciona en desarrollo pero no en producción

**Causas comunes**:
1. **Variables de entorno no configuradas**
2. **Dependencias de desarrollo incluidas en producción**
3. **Configuración de Vite incorrecta**

**Soluciones**:

#### Verificar variables de entorno
```bash
# Crear .env.production con variables reales
echo "VITE_SUPABASE_URL=https://tu-proyecto.supabase.co" > .env.production
echo "VITE_SUPABASE_ANON_KEY=tu-clave-real" >> .env.production
```

#### Verificar configuración de Vite
```typescript
// vite.config.ts debe excluir dependencias de desarrollo
export default defineConfig({
  build: {
    rollupOptions: {
      external: ['vite', 'vitest'], // Excluir herramientas de desarrollo
    }
  }
});
```

### Problemas de autenticación en producción

**Síntomas**:
- Usuarios no pueden iniciar sesión
- Sesiones se pierden frecuentemente
- Errores de CORS o políticas de seguridad

**Causas comunes**:
1. **Configuración de dominio incorrecta en Supabase**
2. **HTTPS no configurado correctamente**
3. **Políticas de seguridad del navegador**

**Soluciones**:

1. **Configurar dominio en Supabase**:
   - Dashboard → Authentication → URL Configuration
   - Agregar dominio de producción
   - Configurar redirect URLs

2. **Verificar configuración HTTPS**:
   ```bash
   # Probar conexión segura
   curl -I https://tu-dominio.com

   # Debe retornar 200 OK con headers de seguridad
   ```

## 📊 Problemas de Datos

### Datos se pierden o no sincronizan

**Síntomas**:
- Entregas aparecen y desaparecen
- Datos diferentes entre sesiones
- Sincronización lenta o fallida

**Causas comunes**:
1. **Problemas de conexión a Supabase**
2. **localStorage corrupto o lleno**
3. **Race conditions en operaciones concurrentes**

**Soluciones**:

#### Diagnosticar problemas de sincronización
```typescript
// En consola del navegador
// Verificar estado de conexión
console.log('Online:', navigator.onLine);

// Verificar datos en localStorage
console.log('Datos locales:', JSON.parse(localStorage.getItem('deliveries') || '[]'));

// Verificar datos remotos (si tienes acceso a Supabase)
```

#### Limpiar datos corruptos
```typescript
// Backup de datos actuales
const backup = localStorage.getItem('deliveries');

// Limpiar datos problemáticos
localStorage.removeItem('deliveries');
localStorage.removeItem('subjects');

// Recargar página (debería sincronizar desde Supabase)
location.reload();
```

### Problemas de importación de archivos

**Síntomas**:
- Archivos Excel/CSV no se importan correctamente
- Datos mal formateados o campos vacíos
- Errores de validación durante importación

**Causas comunes**:
1. **Formato de archivo incompatible**
2. **Datos mal estructurados**
3. **Límite de tamaño excedido**

**Soluciones**:

1. **Verificar formato esperado**:
   ```typescript
   // El formato esperado está documentado en src/utils/importers.ts
   // Columnas requeridas: subject, name, dueDate
   // Formato de fecha: DD/MM/YYYY o YYYY-MM-DD
   ```

2. **Validar archivo antes de importar**:
   ```typescript
   // Usar el validador incluido
   import { validateImportFile } from '@/utils/importers';

   const validation = validateImportFile(file);
   console.log('Errores de validación:', validation.errors);
   ```

## 🔍 Debugging Avanzado

### Herramientas de Debugging

#### React DevTools
- **Profiler**: Identificar re-renders excesivos
- **Components**: Inspeccionar estado de componentes
- **Profiler**: Medir performance de renders

#### Network Tab (DevTools)
- **XHR/Fetch**: Ver todas las peticiones a Supabase
- **Response**: Ver datos reales recibidos
- **Timing**: Identificar cuellos de botella de red

#### Console Logging Estratégico
```typescript
// Logging estructurado para debugging
const debugLog = (context: string, data: any) => {
  console.log(`[${context}]`, data);
};

// Uso en componentes
useEffect(() => {
  debugLog('DeliveriesContext', { deliveries, loading, error });
}, [deliveries]);
```

### Logs de Supabase

**Ver logs en tiempo real**:
1. **Supabase Dashboard** → Project Settings → Database
2. **Logs** → Seleccionar tabla específica
3. **Filtrar por operaciones** (INSERT, UPDATE, DELETE)

**Queries útiles para debugging**:
```sql
-- Ver todas las entregas de un usuario
SELECT * FROM deliveries WHERE user_id = 'user-id-aqui' ORDER BY created_at DESC;

-- Ver errores recientes en logs de Postgres
SELECT * FROM postgres_log WHERE error_severity = 'ERROR' ORDER BY log_time DESC LIMIT 10;
```

## 📋 Checklist de Troubleshooting

### Antes de reportar un bug:

- [ ] **Verificar versión** de Node.js (≥18.0.0)
- [ ] **Limpiar caches** (npm cache clean --force)
- [ ] **Reinstalar dependencias** (rm -rf node_modules && npm install)
- [ ] **Verificar variables de entorno** están configuradas correctamente
- [ ] **Probar en modo incógnito** (descartar problemas de extensión)
- [ ] **Verificar logs del navegador** (F12 → Console)
- [ ] **Verificar logs de red** (F12 → Network)
- [ ] **Probar con datos mínimos** (crear entrega simple de prueba)

### Información necesaria para reportar bugs:

1. **Versión exacta** del software
2. **Sistema operativo** y versión
3. **Navegador** y versión
4. **Pasos exactos** para reproducir el problema
5. **Comportamiento esperado** vs **comportamiento actual**
6. **Capturas de pantalla** o videos si aplica
7. **Logs de error** relevantes
8. **Datos de ejemplo** que causan el problema

## 🆘 Cuándo Pedir Ayuda

### Problemas que requieren intervención:

#### Nivel Bajo (Usuario puede resolver):
- Problemas de instalación básicos
- Configuración inicial
- Errores de uso común

#### Nivel Medio (Desarrollador puede resolver):
- Bugs funcionales menores
- Problemas de performance
- Errores de datos específicos

#### Nivel Alto (Requiere desarrollador senior):
- Problemas arquitectónicos
- Bugs críticos de seguridad
- Problemas de infraestructura

### Canales de soporte:

1. **Documentación interna** (esta guía)
2. **Sistema de feedback** integrado en la aplicación
3. **Issues en repositorio** para bugs específicos
4. **Contacto directo** para problemas críticos

---

**🔧 Nivel**: Desarrollador / Usuario avanzado
**🎯 Propósito**: Resolución autónoma de problemas comunes
**⏱️ Tiempo promedio de resolución**: 5-15 minutos por problema
