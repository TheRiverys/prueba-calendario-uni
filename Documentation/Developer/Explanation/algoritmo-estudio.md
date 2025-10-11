# 🧠 Algoritmo de Estudio - Análisis Técnico Detallado

Este documento proporciona un análisis técnico exhaustivo del algoritmo actual implementado en el sistema, basado en el código fuente real ubicado en `src/features/auth/study-planner/`.

## 🔍 Análisis Arquitectónico del Algoritmo Actual

El algoritmo actual se basa en una arquitectura de **tres fases principales** implementada en `buildStudySchedule.ts` y `computeSequentialDurations.ts`.

## 🏗️ Arquitectura Técnica Detallada

### Estructura de Archivos
```
src/features/auth/study-planner/
├── services/
│   ├── buildStudySchedule.ts        # Función principal de construcción
│   ├── computeSequentialDurations.ts # Núcleo del algoritmo matemático
│   └── studyScheduleService.test.ts  # Tests de integración
├── utils/
│   ├── priorityUtils.ts             # Utilidades de prioridad
│   └── dateUtils.ts                 # Normalización de fechas
└── types.ts                         # Tipos específicos del dominio
```

### Flujo de Ejecución

El algoritmo sigue una secuencia estricta de **4 etapas principales**:

1. **Preparación y Validación** (`buildStudySchedule`)
2. **Cálculo de Asignación Inicial** (`buildPlannedDeliveries`)
3. **Optimización Matemática** (`computeSequentialDurations`)
4. **Mapeo Final** (`mapAllocations`)

## 🔢 Fundamentos Matemáticos Reales

### Variables Principales (Implementación Actual)

#### Parámetros de Configuración (src/utils/config.ts)
```typescript
interface ConfigSettings {
  baseStudyDays: number;           // Valor por defecto: 4 días
  minStudyTime: number;            // Valor por defecto: 2 horas
  priorityVariations: {            // Sistema de prioridades actual
    high: number;                  // Valor por defecto: 1
    normal: number;                // Valor por defecto: 0
    low: number;                   // Valor por defecto: -1
  };
  allocationWindowDays: number;    // Ventana de asignación: 30 días
}
```

#### Fórmula de Cálculo de Prioridad (src/features/auth/study-planner/utils/priorityUtils.ts)
```typescript
const getPriorityValue = (priority: Priority, config?: ConfigSettings): number => {
  const variations = config?.priorityVariations ?? DEFAULT_PRIORITY_VARIATIONS;
  return variations[priority];  // Retorna valores numéricos directamente
};
```

### Algoritmo de Asignación Inicial

#### Paso 1: Preparación de Datos (buildStudySchedule:164-169)
```typescript
const minDays = Math.max(1, Math.round(config?.baseStudyDays ?? DEFAULT_BASE_STUDY_DAYS));

const plannedEligible = buildPlannedDeliveries(deliveries, effectiveStartDate, minDays).sort(
  comparePlanned(config)
);
```

**Función de comparación estable** (líneas 25-38):
```typescript
const comparePlanned = (config: ConfigSettings | undefined) =>
  (a: PlannedDelivery, b: PlannedDelivery): number => {
    const dueDiff = a.dueDate.getTime() - b.dueDate.getTime();
    if (dueDiff !== 0) {
      return dueDiff;  // Primero por fecha de entrega
    }
    const priorityA = getPriorityValue(a.delivery.priority, config);
    const priorityB = getPriorityValue(b.delivery.priority, config);
    if (priorityB !== priorityA) {
      return priorityB - priorityA;  // Luego por prioridad (mayor primero)
    }
    return a.delivery.id.localeCompare(b.delivery.id);  // Finalmente por ID
  };
```

#### Paso 2: Cálculo de Capacidades (computeSequentialDurations:27)
```typescript
const capacity = planned.map(plan => countInclusive(semesterStart, plan.dueDate));

const countInclusive = (start: Date, end: Date): number =>
  Math.max(1, differenceInCalendarDays(end, start) + 1);
```

### Algoritmo de Optimización Principal

