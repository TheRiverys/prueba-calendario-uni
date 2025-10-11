# 📋 Changelog - Calendario de Entregas Universitarias

Este proyecto sigue [semantic Versioning](https://semver.org/). Cada versión representa cambios significativos basados en commits reales del repositorio.

---

## 🚀 Versiones Publicadas

### [1.0.0] - 2025-10-11
**Versión estable con cumplimiento GDPR completo**

#### ✨ Nuevas Funcionalidades
- **Sistema completo de gestión de entregas** con tres vistas diferenciadas (Lista, Calendario, Gantt)
- **Algoritmo matemático inteligente de estudio** con distribución secuencial sin solapamientos
- **Sistema de prioridades** (Baja, Normal, Alta) con colores diferenciados
- **Organización automática por asignaturas** con colores únicos
- **Estadísticas automáticas** (Total, Próximas, Vencidas, Esta semana)
- **Importación de archivos Excel/CSV** con validación automática
- **Exportación a iCal (.ics)** para integración con calendarios externos
- **Tour interactivo integrado** para nuevos usuarios
- **Sistema de ayuda contextual** integrado

#### 🛡️ Seguridad y Cumplimiento
- **Sistema de autenticación completo** integrado con Supabase
- **Cumplimiento total GDPR** con implementación avanzada:
  - Gestión granular de consentimiento de cookies (3 categorías: Esenciales, Analíticas, Funcionales)
  - Derechos completos del usuario (acceso, portabilidad, olvido, rectificación)
  - Política de privacidad detallada conforme al RGPD
  - Sistema de eliminación segura en cascada de datos personales
  - Banner de consentimiento responsivo con opciones de personalización

#### 🎨 Mejoras de Interfaz
- **Tres vistas principales**: Lista tabular, Calendario mensual, Diagrama de Gantt
- **Diseño responsivo** adaptado a móviles y tablets
- **Tema automático** claro/oscuro según configuración del sistema
- **Sistema de notificaciones unificado** con Sonner
- **Navegación protegida por autenticación**
- **Panel de perfil completo** con gestión de cuenta

#### 🔧 Arquitectura Técnica
- **React 19.2.0** con hooks modernos
- **TypeScript 5.9.3** con tipado estricto
- **Tailwind CSS 4.1.14** para estilos
- **Supabase 2.74.0** como backend
- **Vite 7.1.9** para desarrollo optimizado
- **Configuración ESLint y Prettier** automática

---

### [0.9.0] - 2025-09-15
**Versión beta con funcionalidades principales**

#### ✨ Nuevas Funcionalidades
- **Algoritmo 'Ventana Deslizante'** para distribución inteligente de tiempo de estudio
- **Sistema de prioridades mejorado** con colores diferenciados
- **Detección automática de proveedores IA** (OpenAI, Google Gemini)
- **Menú desplegable mejorado** con navegación intuitiva
- **Múltiples optimizaciones de rendimiento** y calidad

#### 🔧 Correcciones Técnicas
- **Configuración ESLint y Husky** correctamente implementada
- **Arreglos de TypeScript** en componentes principales
- **Limpieza de código** y eliminación de debugging innecesario
- **Configuración de producción** optimizada con Docker support

#### 🎨 Mejoras de UX/UI
- **Sistema de notificaciones avanzado** con integración Sonner
- **Página de ayuda mejorada** con navegación optimizada
- **Tour de onboarding** integrado para nuevos usuarios
- **Accesibilidad mejorada** con IDs apropiados

---

### [0.8.0] - 2025-08-20
**Versión inicial con funcionalidades básicas**

#### ✨ Nuevas Funcionalidades
- **Aplicación base de calendario universitario** con React, TypeScript y Tailwind CSS
- **Modal de configuración** y soporte para variables de entorno
- **Integración básica de IA** para optimización de entregas
- **Importación inicial de archivos** con soporte para CSV
- **Componente de estadísticas básico** y vista de controles
- **Panel de feedback** y widget de Buy Me a Coffee
- **Tabla de feedback** y lógica de gestión básica

#### 🏗️ Arquitectura Inicial
- **Configuración inicial del proyecto** con herramientas modernas
- **Estructura base de componentes** y hooks
- **Sistema básico de navegación** y layouts

---

## 📋 Formato de Versiones

Este proyecto sigue [semantic Versioning](https://semver.org/):
- **MAYOR**: Cambios incompatibles
- **MENOR**: Nuevas funcionalidades compatibles
- **PATCH**: Correcciones de bugs

---

**Última actualización**: Octubre 2025
**Estado del proyecto**: ✅ Estable y listo para producción