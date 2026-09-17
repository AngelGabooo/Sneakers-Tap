// src/repositories/cashRepo.js
import { dbPromise, STORES } from '../lib/db'
import { cashService } from '../services/cashService'
import { syncQueue } from '../services/sync/syncQueue'
import { OP, PRIORITY } from '../services/sync/operationTypes'
import { generateLocalId } from '../lib/idGenerator'
import { logAudit } from '../utils/auditHelpers'

// =====================================================================
// HELPERS
// =====================================================================

async function saveSessionToLocal(session) {
  const db = await dbPromise
  await db.put(STORES.CASH_SESSIONS, session)

  if (Array.isArray(session.movements)) {
    const existing = await db.getAllFromIndex(STORES.CASH_MOVEMENTS, 'session_id', session.id)
    for (const m of existing) {
      await db.delete(STORES.CASH_MOVEMENTS, m.id)
    }
    for (const movement of session.movements) {
      await db.put(STORES.CASH_MOVEMENTS, { ...movement, session_id: session.id })
    }
  }
  return session
}

async function hydrateSession(session) {
  if (!session) return null
  const db = await dbPromise
  const movements = await db.getAllFromIndex(STORES.CASH_MOVEMENTS, 'session_id', session.id)
  return { ...session, movements }
}

function mapFromSupabase(row) {
  if (!row) return null
  return {
    id: row.id,
    cashId: row.cash_id,
    cashLabel: row.cash_label,
    branch: row.branch,
    responsibleId: row.responsible_id,
    responsibleName: row.responsible_name,
    openedBy: row.opened_by,
    openedAt: row.opened_at,
    initialFund: Number(row.initial_fund) || 0,
    breakdown: row.breakdown || null,
    note: row.note,
    status: row.status,
    closedAt: row.closed_at,
    closedBy: row.closed_by,
    closingFund: Number(row.closing_fund) || 0,
    expectedCash: Number(row.expected_cash) || 0,
    difference: Number(row.difference) || 0,
    reason: row.reason,
    authorizedBy: row.authorized_by,
    authorizedAt: row.authorized_at,
    closingNotes: row.close_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    syncStatus: 'synced',
    movements: (row.movements || []).map((m) => ({
      id: m.id,
      sessionId: m.session_id,
      type: m.type,
      label: m.label,
      amount: Number(m.amount) || 0,
      notes: m.notes,
      createdBy: m.created_by,
      at: m.created_at,
      createdAt: m.created_at,
    })),
  }
}

// =====================================================================
// API PÚBLICA
// =====================================================================

