import { useState, useCallback } from 'react';
import { AIService } from '../services/ai';
import type { Delivery } from '../types';

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateStudyPlan = useCallback(
    async (
      deliveries: Delivery[],
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
    > => {
      setIsLoading(true);
      setError(null);

      try {
        return await AIService.generateStudyPlan(deliveries, semesterStart);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error en IA';
        setError(errorMessage);
        return []; // fallback
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const generateDetailedSchedule = useCallback(
    (
      studyPlan: Array<{
        subject: string;
        name: string;
        deliveryDate: string;
        startDate: string;
        endDate: string;
        priority?: 'low' | 'normal' | 'high';
        estimatedHours: number;
      }>
    ): Array<{ date: string; hours: number; subject: string; task: string }> => {
      return AIService.generateDetailedSchedule(studyPlan);
    },
    []
  );

  const analyzeProgress = useCallback(
    async (completedDeliveries: Delivery[], upcomingDeliveries: Delivery[]): Promise<string> => {
      setIsLoading(true);
      setError(null);

      try {
        const completedFormatted = completedDeliveries
          .filter((d) => d.completed)
          .map((d) => ({
            subject: d.subject,
            completed: d.completed,
            date: d.date,
          }));

        const upcomingFormatted = upcomingDeliveries
          .filter((d) => !d.completed)
          .map((d) => ({
            subject: d.subject,
            date: d.date,
            priority: d.priority,
          }));

        return await AIService.analyzeProgress(completedFormatted, upcomingFormatted);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error en IA';
        setError(errorMessage);
        return 'Continúa trabajando sistemáticamente.'; // fallback
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    generateStudyPlan,
    generateDetailedSchedule,
    analyzeProgress,
    isLoading,
    error,
  };
};
