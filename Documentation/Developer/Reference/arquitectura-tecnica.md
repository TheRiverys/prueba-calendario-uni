# 🏗️ Arquitectura Técnica

Esta sección documenta la arquitectura técnica completa de Academic Suite, incluyendo decisiones de diseño, estructura del código y tecnologías utilizadas.

## 🎯 Visión General Arquitectónica

```
┌─────────────────────────────────────────────────────────────────┐
│                        Aplicación React                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🎨 UI/UX Layer (Componentes React + Tailwind CSS 4)           │
│  ├─ Componentes reutilizables (/src/components/)                │
│  ├─ Vistas especializadas (/src/components/views/)             │
│  ├─ Sistema de diseño (/src/components/ui/)                    │
│  └─ Estilos y temas (/src/index.css)                           │
│                                                                 │
│  🧠 Business Logic Layer (Servicios y Hooks)                    │
│  ├─ Gestión de estado (/src/contexts/)                         │
│  ├─ Hooks personalizados (/src/hooks/)                         │
│  ├─ Servicios (/src/services/)                                 │
│  └─ Utilidades (/src/utils/)                                   │
│                                                                 │
│  💾 Data Layer (Supabase + Local Storage)                      │
│  ├─ Base de datos PostgreSQL (Supabase)                        │
│  ├─ Políticas RLS implementadas                                │
│  ├─ Sincronización local (/src/utils/storage.ts)               │
│  └─ Migraciones (/supabase/migrations/)                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Tecnologías Principales

### Frontend Framework

- **React 19.2.0**: Framework principal con hooks modernos
- **TypeScript 5.9.3**: Tipado estático completo
- **Vite 7.1.9**: Build tool y servidor de desarrollo

### Estilos y UI

- **Tailwind CSS 4.1.14**: Framework de utilidades CSS
- **Radix UI**: Componentes accesibles y headless
  - @radix-ui/react-dialog, @radix-ui/react-select, etc.
- **Lucide React 0.545.0**: Iconografía consistente

### Backend y Base de Datos

- **Supabase 2.74.0**: Backend como servicio
  - PostgreSQL como base de datos
  - Autenticación integrada
  - Storage para archivos
  - Real-time subscriptions

### Inteligencia Artificial

- **OpenAI API**: Integración para funcionalidades avanzadas
- **AI SDK**: Librería oficial para integración con OpenAI

### Desarrollo y Testing

- **Vitest 3.2.4**: Framework de testing moderno
- **ESLint 9.37.0**: Linting con reglas estrictas
- **Prettier 3.6.2**: Formateo automático de código

## 📁 Estructura del Código Fuente

### Organización por Responsabilidades

```
src/
├── components/           # Componentes React organizados por función
│   ├── ui/              # Componentes básicos reutilizables
│   ├── views/           # Vistas principales (Calendar, Gantt, List)
│   ├── gdpr/            # Componentes relacionados con privacidad
│   └── help/            # Sistema de ayuda integrado
├── contexts/            # Gestión de estado global
├── hooks/               # Hooks personalizados y utilidades
├── services/            # Lógica de negocio y servicios externos
├── utils/               # Utilidades puras y funciones helper
├── types/               # Definiciones de tipos TypeScript
└── features/            # Funcionalidades organizadas por dominio
    └── auth/            # Sistema de autenticación completo
```

### Patrón de Arquitectura: Feature-Based

Cada funcionalidad se organiza en módulos independientes:

```
src/features/auth/
├── components/          # Componentes específicos de auth
├── services/            # Servicios de autenticación
├── hooks/               # Hooks relacionados con auth
└── index.ts             # Barrel export para imports limpios
```

## 🎨 Sistema de Componentes

### Jerarquía de Componentes

#### Nivel 1: Layout Components

```typescript
// Componentes que definen la estructura general
-App.tsx - // Componente raíz de la aplicación
  Header.tsx - // Cabecera con navegación y acciones
  Views.tsx; // Coordinador de las diferentes vistas
```

#### Nivel 2: View Components

```typescript
// Vistas especializadas para diferentes representaciones
-CalendarView.tsx - // Vista de calendario mensual
  GanttView.tsx - // Diagrama de Gantt
  DeliveryList.tsx; // Lista tabular de entregas
