# 📚 Guía de Usuario - Calendario Universitario

¡Bienvenido a tu Calendario Universitario! Esta aplicación te ayudará a organizar y gestionar todas tus entregas académicas de manera eficiente. A continuación encontrarás una guía completa paso a paso para aprovechar al máximo todas las funcionalidades.

## 🎯 ¿Qué es el Calendario Universitario?

El Calendario Universitario es una herramienta diseñada específicamente para estudiantes que necesitan organizar sus entregas académicas (exámenes, trabajos, proyectos, etc.) de forma visual e intuitiva. Con múltiples vistas y funcionalidades inteligentes, te ayudará a mantener el control de tu carga académica.

## 🚀 Inicio Rápido

### Primeros Pasos

1. **Acceso a la aplicación**: Abre la aplicación en tu navegador web
2. **Configuración inicial**: Establece la fecha de inicio de tu semestre en la sección de controles superiores
3. **Añade tu primera entrega**: Haz clic en "Nueva entrega" para comenzar

## 📋 Funcionalidades Principales

### ➕ Gestión de Entregas

#### Crear una Nueva Entrega
1. Haz clic en el botón **"Nueva entrega"** (botón azul con icono de edición)
2. Completa el formulario:
   - **Asignatura**: Selecciona la materia de la entrega
   - **Nombre**: Describe brevemente la entrega (ej: "Examen final", "Trabajo práctico 3")
   - **Fecha de entrega**: Selecciona la fecha límite
   - **Prioridad**: Elige entre Baja, Normal o Alta según la importancia

#### Editar una Entrega
- Haz clic en el botón de edición (✏️) junto a cualquier entrega
- Modifica los datos necesarios y guarda los cambios

#### Marcar como Completada
- Usa el checkbox junto a cada entrega para marcarla como completada
- Las entregas completadas aparecerán con un indicador visual diferente

#### Eliminar una Entrega
- Haz clic en el botón de eliminar (🗑️) junto a la entrega
- Confirma la eliminación cuando se solicite

### 📊 Vistas Disponibles

#### Vista de Lista 📋
- **Ubicación**: Primera pestaña en el selector de vistas
- **Funcionalidad**: Muestra todas tus entregas en formato de tabla/lista
- **Características**:
  - Filtros por asignatura
  - Ordenamiento por fecha, prioridad o estado
  - Vista clara de todas las entregas pendientes

#### Vista de Calendario 📅
- **Ubicación**: Segunda pestaña en el selector de vistas
- **Funcionalidad**: Visualización mensual de tus entregas
- **Características**:
  - Navegación por meses
  - Colores diferenciados por asignatura
  - Vista general de la distribución temporal

#### Vista de Gantt 📈
- **Ubicación**: Tercera pestaña en el selector de vistas
- **Funcionalidad**: Diagrama de Gantt con timeline de entregas
- **Características**:
  - Línea de tiempo horizontal
  - Barras representando duración de entregas
  - Vista de solapamientos y conflictos

### ⚙️ Configuración del Semestre

#### Fecha de Inicio
- **Ubicación**: Control superior izquierdo
- **Función**: Establece la fecha oficial de inicio de tu semestre
- **Impacto**: Afecta los cálculos de horarios de estudio sugeridos

### 👤 Gestión de Perfil

#### Acceso al Perfil
- Haz clic en tu foto de perfil o nombre de usuario (esquina superior derecha)
- Selecciona "Perfil" para acceder a la configuración personal

#### Información Personal
- **Editar datos**: Modifica tu información personal (nombre, email, etc.)
- **Seguridad**: Cambia tu contraseña de acceso
- **Configuración**: Ajusta preferencias personales

#### Eliminación de Cuenta
- **⚠️ Acción irreversible**: Puedes eliminar completamente tu cuenta
- **Proceso**: Requiere confirmación de contraseña y verificación adicional

## 🧠 Funcionalidades Inteligentes

### 🤖 Asistente de IA para Horarios de Estudio

