# ⭐ Funcionalidades Principales

Academic Suite ofrece un conjunto completo de herramientas diseñadas específicamente para estudiantes. Esta guía detalla todas las funcionalidades disponibles.

## 📋 Gestión de Entregas

### Crear Nueva Entrega

**Proceso paso a paso**:

1. **Botón "Nueva entrega"**: Ubicado en la esquina superior derecha de todas las vistas
2. **Formulario completo**:
   - **Asignatura** _(requerido)_: Nombre de la materia
   - **Nombre** _(requerido)_: Descripción específica de la entrega
   - **Fecha límite** _(requerido)_: Fecha de entrega (formato: DD/MM/AAAA)
   - **Prioridad** _(requerido)_: Baja, Normal o Alta

**Características automáticas**:

- ✅ **Color único por asignatura**: Se asigna automáticamente un color distintivo
- ✅ **Validación de datos**: Verificación automática de fechas y campos obligatorios
- ✅ **Sugerencias de asignaturas**: Lista desplegable con asignaturas ya utilizadas

### Editar y Eliminar

**Acciones disponibles**:

- **Editar** ✏️: Modificar cualquier campo de la entrega
- **Eliminar** 🗑️: Remover permanentemente la entrega
- **Marcar completado** ✅: Cambiar estado a terminado

**Accesos rápidos**:

- Desde **Vista Lista**: Iconos de acción en cada fila
- Desde **Vista Calendario**: Click derecho o menú contextual
- Desde **Vista Gantt**: Click en la barra de la entrega

## 📊 Sistema de Vistas

### Vista Lista 📋

**Características principales**:

- **Tabla completa** con todas las entregas
- **Filtros avanzados** por asignatura
- **Ordenación múltiple**: fecha, prioridad, estado, asignatura
- **Búsqueda en tiempo real**
- **Paginación automática** para grandes cantidades de datos

**Columnas disponibles**:

- ✅ Estado (completado/pendiente)
- 📅 Fecha límite
- 📚 Asignatura (con color identificativo)
- 📝 Nombre de la entrega
- 🚩 Prioridad (con indicador visual)
- ⚡ Acciones rápidas

### Vista Calendario 📅

**Características principales**:

- **Calendario mensual** completo e interactivo
- **Vista general** de todas las entregas por día
- **Navegación intuitiva** entre meses
- **Indicadores visuales** claros por asignatura

**Elementos destacados**:

- **Días con entregas**: Fondo coloreado según cantidad
- **Hoy**: Línea vertical destacada
- **Fines de semana**: Diferenciación visual sutil
- **Entregas vencidas**: Indicador rojo automático

**Navegación**:

- ⬅️ **Anterior**: Mes anterior
- ➡️ **Siguiente**: Mes siguiente
- 📅 **Hoy**: Regresar al mes actual
- 🔍 **Vista mensual**: Zoom estándar

### Vista Gantt 📊

**Características principales**:

- **Diagrama de Gantt profesional** para planificación
- **Línea de tiempo extendida** (meses hacia adelante)
- **Barras visuales** representando duración de proyectos
- **Dependencias visuales** entre entregas relacionadas

**Elementos especializados**:

- **Barra de tiempo**: Eje horizontal con fechas
- **Entregas como barras**: Duración desde creación hasta deadline
- **Colores por asignatura**: Consistencia visual
- **Zoom y navegación**: Ajustable según necesidades

**Ideal para**:

- 📚 Proyectos largos con múltiples entregas
- 🎯 Planificación estratégica de semestre
- 📈 Visualización de carga de trabajo futura

## 🎨 Sistema de Organización

### Colores por Asignatura

**Funcionamiento automático**:

1. **Primera entrega**: Se asigna color automáticamente
2. **Entregas posteriores**: Mismo color para misma asignatura
3. **Algoritmo inteligente**: Selecciona colores distintivos y accesibles

**Características**:

- 🎨 **Paleta amplia**: Más de 20 colores únicos disponibles
- ♿ **Accesibilidad**: Contraste adecuado para todos los colores
- 🔄 **Consistencia**: Mismo color en todas las vistas
- 📱 **Responsive**: Adaptable a diferentes dispositivos

### Sistema de Prioridades

**Niveles disponibles**:

#### 🚩 Prioridad Alta

- **Color**: Rojo/Naranja
- **Uso recomendado**: Exámenes finales, proyectos críticos
- **Características**: Mayor prominencia visual
- **Algoritmo**: Más tiempo de estudio asignado automáticamente

