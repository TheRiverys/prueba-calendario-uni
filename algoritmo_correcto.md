# Especificación del motor de planificación (Gantt, Calendario y Lista)

Este documento define cómo debe funcionar el **motor de planificación** que alimenta varias vistas: **Gantt**, **Calendario** y **Lista**. El foco está en producir un plan determinista, justo y coherente con las prioridades del usuario, manteniendo reglas de calendario claras y un contrato de salida único que todas las vistas pueden consumir.

---

## Objetivo y alcance

- **Objetivo**: calcular para cada entrega un intervalo `[inicio, fin]` con conteo **inclusivo** de días (lunes a domingo, sin saltarse fines de semana ni laborables), respetando un **mínimo de días** por tarea, anclando el `fin` al `deadline` y **repartiendo la holgura** de forma global, ponderada por la **prioridad** definida por el usuario.
- **Alcance**: el motor es **agnóstico de la vista**. Las vistas (Gantt, Calendario, Lista) se limitan a representar el mismo resultado de planificación con distintos formatos.

---

## Entradas

1. **Fecha base**
   - `fechaInicioSemestre: Date` (definida por el usuario). Ninguna tarea puede empezar antes de esta fecha.

2. **Entregas**
   - Para cada entrega `Delivery`:
     ```ts
     { id: string, subject: string, name: string, date: ISODateString, priority: "alta" | "normal" | "baja" | string }
     ```
     `date` es la **fecha de entrega** (deadline, inclusiva).

3. **Configuración**
   - `MIN_DIAS` (p. ej. 4) — mínimo rígido por tarea.
   - `mapaPrioridad: Record<string, number>` — valores enteros (pueden ser negativos/positivos), p. ej. `{ alta: +3, normal: 0, baja: -2 }`.
   - `modoSecuencialEstricto: boolean` — si `true`, se intenta evitar solapes recortando **solo** los días añadidos por prioridad; si `false`, se permiten solapes.

4. **Reglas de calendario**
   - Se cuentan **días naturales** (lunes a domingo). No se excluyen fines de semana ni laborables.
   - Todas las fechas se **normalizan a medianoche** en la misma zona horaria para evitar errores por DST.
   - Conteo **inclusivo**: si `inicio=10/10` y `fin=13/10`, `duración=4`.

---

## Definiciones clave

- **Duración**: `duración = días(inicio, fin)`, conteo inclusivo.
- **Holgura de una tarea**: número de días que se puede **mover hacia atrás** su `inicio` sin cruzar `fechaInicioSemestre` (y sin mover `fin` más allá de su `deadline`).
- **Valor de prioridad**: modificador aditivo de la duración calculada por el motor; **no** altera el mínimo.

---

## Pipeline del algoritmo

1. **Normalización y filtrado**
   - Normaliza todas las fechas a medianoche.
   - Elimina entregas con `fechaEntrega < fechaInicioSemestre` (o clávalas al inicio si quieres listarlas como “no planificables”, pero no deben influir en el cálculo).

2. **Orden estable**
   - Ordena por `fechaEntrega` ascendente; desempates por **mayor valor de prioridad** y por `id` para determinismo.

3. **Asignación mínima (anclada a deadline)**
   - Para cada entrega: `fin = fechaEntrega`.
   - `inicio = max(fechaInicioSemestre, fin - (MIN_DIAS - 1))`.
   - Esto garantiza **mínimo** y **deadline** para todas; se permite solapamiento si no cabe en secuencial.

4. **Cálculo de holgura global**
   - Para cada tarea, holgura = días entre `fechaInicioSemestre` y el `inicio` actual (si es positivo).
   - Suma la **holgura total** disponible.

5. **Duración objetivo con prioridad**
   - Para cada tarea: `duracionObjetivo = duracionActual + mapaPrioridad[prioridad]`.
   - Aplica `duracionObjetivo = max(MIN_DIAS, duracionObjetivo)`.
   - Ninguna tarea podrá materializar una duración por encima de la holgura real disponible hacia atrás.