#### ¿Qué hace?
El sistema utiliza inteligencia artificial avanzada para generar horarios de estudio óptimos basados en:
- Tus entregas actuales y fechas límite
- Prioridades asignadas a cada tarea
- Tiempo disponible hasta cada entrega
- Fecha de inicio del semestre
- Configuración personalizada de estudio

#### Características del Modelo IA
- **Modelo utilizado**: GPT-5-nano (modelo especializado de OpenAI)
- **Función principal**: Genera planes de estudio secuenciales sin solapamientos
- **Optimización inteligente**: Distribuye el tiempo de estudio de manera eficiente
- **Análisis de progreso**: Proporciona consejos personalizados para mejorar la productividad

#### Cómo Obtener la Clave API de OpenAI

Para utilizar las funcionalidades de IA, necesitas obtener una clave API de OpenAI:

1. **Crear cuenta en OpenAI**:
   - Ve a [platform.openai.com](https://platform.openai.com)
   - Regístrate con tu email o cuenta de Google/Microsoft

2. **Acceder a la sección de API**:
   - Una vez en tu cuenta, haz clic en tu perfil (esquina superior derecha)
   - Selecciona **"API Keys"** del menú desplegable

3. **Crear nueva clave API**:
   - Haz clic en **"Create new secret key"**
   - Dale un nombre descriptivo (ej: "Calendario Universitario")
   - Copia la clave generada (empieza con `sk-...`)

4. **⚠️ Importante sobre la seguridad**:
   - La clave API se muestra **solo una vez**
   - Guárdala en un lugar seguro inmediatamente
   - Nunca compartas tu clave API con nadie
   - Si pierdes tu clave, tendrás que generar una nueva

#### Configuración en la Aplicación

1. **Acceder a configuración**:
   - Haz clic en el ícono de configuración (⚙️) en la esquina superior derecha
   - Selecciona **"Configuración"** del menú

2. **Introducir clave API**:
   - Busca la sección **"Configuración de IA"**
   - Pega tu clave API en el campo **"Clave API de OpenAI"**
   - La clave se almacena localmente en tu navegador (no se envía a servidores externos)

3. **Guardar cambios**:
   - Haz clic en **"Guardar"** para aplicar la configuración
   - La aplicación verificará automáticamente que la clave es válida

#### 💰 Costos de Uso

**Información importante sobre precios**:

- **Modelo GPT-5-nano**: Es un modelo especializado y económico de OpenAI
- **Costo aproximado**: Entre $0.001 - $0.005 por consulta (dependiendo de la complejidad)
- **Uso típico**: Para un semestre con 20-30 entregas, el costo suele ser menor a $1 USD

**Ejemplos de costo**:
- Generar un plan de estudio completo: ~$0.002 - $0.005
- Análisis de progreso: ~$0.001 - $0.003
- Consulta de consejos: ~$0.001

**💡 Consejo de ahorro**:
- El modelo GPT-5-nano está optimizado y entrenado para estas tareas
- Los costos son significativamente más bajos que modelos estándar de OpenAI
- Puedes monitorear tu uso en el panel de OpenAI

#### Cómo Usar las Funcionalidades de IA

1. **Configura tus preferencias de estudio**:
   - En configuración, ajusta:
     - **Días base de estudio**: Número mínimo de días para estudiar cada entrega
     - **Tiempo mínimo diario**: Horas mínimas de estudio por día
     - **Variaciones por prioridad**: Ajustes adicionales según prioridad (Alta/Normal/Baja)

2. **Genera horario automático**:
   - El sistema calculará automáticamente fechas óptimas de inicio para cada entrega
   - Aparecerán fechas recomendadas marcadas como **"Fecha inicio sugerida"**
   - Los horarios se generan considerando solapamientos y optimización de tiempo

3. **Revisa sugerencias detalladas**:
   - Cada entrega tendrá fechas de inicio y fin sugeridas
   - Se mostrará el tiempo estimado de estudio por día
   - Aparecerá información sobre horas totales recomendadas

4. **Análisis de progreso**:
   - La IA analiza tus entregas completadas y pendientes
   - Proporciona consejos personalizados para mejorar tu productividad
   - Sugiere ajustes en tu planificación según tu rendimiento

#### Solución de Problemas con la IA

**Error común: "Introduce tu clave de API"**
- Asegúrate de que la clave API está correctamente pegada
- Verifica que no hay espacios adicionales al principio o final
- Comprueba que tienes conexión a internet

**La IA no genera sugerencias**
- Verifica que tienes entregas con fechas futuras
- Asegúrate de que la fecha de inicio del semestre está configurada
- Revisa que tienes suficientes días hasta la primera entrega

**Costos inesperados**
- Monitorea tu uso en el panel de OpenAI regularmente
- El modelo GPT-5-nano está diseñado para ser económico
- Puedes desactivar la IA temporalmente si es necesario

### 📊 Estadísticas Generales

#### Información Mostrada
- **Total de entregas**: Cantidad total de tareas pendientes
- **Próximas entregas**: Tareas que vencen en los próximos días
- **Entregas vencidas**: Tareas que ya pasaron su fecha límite
- **Esta semana**: Entregas programadas para la semana actual

## 🔧 Consejos Prácticos

### Organización Efectiva
1. **Colores por asignatura**: El sistema asigna colores automáticamente para diferenciar asignaturas
2. **Prioridades inteligentes**: Usa la prioridad alta solo para entregas realmente importantes
3. **Fechas realistas**: Sé honesto con las fechas de entrega para obtener mejores sugerencias

### Gestión del Tiempo
1. **Planificación temprana**: Añade entregas tan pronto como las conozcas
2. **Revisiones periódicas**: Revisa tu calendario semanalmente
3. **Ajustes flexibles**: Puedes modificar fechas y prioridades según evolucione el semestre

## 🌟 Características Avanzadas

### 📥 Importación Masiva
- Puedes importar múltiples entregas desde archivos externos
- Formatos soportados: CSV, Excel
- Validación automática de datos importados

### 🔄 Sincronización
- Los datos se guardan automáticamente en la nube
- Acceso desde múltiples dispositivos
- Backup automático de tu información

### 📱 Diseño Responsivo
- Funciona perfectamente en escritorio, tablet y móvil
- Interfaz adaptativa según el tamaño de pantalla
- Experiencia consistente en todos los dispositivos

## 🆘 Solución de Problemas

### Problemas Comunes

#### No veo mis entregas
- Verifica que estás en la vista correcta (Lista/Calendar/Gantt)
- Comprueba los filtros de asignatura activos
- Asegúrate de que la fecha de inicio del semestre esté configurada

#### Las fechas de estudio no aparecen
- Verifica que tienes configuradas las preferencias de estudio
- Asegúrate de que hay entregas con fechas futuras
- Comprueba que el algoritmo de IA está activo

#### Problemas de rendimiento
- Cierra otras pestañas del navegador
- Reinicia la aplicación si es necesario
- Verifica tu conexión a internet

### ¿Necesitas Ayuda?
- Revisa esta guía completa
- Consulta la sección de comentarios en la aplicación
- Contacta al soporte técnico si persiste el problema

## ✨ Consejos para el Éxito Académico

1. **Consistencia**: Usa la aplicación diariamente para mantener el hábito
2. **Anticipación**: Añade entregas tan pronto como las conozcas
3. **Realismo**: Sé honesto con tus capacidades y tiempos disponibles
4. **Flexibilidad**: Ajusta fechas y prioridades según sea necesario
5. **Seguimiento**: Marca entregas como completadas para mantener la motivación

## 🎓 Conclusión

El Calendario Universitario está diseñado para hacer tu vida académica más organizada y menos estresante. Con sus múltiples vistas, funcionalidades inteligentes y diseño intuitivo, te ayudará a mantener el control de tu carga académica y mejorar tu rendimiento estudiantil.

¡Éxito en tu semestre académico! 📚✨