#### 🟡 Prioridad Normal

- **Color**: Azul/Azul claro
- **Uso recomendado**: Trabajos regulares, prácticas semanales
- **Características**: Balance equilibrado
- **Algoritmo**: Tiempo estándar asignado

#### 🟢 Prioridad Baja

- **Color**: Verde claro/Gris
- **Uso recomendado**: Lecturas opcionales, tareas menores
- **Características**: Menor prominencia visual
- **Algoritmo**: Menos tiempo asignado, más flexible

## 📈 Estadísticas y Seguimiento

### Panel de Estadísticas

**Métricas disponibles**:

- 📊 **Total de entregas**: Cantidad absoluta registrada
- ⏰ **Próximas**: Entregas con deadline futuro
- 🔴 **Vencidas**: Entregas que pasaron su fecha límite
- 📅 **Esta semana**: Entregas con deadline en los próximos 7 días

**Características**:

- **Actualización automática**: Se recalcula en tiempo real
- **Filtros aplicables**: Respeta filtros activos por asignatura

### Seguimiento de Progreso

**Estados de entrega**:

1. **Pendiente** 🎯: Aún no completada
2. **Completada** ✅: Terminada exitosamente
3. **Vencida** 🔴: Fecha límite pasada
4. **En progreso** ⏳: Estado intermedio (si aplica)

**Registro automático**:

- **Fecha de creación**: Cuando se añade la entrega
- **Fecha de completado**: Cuando se marca como terminado
- **Tiempo empleado**: Cálculo automático si aplica

## 🧠 Cómo Funciona el Planificador Inteligente de Estudios

### ¿Qué hace el algoritmo por ti?

Imagina que tienes varias entregas académicas con fechas límite diferentes y prioridades distintas. El algoritmo inteligente analiza toda esta información y crea automáticamente un **plan de estudio óptimo** que respeta tus fechas límite mientras prioriza las tareas más importantes.

### 🎯 ¿Cómo funciona paso a paso?

#### 1. **Análisis inicial** 📋

El algoritmo revisa todas tus entregas:

- ✅ **Filtra tareas completadas** - Solo trabaja con entregas pendientes
- ✅ **Ordena por fecha límite** - Las más urgentes primero
- ✅ **Considera prioridades** - Alta, normal o baja importancia

#### 2. **Cálculo de tiempo mínimo** ⏱️

Para cada entrega calcula:

- **Tiempo base**: Cuántos días necesitas como mínimo (configurable, por defecto 4 días)
- **Ajustes por prioridad**:
  - 🔴 **Alta prioridad**: +1 día adicional
  - 🟡 **Normal**: Sin cambios
  - 🔵 **Baja prioridad**: -1 día (nunca menos del mínimo)

#### 3. **Distribución inteligente del tiempo** 📅

Aquí viene la magia matemática:

**Ejemplo práctico:**

```
Tienes 3 entregas:
- Entrega A: Fecha 15 octubre, prioridad ALTA (5 días asignados)
- Entrega B: Fecha 20 octubre, prioridad NORMAL (4 días asignados)
- Entrega C: Fecha 25 octubre, prioridad BAJA (3 días asignados)
```

**El algoritmo calcula:**

- **Ventana disponible**: Desde hoy hasta cada fecha límite
- **Distribución óptima**: Coloca los días de estudio respetando deadlines
- **Sin solapamientos**: Evita que estudies varias cosas el mismo día

#### 4. **Resultado final** ✨

Obtienes un calendario con:

- **Fecha de inicio** para cada entrega
- **Fecha de fin** (siempre = deadline)
- **Días totales** de estudio asignados
- **Advertencias** si hay conflictos de tiempo

### 🔧 Características especiales

#### Sistema de prioridades inteligente

- **Alta prioridad** = más tiempo de estudio
- **Baja prioridad** = tiempo optimizado pero respetando mínimos
- **Equilibrio automático** entre todas las tareas

#### Ventana de asignación dinámica

- Solo considera entregas en las próximas semanas (configurable)
- Se adapta a cambios de último momento
- Enfoque en lo realmente urgente

### 📊 ¿Qué ves en las diferentes vistas?

#### Vista Calendario 📆

- **Eventos de día completo** mostrando cada entrega
- **Códigos de colores** por asignatura
- **Vista clara** de tu carga de estudio día a día

#### Vista Gantt 📈