#### Suma de Prefijos (líneas 29-35)
```typescript
const prefixSumAt = (idx: number): number => {
  let sum = 0;
  for (let position = 0; position <= idx; position += 1) {
    sum += durations[position];
  }
  return sum;
};
```

#### Función de Crecimiento (líneas 37-44)
```typescript
const canGrow = (candidateIdx: number, prefixEnd: number): boolean => {
  for (let index = candidateIdx; index <= prefixEnd; index += 1) {
    if (prefixSumAt(index) >= capacity[index]) {
      return false;
    }
  }
  return true;
};
```

#### Algoritmo de Asignación de Extras (líneas 46-109)
```typescript
const allocateExtra = (groupStart: number, groupEnd: number, amount: number) => {
  const windowDays = allocationConfig?.allocationWindowDays ?? 30;
  const groupDueDate = planned[groupEnd].dueDate;

  let remaining = amount;
  while (remaining > 0) {
    // Selección ponderada por prioridad y distancia temporal
    const candidates: Array<{ idx: number; weight: number; achieved: number }> = [];

    for (let iterator = groupStart; iterator < planned.length; iterator += 1) {
      const task = planned[iterator];

      if (!canGrow(iterator, groupEnd)) {
        continue;
      }

      const daysUntilDue = differenceInCalendarDays(task.dueDate, groupDueDate);
      if (daysUntilDue < 0 || daysUntilDue > windowDays) {
        if (daysUntilDue > windowDays) {
          break;
        }
        continue;
      }

      candidates.push({
        idx: iterator,
        weight: Math.max(0, desiredExtras[iterator]),
        achieved: achievedExtras[iterator],
      });
    }

    // Ordenación por prioridad, logros alcanzados y fecha
    candidates.sort((first, second) => {
      if (second.weight !== first.weight) {
        return second.weight - first.weight;  // Mayor prioridad primero
      }
      if (first.achieved !== second.achieved) {
        return first.achieved - second.achieved;  // Menos logrados primero
      }
      const dueDiff = planned[first.idx].dueDate.getTime() - planned[second.idx].dueDate.getTime();
      if (dueDiff !== 0) {
        return dueDiff;  // Más próximas primero
      }
      return planned[first.idx].delivery.id.localeCompare(planned[second.idx].delivery.id);
    });

    const chosen = candidates[0].idx;
    if (!canGrow(chosen, groupEnd)) {
      break;
    }

    durations[chosen] += 1;
    achievedExtras[chosen] += 1;
    remaining -= 1;
  }
};
```

#### Algoritmo de Recorte de Extras (líneas 111-151)
```typescript
const trimExtras = (prefixEnd: number, deficit: number): number => {
  let remaining = deficit;
  while (remaining < 0) {
    const candidates: Array<{ idx: number; weight: number; achieved: number }> = [];
    for (let iterator = 0; iterator <= prefixEnd; iterator += 1) {
      if (achievedExtras[iterator] > 0 && durations[iterator] > planned[iterator].minDays) {
        candidates.push({
          idx: iterator,
          weight: desiredExtras[iterator],
          achieved: achievedExtras[iterator],
        });
      }
    }

    if (candidates.length === 0) {
      break;
    }

    // Ordenación inversa: menor prioridad primero para recortar
    candidates.sort((first, second) => {
      if (first.weight !== second.weight) {
        return first.weight - second.weight;  // Menor prioridad primero
      }
      if (second.achieved !== first.achieved) {
        return second.achieved - first.achieved;  // Más logrados primero
      }
      const dueDiff = planned[second.idx].dueDate.getTime() - planned[first.idx].dueDate.getTime();
      if (dueDiff !== 0) {
        return dueDiff;
      }
      return planned[first.idx].delivery.id.localeCompare(planned[second.idx].delivery.id);
    });

    const chosen = candidates[0].idx;
    durations[chosen] -= 1;
    achievedExtras[chosen] -= 1;
    remaining += 1;
  }

  return remaining;
};
```

### Algoritmo de Procesamiento por Grupos (líneas 153-175)

