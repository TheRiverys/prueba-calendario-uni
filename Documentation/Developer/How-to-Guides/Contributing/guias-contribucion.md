# 🤝 Guía de Contribución

Esta guía detallada explica cómo contribuir al proyecto Academic Suite, desde reportar bugs hasta implementar nuevas funcionalidades.

## 🎯 Filosofía del Proyecto

### Principios Rectores

**Valores fundamentales**:

- 🎓 **Enfoque estudiantil**: Siempre priorizar la experiencia del estudiante
- 🔒 **Privacidad primero**: Protección estricta de datos personales
- ♿ **Accesibilidad universal**: Diseño inclusivo para todos los usuarios
- 🚀 **Performance crítica**: Aplicación rápida y responsiva
- 📚 **Documentación excelente**: Código y funcionalidades bien documentados

**Compromisos de calidad**:

- ✅ **Código revisado**: Todas las contribuciones requieren revisión
- 🧪 **Tests incluidos**: Nueva funcionalidad debe incluir tests
- 📋 **Cumple estándares**: ESLint, Prettier y convenciones del proyecto
- 🔄 **CI/CD automático**: Verificaciones automáticas antes de merge

## 🚀 Primeros Pasos

### 1. Configuración del Entorno

#### Requisitos Previos

```bash
# Node.js 18+ (LTS recomendado)
node --version  # Debe mostrar 18.x.x o superior

# Git configurado
git --version   # Cualquier versión reciente

# Editor recomendado: VS Code con extensiones
# - ES7+ React/Redux/React-Native snippets
# - Prettier - Code formatter
# - ESLint
# - Tailwind CSS IntelliSense
```

#### Fork y Clone

```bash
# Fork el repositorio en GitHub primero

# Clonar tu fork
git clone https://github.com/TU-USUARIO/calendario-entregas-uni.git
cd calendario-entregas-uni

# Añadir upstream para sincronizar
git remote add upstream https://github.com/ORIGINAL/calendario-entregas-uni.git
```

### 2. Instalación y Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar desarrollo (con hot reload)
npm run dev

# Ejecutar tests
npm run test

# Verificar linting
npm run lint
```

## 🔍 Entendiendo el Código

### Arquitectura General

**Estructura recomendada**:

```
src/
├── components/          # Componentes React organizados
│   ├── ui/             # Componentes básicos reutilizables
│   ├── views/          # Vistas principales (Calendar, Gantt, List)
│   └── features/       # Funcionalidades específicas
├── contexts/           # Gestión de estado global
├── hooks/              # Hooks personalizados
├── services/           # Lógica de negocio externa
├── utils/              # Utilidades puras
└── types/              # Definiciones TypeScript
```

### Convenciones de Código

#### Nombres y Estilos

```typescript
// ✅ Componentes: PascalCase
const CalendarView: React.FC<Props> = () => {};

// ✅ Funciones/Hooks: camelCase
const useDeliveries = () => {};

// ✅ Constantes: SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';

// ❌ Archivos: kebab-case (calendar-view.tsx)
```

#### Imports Ordenados

```typescript
// 1. React y librerías externas
import React from 'react';
import { useState } from 'react';

// 2. Librerías internas (@/ alias)
import { Button } from '@/components/ui/button';
import { useDeliveriesContext } from '@/contexts/deliveries/DeliveriesContext';

// 3. Archivos locales
import { helperFunction } from '../utils/helpers';
```

## 💻 Tipos de Contribuciones

### 🐛 Reportar Bugs

**Proceso estructurado**:

1. **Reproducir el problema** sistemáticamente
2. **Buscar issues existentes** para evitar duplicados
3. **Crear issue detallado** con plantilla específica

**Plantilla recomendada**:

```markdown
## Descripción del Bug

[Descripción clara y concisa]

## Pasos para Reproducir

1. Paso 1
2. Paso 2
3. Paso 3

## Comportamiento Esperado

