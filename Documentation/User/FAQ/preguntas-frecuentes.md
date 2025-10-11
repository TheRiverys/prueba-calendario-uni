# ❓ Preguntas Frecuentes

Esta sección responde las preguntas más comunes que reciben los usuarios de Academic Suite.

## 🚀 Preguntas Generales

### ¿Qué es Academic Suite?

Es una aplicación web diseñada específicamente para estudiantes universitarios que necesitan gestionar múltiples entregas, exámenes y proyectos académicos de manera eficiente y visual.

**Características principales**:
- 📅 **Gestión visual de entregas** con tres vistas diferentes
- 🎨 **Organización automática por asignaturas** con colores únicos
- 🧠 **Algoritmo inteligente de estudio** que sugiere horarios óptimos
- 📊 **Estadísticas detalladas** de progreso y carga de trabajo

### ¿Es gratuito?

Sí, la aplicación es completamente gratuita y de código abierto. Puedes:

- ✅ **Usar todas las funcionalidades** sin costo
- ✅ **Instalarla localmente** para desarrollo
- ✅ **Contribuir al proyecto** en GitHub
- ✅ **Personalizarla** según tus necesidades

### ¿Dónde se almacenan mis datos?

**Privacidad y seguridad**:
- 🔐 **Datos locales primero**: Información almacenada en tu navegador
- 🌐 **Sincronización opcional**: Puedes usar Supabase para respaldo en la nube
- 🚫 **Sin rastreo externo**: Respeta tu privacidad completamente
- 📋 **Cumple GDPR**: Políticas estrictas de protección de datos

## 📥 Instalación y Configuración

### ¿Cómo instalo la aplicación?

**Opción 1: Usar la versión web**
- Simplemente abre la aplicación en tu navegador
- No requiere instalación ni configuración

**Opción 2: Instalar localmente**
```bash
# Clonar repositorio
git clone https://github.com/TheRiverys/prueba-calendario-uni.git

# Instalar dependencias
cd calendario-entregas-uni
npm install

# Iniciar desarrollo
npm run dev
```

### ¿Necesito conocimientos técnicos?

**Para uso básico**: No, es intuitiva y tiene tour integrado
**Para desarrollo**: Conocimientos básicos de JavaScript/React ayudan
**Para personalización avanzada**: Requiere conocimientos de desarrollo web

## 📋 Gestión de Entregas

### ¿Cómo cambio la prioridad de una entrega?

1. **Desde cualquier vista** → Haz clic en el botón "Editar" ✏️
2. **Selecciona prioridad** → Baja, Normal o Alta
3. **Guarda cambios** → Se aplicará automáticamente

**Consejo**: Usa prioridades según importancia real:
- 🚩 **Alta**: Exámenes finales, proyectos críticos
- 🟡 **Normal**: Trabajos regulares, prácticas semanales
- 🟢 **Baja**: Lecturas opcionales, tareas menores

### ¿Por qué mi entrega aparece en rojo?

**Indicadores de estado**:
- 🔴 **Rojo**: Entrega vencida (fecha pasada)
- 🟡 **Amarillo**: Próxima (próximos 7 días)
- 🟢 **Verde**: Pendiente (más de 7 días)
- ✅ **Verde claro**: Completada

### ¿Cómo elimino una entrega por error?

1. **Localiza la entrega** en cualquier vista
2. **Haz clic en el ícono de papelera** 🗑️
3. **Confirma eliminación** en el diálogo
4. **No se puede deshacer** - se eliminará permanentemente

## 📊 Vistas y Funcionalidades

### ¿Cuál es la diferencia entre las 3 vistas?

#### 📋 Vista Lista
- **Mejor para**: Gestión detallada y filtros
- **Características**: Tabla completa, filtros avanzados, acciones rápidas

#### 📅 Vista Calendario
- **Mejor para**: Visión mensual rápida
- **Características**: Calendario visual, entregas por día, navegación fácil

#### 📊 Vista Gantt
- **Mejor para**: Planificación de proyectos largos
- **Características**: Línea de tiempo, barras de duración, dependencias visuales

### ¿Cómo cambio entre vistas?

**Método 1**: Usa el selector desplegable en la esquina superior derecha

**Método 2**: Desde la Vista Calendario o Gantt, usa el selector integrado

### ¿Por qué no veo el algoritmo de estudio?

**Requisitos para usar el algoritmo**:
1. ✅ **Tener entregas registradas** (mínimo 2-3 entregas)
2. ⚙️ **Configuración habilitada** (en el menú de configuración)
3. 🔑 **API key configurada** (opcional, para funciones avanzadas)

## 🎨 Colores y Organización

### ¿Cómo funcionan los colores automáticos?

**Sistema inteligente**:
1. **Primera entrega**: Se asigna color único automáticamente
2. **Mismas asignaturas**: Conservan el mismo color siempre
3. **Algoritmo de selección**: Elige colores accesibles y distintivos
4. **Más de 20 colores**: Amplia paleta disponible

### ¿Puedo cambiar colores manualmente?

**Actualmente**: Los colores son automáticos por asignatura

**Planes futuros**: Posibilidad de personalización manual

**Alternativa**: Usa nombres de asignaturas consistentes para mantener colores

### ¿Qué hacer si tengo muchas asignaturas?

**Consejos de organización**:
- 📚 **Nombres consistentes**: Siempre "Matemáticas II", nunca variar
- 🎯 **Agrupar relacionadas**: Usa prefijos comunes cuando corresponda
- 🧹 **Eliminar obsoletas**: Borra asignaturas que ya no uses

## ⚙️ Configuración y Personalización