```

#### Nivel 3: UI Components

```typescript
// Componentes reutilizables de bajo nivel
-Button.tsx - // Botón básico con variantes
  Input.tsx - // Campo de texto
  Select.tsx - // Selector desplegable
  Modal.tsx; // Ventana modal
```

### Sistema de Diseño

**Basado en Tailwind CSS 4**:

- **Design Tokens**: Colores, espaciado, tipografía definidos
- **Responsive First**: Diseño móvil primero
- **Dark Mode**: Soporte automático según sistema
- **Accesibilidad**: Cumple estándares WCAG

## 🧠 Gestión de Estado

### Context API Pattern

**Providers organizados jerárquicamente**:

```typescript
<App>
  <GdprProvider>           {/* Privacidad y cookies */}
    <AppProvider>          {/* Estado general de la app */}
      <AuthProvider>       {/* Información del usuario */}
        <DeliveriesProvider> {/* Gestión de entregas */}
          <ScheduleProvider> {/* Algoritmo de estudio */}
            {/* Aplicación */}
          </ScheduleProvider>
        </DeliveriesProvider>
      </AuthProvider>
    </AppProvider>
  </GdprProvider>
</App>
```

### Contextos Especializados

#### DeliveriesContext

```typescript
interface DeliveriesContextType {
  deliveries: Delivery[]; // Lista completa de entregas
  subjects: string[]; // Asignaturas únicas
  addDelivery: (delivery: Omit<Delivery, 'id'>) => void;
  updateDelivery: (id: string, updates: Partial<Delivery>) => void;
  deleteDelivery: (id: string) => void;
  toggleCompleted: (id: string) => void;
}
```

#### ScheduleContext

```typescript
interface ScheduleContextType {
  studySchedule: StudySchedule[]; // Planificación calculada
  calculateSchedule: () => void; // Ejecutar algoritmo
  stats: StudyStats; // Estadísticas calculadas
}
```

## 💾 Capa de Datos

### Estrategia de Persistencia

#### Supabase (Datos Remotos)

- **Autenticación**: Gestión de usuarios y sesiones
- **Base de datos**: PostgreSQL con políticas RLS
- **Storage**: Archivos y backups
- **Real-time**: Sincronización automática

#### Local Storage (Datos Locales)

- **Preferencias**: Configuración del usuario
- **Cache**: Datos frecuentemente accedidos
- **Offline**: Funcionalidad básica sin conexión

### Políticas de Seguridad (RLS)

**Tablas principales**:

- `deliveries`: Solo el usuario propietario puede acceder
- `user_configs`: Configuración personal por usuario
- `semester_starts`: Información académica privada

## 🔧 Utilidades y Servicios

### Organización de Utils

```
src/utils/
├── colors.ts            # Gestión de colores por asignatura
├── storage.ts           # Abstracción de localStorage
├── ics.ts              # Generación de archivos .ics
├── importers.ts         # Lógica de importación de archivos
└── config.ts           # Configuración por defecto
```

### Servicios Especializados

```
src/services/
├── ai.ts               # Integración con OpenAI
├── cookieConsent.ts    # Gestión de consentimiento GDPR
└── gdprDataService.ts  # Servicio de datos de privacidad
```

## 🎯 Algoritmo de Estudio

### Implementación Detallada

**Archivo principal**: `/src/services/buildStudySchedule.ts`

**Fases del algoritmo**:

1. **Preparación de datos**:
   - Filtrado de entregas válidas
   - Cálculo de días disponibles
   - Agrupación por asignaturas

2. **Asignación inicial**:
   - Distribución de días base por entrega
   - Aplicación de variaciones por prioridad
   - Cálculo de tiempo mínimo requerido

3. **Optimización**:
   - Redistribución de tiempo extra
   - Prevención de solapamientos críticos
   - Ajustes según modo seleccionado

**Modos disponibles**:

- **Normal**: Distribución equilibrada
- **Estricto**: Sin solapamientos, corte preciso
- **Ventana deslizante**: Asignación dinámica

## 🔒 Seguridad y Privacidad

### Implementación GDPR

**Componentes específicos**:

- `CookieConsentBanner`: Banner de consentimiento inicial
- `PrivacySettings`: Panel de control de privacidad
- `GdprRightsCard`: Información sobre derechos del usuario

**Características técnicas**:

- **Consentimiento granular**: Por tipo de cookie y funcionalidad
- **Derecho al olvido**: Eliminación completa de datos
- **Portabilidad**: Exportación de datos personales
- **Transparencia**: Logs de actividad detallados

## 🧪 Estrategia de Testing

### Organización de Tests

```
src/
├── __tests__/           # Tests de integración
│   ├── views/          # Tests de vistas principales
│   └── providers/      # Tests de contextos
└── components/
    └── __tests__/      # Tests unitarios por componente