[Qué debería pasar]

## Comportamiento Actual

[Qué pasa realmente]

## Información del Entorno

- Sistema Operativo:
- Navegador:
- Versión de la aplicación:
- Otros detalles relevantes

## Capturas de Pantalla

[Adjuntar imágenes si aplica]
```

### ✨ Sugerir Mejoras

**Proceso estructurado**:

1. **Definir problema claramente**
2. **Proponer solución específica**
3. **Considerar impacto en usuarios**
4. **Evaluar viabilidad técnica**

### 🚀 Implementar Funcionalidades

**Proceso completo**:

#### 1. Planificación

- **Crear issue** describiendo la funcionalidad
- **Discutir enfoque** con mantenedores
- **Definir alcance** (MVP vs versión completa)

#### 2. Desarrollo

```bash
# Crear rama específica
git checkout -b feature/nueva-funcionalidad

# Desarrollar incrementalmente
# Commits pequeños y frecuentes

# Ejecutar tests frecuentemente
npm run test

# Verificar linting
npm run lint
```

#### 3. Testing

- **Tests unitarios** para funciones puras
- **Tests de componentes** para UI
- **Tests de integración** para flujos completos
- **Tests manuales** para validar UX

#### 4. Documentación

- **Comentarios en código** claros y útiles
- **Documentación de usuario** si aplica nueva funcionalidad
- **Ejemplos de uso** cuando corresponda

## 🔧 Flujo de Trabajo

### Ramas y Commits

**Estrategia de ramas**:

```bash
# Ramas principales
main           # Código estable
develop        # Desarrollo activo

# Ramas de trabajo
feature/nueva-funcionalidad     # Nuevas características
bugfix/descripcion-corta        # Corrección de bugs
hotfix/problema-critico         # Correcciones urgentes
```

**Commits convencionales**:

```bash
# Formato requerido
tipo(scope): descripción corta

# Ejemplos
feat(auth): añadir sistema de login con Supabase
fix(calendar): corregir cálculo de fechas en calendario
docs(readme): actualizar instrucciones de instalación
test(utils): añadir tests para función de colores
```

### Proceso de Pull Request

#### 1. Preparación

```bash
# Asegurar rama actualizada
git fetch upstream
git rebase upstream/main

# Ejecutar verificaciones finales
npm run test
npm run lint
npm run build

# Push a tu fork
git push origin feature/tu-funcionalidad
```

#### 2. Crear Pull Request

**Información requerida**:

- ✅ **Título claro** y descriptivo
- ✅ **Descripción detallada** del problema y solución
- ✅ **Referencia al issue** relacionado (#123)
- ✅ **Capturas de pantalla** si aplica cambios visuales
- ✅ **Tests incluidos** o explicación de por qué no aplican

**Plantilla recomendada**:

```markdown
## Descripción

[Problema que resuelve y solución implementada]

## Cambios Realizados

- Cambio 1: descripción específica
- Cambio 2: descripción específica
- Cambio 3: descripción específica

## Tests Añadidos

- [ ] Test unitario para nueva función
- [ ] Test de integración para flujo completo
- [ ] Test manual realizado exitosamente

## Capturas de Pantalla

[Antes/Después si aplica]

## Issues Relacionados

