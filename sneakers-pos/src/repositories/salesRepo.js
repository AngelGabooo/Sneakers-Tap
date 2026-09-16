// src/repositories/salesRepo.js
import { dbPromise, STORES } from '../lib/db'
import { salesService } from '../services/salesService'
import { syncQueue } from '../services/sync/syncQueue'
import { OP, PRIORITY } from '../services/sync/operationTypes'
import { generateLocalId } from '../lib/idGenerator'

/**
 * Repositorio offline-first de ventas.
 *
 * Estrategia:
 *   - LECTURA: IndexedDB primero (rápido), Supabase en background
 *   - ESCRITURA: IndexedDB + cola de sync (funciona sin internet)
 *   - Las ventas se guardan en STORES.SALES
 *   - Los items se guardan en STORES.SALE_ITEMS
 */

// =====================================================================
// HELPERS INTERNOS
// =====================================================================

async function saveSaleToLocal(sale) {
  const db = await dbPromise

  // Guardar venta
  await db.put(STORES.SALES, sale)

  // Guardar items por separado
  if (Array.isArray(sale.items)) {
    // Borrar items viejos de esta venta
    const existingItems = await db.getAllFromIndex(
      STORES.SALE_ITEMS,
      'sale_id',
      sale.id,
    )
    for (const item of existingItems) {
      await db.delete(STORES.SALE_ITEMS, item.id)
    }

    // Guardar los nuevos
    for (const item of sale.items) {
      await db.put(STORES.SALE_ITEMS, {
        ...item,
        sale_id: sale.id,
      })
    }
  }

  return sale
}

async function hydrateSale(sale) {
  if (!sale) return null
  const db = await dbPromise
  const items = await db.getAllFromIndex(
    STORES.SALE_ITEMS,
    'sale_id',
    sale.id,
  )
  return { ...sale, items }
}

function mapFromSupabase(row) {
  if (!row) return null
  return {
    id: row.id,
    folio: row.folio || '',
    cashier: row.cashier || '',
    cashierRole: row.cashier_role || '',
    sellerId: row.seller_id || null,
    customerId: row.customer_id || null,
    customerName: row.customer_name || null,
    customerType: row.customer_type || 'regular',
    wholesaleSnapshot: row.wholesale_snapshot || null,
    totals: row.totals || {},
    payment: row.payment || {},
    change: Number(row.change) || 0,
    total: Number(row.total) || 0,
    branch: row.branch || null,
    cashId: row.cash_id || null,
    cashSessionId: row.cash_session_id || null,
    status: row.status || 'completed',
    cancelReason: row.cancel_reason || null,
    cancelNotes: row.cancel_notes || null,
    cancelledAt: row.cancelled_at || null,
    cancelledBy: row.cancelled_by || null,
    notes: row.notes || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    syncStatus: 'synced',
    items: (row.items || []).map((it) => ({
      id: it.id,
      saleId: it.sale_id,
      productId: it.product_id,
      productName: it.product_name,
      variantId: it.variant_id,
      variantLabel: it.variant_label,
      sku: it.sku,
      price: Number(it.price) || 0,
      basePrice: Number(it.base_price) || 0,
      quantity: Number(it.quantity) || 1,
    })),
  }
}

function mapToSupabase(sale) {
  return {
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
  }
}

// =====================================================================
// API PÚBLICA
// =====================================================================

