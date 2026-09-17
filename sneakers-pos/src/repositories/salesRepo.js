// src/repositories/salesRepo.js
import { dbPromise, STORES } from '../lib/db'
import { salesService } from '../services/salesService'
import { syncQueue } from '../services/sync/syncQueue'
import { OP, PRIORITY } from '../services/sync/operationTypes'
import { generateLocalId } from '../lib/idGenerator'
import { notifyVariantStockChanged } from '../utils/events'
import { logAudit } from '../utils/auditHelpers'

// =====================================================================
// HELPERS
// =====================================================================

async function saveSaleToLocal(sale) {
  const db = await dbPromise
  await db.put(STORES.SALES, sale)

  if (Array.isArray(sale.items)) {
    const existingItems = await db.getAllFromIndex(STORES.SALE_ITEMS, 'sale_id', sale.id)
    for (const item of existingItems) {
      await db.delete(STORES.SALE_ITEMS, item.id)
    }
    for (const item of sale.items) {
      await db.put(STORES.SALE_ITEMS, { ...item, sale_id: sale.id })
    }
  }
  return sale
}

async function hydrateSale(sale) {
  if (!sale) return null
  const db = await dbPromise
  const items = await db.getAllFromIndex(STORES.SALE_ITEMS, 'sale_id', sale.id)
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
      imageUrl: it.image_url || null,
      price: Number(it.price) || 0,
      basePrice: Number(it.base_price) || 0,
      costPrice: Number(it.cost_price) || 0,
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

async function decrementLocalStock(items, saleId, saleFolio, createdBy) {
  const db = await dbPromise
  const now = new Date().toISOString()

  for (const item of items) {
    if (!item.variantId) continue
    try {
      const dbVariant = await db.get(STORES.PRODUCT_VARIANTS, item.variantId)
      if (!dbVariant) continue

      const previousStock = Number(dbVariant.stock) || 0
      const newStock = Math.max(0, previousStock - (Number(item.quantity) || 1))

      await db.put(STORES.PRODUCT_VARIANTS, { ...dbVariant, stock: newStock })

      const movementId = generateLocalId('mov')
      await db.put(STORES.INVENTORY_MOVES, {
        id: movementId,
        productId: item.productId,
        productName: item.productName,
        variantId: item.variantId,
        variantLabel: item.variantLabel,
        sku: item.sku,
        type: 'sale',
        quantity: -Number(item.quantity),
        previousStock,
        newStock,
        reason: `Venta ${saleFolio}`,
        saleId,
        createdBy: createdBy || null,
        createdAt: now,
        syncStatus: 'pending',
      })

      console.log(`📦 Stock local actualizado: ${item.sku || item.variantId} ${previousStock} → ${newStock}`)
    } catch (err) {
      console.error(`❌ Error descontando stock de ${item.sku}:`, err)
    }
  }
}

async function generateUniqueFolio() {
  const db = await dbPromise
  const all = await db.getAll(STORES.SALES)
  const prefix = 'VTA-'
  const nums = all
    .map((s) => Number((s.folio || '').replace(prefix, '')))
    .filter((n) => !isNaN(n))
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1
  return `${prefix}${String(next).padStart(6, '0')}`
}

// =====================================================================
// API PÚBLICA
// =====================================================================

export const salesRepo = {
  async getAllLocal() {
    const db = await dbPromise
    const sales = await db.getAll(STORES.SALES)
    const hydrated = await Promise.all(sales.map(hydrateSale))
    return hydrated.filter(Boolean).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  async getByIdLocal(id) {
    const db = await dbPromise
    const sale = await db.get(STORES.SALES, id)
    if (sale) return hydrateSale(sale)
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

  async create(payload) {
    const isOnline = navigator.onLine
    const id = isOnline && crypto?.randomUUID ? crypto.randomUUID() : generateLocalId('sale')
    const now = new Date().toISOString()
    const folio = payload.folio || (await generateUniqueFolio())

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
        imageUrl: it.imageUrl || null,
        price: Number(it.price) || 0,
        basePrice: Number(it.basePrice) || 0,
        costPrice: Number(it.costPrice) || 0,
        quantity: Number(it.quantity) || 1,
      })),
    }

    await saveSaleToLocal(localSale)
    await decrementLocalStock(localSale.items, localSale.id, localSale.folio, payload.sellerId)
    notifyVariantStockChanged()

    // ⭐ Auditoría: Crear venta
    await logAudit({
      action: 'create',
      module: 'sales',
      entity: 'sale',
      entityId: localSale.folio,
      entityName: localSale.folio,
      description: `Venta ${localSale.folio} por $${Number(localSale.total || 0).toLocaleString('es-MX')}`,
      userId: payload.sellerId,
      userName: payload.cashier,
      userRole: payload.cashierRole,
      branch: payload.branch,
      level: Number(localSale.total) > 5000 ? 'important' : 'info',
      metadata: {
        total: localSale.total,
        itemsCount: localSale.items.length,
        customerName: localSale.customerName,
        paymentMethod: localSale.payment?.method,
      },
    })

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
      payload: { id, patch: mapToSupabase(updated) },
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

    // ⭐ Auditoría: Cancelar venta
    await logAudit({
      action: 'cancel',
      module: 'sales',
      entity: 'sale',
      entityId: updated.folio,
      entityName: updated.folio,
      description: `Venta ${updated.folio} cancelada`,
      userName: cancelledBy,
      userRole: 'Vendedor',
      branch: updated.branch,
      level: 'critical',
      reason: reason || 'Sin motivo',
      metadata: {
        total: updated.total,
        reason,
        notes,
      },
    })

    await syncQueue.add({
      type: OP.CANCEL_SALE,
      entity: 'sales',
      payload: { id, reason, notes, cancelledBy },
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
    return true
  },

  async nextLocalFolio() {
    return await generateUniqueFolio()
  },
}