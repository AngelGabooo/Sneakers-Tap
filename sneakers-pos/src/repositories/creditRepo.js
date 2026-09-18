// src/repositories/creditRepo.js
import { dbPromise, STORES } from '../lib/db'
import { creditService } from '../services/creditService'
import { syncQueue } from '../services/sync/syncQueue'
import { OP, PRIORITY } from '../services/sync/operationTypes'
import { generateLocalId } from '../lib/idGenerator'
import { logAudit } from '../utils/auditHelpers'

// =====================================================================
// HELPERS
// =====================================================================

function mapFromSupabase(row) {
  if (!row) return null
  const amount = Number(row.amount) || 0
  const used = Number(row.used) || 0
  const paidAmount = Number(row.paid_amount) || 0

  const outstanding = used - paidAmount
  const available = amount - outstanding

  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    amount,
    used,
    paidAmount,
    // ⭐ Campos derivados (calculados siempre)
    outstanding: Math.max(0, outstanding),
    available: Math.max(0, available),
    balance: Math.max(0, available),          // alias de available (compatibilidad)
    dueDate: row.due_date,
    status: row.status || 'active',
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    closedAt: row.closed_at,
    closedBy: row.closed_by,
    syncStatus: 'synced',
    payments: (row.payments || []).map(mapPaymentFromSupabase),
  }
}

function mapPaymentFromSupabase(row) {
  if (!row) return null
  return {
    id: row.id,
    creditId: row.credit_id,
    customerId: row.customer_id,
    amount: Number(row.amount) || 0,
    method: row.method,
    receivedBy: row.received_by,
    receivedByName: row.received_by_name,
    cashSessionId: row.cash_session_id,
    paidAt: row.paid_at,
    notes: row.notes,
    syncStatus: 'synced',
  }
}

async function saveCreditToLocal(credit) {
  const db = await dbPromise
  await db.put(STORES.CUSTOMER_CREDITS, credit)

  if (Array.isArray(credit.payments)) {
    const existing = await db.getAllFromIndex(STORES.CREDIT_PAYMENTS, 'credit_id', credit.id)
    for (const p of existing) {
      await db.delete(STORES.CREDIT_PAYMENTS, p.id)
    }
    for (const payment of credit.payments) {
      await db.put(STORES.CREDIT_PAYMENTS, { ...payment, credit_id: credit.id })
    }
  }
  return credit
}

async function hydrateCredit(credit) {
  if (!credit) return null
  const db = await dbPromise
  const payments = await db.getAllFromIndex(STORES.CREDIT_PAYMENTS, 'credit_id', credit.id)
  return { ...credit, payments: payments.sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt)) }
}

/**
 * ⭐ Recalcula los campos derivados a partir de amount/used/paidAmount.
 *    Se usa cuando actualizamos localmente sin ir a Supabase.
 */
function recomputeDerived(credit) {
  const amount = Number(credit.amount) || 0
  const used = Number(credit.used) || 0
  const paidAmount = Number(credit.paidAmount) || 0
  const outstanding = used - paidAmount
  const available = amount - outstanding
  return {
    ...credit,
    outstanding: Math.max(0, outstanding),
    available: Math.max(0, available),
    balance: Math.max(0, available),
  }
}

// =====================================================================
// API PÚBLICA
// =====================================================================