Closes #123
Relacionado con #456
```

#### 3. Revisión y Aprobación

**Proceso de revisión**:

1. **Revisión automática** (GitHub Actions)
2. **Revisión por pares** (mantenedores del proyecto)
3. **Comentarios y sugerencias** para mejoras
4. **Aprobación final** y merge automático

## 🧪 Estrategias de Testing

### Tipos de Tests

#### Unit Tests

```typescript
// Ejemplo: src/utils/__tests__/colors.test.ts
describe('pickColorForSubject', () => {
  test('should assign different colors to different subjects', () => {
    const color1 = pickColorForSubject('Matemáticas', []);
    const color2 = pickColorForSubject('Física', []);

    expect(color1).not.toBe(color2);
  });
});
```

#### Component Tests

```typescript
// Ejemplo: src/components/__tests__/Button.test.tsx
describe('Button Component', () => {
  test('should render children correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

#### Integration Tests

```typescript
// Ejemplo: src/__tests__/views/CalendarView.test.tsx
describe('Calendar View Integration', () => {
  test('should display deliveries in calendar format', () => {
    // Setup complejo con datos reales
    // Verificación de flujo completo
  });
});
```

### Ejecución de Tests

```bash
# Ejecutar todos los tests
npm run test

# Con cobertura detallada
npm run test:coverage

# Tests en modo watch (desarrollo)
npm run test:watch

# Tests específicos
npm run test CalendarView
```

## 📚 Documentación

### Documentación de Código

**Comentarios efectivos**:

````typescript
/**
 * Calcula el color óptimo para una asignatura considerando colores existentes.
 *
 * @param subjectName - Nombre de la asignatura
 * @param existingColors - Array de colores ya utilizados
 * @returns Color en formato hexadecimal
 *
 * @example
 * ```typescript
 * const color = pickColorForSubject('Matemáticas', ['#ff0000']);
 * console.log(color); // '#00ff00' (verde, diferente al rojo existente)
 * ```
 */
export const pickColorForSubject = (
  subjectName: string,
  existingColors: string[]
): string => {
  // Implementación...
};
````

### Documentación de Usuario

**Para nuevas funcionalidades**:

1. **Crear guía específica** en `/Documentation/User/`
2. **Actualizar guía de inicio rápido** si aplica
3. **Añadir ejemplos prácticos** en `/Documentation/Examples/`
4. **Actualizar FAQ** con preguntas comunes

## 🔒 Seguridad y Privacidad

### Consideraciones Especiales

**Para funcionalidades nuevas**:

- 🔐 **Revisión de seguridad** obligatoria
- 📋 **Impacto en privacidad** evaluado
- 🧪 **Tests de seguridad** incluidos
- 📚 **Documentación de permisos** clara

**Ejemplos críticos**:

- ✅ **Autenticación**: Siempre revisar implementación de auth
- ✅ **Almacenamiento**: Verificar políticas RLS en Supabase
- ✅ **Datos sensibles**: Encriptación adecuada
- ✅ **Permisos**: Principio de menor privilegio

## 🚀 Después del Merge

### Tareas Post-Merge

1. **Cerrar issue relacionado** automáticamente (si aplica)
2. **Actualizar documentación** si hay cambios significativos
3. **Comunicar cambios** a usuarios si afecta experiencia
4. **Monitorear métricas** para detectar problemas tempranos

### Mantenimiento Continuo

**Responsabilidades del contribuidor**:

- 🔍 **Monitorear issues** relacionados con tu contribución
- 🐛 **Corregir bugs** reportados en tu código
- 📚 **Mantener documentación** actualizada
- 🚀 **Mejorar implementación** basada en feedback

## 🏆 Mejores Prácticas

### Desarrollo Efectivo

1. **Commits pequeños y frecuentes** (no commits masivos)
2. **Tests antes de código** (TDD cuando aplica)
3. **Documentación junto con código** (no al final)
4. **Feedback temprano** (preguntar dudas pronto)

### Comunicación Clara

1. **Issues descriptivos** con contexto completo
2. **PRs enfocados** en un problema específico
3. **Comentarios constructivos** en revisiones
4. **Actualizaciones regulares** sobre progreso

### Calidad de Código

1. **SOLID principles** aplicados estrictamente
2. **DRY principle** (Don't Repeat Yourself)
3. **Funciones puras** cuando sea posible
4. **Tipos estrictos** de TypeScript

---

**🎯 Nivel**: Desarrollador principiante a avanzado
**⏱️ Tiempo estimado**: Variable según contribución
**📋 Prerrequisitos**: Conocimientos básicos de Git y desarrollo web
