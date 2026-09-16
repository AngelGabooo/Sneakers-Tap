// src/services/cashService.js
import { supabase } from '../lib/supabase'

/**
 * Servicio de caja (sesiones + movimientos) conectado a Supabase.
 */
export const cashService = {
  // =================================================================
  // LECTURA
  // =================================================================

  /**
   * Obtiene todas las sesiones con sus movimientos.
   */
  async getAll() {
    const { data, error } = await supabase
      .from('cash_sessions')
      .select(`
        *,
        movements:cash_movements (*)
      `)
      .order('opened_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Obtiene una sesión por ID con sus movimientos.
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('cash_sessions')
      .select(`
        *,
        movements:cash_movements (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Obtiene la sesión abierta de una caja específica.
   */
  async getOpenByCash(cashId) {
    const { data, error } = await supabase
      .from('cash_sessions')
      .select(`
        *,
        movements:cash_movements (*)
      `)
      .eq('cash_id', cashId)
      .eq('status', 'open')
      .maybeSingle()

    if (error) throw error
    return data
  },

  /**
   * Obtiene cualquier sesión abierta.
   */
  async getAnyOpen() {
    const { data, error } = await supabase
      .from('cash_sessions')
      .select(`
        *,
        movements:cash_movements (*)
      `)
      .eq('status', 'open')
      .order('opened_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return data
  },

  // =================================================================
  // ESCRITURA
  // =================================================================

  /**
   * Abre una caja.
   */
  async open({ session, movements }) {
    // 1. Insertar sesión
    const sessionPayload = {
      cash_id: session.cashId,
      cash_label: session.cashLabel,
      branch: session.branch,
      responsible_id: session.responsibleId || null,
      responsible_name: session.responsibleName,
      opened_by: session.openedBy,
      initial_fund: Number(session.initialFund) || 0,
      breakdown: session.breakdown || {},
      note: session.note || null,
      status: 'open',
      opened_at: session.openedAt || new Date().toISOString(),
    }

    if (session.id && !session.id.startsWith('local_') && !session.id.startsWith('CAJ-')) {
      sessionPayload.id = session.id
    }

    const { data: sessionData, error: sessionError } = await supabase
      .from('cash_sessions')
      .insert(sessionPayload)
      .select()
      .single()

    if (sessionError) throw sessionError

    // 2. Insertar movimientos iniciales (apertura)
    if (movements && movements.length > 0) {
      const movementsPayload = movements.map((m) => ({
        session_id: sessionData.id,
        type: m.type === 'opening' ? 'in' : m.type,
        label: m.label || null,
        amount: Number(m.amount) || 0,
        notes: m.notes || null,
        created_by: m.by || null,
        created_at: m.at || new Date().toISOString(),
      }))

      const { error: movementsError } = await supabase
        .from('cash_movements')
        .insert(movementsPayload)

      if (movementsError) {
        console.warn('⚠️ Sesión creada pero movimientos fallaron:', movementsError)
      }
    }

    return sessionData
  },

  /**
   * Cierra una sesión.
   */
  async close(id, patch) {
    const { data, error } = await supabase
      .from('cash_sessions')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
        closed_by: patch.closedBy || null,
        closing_fund: Number(patch.closingFund) || 0,
        expected_cash: Number(patch.expectedCash) || 0,
        difference: Number(patch.difference) || 0,
        reason: patch.reason || null,
        authorized_by: patch.authorizedBy || null,
        authorized_at: patch.authorizedAt || null,
        close_notes: patch.notes || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Agrega un movimiento a una sesión.
   */
  async addMovement({ movement }) {
    const payload = {
      session_id: movement.sessionId,
      type: movement.type,
      label: movement.label || null,
      amount: Number(movement.amount) || 0,
      notes: movement.notes || null,
      created_by: movement.createdBy || null,
      created_at: movement.createdAt || new Date().toISOString(),
    }

    if (movement.id && !movement.id.startsWith('local_')) {
      payload.id = movement.id
    }

    const { data, error } = await supabase
      .from('cash_movements')
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Elimina una sesión.
   */
  async delete(id) {
    const { error } = await supabase.from('cash_sessions').delete().eq('id', id)
    if (error) throw error
    return true
  },
}