export const cashRepo = {
  async getAllLocal() {
    const db = await dbPromise
    const sessions = await db.getAll(STORES.CASH_SESSIONS)
    const hydrated = await Promise.all(sessions.map(hydrateSession))
    return hydrated.filter(Boolean).sort((a, b) => new Date(b.openedAt) - new Date(a.openedAt))
  },

  async getByIdLocal(id) {
    const db = await dbPromise
    const session = await db.get(STORES.CASH_SESSIONS, id)
    return hydrateSession(session)
  },

  async syncFromSupabase() {
    try {
      console.log('🔄 Sincronizando cajas desde Supabase...')
      const remote = await cashService.getAll()
      const mapped = remote.map(mapFromSupabase)
      for (const session of mapped) {
        await saveSessionToLocal(session)
      }
      console.log(`✅ ${mapped.length} cajas sincronizadas`)
      return mapped
    } catch (err) {
      console.error('❌ Error sincronizando cajas:', err)
      throw err
    }
  },

  async open(payload) {
    const isOnline = navigator.onLine
    const id = isOnline && crypto?.randomUUID ? crypto.randomUUID() : generateLocalId('cash')
    const now = new Date().toISOString()

    const localSession = {
      id,
      cashId: payload.cashId,
      cashLabel: payload.cashLabel,
      branch: payload.branch,
      responsibleId: payload.responsibleId || null,
      responsibleName: payload.responsibleName,
      responsibleRole: payload.responsibleRole,
      openedAt: now,
      openedBy: payload.openedBy || payload.responsibleName,
      initialFund: Number(payload.initialFund) || 0,
      breakdown: payload.breakdown || null,
      note: payload.note || '',
      status: 'open',
      closedAt: null,
      closedBy: null,
      closingFund: null,
      expectedCash: null,
      difference: null,
      reason: null,
      authorizedBy: null,
      authorizedAt: null,
      closingNotes: null,
      createdAt: now,
      updatedAt: now,
      syncStatus: 'pending',
      movements: [
        {
          id: generateLocalId('mov'),
          sessionId: id,
          type: 'in',
          label: 'Apertura de caja',
          amount: Number(payload.initialFund) || 0,
          notes: null,
          createdBy: payload.responsibleName,
          at: now,
          createdAt: now,
        },
      ],
    }

    await saveSessionToLocal(localSession)

    // ⭐ Auditoría: Abrir caja
    await logAudit({
      action: 'register',
      module: 'cash',
      entity: 'cash',
      entityId: localSession.id,
      entityName: localSession.cashLabel,
      description: `Apertura de caja ${localSession.cashLabel} con fondo de $${Number(localSession.initialFund || 0).toLocaleString('es-MX')}`,
      userId: payload.responsibleId,
      userName: payload.responsibleName,
      userRole: payload.responsibleRole,
      branch: payload.branch,
      level: 'info',
      metadata: {
        initialFund: localSession.initialFund,
        breakdown: localSession.breakdown,
      },
    })

    await syncQueue.add({
      type: OP.OPEN_CASH,
      entity: 'cash_sessions',
      payload: {
        session: { ...localSession, movements: undefined },
        movements: localSession.movements,
      },
      priority: PRIORITY.HIGH,
    })

    console.log(`💰 Caja abierta localmente: ${localSession.cashLabel} (${id})`)
    return localSession
  },

  async close(id, patch) {
    const existing = await this.getByIdLocal(id)
    if (!existing) throw new Error(`Sesión no encontrada: ${id}`)

    const updated = {
      ...existing,
      status: 'closed',
      closedAt: new Date().toISOString(),
      closedBy: patch.closedBy || existing.responsibleName,
      closingFund: Number(patch.closingFund) || 0,
      expectedCash: Number(patch.expectedCash) || 0,
      difference: Number(patch.difference) || 0,
      reason: patch.reason || null,
      authorizedBy: patch.authorizedBy || null,
      authorizedAt: patch.authorizedAt || null,
      closingNotes: patch.notes || '',
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    }

    await saveSessionToLocal(updated)

    // ⭐ Auditoría: Cerrar caja
    const hasDiff = Math.abs(Number(patch.difference) || 0) > 0.01
    await logAudit({
      action: 'close',
      module: 'cash',
      entity: 'cash',
      entityId: updated.id,
      entityName: updated.cashLabel,
      description: hasDiff
        ? `Cierre de caja ${updated.cashLabel} · Diferencia $${Number(patch.difference).toLocaleString('es-MX')}`
        : `Cierre de caja ${updated.cashLabel} sin diferencias`,
      userName: patch.closedBy,
      userRole: 'Cajero',
      branch: updated.branch,
      level: hasDiff ? 'critical' : 'info',
      reason: patch.reason || null,
      metadata: {
        closingFund: patch.closingFund,
        expectedCash: patch.expectedCash,
        difference: patch.difference,
      },
    })

    await syncQueue.add({
      type: OP.CLOSE_CASH,
      entity: 'cash_sessions',
      payload: {
        id,
        patch: {
          closedBy: updated.closedBy,
          closingFund: updated.closingFund,
          expectedCash: updated.expectedCash,
          difference: updated.difference,
          reason: updated.reason,
          authorizedBy: updated.authorizedBy,
          authorizedAt: updated.authorizedAt,
          notes: updated.closingNotes,
        },
      },
      priority: PRIORITY.HIGH,
    })

    console.log(`🔒 Caja cerrada: ${updated.cashLabel}`)
    return updated
  },

  async addMovement({ sessionId, type, label, amount, notes, createdBy }) {
    const db = await dbPromise
    const session = await db.get(STORES.CASH_SESSIONS, sessionId)
    if (!session) throw new Error(`Sesión no encontrada: ${sessionId}`)

    const movement = {
      id: generateLocalId('mov'),
      sessionId,
      type,
      label: label || null,
      amount: Number(amount) || 0,
      notes: notes || null,
      createdBy: createdBy || null,
      at: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }

    await db.put(STORES.CASH_MOVEMENTS, movement)

    // ⭐ Auditoría: Movimiento de caja
    await logAudit({
      action: 'register',
      module: 'cash',
      entity: 'cash_movement',
      entityId: movement.id,
      entityName: label,
      description: `${type === 'in' ? 'Entrada' : 'Retiro'} de $${Number(amount).toLocaleString('es-MX')} en caja`,
      userName: createdBy,
      branch: session.branch,
      level: type === 'out' ? 'important' : 'info',
      metadata: { amount, type, sessionId },
    })

    await syncQueue.add({
      type: OP.ADD_CASH_MOVE,
      entity: 'cash_movements',
      payload: { movement },
      priority: PRIORITY.NORMAL,
    })

    return movement
  },

  async delete(id) {
    const db = await dbPromise
    await db.delete(STORES.CASH_SESSIONS, id)
    const movements = await db.getAllFromIndex(STORES.CASH_MOVEMENTS, 'session_id', id)
    for (const m of movements) {
      await db.delete(STORES.CASH_MOVEMENTS, m.id)
    }
    return true
  },
}