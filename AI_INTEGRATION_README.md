# Integración de IA en el Calendario de Entregas

Esta aplicación ahora incluye integración con IA para mejorar la planificación y gestión de entregas universitarias.

## Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Configuración de IA
OPENAI_API_KEY=tu_clave_api_de_openai_aqui
```

### 2. Instalación de Dependencias

Las dependencias necesarias ya están instaladas:
- `ai` - Vercel AI SDK 5
- `@ai-sdk/openai` - Provider para OpenAI
- `zod` - Validación de esquemas

## Funcionalidades de IA

### 1. Recomendación de Prioridades
- **Modelo**: gpt-5-nano
- **Función**: Analiza entregas y sugiere niveles de prioridad (low, normal, high)
- **Ubicación**: `src/services/ai.ts` - `generatePriorityRecommendation`

### 2. Generación de Horarios de Estudio
- **Modelo**: gpt-5-nano
- **Función**: Crea horarios de estudio optimizados basados en deadlines y prioridades
- **Ubicación**: `src/services/ai.ts` - `generateStudySchedule`

### 3. Análisis de Progreso
- **Modelo**: gpt-5-nano
- **Función**: Proporciona consejos personalizados para mejorar la productividad
- **Ubicación**: `src/services/ai.ts` - `analyzeProgress`

## Arquitectura

### Orden de Preferencia
1. **Primero IA**: Se intenta usar el modelo de IA para generar recomendaciones
2. **Fallback al algoritmo**: Si la IA no devuelve resultados, se usa el algoritmo tradicional

### Archivos Principales

```
src/
├── services/
│   └── ai.ts              # Servicio principal de IA
├── hooks/
│   └── useAI.ts          # Hook para usar servicios de IA
├── contexts/
│   └── AppContext.tsx    # Contexto actualizado con funciones de IA
└── components/
    ├── AIControls.tsx    # Componente UI para controles de IA
    └── Controls.tsx      # Controles principales (integran AIControls)
```

## Hooks y Servicios

### useAI Hook
- Maneja el estado de loading y errores de IA
- Proporciona funciones wrapper para los servicios de IA

### AIService
- Clase estática con métodos para diferentes funcionalidades de IA
- Configurado específicamente para usar gpt-5-nano

## Componentes UI

### AIControls
- Interfaz para interactuar con las funcionalidades de IA
- Muestra resultados de análisis y recomendaciones
- Maneja estados de loading y errores

## Configuración del Modelo

El modelo `gpt-5-nano` está configurado en `src/services/ai.ts`:

```typescript
const AI_MODEL = 'gpt-5-nano';
```

## Uso

1. **Configurar clave API**: Agregar `OPENAI_API_KEY` en `.env.local`
2. **Usar la interfaz**: El componente `AIControls` aparece en la sección de controles
3. **Generar recomendaciones**: Hacer clic en "Generar Recomendaciones IA"
4. **Ver resultados**: La IA mostrará prioridades sugeridas, horarios y consejos

## Consideraciones

- **Privacidad**: Los datos se procesan localmente, solo se envían a OpenAI
- **Costos**: Cada llamada a la IA consume tokens de OpenAI
- **Fallback**: Siempre hay un algoritmo tradicional como respaldo
- **Personalización**: El modelo puede ajustarse cambiando `AI_MODEL`
