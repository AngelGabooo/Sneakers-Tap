// src/utils/notifyAdmins.js
import { notificationsRepo } from '../repositories/notificationsRepo'

/**
 * Notifica a los administradores sobre un evento del sistema.
 * Persiste en Supabase (o queda en cache si no hay internet).
 */
export async function notifyAdmins(payload) {
  try {
    const entry = await notificationsRepo.create({
      read: false,
      priority: 'normal',
      ...payload,
    })
    return entry
  } catch (e) {
    console.warn('No se pudo enviar la notificación:', e)
  }
}

/* Helpers semánticos */

export function notifySale({ sale, actorName, actorRole, cashId, branch }) {
  const total = Number(sale?.total || sale?.totals?.total || 0)
  const itemsCount = (sale?.items || []).length

  return notifyAdmins({
    type: 'sale',
    title: `Venta registrada · ${sale?.folio || '—'}`,
    description: `${actorName} vendió $${total.toLocaleString('es-MX')} · ${itemsCount} ${itemsCount === 1 ? 'producto' : 'productos'}`,
    priority: total > 5000 ? 'important' : 'normal',
    actorName,
    actorRole,
    entityId: sale?.folio,
    meta: {
      saleId: sale?.id,
      total,
      itemsCount,
      cashId,
      branch,
      paymentMethod: sale?.payment?.method,
    },
  })
}

export function notifySaleCancel({ sale, actorName, actorRole, reason }) {
  const total = Number(sale?.total || sale?.totals?.total || 0)

  return notifyAdmins({
    type: 'cancel',
    title: `Venta cancelada · ${sale?.folio || '—'}`,
    description: `${actorName} canceló ${sale?.folio || 'venta'} por $${total.toLocaleString('es-MX')}${reason ? ` · ${reason}` : ''}`,
    priority: 'critical',
    actorName,
    actorRole,
    entityId: sale?.folio,
    meta: { saleId: sale?.id, total, reason: reason || '' },
  })
}

export function notifySaleReturn({ sale, actorName, actorRole, reason, amount, isPartial }) {
  const total = Number(sale?.total || sale?.totals?.total || 0)
  const returnAmount = Number(amount) || total

  return notifyAdmins({
    type: 'return',
    title: `${isPartial ? 'Devolución parcial' : 'Devolución'} · ${sale?.folio || '—'}`,
    description: `${actorName} procesó una ${isPartial ? 'devolución parcial' : 'devolución'} de $${returnAmount.toLocaleString('es-MX')}${reason ? ` · ${reason}` : ''}`,
    priority: 'important',
    actorName,
    actorRole,
    entityId: sale?.folio,
    meta: { saleId: sale?.id, total, amount: returnAmount, isPartial: !!isPartial, reason: reason || '' },
  })
}

export function notifyCashOpen({ session, actorName, actorRole, initialFund, branch }) {
  return notifyAdmins({
    type: 'cash_open',
    title: `Caja abierta · ${session?.cashLabel || session?.id || '—'}`,
    description: `${actorName} abrió caja con fondo de $${(Number(initialFund) || 0).toLocaleString('es-MX')}`,
    priority: 'normal',
    actorName,
    actorRole,
    entityId: session?.id,
    meta: { sessionId: session?.id, initialFund: Number(initialFund) || 0, branch },
  })
}

export function notifyCashClose({ session, actorName, actorRole, difference, expected, counted }) {
  const diff = Number(difference) || 0
  const hasDiff = Math.abs(diff) > 0.01

  return notifyAdmins({
    type: 'cash_close',
    title: `Caja cerrada · ${session?.cashLabel || session?.id || '—'}`,
    description: hasDiff
      ? `${actorName} cerró caja · Diferencia ${diff >= 0 ? '+' : '-'}$${Math.abs(diff).toLocaleString('es-MX')}`
      : `${actorName} cerró caja sin diferencias`,
    priority: hasDiff ? 'important' : 'normal',
    actorName,
    actorRole,
    entityId: session?.id,
    meta: { sessionId: session?.id, difference: diff, expected: Number(expected) || 0, counted: Number(counted) || 0 },
  })
}

export function notifyLoginFailed({ email, reason }) {
  return notifyAdmins({
    type: 'login_failed',
    title: `Acceso rechazado · ${email}`,
    description: reason || 'Credenciales inválidas',
    priority: 'important',
    actorName: email,
    actorRole: '—',
    meta: { email, reason },
  })
}