- **Barras horizontales** mostrando duración de cada tarea
- **Líneas de tiempo** claras desde inicio hasta deadline
- **Visualización** de solapamientos y conflictos

#### Vista Lista 📋

- **Tabla ordenada** por fecha o prioridad
- **Detalles específicos** de cada entrega
- **Indicadores** de días asignados vs. deseados

### ⚙️ Configuración personalizable

Puedes ajustar:

- **Días base** de estudio por entrega (2-14 días)
- **Sistema de prioridades** (valores numéricos)
- **Ventana de planificación** (15-60 días)

### 🎓 Consejos para usar el planificador

#### Para estudiantes con buena organización:

1. **Configura prioridades** según importancia real
2. **Revisa el plan generado** antes de seguirlo estrictamente
3. **Ajusta manualmente** si necesitas cambios específicos

#### Para estudiantes con dificultades de tiempo:

1. **Usa prioridades altas** para todo inicialmente
2. **Deja que el algoritmo** haga el trabajo pesado
3. **Sigue el plan** y ajusta gradualmente

### 🔍 ¿Por qué es mejor que planificar manualmente?

#### Ventajas del algoritmo:

- ✅ **Objetivo**: Basado en matemáticas, no en intuición
- ✅ **Consistente**: Siempre aplica las mismas reglas
- ✅ **Adaptable**: Se ajusta automáticamente a cambios
- ✅ **Equilibrado**: Respeta prioridades y minimiza estrés

#### Lo que NO hace:

- ❌ **No considera exámenes sorpresa**
- ❌ **No sabe tu nivel de dificultad personal**
- ❌ **No reemplaza tu juicio académico**

### 🚨 Indicadores importantes

#### Advertencias del sistema:

- 🟡 **Días insuficientes**: Cuando no hay tiempo para estudiar lo ideal
- 🔴 **Conflictos temporales**: Cuando hay demasiadas tareas solapadas
- ⚪ **Plan óptimo**: Cuando todo está perfectamente distribuido

### 📈 Mejora continua

El algoritmo aprende de:

- **Tus ajustes manuales** (si cambias fechas o prioridades)
- **Tus hábitos de estudio** (aunque no está completamente implementado)
- **Configuraciones personalizadas** que guardas

### 🎛️ Modos disponibles

#### Modo Normal (Recomendado)

- ✅ Permite solapamientos menores para mayor eficiencia
- ✅ Distribución equilibrada respetando prioridades
- ✅ Más tiempo para entregas importantes
- ❌ Puede generar algo de estrés acumulado

#### Modo Estricto

- ✅ Sin solapamientos temporales
- ✅ Carga perfectamente distribuida
- ✅ Respeta límites cognitivos diarios
- ❌ Puede requerir más tiempo total

#### Modo Ventana Deslizante

- ✅ Asignación dinámica según proximidad
- ✅ Enfoque en entregas inmediatas
- ✅ Adaptable a cambios de último momento
- ❌ Puede descuidar planificación a largo plazo

### 📍 Acceso al Algoritmo

**Ubicación**:

- **Configuración** ⚙️ → **Algoritmo de estudio**
- **Panel específico** para ajustes avanzados
- **Información detallada** sobre funcionamiento

---

_Este planificador está diseñado para hacer tu vida académica más predecible y menos estresante, pero recuerda: tú eres el experto en tu propio aprendizaje. Úsalo como guía, no como regla absoluta._

## 📥 Importación y Exportación

### Formatos Soportados

#### Importación

- 📄 **Excel (.xlsx, .xls)**: Para múltiples entregas desde hojas de cálculo
- 📋 **CSV**: Formato estándar de texto separado por comas
- 🔍 **Detección automática**: Reconoce columnas por encabezados o posición estándar

#### Exportación

- 📅 **iCal (.ics)**: Para integración con calendarios externos (Google Calendar, Outlook, etc.)

### Proceso de Importación

**Pasos detallados**:

1. **Seleccionar archivo** compatible (Excel o CSV)
2. **Detección automática** de columnas por encabezados
3. **Validación automática** de formato y datos requeridos
4. **Vista previa** con errores destacados antes de importar
5. **Importación final** con reporte detallado de errores

**Características de seguridad**:

- 🔒 **Sin datos personales**: Solo importa información académica (asignatura, nombre, fecha)
- ✅ **Validación estricta**: Rechazo de archivos malformados o con datos inválidos
- 📊 **Reporte detallado**: Información específica sobre éxito/errores por fila

### Proceso de Exportación

**Funcionalidad disponible**:

