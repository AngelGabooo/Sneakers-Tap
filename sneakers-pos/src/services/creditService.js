// src/services/creditService.js
import { supabase } from '../lib/supabase'

/**
 * Servicio de créditos — modelo de LÍNEA ROTATIVA.
 *
 *   amount       = límite autorizado (ej: 5000)
 *   used         = total gastado a crédito (ej: 2000)
 *   paid_amount  = total pagado de lo gastado (ej: 500)
 *   outstanding  = deuda pendiente = used - paid_amount (ej: 1500)
 *   available    = saldo disponible = amount - outstanding (ej: 3500)
 *   balance      = alias de `available` (compatibilidad con UI vieja)
 */
export const creditService = {
  // =================================================================
  // LECTURA
  // =================================================================

  async getAll() {
    const { data, error } = await supabase
      .from('customer_credits')
      .select(`
        *,
        payments:credit_payments (*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('customer_credits')
      .select(`
        *,
        payments:credit_payments (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async getActiveByCustomer(customerId) {
    const { data, error } = await supabase
      .from('customer_credits')
      .select(`
        *,
        payments:credit_payments (*)
      `)
      .eq('customer_id', customerId)
      .in('status', ['active', 'overdue'])
      .maybeSingle()

    if (error) throw error
    return data
  },

  async getAllByCustomer(customerId) {
    const { data, error } = await supabase
      .from('customer_credits')
      .select(`
        *,
        payments:credit_payments (*)
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // =================================================================
  // ESCRITURA
  // =================================================================

  /**
   * Otorga un nuevo crédito (línea de crédito).
   * Estado inicial: nada usado, nada pagado, todo disponible.
   */
  async create({ credit, receivedBy }) {
    const existing = await this.getActiveByCustomer(credit.customerId)
    if (existing) {
      throw new Error('Este cliente ya tiene un crédito activo.')
    }

    const amount = Number(credit.amount) || 0

    const payload = {
      customer_id: credit.customerId,
      customer_name: credit.customerName,
      amount,
      used: 0,                        // ⭐ NUEVO
      paid_amount: 0,
      balance: amount,                // alias de available
      due_date: credit.dueDate,
      status: 'active',
      notes: credit.notes || null,
      created_by: receivedBy?.id || null,
    }

    const { data, error } = await supabase
      .from('customer_credits')
      .insert(payload)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * ⭐ Registra un CARGO (venta a crédito).
   *    Aumenta `used` y reduce `available`.
   */
  async registerCharge({ charge, receivedBy }) {
    const { creditId, amount } = charge

    const { data: credit, error: fetchErr } = await supabase
      .from('customer_credits')
      .select('*')
      .eq('id', creditId)
      .single()

    if (fetchErr) throw fetchErr
    if (!credit) throw new Error('Crédito no encontrado')
    if (credit.status !== 'active' && credit.status !== 'overdue') {
      throw new Error('El crédito no está activo')
    }

    const chargeAmount = Number(amount) || 0
    if (chargeAmount <= 0) throw new Error('El monto debe ser mayor a 0')

    const currentUsed = Number(credit.used) || 0
    const currentPaid = Number(credit.paid_amount) || 0
    const currentAvailable = Number(credit.amount) - (currentUsed - currentPaid)

    if (chargeAmount > currentAvailable) {
      throw new Error(`El monto supera el saldo disponible ($${currentAvailable.toLocaleString('es-MX')})`)
    }

    const newUsed = currentUsed + chargeAmount
    const newAvailable = Number(credit.amount) - (newUsed - currentPaid)

    const { data: updatedCredit, error: updateErr } = await supabase
      .from('customer_credits')
      .update({
        used: newUsed,
        balance: newAvailable,
        updated_at: new Date().toISOString(),
      })
      .eq('id', creditId)
      .select()
      .single()

    if (updateErr) throw updateErr
    return { credit: updatedCredit }
  },

  /**
   * Registra un PAGO (abono) parcial o total.
   * Reduce la deuda pendiente y libera saldo disponible.
   */
  async registerPayment({ payment, receivedBy }) {
    const { creditId, amount, method, notes } = payment

    const { data: credit, error: fetchErr } = await supabase
      .from('customer_credits')
      .select('*')
      .eq('id', creditId)
      .single()

    if (fetchErr) throw fetchErr
    if (!credit) throw new Error('Crédito no encontrado')
    if (credit.status === 'paid') throw new Error('Este crédito ya está pagado')

    const payAmount = Number(amount) || 0
    if (payAmount <= 0) throw new Error('El monto debe ser mayor a 0')

    const currentUsed = Number(credit.used) || 0
    const currentPaid = Number(credit.paid_amount) || 0
    const outstanding = currentUsed - currentPaid

    if (outstanding <= 0) {
      throw new Error('Este crédito no tiene deuda pendiente')
    }
    if (payAmount > outstanding) {
      throw new Error(`El monto supera la deuda pendiente ($${outstanding.toLocaleString('es-MX')})`)
    }

    // Insertar pago
    const paymentPayload = {
      credit_id: creditId,
      customer_id: credit.customer_id,
      amount: payAmount,
      method: method || 'cash',
      received_by: receivedBy?.id || null,
      received_by_name: receivedBy?.name || 'Usuario',
      cash_session_id: payment.cashSessionId || null,
      notes: notes || null,
    }

    const { data: paymentData, error: paymentErr } = await supabase
      .from('credit_payments')
      .insert(paymentPayload)
      .select()
      .single()

    if (paymentErr) throw paymentErr

    // Actualizar crédito
    const newPaid = currentPaid + payAmount
    const newOutstanding = currentUsed - newPaid
    const newAvailable = Number(credit.amount) - newOutstanding
    const isFullyPaid = newOutstanding <= 0.01

    const creditUpdate = {
      paid_amount: newPaid,
      balance: newAvailable,
      status: isFullyPaid ? 'paid' : credit.status,
      updated_at: new Date().toISOString(),
    }

    if (isFullyPaid) {
      creditUpdate.closed_at = new Date().toISOString()
      creditUpdate.closed_by = receivedBy?.id || null
    }

    const { data: updatedCredit, error: updateErr } = await supabase
      .from('customer_credits')
      .update(creditUpdate)
      .eq('id', creditId)
      .select()
      .single()

    if (updateErr) throw updateErr

    return { payment: paymentData, credit: updatedCredit }
  },

  async cancel(id, { reason, cancelledBy }) {
    const { data, error } = await supabase
      .from('customer_credits')
      .update({
        status: 'cancelled',
        notes: reason || null,
        updated_at: new Date().toISOString(),
        closed_at: new Date().toISOString(),
        closed_by: cancelledBy?.id || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async markOverdue() {
    const { error } = await supabase.rpc('mark_overdue_credits')
    if (error) {
      const today = new Date().toISOString().split('T')[0]
      const { error: updErr } = await supabase
        .from('customer_credits')
        .update({ status: 'overdue' })
        .eq('status', 'active')
        .lt('due_date', today)
      if (updErr) throw updErr
    }
    return true
  },
}