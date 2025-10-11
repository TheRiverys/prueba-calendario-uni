/**
 * Servicio para implementar derechos GDPR de acceso y supresión de datos
 *
 * Aplica principio de Responsabilidad Única (SRP):
 * - Solo se encarga de exportación y eliminación de datos del usuario
 *
 * Aplica principio de Inversión de Dependencias (DIP):
 * - Depende de abstracciones (supabase interface) no de implementaciones concretas
 */

import { supabase } from '@/lib/supabase';
import type { Delivery } from '@/types';

interface UserDataExport {
  exportDate: string;
  userId: string;
  email: string;
  profile: {
    createdAt: string;
    lastLogin: string;
  };
  deliveries: Delivery[];
  analytics: {
    firstSeen: string;
    lastSeen: string;
    accessCount: number;
    consentHistory: string;
  } | null;
  preferences: Record<string, unknown>;
  semesterConfig: {
    startDate: string | null;
  };
}

/**
 * Servicio de gestión de datos GDPR
 */
class GdprDataService {
  /**
   * Derecho de acceso (Art. 15 GDPR):
   * Exporta todos los datos del usuario en formato JSON estructurado
   */
  public async exportUserData(userId: string): Promise<UserDataExport> {
    if (!userId) {
      throw new Error('ID de usuario requerido');
    }

    // Obtener datos del usuario
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('No se pudo obtener información del usuario');
    }

    // Obtener entregas
    const { data: deliveries, error: deliveriesError } = await supabase
      .from('deliveries')
      .select('*')
      .eq('user_id', userId);

    if (deliveriesError) {
      throw new Error(`Error al obtener entregas: ${deliveriesError.message}`);
    }

    // Obtener analíticas
    const { data: analytics, error: analyticsError } = await supabase
      .from('analiticas')
      .select('*')
      .eq('user_id_auth', userId)
      .single();

    // No es un error si no hay analíticas
    const analyticsData = analyticsError ? null : analytics;

    // Obtener configuración de semestre
    const { data: semesterData, error: semesterError } = await supabase
      .from('semester_start')
      .select('*')
      .eq('user_id', userId)
      .single();

    // No es un error si no hay configuración
    const semesterConfig = semesterError ? null : semesterData;

    // Construir objeto de exportación
    const exportData: UserDataExport = {
      exportDate: new Date().toISOString(),
      userId: user.id,
      email: user.email || 'No disponible',
      profile: {
        createdAt: user.created_at || 'No disponible',
        lastLogin: user.last_sign_in_at || 'Nunca',
      },
      deliveries: (deliveries || []).map(d => ({
        id: d.id,
        name: d.name,
        subject: d.subject,
        date: d.date,
        color: d.color,
        completed: d.completed,
        deadline: d.deadline,
        weight: d.weight,
        priority: d.priority,
        category: d.category,
        studyDays: d.study_days,
        hoursPerDay: d.hours_per_day,
        useWeekends: d.use_weekends,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      })),
      analytics: analyticsData
        ? {
            firstSeen: analyticsData.first_seen_at,
            lastSeen: analyticsData.last_seen_at,
            accessCount: analyticsData.access_count,
            consentHistory: analyticsData.created_at,
          }
        : null,
      preferences: this.getLocalPreferences(),
      semesterConfig: {
        startDate: semesterConfig?.start_date || null,
      },
    };

    return exportData;
  }

  /**
   * Derecho de portabilidad (Art. 20 GDPR):
   * Descarga los datos del usuario en un archivo JSON
   */
  public async downloadUserData(userId: string): Promise<void> {
    const data = await this.exportUserData(userId);

    // Crear blob y descargar
    // eslint-disable-next-line no-undef
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datos-usuario-${data.userId}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Derecho al olvido (Art. 17 GDPR):
   * Elimina permanentemente todos los datos del usuario
   */
  public async deleteUserData(userId: string): Promise<void> {
    if (!userId) {
      throw new Error('ID de usuario requerido');
    }

    // Llamar a la función RPC que elimina todo en cascada
    const { error: deleteError } = await supabase.rpc('delete_user_data', {
      p_user_id: userId,
    });

    if (deleteError) {
      throw new Error(`Error al eliminar datos: ${deleteError.message}`);
    }

    // Limpiar datos locales
    this.clearLocalData();

    // Cerrar sesión
    await supabase.auth.signOut();
  }

  /**
   * Obtiene preferencias almacenadas localmente
   */
  private getLocalPreferences(): Record<string, unknown> {
    if (typeof window === 'undefined') {
      return {};
    }

    const preferences: Record<string, unknown> = {};

    // Recopilar datos de localStorage
    const keys = [
      'user_preferences',
      'analytics_user_id',
      'pending_analytics_association',
      'cookie_consent',
    ];

    keys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          preferences[key] = JSON.parse(value);
        } catch {
          preferences[key] = value;
        }
      }
    });

    return preferences;
  }

  /**
   * Limpia todos los datos locales
   */
  private clearLocalData(): void {
    if (typeof window === 'undefined') {
      return;
    }

    // Limpiar localStorage
    localStorage.clear();

    // Limpiar cookies
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    });
  }
}

// Exportar instancia única (Singleton pattern)
export const gdprDataService = new GdprDataService();