```typescript
let groupStart = 0;
while (groupStart < n) {
  let groupEnd = groupStart;
  const groupDue = planned[groupStart].dueDate.getTime();

  // Agrupar tareas con mismo deadline
  while (groupEnd + 1 < n && planned[groupEnd + 1].dueDate.getTime() === groupDue) {
    groupEnd += 1;
  }

  const slack = capacity[groupEnd] - prefixSumAt(groupEnd);

  if (slack < 0) {
    // Recortar extras si hay déficit
    const remainingDeficit = trimExtras(groupEnd, slack);
    if (remainingDeficit < 0) {
      for (let idx = 0; idx <= groupEnd; idx += 1) {
        warnings[idx] = true;
      }
    }
  } else if (slack > 0) {
    // Asignar extras disponibles
    allocateExtra(groupStart, groupEnd, slack, config);
  }

  groupStart = groupEnd + 1;
}
```

## 🎯 Propósito del Algoritmo

El algoritmo resuelve el **problema de optimización de tiempo de estudio** considerando:

- ⏰ **Restricciones temporales**: Fechas límite fijas (deadline inmutable)
- 📚 **Carga académica variable**: Diferentes tipos de entregas con requisitos mínimos
- 🧠 **Capacidad cognitiva**: Límites matemáticos de distribución temporal
- 📊 **Prioridades diferenciadas**: Sistema de pesos numéricos para importancia relativa

## 📊 Análisis de Complejidad y Rendimiento

### Complejidad Algorítmica

#### Función `computeSequentialDurations` (línea 12-178)

**Complejidad temporal**: O(n²) en el peor caso, donde n es el número de entregas

- **Bucle principal** (línea 154): O(n) iteraciones
- **Función `allocateExtra`** (línea 46): Dentro de cada iteración del grupo, itera sobre todas las tareas restantes: O(n)
- **Función `trimExtras`** (línea 111): Similar complejidad O(n) en cada iteración
- **Función `prefixSumAt`** (línea 29): O(n) para cada cálculo de suma de prefijos

**Complejidad espacial**: O(n) para arrays auxiliares (durations, warnings, desiredExtras, achievedExtras)

#### Función `buildStudySchedule` (línea 143-227)

**Complejidad temporal**: O(n log n) debido al ordenamiento, más O(n) para el procesamiento

**Complejidad espacial**: O(n) para estructuras de datos intermedias

### Limitaciones Técnicas Identificadas

#### 1. Problema de Agrupación por Deadline
```typescript
// Líneas 233-236: Solo agrupa tareas con deadline exactamente igual
while (groupEnd + 1 < n && planned[groupEnd + 1].dueDate.getTime() === groupDue) {
  groupEnd += 1;
}
```
**Limitación**: No considera tareas que podrían beneficiarse de agrupación por proximidad temporal, solo igualdad exacta de timestamps.

#### 2. Ventana de Asignación Fija
```typescript
// Línea 123: Ventana fija de 30 días
const windowDays = allocationConfig?.allocationWindowDays ?? 30;
```
**Limitación**: No adapta dinámicamente la ventana según la distribución temporal de las tareas.

#### 3. Sistema de Prioridades Relativo
```typescript
// Líneas 47-50: Valores relativos, no absolutos
const DEFAULT_PRIORITY_VARIATIONS = {
  high: 1,    // +1 día adicional
  normal: 0,  // Sin días adicionales
  low: -1     // -1 día (puede llegar a mínimo)
};
```
**Limitación**: Las prioridades bajas pueden llegar al mínimo absoluto, haciendo el sistema menos granular.

## 🔬 Comparación con Especificación "Algoritmo Correcto"

### Diferencias Críticas Identificadas

#### 1. **Anclaje del Deadline** ✅ IMPLEMENTADO CORRECTAMENTE
```typescript
// Líneas 76-82: El deadline es inmutable
const effectiveEnd = (() => {
  if (!nextAvailableEnd) {
    return new Date(dueTime);
  }
  const candidate = Math.min(dueTime, nextAvailableEnd.getTime());
  return new Date(candidate);
})();
```
**Estado**: ✅ Cumple con la especificación - el `endDate` nunca supera el deadline.

