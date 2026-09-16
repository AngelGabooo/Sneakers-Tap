// src/services/settingsService.js
import { supabase } from '../lib/supabase'

/**
 * Servicio de configuración — conecta con la tabla `settings` de Supabase.
 * Solo hay UNA fila global (singleton).
 */
export const settingsService = {
  /**
   * Obtiene la configuración actual (la única fila).
   */
  async get() {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return data
  },

  /**
   * Guarda/actualiza la configuración.
   * Si no existe la fila, la crea.
   */
  async save(settings) {
    // 1. Verificar si existe la fila
    const existing = await this.get()

    const payload = {
      store: settings.store || {},
      ticket: settings.ticket || {},
      sales: settings.sales || {},
      taxes: settings.taxes || {},
      preferences: settings.preferences || {},
      branches: settings.branches || [],
    }

    if (existing?.id) {
      // 2a. Actualizar
      const { data, error } = await supabase
        .from('settings')
        .update(payload)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return data
    } else {
      // 2b. Crear
      const { data, error } = await supabase
        .from('settings')
        .insert(payload)
        .select()
        .single()

      if (error) throw error
      return data
    }
  },
}