export const creditRepo = {
  async getAllLocal() {
    const db = await dbPromise
    const all = await db.getAll(STORES.CUSTOMER_CREDITS)
    const hydrated = await Promise.all(all.map(hydrateCredit))
    return hydrated
      .filter(Boolean)
      .map(recomputeDerived)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  async getByIdLocal(id) {
    const db = await dbPromise
    const row = await db.get(STORES.CUSTOMER_CREDITS, id)
    const hydrated = await hydrateCredit(row)
    return hydrated ? recomputeDerived(hydrated) : null
  },

  async getActiveByCustomerLocal(customerId) {
    const db = await dbPromise
    const all = await db.getAllFromIndex(STORES.CUSTOMER_CREDITS, 'customer_id', customerId)
    const active = all.find((c) => c.status === 'active' || c.status === 'overdue')
    const hydrated = active ? await hydrateCredit(active) : null
    return hydrated ? recomputeDerived(hydrated) : null
  },

  async getAllByCustomerLocal(customerId) {
    const db = await dbPromise
    const all = await db.getAllFromIndex(STORES.CUSTOMER_CREDITS, 'customer_id', customerId)
    const hydrated = await Promise.all(all.map(hydrateCredit))
    return hydrated
      .filter(Boolean)
      .map(recomputeDerived)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  async syncFromSupabase() {
    try {
      console.log('🔄 Sincronizando créditos desde Supabase...')
      const remote = await creditService.getAll()
      const mapped = remote.map(mapFromSupabase)

      const db = await dbPromise
      const existingIds = new Set(mapped.map((c) => c.id))
      const localAll = await db.getAll(STORES.CUSTOMER_CREDITS)
      for (const local of localAll) {
        if (local.syncStatus === 'synced' && !existingIds.has(local.id)) {
          await db.delete(STORES.CUSTOMER_CREDITS, local.id)
        }
      }

      for (const credit of mapped) {
        await saveCreditToLocal(credit)
      }

      console.log(`✅ ${mapped.length} créditos sincronizados`)
      return mapped
    } catch (err) {
      console.error('❌ Error sincronizando créditos:', err)
      throw err
    }
  },

  /**
   * Otorga un nuevo crédito.
   */
  async create({ credit, receivedBy }) {
    const isOnline = navigator.onLine
    const id = isOnline && crypto?.randomUUID ? crypto.randomUUID() : generateLocalId('credit')
    const now = new Date().toISOString()
    const amount = Number(credit.amount) || 0

    const localCredit = {
      id,
      customerId: credit.customerId,
      customerName: credit.customerName,
      amount,
      used: 0,
      paidAmount: 0,
      outstanding: 0,
      available: amount,
      balance: amount,                 // compat
      dueDate: credit.dueDate,
      status: 'active',
      notes: credit.notes || null,
      createdAt: now,
      updatedAt: now,
      createdBy: receivedBy?.id || null,
      closedAt: null,
      closedBy: null,
      syncStatus: 'pending',
      payments: [],
    }

    await saveCreditToLocal(localCredit)

    await logAudit({
      action: 'create',
      module: 'credit',
      entity: 'credit',
      entityId: localCredit.id,
      entityName: localCredit.customerName,
      description: `Crédito otorgado a ${localCredit.customerName} por $${amount.toLocaleString('es-MX')}`,
      userId: receivedBy?.id,
      userName: receivedBy?.name,
      userRole: receivedBy?.role,
      level: 'important',
      metadata: {
        customerId: localCredit.customerId,
        amount,
        dueDate: localCredit.dueDate,
      },
    })

    if (isOnline) {
      try {
        const remote = await creditService.create({ credit, receivedBy })
        const mapped = mapFromSupabase(remote)
        await saveCreditToLocal(mapped)
        return mapped
      } catch (err) {
        console.warn('⚠️ Falló create en Supabase, encolando:', err.message)
      }
    }

    await syncQueue.add({
      type: OP.CREATE_CREDIT,
      entity: 'customer_credits',
      payload: { credit: localCredit, receivedBy },
      priority: PRIORITY.HIGH,
    })

    return localCredit
  },

  /**
   * ⭐ Registra un CARGO (venta a crédito).
   *    Aumenta used y reduce el saldo disponible.
   */
  async registerCharge({ charge, receivedBy }) {
    const isOnline = navigator.onLine
    const now = new Date().toISOString()

    const db = await dbPromise
    const credit = await db.get(STORES.CUSTOMER_CREDITS, charge.creditId)
    if (!credit) throw new Error('Crédito no encontrado localmente')

    const chargeAmount = Number(charge.amount) || 0
    if (chargeAmount <= 0) throw new Error('El monto debe ser mayor a 0')

    const available = Number(credit.balance || credit.available || 0)
    if (chargeAmount > available) {
      throw new Error(`El monto supera el saldo disponible ($${available.toLocaleString('es-MX')})`)
    }

    const newUsed = Number(credit.used || 0) + chargeAmount
    const newAvailable = Number(credit.amount || 0) - (newUsed - Number(credit.paidAmount || 0))

    const updatedCredit = recomputeDerived({
      ...credit,
      used: newUsed,
      balance: newAvailable,
      updatedAt: now,
      syncStatus: 'pending',
    })

    await db.put(STORES.CUSTOMER_CREDITS, updatedCredit)

    await logAudit({
      action: 'charge',
      module: 'credit',
      entity: 'credit_charge',
      entityId: charge.saleId || updatedCredit.id,
      entityName: credit.customerName,
      description: `Cargo a crédito de $${chargeAmount.toLocaleString('es-MX')} · ${credit.customerName}${charge.saleFolio ? ` · Venta ${charge.saleFolio}` : ''}`,
      userId: receivedBy?.id,
      userName: receivedBy?.name,
      userRole: receivedBy?.role,
      level: 'important',
      metadata: {
        creditId: charge.creditId,
        amount: chargeAmount,
        saleId: charge.saleId,
        saleFolio: charge.saleFolio,
        newOutstanding: updatedCredit.outstanding,
      },
    })

    if (isOnline) {
      try {
        const result = await creditService.registerCharge({ charge, receivedBy })
        const mapped = mapFromSupabase(result.credit)
        await saveCreditToLocal(mapped)
        return mapped
      } catch (err) {
        console.warn('⚠️ Falló registerCharge en Supabase, encolando:', err.message)
      }
    }

    await syncQueue.add({
      type: OP.CREATE_CREDIT_CHARGE,
      entity: 'customer_credits',
      payload: { charge, receivedBy },
      priority: PRIORITY.HIGH,
    })

    return updatedCredit
  },

  /**
   * Registra un pago.
   */
  async registerPayment({ payment, receivedBy }) {
    const isOnline = navigator.onLine
    const id = isOnline && crypto?.randomUUID ? crypto.randomUUID() : generateLocalId('pay')
    const now = new Date().toISOString()

    const localPayment = {
      id,
      creditId: payment.creditId,
      customerId: payment.customerId,
      amount: Number(payment.amount) || 0,
      method: payment.method || 'cash',
      receivedBy: receivedBy?.id || null,
      receivedByName: receivedBy?.name || 'Usuario',
      cashSessionId: payment.cashSessionId || null,
      paidAt: now,
      notes: payment.notes || null,
      syncStatus: 'pending',
    }

    const db = await dbPromise
    await db.put(STORES.CREDIT_PAYMENTS, localPayment)

    const credit = await db.get(STORES.CUSTOMER_CREDITS, payment.creditId)
    if (!credit) throw new Error('Crédito no encontrado localmente')

    const newPaid = Number(credit.paidAmount || 0) + localPayment.amount
    const outstanding = Number(credit.used || 0) - newPaid
    const available = Number(credit.amount || 0) - outstanding
    const isFullyPaid = outstanding <= 0.01

    const updatedCredit = recomputeDerived({
      ...credit,
      paidAmount: newPaid,
      balance: available,
      status: isFullyPaid ? 'paid' : credit.status,
      updatedAt: now,
      closedAt: isFullyPaid ? now : null,
      closedBy: isFullyPaid ? (receivedBy?.id || null) : null,
      syncStatus: 'pending',
    })

    await db.put(STORES.CUSTOMER_CREDITS, updatedCredit)

    await logAudit({
      action: 'payment',
      module: 'credit',
      entity: 'credit_payment',
      entityId: localPayment.id,
      entityName: credit.customerName,
      description: `Pago de $${localPayment.amount.toLocaleString('es-MX')} · ${credit.customerName}${isFullyPaid ? ' · LIQUIDADO' : ''}`,
      userId: receivedBy?.id,
      userName: receivedBy?.name,
      userRole: receivedBy?.role,
      level: isFullyPaid ? 'important' : 'info',
      metadata: {
        creditId: payment.creditId,
        amount: localPayment.amount,
        method: localPayment.method,
        newOutstanding: updatedCredit.outstanding,
        newAvailable: updatedCredit.available,
      },
    })

    if (isOnline) {
      try {
        const result = await creditService.registerPayment({ payment, receivedBy })
        await saveCreditToLocal(mapFromSupabase(result.credit))
        await db.put(
          STORES.CREDIT_PAYMENTS,
          mapPaymentFromSupabase(result.payment),
        )
        return {
          payment: mapPaymentFromSupabase(result.payment),
          credit: mapFromSupabase(result.credit),
        }
      } catch (err) {
        console.warn('⚠️ Falló registerPayment en Supabase, encolando:', err.message)
      }
    }

    await syncQueue.add({
      type: OP.CREATE_CREDIT_PAYMENT,
      entity: 'credit_payments',
      payload: { payment: localPayment, receivedBy },
      priority: PRIORITY.HIGH,
    })

    return { payment: localPayment, credit: updatedCredit }
  },

  async cancel(id, { reason, cancelledBy }) {
    const db = await dbPromise
    const credit = await db.get(STORES.CUSTOMER_CREDITS, id)
    if (!credit) throw new Error('Crédito no encontrado')

    const updated = {
      ...credit,
      status: 'cancelled',
      notes: reason || credit.notes,
      updatedAt: new Date().toISOString(),
      closedAt: new Date().toISOString(),
      closedBy: cancelledBy?.id || null,
      syncStatus: 'pending',
    }

    await db.put(STORES.CUSTOMER_CREDITS, updated)

    await syncQueue.add({
      type: OP.UPDATE_CREDIT,
      entity: 'customer_credits',
      payload: { id, patch: { status: 'cancelled', notes: reason } },
      priority: PRIORITY.NORMAL,
    })

    return updated
  },
}