```

### Tecnologías de Testing

- **Vitest**: Runner de tests moderno y rápido
- **React Testing Library**: Utilidades para testing de React
- **jsdom**: Entorno DOM simulado
- **Coverage**: Reportes de cobertura automáticos

### Tipos de Tests Implementados

1. **Unit Tests**: Funciones puras y utilidades
2. **Component Tests**: Renderizado y comportamiento de componentes
3. **Integration Tests**: Flujos completos de usuario
4. **E2E Tests**: Tests completos con Playwright (si aplica)

## 🚀 Despliegue y DevOps

### Estrategia de Build

**Comandos de producción**:

```bash
npm run build          # Build optimizado para producción
npm run preview        # Vista previa local de producción
```

**Optimizaciones aplicadas**:

- ✅ Tree shaking automático
- ✅ Code splitting por rutas
- ✅ Minificación y compresión
- ✅ Asset optimization

### Configuración de Producción

**Variables de entorno críticas**:

- `VITE_SUPABASE_URL`: URL del proyecto Supabase
- `VITE_SUPABASE_ANON_KEY`: Clave pública de acceso
- `VITE_OPENAI_API_KEY`: API key para funcionalidades IA (opcional)

## 📈 Performance y Optimización

### Técnicas Implementadas

#### Renderizado

- **Lazy Loading**: Carga diferida de componentes pesados
- **Suspense**: Indicadores de carga elegantes
- **Memoización**: Componentes optimizados con React.memo

#### Estado

- **Context Selectors**: Subscripciones granulares a cambios
- **Local State**: Estado aislado donde es apropiado
- **Immutable Updates**: Actualizaciones predecibles

#### Bundle

- **Code Splitting**: Separación automática por rutas
- **Dynamic Imports**: Carga bajo demanda
- **Tree Shaking**: Eliminación de código no utilizado

## 🔧 Configuración de Desarrollo

### ESLint Configuration

**Archivo**: `eslint.config.js`

**Reglas estrictas habilitadas**:

- `no-console`, `no-debugger`: Prohibición absoluta
- `react-hooks/exhaustive-deps`: Verificación estricta de dependencias
- Límites de complejidad y longitud de funciones

### Prettier Configuration

**Archivo**: `.prettierrc`

**Formato estricto**:

- Comillas simples obligatorias
- Punto y coma obligatorio
- Indentación de 2 espacios
- Líneas máximas de 120 caracteres

### Husky y Pre-commit Hooks

**Configuración automática**:

- Pre-commit: ESLint + Prettier
- Pre-push: Tests + build verification
- Mensajes de commit validados

## 📚 Documentación Técnica

### Fuentes de Documentación

1. **Comentarios en código**: Documentación inline completa
2. **Archivos README**: En cada directorio importante
3. **Tipos TypeScript**: Interfaces auto-documentadas
4. **Wiki/Issues**: Información adicional en el repositorio

### Convenciones de Código

#### Nombres

- **Componentes**: PascalCase (`CalendarView`)
- **Funciones/Hooks**: camelCase (`useDeliveries`)
- **Constantes**: SCREAMING_SNAKE_CASE (`API_BASE_URL`)
- **Archivos**: kebab-case (`calendar-view.tsx`)

#### Imports

- **Orden específico**: React → Librerías → Relativos
- **Agrupación lógica**: Separados por líneas en blanco
- **Paths absolutos**: Uso de `@/` para paths desde src/

---

**📚 Nivel**: Arquitecto/Desarrollador Senior
**🎯 Propósito**: Comprensión completa del sistema
**🔧 Mantenimiento**: Referencia para modificaciones futuras