### ¿Dónde encuentro la configuración?

**Acceso**:
- **Ícono de engranaje** ⚙️ en la esquina superior derecha
- **Configuración detallada** para opciones avanzadas
- **Privacidad** para ajustes de datos personales

### ¿Qué configuraciones puedo cambiar?

**Opciones disponibles**:
- 🎨 **Tema**: Claro/oscuro automático
- 📱 **Densidad**: Compacta o espaciada
- ⚙️ **Algoritmo de estudio**: Parámetros de planificación
- 📅 **Formato de fecha**: DD/MM/AAAA o MM/DD/AAAA

## 🔐 Privacidad y Seguridad

### ¿Mis datos están seguros?

**Medidas de seguridad implementadas**:
- 🔐 **Encriptación automática** de datos sensibles
- 🌐 **Comunicación segura** (HTTPS obligatorio)
- 📋 **Cumple estrictamente GDPR** con derechos implementados
- 🚫 **Sin rastreo externo** ni cookies de terceros

### ¿Quién puede ver mis entregas?

**Política de privacidad estricta**:
- 🔒 **Solo tú**: Nadie más puede acceder a tus datos
- 👀 **Transparencia total**: Puedes ver qué datos se almacenan
- 🗑️ **Derecho al olvido**: Puedes eliminar todos tus datos
- 📄 **Portabilidad**: Puedes exportar tus datos en cualquier momento

## 🆘 Problemas y Soporte

### ¿Qué hacer si algo no funciona?

**Proceso de resolución**:
1. **Verificar conexión** a internet
2. **Recargar la página** (F5 o Ctrl+R)
3. **Limpiar caché** del navegador si persiste
4. **Usar el sistema de feedback** integrado
5. **Consultar la documentación** completa

### ¿Cómo reporto un problema?

**Opciones disponibles**:
- 💬 **Panel de feedback**: Integrado en la aplicación
- 🐛 **Reportar bug**: Describe detalladamente el problema
- 📧 **Contacto directo**: Para problemas críticos
- 📚 **Documentación**: Busca soluciones conocidas

### ¿Hay soporte técnico?

**Recursos de soporte**:
- 📖 **Documentación completa** (esta guía)
- 🎯 **Tour interactivo** integrado
- ❓ **Ayuda contextual** en cada sección
- 👥 **Comunidad** (si aplica al proyecto)

## 🔄 Actualizaciones y Cambios

### ¿Cómo sé si hay actualizaciones?

**Notificaciones automáticas**:
- 🔄 **Actualizaciones en segundo plano**
- 📢 **Notificaciones en aplicación** para cambios importantes
- 📋 **Registro de cambios** accesible desde la aplicación

### ¿Perderé mis datos al actualizar?

**Política de actualización**:
- ✅ **Datos preservados**: Tus entregas siempre se mantienen
- 🔄 **Backups automáticos**: Seguridad adicional
- 📋 **Migraciones controladas**: Cambios de estructura anunciados

## 📤 Exportación e Importación

### ¿Puedo importar entregas desde Excel?

**Sí, completamente soportado**:
- 📄 **Formatos aceptados**: .xlsx, .xls, .csv
- ✅ **Validación automática**: Verifica datos antes de importar
- 🔄 **Mapeo inteligente**: Reconoce columnas automáticamente
- 🛡️ **Seguro**: Sin datos personales, solo información académica

### ¿Cómo exporto mis datos?

**Funcionalidad disponible**:
- 📅 **iCal (.ics)**: Para integración con calendarios externos (Google Calendar, Outlook, etc.)
- 🔄 **Incluye planificación**: Exporta entregas con fechas de estudio asignadas

## 🎓 Consejos Avanzados

### ¿Cómo optimizo mi uso?

**Mejores prácticas**:
1. **Añade entregas tempranamente** para mejor planificación
2. **Usa prioridades consistentemente** según importancia real
3. **Revisa estadísticas regularmente** para ajustar planificación
4. **Aprovecha las 3 vistas** según el contexto (lista para detalles, calendario para visión general, Gantt para proyectos)

### ¿Puedo usar múltiples dispositivos?

**Sincronización**:
- 💾 **Datos locales**: Funciona offline en cada dispositivo
- 🌐 **Sincronización opcional**: Puedes configurar respaldo en la nube
- 📱 **Responsive**: Se adapta automáticamente a móviles y tablets

## 🚀 Funcionalidades Avanzadas

### ¿Qué es el algoritmo de estudio?

**Sistema inteligente que**:
- 🧮 **Calcula tiempo óptimo** para cada entrega
- 📊 **Considera prioridades** (alta = más tiempo)
- 📅 **Distribuye carga temporalmente** evitando sobrecargas
- 🔄 **Se adapta automáticamente** a cambios en entregas

### ¿Cómo funciona la integración con IA?

**Características disponibles**:
- 🤖 **OpenAI integration** opcional para funcionalidades avanzadas
- 📝 **Generación automática** de horarios de estudio detallados
- 🔍 **Análisis de progreso** con sugerencias personalizadas
- ⚙️ **Requiere configuración**: API key de OpenAI necesaria para usar estas funciones

**Funcionalidades básicas sin IA**:
- ✅ **Algoritmo matemático** integrado funciona completamente offline
- ✅ **Planificación secuencial** evita conflictos automáticamente
- ✅ **Ajustes manuales** siempre disponibles en configuración

---

**📚 Última actualización**: Octubre 2025
**🎯 Nivel**: Usuario principiante a intermedio
**🔍 Búsquedas relacionadas**: ayuda, soporte, problemas comunes, configuración