#### 2. **Mínimo Garantizado** ✅ IMPLEMENTADO CORRECTAMENTE
```typescript
// Líneas 187-188: Siempre respeta minDays
if (achievedExtras[iterator] > 0 && durations[iterator] > planned[iterator].minDays) {
  // Solo recorta si tiene días adicionales y está por encima del mínimo
}
```
**Estado**: ✅ Cumple con la especificación - nunca baja del mínimo establecido.

#### 3. **Procesamiento por Grupos** ⚠️ PARCIALMENTE IMPLEMENTADO
```typescript
// Líneas 233-236: Solo agrupa por deadline exacto
while (groupEnd + 1 < n && planned[groupEnd + 1].dueDate.getTime() === groupDue) {
  groupEnd += 1;
}
```
**Estado**: ⚠️ Parcial - solo agrupa tareas con deadline idéntico, no por proximidad como sugiere la especificación.

#### 4. **Modo Secuencial Estricto** ❌ NO IMPLEMENTADO
La especificación requiere un modo que evite solapamientos recortando solo días adicionales, pero el algoritmo actual no tiene esta funcionalidad.

#### 5. **Reparto Ponderado por Prioridad** ✅ IMPLEMENTADO CORRECTAMENTE
```typescript
// Líneas 154-166: Ordenación correcta por prioridad
candidates.sort((first, second) => {
  if (second.weight !== first.weight) {
    return second.weight - first.weight;  // Mayor prioridad primero
  }
  // ... resto de criterios de desempate
});
```
**Estado**: ✅ Cumple con la especificación - reparte holgura priorizando tareas de mayor valor.

## 🔢 Fundamentos Matemáticos

### Variables Principales

#### Parámetros de Entrada
```typescript
interface AlgorithmInput {
  deliveries: Delivery[];           // Entregas a planificar
  baseStudyDays: number;            // Días base por entrega (ej: 3)
  priorityVariations: {             // Variaciones por prioridad
    high: number;                   // Multiplicador para alta (ej: 1.5)
    normal: number;                 // Multiplicador para normal (ej: 1.0)
    low: number;                    // Multiplicador para baja (ej: 0.7)
  };
  allocationWindowDays?: number;    // Ventana de asignación (ej: 30)
}
```

#### Función Objetivo

**Minimizar**:
```
f(x) = Σ(wasted_days) + Σ(overlapping_penalties)
```

**Sujeto a**:
```
deadline_constraint: finish_date ≤ deadline
capacity_constraint: daily_study_hours ≤ max_daily_hours
priority_constraint: high_priority_items ≥ normal_priority_items ≥ low_priority_items
```

## 🏗️ Arquitectura del Algoritmo

### Fases de Procesamiento

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Fase 1:       │    │    Fase 2:       │    │   Fase 3:       │
│   Preparación   │───▶│   Asignación     │───▶│  Optimización   │
│     de Datos    │    │     Inicial      │    │   y Ajustes     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Fase 1: Preparación de Datos

#### Limpieza y Validación

```typescript
// Filtrar entregas válidas
const validDeliveries = deliveries.filter(d =>
  d.date && new Date(d.date) > new Date() && !d.completed
);

// Calcular días disponibles hasta cada deadline
const deliveriesWithDays = validDeliveries.map(delivery => ({
  ...delivery,
  daysUntilDeadline: Math.ceil(
    (new Date(delivery.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )
}));
```

#### Agrupación por Asignaturas

**Problema**: Múltiples entregas de la misma asignatura pueden requerir tiempo compartido.

**Solución**: Crear grupos lógicos por asignatura considerando dependencias naturales.

### Fase 2: Asignación Inicial

#### Cálculo de Días Base

**Fórmula básica**:
```
días_asignados = base_study_days × priority_multiplier
```

**Ejemplo práctico**:
```typescript
const baseAssignment = (delivery: Delivery, config: ConfigSettings) => {
  const priorityMultiplier = config.priorityVariations[delivery.priority];
  return Math.max(1, Math.floor(config.baseStudyDays * priorityMultiplier));
};
```