- 📅 **Exportación a iCal**: Genera archivo .ics compatible con calendarios estándar
- 🔄 **Incluye planificación completa**: Exporta todas las entregas con fechas de estudio asignadas
- 📱 **Compatible universal**: Funciona con Google Calendar, Outlook, Apple Calendar, etc.

## ⚙️ Configuración Avanzada

### Opciones Disponibles

#### Planificación de Estudios

- ⚙️ **Días base de estudio**: Tiempo mínimo asignado a cada entrega
- 📊 **Variaciones por prioridad**: Ajustes específicos para prioridades alta/normal/baja
- 🕐 **Tiempo mínimo por sesión**: Duración mínima recomendada de estudio diario
- 📅 **Ventana de asignación**: Días alrededor de cada entrega para distribuir el estudio

#### Configuración de IA

- 🔑 **Clave API de OpenAI**: Necesaria para funcionalidades avanzadas de IA
- 🤖 **Modelo de IA**: Configuración del modelo utilizado para generación de planes

#### Preferencias de Usuario

- 🎨 **Tema automático**: Claro/oscuro según configuración del sistema
- 🔄 **Auto-guardado**: Activado por defecto para preservar cambios

## 🔐 Privacidad y Seguridad

### Cumplimiento GDPR

**Características implementadas**:

- 📋 **Banner de consentimiento**: Información clara sobre cookies
- ⚙️ **Panel de privacidad**: Control granular de datos
- 🗑️ **Derecho al olvido**: Eliminación completa de datos
- 📄 **Política de privacidad**: Documentación completa

**Datos gestionados**:

- 🔒 **Encriptación automática**: Todos los datos sensibles
- ⏰ **Retención limitada**: Solo datos necesarios
- 🚫 **Sin rastreo externo**: Respeta privacidad del usuario

## 🆘 Sistema de Ayuda

### Recursos Disponibles

#### Ayuda Integrada

- ❓ **Botón de ayuda**: Acceso directo desde cualquier vista
- 📚 **Documentación completa**: Guías detalladas para cada función
- 🎯 **Tour interactivo**: Guía paso a paso para nuevos usuarios

#### Soporte

- 💬 **Panel de feedback**: Envío directo de comentarios
- 🐛 **Reporte de errores**: Sistema integrado de reporte
- 📧 **Contacto directo**: Información de soporte

## 🚀 Funcionalidades Avanzadas

### Algoritmo de Estudio Inteligente

**Sistema matemático avanzado**:

- 🧮 **Cálculo automático** de tiempo óptimo para cada entrega
- 📊 **Considera prioridades** (alta = más tiempo asignado automáticamente)
- 📅 **Distribuye carga temporalmente** evitando solapamientos críticos
- 🔄 **Se adapta automáticamente** a cambios en entregas y configuración

**Modos disponibles**:

- **Normal**: Distribución equilibrada respetando prioridades
- **Estricto**: Sin solapamientos, planificación precisa
- **Ventana deslizante**: Asignación dinámica según proximidad

### Integración con IA (Opcional)

**Características disponibles**:

- 🤖 **OpenAI integration** para generación avanzada de planes de estudio
- 📝 **Generación automática** de horarios de estudio diarios detallados
- 🔍 **Análisis de progreso** con sugerencias personalizadas de mejora
- ⚙️ **Requiere configuración**: API key de OpenAI en ajustes

**Funcionalidades básicas sin IA**:

- ✅ **Algoritmo matemático** integrado funciona completamente offline
- ✅ **Planificación secuencial** inteligente evita conflictos
- ✅ **Ajustes manuales** siempre disponibles en configuración

## 🎯 Consejos de Uso

### Mejores Prácticas

#### Organización

1. **Nombres consistentes** para asignaturas (ej: siempre "Matemáticas II")
2. **Descripciones claras** en nombres de entregas
3. **Uso adecuado de prioridades** según importancia real

#### Planificación

1. **Añadir entregas tempranamente** para mejor planificación
2. **Revisar regularmente** el calendario y estadísticas
3. **Marcar como completado** inmediatamente después de terminar

#### Mantenimiento

1. **Eliminar entregas obsoletas** para mantener datos limpios
2. **Revisar configuración periódicamente** para optimizar experiencia
3. **Usar exportación regular** para backups personales

---

**📚 Nivel**: Usuario intermedio
**⏱️ Características cubiertas**: Todas las funciones principales
**🎯 Objetivo**: Dominio completo de la aplicación
