import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

// Configuración del modelo gpt-5-nano
const AI_MODEL = 'gpt-5-nano';

// Configuración por defecto
const DEFAULT_CONFIG = {
  minStudyTime: 2,
  baseStudyDays: 4,
  priorityVariations: {
    high: 1,
    normal: 0,
    low: -1,
  },
};

/**
 * Obtiene la configuración de la aplicación desde localStorage
 */
function getConfig() {
  try {
    const saved = localStorage.getItem('app-config');
    return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

/**
 * Crea el cliente OpenAI con la API key configurada
 */
function createOpenAIClient() {
  const config = getConfig();
  // Crear el cliente OpenAI con la API key configurada
  const client = createOpenAI({
    apiKey: config.openaiApiKey || undefined,
  });

  // Retornar el modelo específico
  return client(AI_MODEL);
}

/**
 * Servicio de IA para mejorar el algoritmo de programación de entregas
 */
export class AIService {
  /**
   * Genera un plan de estudio completo con fechas de inicio y fin para cada entrega
   */
  static async generateStudyPlan(
    deliveries: Array<{ subject: string; name: string; date: string; priority: string }>,
    semesterStart: string
  ): Promise<
    Array<{
      subject: string;
      name: string;
      deliveryDate: string;
      startDate: string;
      endDate: string;
      priority?: 'low' | 'normal' | 'high';
      estimatedHours: number;
    }>
  > {
    try {
      const config = getConfig();

      const baseStudyDaysValue =
        typeof config.baseStudyDays === 'number'
          ? config.baseStudyDays
          : (DEFAULT_CONFIG.baseStudyDays ?? 4);
      const baseStudyDays = Math.max(1, Math.round(baseStudyDaysValue));

      const prompt = `
        Eres un planificador académico que diseña horarios de estudio secuenciales sin solapamientos.

        Datos del semestre:
        - Inicio del semestre: ${semesterStart}
        - Días mínimos de estudio consecutivos por entrega: ${baseStudyDays}
        - Tiempo mínimo diario de estudio: ${config.minStudyTime} horas
        - Ajustes por prioridad (impactan la duración mínima):
          * Alta: +${config.priorityVariations.high} días
          * Normal: ${config.priorityVariations.normal} días
          * Baja: ${config.priorityVariations.low} días

        Entregas ordenadas por fecha y prioridad:
        ${deliveries.map((d, i) => `${i + 1}. ${d.subject}: ${d.name} (entrega: ${d.date}, prioridad actual: ${d.priority})`).join('\n')}

        Procedimiento para construir los bloques secuenciales:
        1. Trabaja con las entregas en orden cronológico; ante la misma fecha prioriza high sobre normal y normal sobre low.
        2. Para cada entrega calcula la ventana disponible:
           - inicioDisponible = bloqueAnteriorEnd + 1 día (o el inicio del semestre si es la primera).
           - finDisponible = fecha de entrega.
        3. Calcula la duración mínima del bloque: ${baseStudyDays} días + ajuste por prioridad + 2 días si el nombre contiene examen, final o proyecto.
        4. Si la ventana disponible ofrece días adicionales, distribuye esos días extendiendo los bloques hacia atrás (comenzando antes) para ocupar el intervalo completo sin dejar huecos. Reparte primero a las entregas de mayor prioridad o con menos margen restante.
        5. Nunca sobrepases la fecha de entrega: endDate debe ser <= finDisponible y startDate >= inicioDisponible.
        6. Mantén los bloques consecutivos: si quedan días libres inevitables, déjalos antes del siguiente bloque pero regístralo en el siguiente cálculo para minimizar huecos.
        7. Horas estimadas: elige un valor diario entre ${config.minStudyTime} y 6 horas, multiplícalo por la duración del bloque y redondea el total a un decimal.

        Reglas adicionales:
        - Usa todos los días posibles dentro de cada ventana para maximizar la preparación sin violar los mínimos ni las fechas de entrega.
        - Si el intervalo es más corto que la duración mínima, utiliza cada día disponible y fija endDate en la fecha de entrega.
        - Devuelve fechas en formato ISO (YYYY-MM-DD) y asegúrate de que los bloques queden ordenados por deliveryDate.

        Responde en JSON válido exactamente con este formato:
        {
          \"studyPlan\": [
            {
              \"subject\": \"materia\",
              \"name\": \"nombre de la entrega\",
              \"deliveryDate\": \"YYYY-MM-DD\",
              \"startDate\": \"YYYY-MM-DD\",
              \"endDate\": \"YYYY-MM-DD\",
              \"priority\": \"normal\",
              \"estimatedHours\": 3
            }
          ]
        }
      `;

      const result = await generateText({
        model: createOpenAIClient(),
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      });

      try {
        const parsed = JSON.parse(result.text);
        return parsed.studyPlan || [];
      } catch {
        return []; // fallback
      }
    } catch (error) {
      console.error('Error en IA de plan de estudio:', error);
      return []; // fallback
    }
  }

  /**
   * Convierte el plan de estudio en un horario diario detallado
   */
  static generateDetailedSchedule(
    studyPlan: Array<{
      subject: string;
      name: string;
      deliveryDate: string;
      startDate: string;
      endDate: string;
      priority?: 'low' | 'normal' | 'high';
      estimatedHours: number;
    }>
  ): Array<{ date: string; hours: number; subject: string; task: string }> {
    const schedule: Array<{ date: string; hours: number; subject: string; task: string }> = [];

    studyPlan.forEach((plan) => {
      const startDate = new Date(plan.startDate);
      const endDate = new Date(plan.endDate);
      const totalDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Distribuir las horas estimadas en los días disponibles
      const dailyHours = Math.min(plan.estimatedHours / totalDays, 6); // Máximo 6 horas por día

      let currentDate = new Date(startDate);
      let remainingHours = plan.estimatedHours;

      while (currentDate <= endDate && remainingHours > 0) {
        const hoursToday = Math.min(dailyHours, remainingHours);

        schedule.push({
          date: currentDate.toISOString().split('T')[0],
          hours: Math.round(hoursToday * 10) / 10, // Redondear a 1 decimal
          subject: plan.subject,
          task: `Trabajar en: ${plan.name}`,
        });

        remainingHours -= hoursToday;
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    // Ordenar por fecha
    return schedule.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Analiza el progreso y sugiere ajustes
   */
  static async analyzeProgress(
    completedDeliveries: Array<{ subject: string; completed: boolean; date: string }>,
    upcomingDeliveries: Array<{ subject: string; date: string; priority: string }>
  ): Promise<string> {
    try {
      const prompt = `
        Analiza el progreso académico y sugiere mejoras:

        Entregas completadas: ${completedDeliveries.length}
        Entregas pendientes: ${upcomingDeliveries.length}

        Detalles de completadas:
        ${completedDeliveries.map((d) => `- ${d.subject} (${d.date})`).join('\n')}

        Detalles de pendientes:
        ${upcomingDeliveries.map((d) => `- ${d.subject}: ${d.priority} (${d.date})`).join('\n')}

        Proporciona consejos específicos para mejorar la productividad y gestión del tiempo.
        Responde en español, de forma concisa pero útil.
      `;

      const result = await generateText({
        model: createOpenAIClient(),
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });

      return result.text;
    } catch (error) {
      console.error('Error en análisis de IA:', error);
      return 'Continúa trabajando sistemáticamente en tus entregas.'; // fallback
    }
  }
}