6. **Reparto de holgura ponderado por prioridad**
   - Reparte la holgura **día a día** moviendo `inicio` hacia atrás, priorizando mayor `valorPrioridad`.
   - Desempates: `fechaEntrega` más próxima; si persiste, `id`.
   - Nunca cruzar `fechaInicioSemestre`.
   - Si una tarea alcanza su `duracionObjetivo`, pasa a la siguiente elegible.
   - Si no hay holgura suficiente para todas, las de mayor `valorPrioridad` retienen más días.

7. **Reconciliación de conflictos (solo si es secuencial estricto)**
   - Detecta solapes día a día.
   - Recorta **primero los días ganados** (no el mínimo) de las tareas con **menor** `valorPrioridad` hasta eliminar solapes o hasta quedarse en `MIN_DIAS`.
   - Si aún hay conflicto, permite paralelismo (o marca advertencia de capacidad).

8. **Resultado final**
   - Para cada tarea, devuelve `{ inicio, fin, duracion }` coherentes con:
     - `fin = fechaEntrega`,
     - `inicio >= fechaInicioSemestre`,
     - `duracion >= MIN_DIAS`,
     - determinismo completo (misma entrada ⇒ mismo resultado).

---

## Contrato de salida para todas las vistas

El motor devuelve una lista de objetos `StudySchedule` que todas las vistas consumen por igual:

```ts
type StudySchedule = {
  id: string;
  subject: string;
  name: string;
  priority: string;
  startDate: Date;      // = inicio
  endDate: Date;        // = fin (deadline)
  durationDays: number; // inclusivo
  minDays: number;      // MIN_DIAS
  desiredExtraByPriority: number;  // mapaPrioridad[priority]
  achievedExtra: number;           // días realmente añadidos por reparto
  warning: boolean;     // true si no se alcanzó la duración objetivo o hubo recortes en secuencial estricto
};

### Uso por vistas

- **Vista Gantt**: una barra por `StudySchedule`, desde `startDate` hasta `endDate`. Se pueden resaltar `warning` y `achievedExtra`.
- **Vista Calendario**: evento de día completo para cada tarea cubriendo el rango `[startDate, endDate]`. Si el calendario requiere items diarios, generar una entrada por día dentro del rango.
- **Vista Lista**: ordenar por `endDate` (deadline) o por `startDate`. Mostrar `durationDays`, `minDays`, `desiredExtraByPriority` y `achievedExtra`, junto con la bandera `warning`.

---

## Propiedades y garantías

- **Deadline inmutable**: `endDate` nunca supera la `fechaEntrega`.
- **Límite inferior**: `startDate >= fechaInicioSemestre`.
- **Mínimo garantizado**: `durationDays >= MIN_DIAS`.
- **Prioridad como modificador**: actúa como **extra** sobre la duración, no sobre el mínimo.
- **Determinismo**: misma entrada ⇒ mismo resultado (orden, desempates y reparto fijos).
- **Sin picos arbitrarios**: toda variación proviene de holgura real + valor de prioridad.

---

## Pseudocódigo de referencia (continuación)


if (modoSecuencialEstricto) {
  // Detectar solapes y resolverlos
  while (existenSolapes()) {
    // Seleccionar el día con conflicto y las tareas implicadas
    const tareas = tareasEnConflictoOrdenadasPor(
      // primero menor valor de prioridad (ceden antes),
      // luego mayor holgura ganada,
      // luego id estable
    );

    for (const t of tareas) {
      if (t.durationDays > MIN_DIAS && t.achievedExtra > 0) {
        // recortar solo el extra conseguido por prioridad
        t.startDate = addDays(t.startDate, 1);
        t.durationDays -= 1;
        t.achievedExtra -= 1;
        if (!existenSolapesEnEseDia()) break;
      }
    }

    // Si persisten solapes tras recortar extras, permitir paralelismo o marcar warning global
    if (existenSolapes()) {
      marcarCapacidadInsuficiente();
      break;
    }
  }
}

// Postcondiciones:
assert(fin == deadline para todas);
assert(inicio >= fechaInicioSemestre para todas);
assert(durationDays >= MIN_DIAS para todas);
```
---