#### Distribución Temporal

**Estrategias de distribución**:

1. **Distribución uniforme**:
   ```
   Día 1: 33% del tiempo
   Día 2: 33% del tiempo
   Día 3: 34% del tiempo
   ```

2. **Distribución decreciente**:
   ```
   Día 1: 50% del tiempo (más esfuerzo inicial)
   Día 2: 30% del tiempo
   Día 3: 20% del tiempo (revisión final)
   ```

### Fase 3: Optimización y Ajustes

#### Algoritmo de Ventana Deslizante

**Para entregas con ventana de asignación limitada**:

```typescript
const slidingWindowAllocation = (deliveries: Delivery[], windowDays: number) => {
  const sortedDeliveries = [...deliveries].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (let i = 0; i < sortedDeliveries.length; i++) {
    const current = sortedDeliveries[i];
    const windowStart = new Date(current.date);
    windowStart.setDate(windowStart.getDate() - windowDays);

    // Redistribuir tiempo dentro de la ventana
    const windowDeliveries = sortedDeliveries.filter(d =>
      new Date(d.date) >= windowStart && new Date(d.date) <= new Date(current.date)
    );

    redistributeWindowTime(windowDeliveries);
  }
};
```

#### Prevención de Solapamientos

**Detección de conflictos**:
```typescript
const detectOverlaps = (schedule: StudySchedule[]) => {
  const overlaps: Array<{delivery1: StudySchedule, delivery2: StudySchedule}> = [];

  for (let i = 0; i < schedule.length; i++) {
    for (let j = i + 1; j < schedule.length; j++) {
      const d1 = schedule[i];
      const d2 = schedule[j];

      if (datesOverlap(d1.startDate, d1.endDate, d2.startDate, d2.endDate)) {
        overlaps.push({delivery1: d1, delivery2: d2});
      }
    }
  }

  return overlaps;
};
```

## 🎛️ Modos de Funcionamiento

### Modo Normal

**Características**:
- ✅ Permite solapamientos menores
- ✅ Distribución equilibrada de carga
- ✅ Más tiempo para entregas importantes
- ❌ Puede generar algo de estrés acumulado

**Uso recomendado**: Estudiantes con buena gestión del tiempo

### Modo Estricto

**Características**:
- ✅ Sin solapamientos temporales
- ✅ Carga perfectamente distribuida
- ✅ Respeta límites cognitivos diarios
- ❌ Puede requerir más tiempo total

**Uso recomendado**: Estudiantes con dificultades de concentración

### Modo Ventana Deslizante

**Características**:
- ✅ Asignación dinámica según proximidad
- ✅ Enfoque en entregas inmediatas
- ✅ Adaptable a cambios de último momento
- ❌ Puede descuidar planificación a largo plazo

**Uso recomendado**: Estudiantes con cargas variables

## 📊 Métricas y Estadísticas

### Métricas Calculadas

#### Estadísticas Básicas
```typescript
interface StudyStats {
  total: number;           // Total de entregas
  upcoming: number;        // Próximas 7 días
  overdue: number;         // Vencidas
  thisWeek: number;        // Esta semana
}
```

#### Métricas Avanzadas
```typescript
interface DetailedStats {
  averageStudyDays: number;        // Días promedio asignados
  maxDailyLoad: number;            // Máxima carga diaria
  minDailyLoad: number;            // Mínima carga diaria
  standardDeviation: number;       // Variabilidad de carga
  efficiencyScore: number;         // Eficiencia general (0-100)
}
```

### Cálculo de Eficiencia

**Fórmula de eficiencia**:
```
eficiencia = (tiempo_utilizado / tiempo_disponible) × 100
```

**Factores considerados**:
- 📅 Distribución temporal adecuada
- 🎯 Respeto a prioridades asignadas
- ⚖️ Balance de carga cognitiva
- ⏰ Cumplimiento de deadlines

## 🔧 Configuración Avanzada

### Parámetros Configurables

