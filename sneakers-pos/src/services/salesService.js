// src/services/salesService.js
import { supabase } from '../lib/supabase'

/**
 * Servicio de ventas + items conectado a Supabase.
 */
export const salesService = {
  // =================================================================
  // LECTURA
  // =================================================================

  /**
   * Obtiene todas las ventas con sus items.
   */
  async getAll() {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        items:sale_items (*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Obtiene una venta por ID con sus items.
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        items:sale_items (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Obtiene ventas por rango de fecha.
   */
  async getByDateRange(from, to) {
    let query = supabase
      .from('sales')
      .select(`
        *,
        items:sale_items (*)
      `)
      .order('created_at', { ascending: false })

    if (from) query = query.gte('created_at', from)
    if (to) query = query.lte('created_at', to)

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  /**
   * Obtiene ventas por sesión de caja.
   */
  async getByCashSession(cashSessionId) {
    const { data, error } = await supabase
      .from('sales')
      .select(`
        *,
        items:sale_items (*)
      `)
      .eq('cash_session_id', cashSessionId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // =================================================================
  // ESCRITURA
  // =================================================================

  /**
   * Crea una venta con sus items.
   */
  async create({ sale, items }) {
    // 1. Insertar venta
    const salePayload = {
      folio: sale.folio,
      cashier: sale.cashier,
      cashier_role: sale.cashierRole,
      seller_id: sale.sellerId || null,
      customer_id: sale.customerId || null,
      customer_name: sale.customerName || null,
      customer_type: sale.customerType || 'regular',
      wholesale_snapshot: sale.wholesaleSnapshot || {},
      totals: sale.totals || {},
      payment: sale.payment || {},
      change: Number(sale.change) || 0,
      total: Number(sale.total) || 0,
      branch: sale.branch || null,
      cash_id: sale.cashId || null,
      cash_session_id: sale.cashSessionId || null,
      status: sale.status || 'completed',
      notes: sale.notes || null,
      created_at: sale.createdAt || new Date().toISOString(),
    }

    // Si el ID no es local, respetarlo
    if (sale.id && !sale.id.startsWith('local_')) {
      salePayload.id = sale.id
    }

    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert(salePayload)
      .select()
      .single()

    if (saleError) throw saleError

    // 2. Insertar items
    if (items && items.length > 0) {
      const itemsPayload = items.map((it) => ({
        sale_id: saleData.id,
        product_id: it.productId || null,
        product_name: it.productName || null,
        variant_id: it.variantId || null,
        variant_label: it.variantLabel || null,
        sku: it.sku || null,
        price: Number(it.price) || 0,
        base_price: Number(it.basePrice) || 0,
        quantity: Number(it.quantity) || 1,
      }))

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(itemsPayload)

      if (itemsError) {
        console.warn('⚠️ Venta creada pero items fallaron:', itemsError)
      }
    }

    return saleData
  },

  /**
   * Actualiza campos de una venta.
   */
  async update(id, patch) {
    const { data, error } = await supabase
      .from('sales')
      .update(patch)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Cancela una venta.
   */
  async cancel(id, { reason, notes, cancelledBy }) {
    const { data, error } = await supabase
      .from('sales')
      .update({
        status: 'cancelled',
        cancel_reason: reason || null,
        cancel_notes: notes || null,
        cancelled_at: new Date().toISOString(),
        cancelled_by: cancelledBy || null,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Elimina una venta (raro, sólo por errores graves).
   */
  async delete(id) {
    const { error } = await supabase.from('sales').delete().eq('id', id)
    if (error) throw error
    return true
  },

  /**
   * Genera el siguiente folio basado en las ventas existentes.
   */
  async nextFolio() {
    const { data, error } = await supabase
      .from('sales')
      .select('folio')
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) throw error

    const prefix = 'VTA-'
    const nums = (data || [])
      .map((s) => Number((s.folio || '').replace(prefix, '')))
      .filter((n) => !isNaN(n))

    const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
    return `${prefix}${String(next).padStart(6, '0')}`
  },
}