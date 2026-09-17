// src/repositories/wholesaleRepo.js
import { dbPromise, STORES } from '../lib/db'
import { wholesaleService } from '../services/wholesaleService'
import { syncQueue } from '../services/sync/syncQueue'
import { OP, PRIORITY } from '../services/sync/operationTypes'

// =====================================================================
// HELPERS
// =====================================================================

/**
 * Convierte un row de Supabase → objeto de la app (camelCase).
 */
function mapFromSupabase(row) {
  if (!row) return null
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    legalName: row.legal_name,
    rfc: row.rfc,
    clientType: row.client_type,

    contactName: row.contact_name,
    phone: row.phone,
    phoneSecondary: row.phone_secondary,
    email: row.email,
    website: row.website,

    taxRegime: row.tax_regime,
    cfdiUse: row.cfdi_use,
    billingEmail: row.billing_email,

    street: row.street,
    extNumber: row.ext_number,
    intNumber: row.int_number,
    neighborhood: row.neighborhood,
    zip: row.zip,
    city: row.city,
    state: row.state,
    country: row.country,

    condition: row.condition,
    priceList: row.price_list,
    defaultDiscount: Number(row.default_discount) || 0,
    maxDiscount: Number(row.max_discount) || 0,
    minPurchaseAmount: Number(row.min_purchase_amount) || 0,
    minPurchaseUnits: Number(row.min_purchase_units) || 0,

    creditEnabled: row.credit_enabled,
    creditLimit: Number(row.credit_limit) || 0,
    creditUsed: Number(row.credit_used) || 0,
    creditDays: row.credit_days,

    paymentCondition: row.payment_condition,
    paymentMethods: row.payment_methods || [],

    responsable: row.responsable,
    branch: row.branch,

    status: row.status,
    overdue: row.overdue,

    internalNotes: row.internal_notes,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
    syncStatus: 'synced',
  }
}

// =====================================================================
// API PÚBLICA
// =====================================================================

export const wholesaleRepo = {
  async getAllLocal() {
    const db = await dbPromise
    const all = await db.getAll(STORES.WHOLESALE)
    return all
      .map(mapFromSupabase)
      .filter(Boolean)
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'es'))
  },

  async getByIdLocal(id) {
    const db = await dbPromise
    const row = await db.get(STORES.WHOLESALE, id)
    return row ? mapFromSupabase(row) : null
  },

  async syncFromSupabase() {
    try {
      console.log('🔄 Sincronizando mayoristas desde Supabase...')
      const remote = await wholesaleService.getAll()
      const db = await dbPromise

      for (const row of remote) {
        await db.put(STORES.WHOLESALE, row)
      }

      console.log(`✅ ${remote.length} mayoristas sincronizados`)
      return remote.map(mapFromSupabase)
    } catch (err) {
      console.error('❌ Error sincronizando mayoristas:', err)
      throw err
    }
  },

  async create(payload) {
    try {
      // 1. Crear en Supabase
      const remote = await wholesaleService.create(payload)

      // 2. Guardar local
      const db = await dbPromise
      await db.put(STORES.WHOLESALE, remote)

      console.log(`💾 Mayorista creado: ${remote.name} (${remote.id})`)
      return mapFromSupabase(remote)
    } catch (err) {
      // Si falla Supabase (offline), encolamos
      console.warn('⚠️ Guardando mayorista en cola (offline):', err.message)

      const id = `local_may_${Date.now()}`
      const local = {
        ...payload,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const db = await dbPromise
      await db.put(STORES.WHOLESALE, local)

      await syncQueue.add({
        type: OP.CREATE_CUSTOMER,
        entity: 'wholesale_customers',
        payload: { customer: local },
        priority: PRIORITY.HIGH,
      })

      return mapFromSupabase(local)
    }
  },

  async update(id, patch) {
    try {
      const remote = await wholesaleService.update(id, patch)
      const db = await dbPromise
      await db.put(STORES.WHOLESALE, remote)
      return mapFromSupabase(remote)
    } catch (err) {
      console.warn('⚠️ Actualizando mayorista en cola (offline):', err.message)

      const db = await dbPromise
      const current = await db.get(STORES.WHOLESALE, id)
      const merged = { ...current, ...patch, updatedAt: new Date().toISOString() }
      await db.put(STORES.WHOLESALE, merged)

      await syncQueue.add({
        type: OP.UPDATE_CUSTOMER,
        entity: 'wholesale_customers',
        payload: { id, patch },
        priority: PRIORITY.NORMAL,
      })

      return mapFromSupabase(merged)
    }
  },

  async delete(id) {
    await wholesaleService.delete(id)
    const db = await dbPromise
    await db.delete(STORES.WHOLESALE, id)
    return true
  },

  async nextCode() {
    return await wholesaleService.nextCode()
  },
}