export const salesRepo = {
  async getAllLocal() {
    const db = await dbPromise
    const sales = await db.getAll(STORES.SALES)
    const hydrated = await Promise.all(sales.map(hydrateSale))
    return hydrated
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  async getByIdLocal(id) {
    const db = await dbPromise
    const sale = await db.get(STORES.SALES, id)
    if (sale) return hydrateSale(sale)

    // Fallback: buscar por folio
    const all = await db.getAll(STORES.SALES)
    const found = all.find((s) => s.folio === id)
    return found ? hydrateSale(found) : null
  },

  async syncFromSupabase() {
    try {
      console.log('🔄 Sincronizando ventas desde Supabase...')
      const remote = await salesService.getAll()
      const mapped = remote.map(mapFromSupabase)

      for (const sale of mapped) {
        await saveSaleToLocal(sale)
      }

      console.log(`✅ ${mapped.length} ventas sincronizadas`)
      return mapped
    } catch (err) {
      console.error('❌ Error sincronizando ventas:', err)
      throw err
    }
  },

  /**
   * Crea una venta localmente + encola para sync.
   */
  async create(payload) {
    const isOnline = navigator.onLine
    const id = isOnline && crypto?.randomUUID
      ? crypto.randomUUID()
      : generateLocalId('sale')

    const now = new Date().toISOString()

    // Folio local si no viene
    const folio = payload.folio || `VTA-${String(Date.now()).slice(-6)}`

    const localSale = {
      id,
      folio,
      cashier: payload.cashier || '',
      cashierRole: payload.cashierRole || '',
      sellerId: payload.sellerId || null,
      customerId: payload.customerId || null,
      customerName: payload.customerName || null,
      customerType: payload.customerType || 'regular',
      wholesaleSnapshot: payload.wholesaleSnapshot || null,
      totals: payload.totals || {},
      payment: payload.payment || {},
      change: Number(payload.change) || 0,
      total: Number(payload.total) || 0,
      branch: payload.branch || null,
      cashId: payload.cashId || null,
      cashSessionId: payload.cashSessionId || null,
      status: payload.status || 'completed',
      notes: payload.notes || null,
      createdAt: payload.createdAt || now,
      updatedAt: now,
      syncStatus: 'pending',
      items: (payload.items || []).map((it) => ({
        id: generateLocalId('item'),
        saleId: id,
        productId: it.productId,
        productName: it.productName,
        variantId: it.variantId,
        variantLabel: it.variantLabel,
        sku: it.sku,
        price: Number(it.price) || 0,
        basePrice: Number(it.basePrice) || 0,
        quantity: Number(it.quantity) || 1,
      })),
    }

    // 1. Guardar en IndexedDB
    await saveSaleToLocal(localSale)

    // 2. Encolar para sync
    await syncQueue.add({
      type: OP.CREATE_SALE,
      entity: 'sales',
      payload: {
        sale: { ...localSale, items: undefined },
        items: localSale.items,
      },
      priority: PRIORITY.HIGH,
    })

    console.log(`🛒 Venta creada localmente: ${localSale.folio} (${id})`)
    return localSale
  },

  async update(id, patch) {
    const existing = await this.getByIdLocal(id)
    if (!existing) throw new Error(`Venta no encontrada: ${id}`)

    const updated = {
      ...existing,
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    }

    await saveSaleToLocal(updated)

    await syncQueue.add({
      type: OP.UPDATE_SALE,
      entity: 'sales',
      payload: {
        id,
        patch: mapToSupabase(updated),
      },
      priority: PRIORITY.NORMAL,
    })

    console.log(`📝 Venta actualizada: ${updated.folio}`)
    return updated
  },

  async cancel(id, { reason, notes, cancelledBy }) {
    const existing = await this.getByIdLocal(id)
    if (!existing) throw new Error(`Venta no encontrada: ${id}`)

    const updated = {
      ...existing,
      status: 'cancelled',
      cancelReason: reason || null,
      cancelNotes: notes || null,
      cancelledAt: new Date().toISOString(),
      cancelledBy: cancelledBy || null,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    }

    await saveSaleToLocal(updated)

    await syncQueue.add({
      type: OP.CANCEL_SALE,
      entity: 'sales',
      payload: {
        id,
        reason: reason || null,
        notes: notes || null,
        cancelledBy: cancelledBy || null,
      },
      priority: PRIORITY.HIGH,
    })

    console.log(`❌ Venta cancelada: ${updated.folio}`)
    return updated
  },

  async delete(id) {
    const db = await dbPromise
    await db.delete(STORES.SALES, id)

    const items = await db.getAllFromIndex(STORES.SALE_ITEMS, 'sale_id', id)
    for (const item of items) {
      await db.delete(STORES.SALE_ITEMS, item.id)
    }

    console.log(`🗑️  Venta eliminada: ${id}`)
    return true
  },

  /**
   * Obtiene el folio local más alto (para generar el siguiente sin depender de Supabase).
   */
  async nextLocalFolio() {
    const db = await dbPromise
    const all = await db.getAll(STORES.SALES)
    const prefix = 'VTA-'
    const nums = all
      .map((s) => Number((s.folio || '').replace(prefix, '')))
      .filter((n) => !isNaN(n))
    const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
    return `${prefix}${String(next).padStart(6, '0')}`
  },
}