## Consideraciones para el hook (TypeScript/React)

- **Normalización de fechas**: usa `startOfDay` y opera con `differenceInCalendarDays` en **modo inclusivo** (`duración = diff + 1`).
- **Separación de fases**: 
  1) **Mínimo anclado a deadline** (no usa prioridad), 
  2) **Reparto de holgura** ponderado por prioridad, 
  3) **Resolución de solapes** solo si `modoSecuencialEstricto`.
- **Prioridad ≠ mínimo**: no mezclar el valor de prioridad con `MIN_DIAS`. La prioridad solo suma **extra** (duración objetivo).
- **Determinismo**: usa desempates estables (deadline, prioridad, id) también en el bucle de reparto.
- **Zonas horarias**: normaliza todas las fechas a medianoche en la **misma TZ** para evitar desfases por DST.
- **Paralelismo**: si el modo no es estricto, permite barras paralelas sin intentar “rellenar” huecos por defecto.

---

## Cambios recomendados en la API del hook

- Entrada de configuración:
  ```ts
  type PlanningConfig = {
    minDias: number; // MIN_DIAS
    mapaPrioridad: Record<string, number>;
    modoSecuencialEstricto?: boolean;
  }
  export type StudySchedule = {
  id: string;
  subject: string;
  name: string;
  priority: string;
  startDate: Date;      // inicio
  endDate: Date;        // fin (deadline)
  durationDays: number; // inclusivo: endDate - startDate + 1
  minDays: number;      
  desiredExtraByPriority: number; // mapaPrioridad[priority]
  achievedExtra: number;          // días añadidos realmente por reparto
  warning: boolean;               // true si duracion < objetivo o recortes por secuencial estricto
};

## Casos límite y tests de regresión

- Deadlines iguales: varias entregas con la misma fechaEntrega y diferentes prioridades; verificar reparto determinista.

- Cero holgura: fechaInicioSemestre casi pegada al primer deadline; todas deben quedarse en minDias y achievedExtra = 0.

- Prioridades negativas/positivas: { alta: +5, normal: 0, baja: -3 }; nunca bajar de minDias.

- Entregas no planificables: fechaEntrega < fechaInicioSemestre; no deben contaminar el cálculo del resto.

- Secuencial estricto: provocar solapes y verificar que se recorta solo el extra, empezando por menor valor de prioridad.

- Cambio de hora (DST): rangos que atraviesan DST; el conteo por días no debe variar.

- Holgura amplia: muchas semanas libres; comprobar reparto por prioridad estable (empates por deadline, luego id).

- Paralelismo (no estricto): permitir solapes sin warnings si se respetan minDias y deadline.

# Errores comunes a evitar

- Usar la prioridad para aumentar el mínimo en lugar de la duración extra.

- Expandir por defecto hasta “rellenar el hueco derecho” sin considerar prioridades ni holgura global.

- Mover endDate antes del deadline para encajar secuencialidad: el fin está anclado al deadline.

- No normalizar fechas a medianoche en la misma zona; provocar desfases de un día.

- Contar días de forma exclusiva (diff) en vez de inclusiva (diff + 1).

## Checklist de implementación

- Normalizar fechas (startOfDay) con la misma TZ.

- Filtrar tareas con deadline < fechaInicioSemestre (o marcarlas como no planificables).

- Orden estable: deadline ASC, valorPrioridad DESC, id ASC.

- Fase 1: asignar minDias anclado a deadline (fin = deadline).

- Fase 2: calcular holguras hacia atrás y repartir por prioridad hasta duracionObjetivo.

- Fase 3 (opcional): resolver solapes solo si modoSecuencialEstricto recortando extras.

- Exportar StudySchedule[] para todas las vistas.

- Tests de regresión para los 8 casos límite.