import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '../useAuth';

type FeedbackType = 'sugerencia' | 'error' | 'comentario';

interface FeedbackData {
  type: FeedbackType;
  title: string;
  description: string;
  email?: string;
}

export const useSupabaseFeedback = () => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitFeedback = useCallback(async (feedbackData: FeedbackData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error } = await supabase.rpc('insert_feedback', {
        p_type: feedbackData.type,
        p_title: feedbackData.title,
        p_description: feedbackData.description,
        p_email: feedbackData.email || null,
      });

      if (error) throw error;

      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al enviar feedback';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const getUserFeedback = useCallback(async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase.rpc('get_user_feedback');

      if (error) throw error;

      return data || [];
    } catch (err) {
      console.error('Error getting user feedback:', err);
      return [];
    }
  }, [user]);

  return {
    submitFeedback,
    getUserFeedback,
    isSubmitting,
    error,
  };
};