#### Días Base de Estudio
```typescript
// Tiempo mínimo recomendado por entrega
const BASE_STUDY_DAYS = {
  MIN: 1,           // Mínimo absoluto
  DEFAULT: 3,       // Valor por defecto
  MAX: 14           // Máximo recomendado
};
```

#### Variaciones por Prioridad
```typescript
const PRIORITY_VARIATIONS = {
  LOW: 0.7,         // 70% del tiempo base
  NORMAL: 1.0,      // 100% del tiempo base
  HIGH: 1.5         // 150% del tiempo base
};
```

#### Límites Cognitivos
```typescript
const COGNITIVE_LIMITS = {
  MAX_DAILY_HOURS: 8,      // Máximo recomendado por día
  MAX_WEEKLY_HOURS: 40,    // Máximo por semana
  MIN_BREAK_HOURS: 0.5     // Descanso mínimo entre sesiones
};
```

## 🧪 Casos de Estudio

### Caso 1: Estudiante con Exámenes Finales

**Entrada**:
- 3 exámenes finales (prioridad alta) en 2 semanas
- 2 trabajos regulares (prioridad normal)
- 1 lectura opcional (prioridad baja)

**Funcionamiento del algoritmo**:
- **Ordena por fecha y prioridad**: Exámenes primero por fecha, luego trabajos, finalmente lecturas
- **Calcula ventanas disponibles**: Desde inicio del semestre hasta cada deadline
- **Asigna días base + variaciones**: Alta prioridad = más días, baja prioridad = menos días
- **Distribución secuencial**: Evita solapamientos, asigna bloques consecutivos
- **Resultado típico**: Carga intensa al principio, relajación final

### Caso 2: Proyecto Largo con Entregas Intermedias

**Entrada**:
- Proyecto final (prioridad alta) - deadline en 6 semanas
- 3 entregas parciales (prioridad normal) - semanales
- 2 prácticas semanales (prioridad baja)

**Resultado esperado**:
- **Proyecto final**: Distribución uniforme de 8-10 días
- **Entregas parciales**: 2-3 días cada una
- **Prácticas**: 1 día cada una, en paralelo con otras tareas

## 🔬 Validación y Testing

### Estrategia de Testing

#### Tests Unitarios
```typescript
describe('Study Algorithm', () => {
  test('should assign more days to high priority items', () => {
    const highPriority = createMockDelivery('high', 7);
    const lowPriority = createMockDelivery('low', 7);

    const schedule = calculateSchedule([highPriority, lowPriority]);

    expect(schedule[0].allocatedDays).toBeGreaterThan(schedule[1].allocatedDays);
  });
});
```

#### Tests de Integración
- Validación completa de flujo de cálculo
- Verificación de constraints temporales
- Tests de performance con datasets grandes

## 🚀 Mejoras Futuras

### Optimizaciones Potenciales

#### Machine Learning
- **Aprendizaje de hábitos**: Adaptar algoritmo según comportamiento histórico
- **Predicción de rendimiento**: Ajustar según métricas personales
- **Optimización genética**: Evolución automática de parámetros

#### Nuevas Características
- **Dependencias entre tareas**: Considerar prerequisitos
- **Tiempo de contexto**: Switching cost entre asignaturas
- **Fatiga cognitiva**: Modelo de atención decreciente

#### Integraciones Externas
- **Calendarios externos**: Importar eventos de Google Calendar
- **Herramientas de productividad**: Integración con Notion, Todoist
- **Métricas biomédicas**: Ritmo cardíaco, calidad de sueño

## 📚 Referencias Académicas

### Algoritmos Relacionados

1. **Knapsack Problem**: Optimización de recursos limitados
2. **Job Scheduling**: Asignación óptima de tareas temporales
3. **Resource Allocation**: Distribución eficiente de tiempo

### Investigación Relacionada

- **Cognitive Load Theory**: Límites de procesamiento mental
- **Spaced Repetition**: Técnicas de retención óptima
- **Pomodoro Technique**: Gestión de sesiones de estudio

---

**🎓 Nivel**: Desarrollador avanzado / Investigador
**🧠 Propósito**: Comprensión profunda del algoritmo
**🔬 Aplicación**: Mejora y extensión del sistema
