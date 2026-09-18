// src/components/credits/CreditDetailDrawer.jsx
import { useMemo } from 'react'
import {
  X, HandCoins, AlertTriangle, CheckCircle2, Clock, Ban,
  User, Calendar, FileText, Trash2, ShoppingCart, TrendingDown,
} from 'lucide-react'
import Badge from '../common/Badge'
import Button from '../common/Button'
import { useSales } from '../../context/SalesContext'

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 2 })}`

const fmtDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
}

const fmtDateTime = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

const STATUS_CONFIG = {
  active:    { label: 'Activo',    variant: 'info',    icon: Clock },
  overdue:   { label: 'Vencido',   variant: 'danger',  icon: AlertTriangle },
  paid:      { label: 'Pagado',    variant: 'success', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', variant: 'neutral', icon: Ban },
}

export default function CreditDetailDrawer({ open, credit, onClose, onPay, onCancel, onViewCustomer }) {
  const { sales } = useSales()

  // ⭐ Calcular los CARGOS (ventas a crédito) para este crédito
  //    desde la creación del crédito
  const charges = useMemo(() => {
    if (!open || !credit) return []

    const createdAt = new Date(credit.createdAt).getTime()

    return sales
      .filter((s) => {
        if (s.customerId !== credit.customerId) return false
        if (s.payment?.method !== 'credit') return false
        if (s.status === 'cancelled') return false
        const d = new Date(s.createdAt).getTime()
        return d >= createdAt
      })
      .map((s) => ({
        id: s.id,
        folio: s.folio,
        amount: Number(s.total) || 0,
        createdAt: s.createdAt,
        itemsCount: (s.items || []).reduce((a, i) => a + (Number(i.quantity) || 0), 0),
        type: 'charge',
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [open, credit, sales])

  // ⭐ Pagos desde credit.payments
  const payments = useMemo(() => {
    if (!open || !credit) return []
    return (credit.payments || [])
      .map((p) => ({ ...p, type: 'payment' }))
      .sort((a, b) => new Date(b.paidAt) - new Date(a.paidAt))
  }, [open, credit])

  // ⭐ Timeline combinada (cargos + pagos)
  const timeline = useMemo(() => {
    const combined = [...charges, ...payments]
    return combined.sort((a, b) => {
      const ta = new Date(a.createdAt || a.paidAt).getTime()
      const tb = new Date(b.createdAt || b.paidAt).getTime()
      return tb - ta
    })
  }, [charges, payments])

  if (!open || !credit) return null

  const cfg = STATUS_CONFIG[credit.status] || STATUS_CONFIG.active
  const StatusIcon = cfg.icon
  const canPay = (credit.status === 'active' || credit.status === 'overdue') && (credit.outstanding > 0)
  const canCancel = credit.status === 'active' && credit.used === 0

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-black/50 backdrop-blur-sm">
      {/* Backdrop */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer */}
      <div className="w-full max-w-lg h-full flex flex-col bg-white dark:bg-dark-card border-l border-gray-200 dark:border-dark-border shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-dark-border shrink-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-brand-black dark:text-dark-text truncate">
              {credit.customerName}
            </h3>
            <div className="mt-1">
              <Badge variant={cfg.variant}>
                <StatusIcon size={11} strokeWidth={2.4} />
                {cfg.label}
              </Badge>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-brand-black dark:hover:text-dark-text transition-colors shrink-0 ml-2"
            aria-label="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto">
          {/* Resumen 4 columnas */}
          <div className="p-5 border-b border-gray-100 dark:border-dark-border">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-dark-surface">
                <p className="text-[10px] uppercase text-gray-400 dark:text-dark-muted mb-0.5">Límite</p>
                <p className="text-sm font-bold text-brand-black dark:text-dark-text">{fmt(credit.amount)}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30">
                <p className="text-[10px] uppercase text-amber-600 dark:text-amber-400 mb-0.5">Usado</p>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-300">{fmt(credit.used)}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                <p className="text-[10px] uppercase text-emerald-600 dark:text-emerald-400 mb-0.5">Pagado</p>
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">{fmt(credit.paidAmount)}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                <p className="text-[10px] uppercase text-brand-blue mb-0.5">Disponible</p>
                <p className="text-sm font-bold text-brand-blueDark dark:text-blue-200">{fmt(credit.available)}</p>
              </div>
            </div>

            {/* Deuda pendiente */}
            {credit.outstanding > 0 && (
              <div className="mt-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex justify-between items-center">
                <span className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                  Deuda pendiente
                </span>
                <span className="text-base font-bold text-amber-900 dark:text-amber-200">
                  {fmt(credit.outstanding)}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-5 border-b border-gray-100 dark:border-dark-border space-y-3">
            <InfoRow icon={User} label="Cliente" value={credit.customerName} />
            <InfoRow icon={Calendar} label="Otorgado" value={fmtDate(credit.createdAt)} />
            <InfoRow
              icon={Calendar}
              label="Vence"
              value={fmtDate(credit.dueDate)}
              tone={credit.status === 'overdue' ? 'danger' : 'neutral'}
            />
            {credit.notes && (
              <InfoRow icon={FileText} label="Notas" value={credit.notes} />
            )}
          </div>

          {/* Historial combinado (cargos + pagos) */}
          <div className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-brand-black dark:text-dark-text">
                Historial de movimientos
              </h4>
              <span className="text-[11px] text-gray-500 dark:text-dark-muted">
                {timeline.length} {timeline.length === 1 ? 'movimiento' : 'movimientos'}
              </span>
            </div>

            {timeline.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-gray-500 dark:text-dark-muted">
                  Sin movimientos registrados todavía.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {timeline.map((item) => {
                  if (item.type === 'charge') {
                    return (
                      <li
                        key={`charge-${item.id}`}
                        className="
                          flex items-center justify-between gap-3
                          p-3 rounded-lg border border-red-100 dark:border-red-900/40
                          bg-red-50/40 dark:bg-red-950/20
                        "
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/40 flex items-center justify-center shrink-0">
                            <ShoppingCart size={14} className="text-brand-red" strokeWidth={2.2} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-brand-red">
                              - {fmt(item.amount)}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-dark-muted truncate">
                              Venta {item.folio} · {item.itemsCount} {item.itemsCount === 1 ? 'artículo' : 'artículos'}
                            </p>
                            <p className="text-[10px] text-gray-400 dark:text-dark-muted">
                              {fmtDateTime(item.createdAt)}
                            </p>
                          </div>
                        </div>
                      </li>
                    )
                  }

                  // Pago
                  return (
                    <li
                      key={`payment-${item.id}`}
                      className="
                        flex items-center justify-between gap-3
                        p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/40
                        bg-emerald-50/40 dark:bg-emerald-950/20
                      "
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                          <HandCoins size={14} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2.2} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            + {fmt(item.amount)}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-dark-muted">
                            {methodLabel(item.method)} · {item.receivedByName || '—'}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-dark-muted">
                            {fmtDateTime(item.paidAt)}
                          </p>
                          {item.notes && (
                            <p className="text-[10px] text-gray-400 dark:text-dark-muted italic mt-0.5">
                              {item.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Footer sticky */}
        <div className="p-4 border-t border-gray-100 dark:border-dark-border shrink-0 space-y-2">
          {canPay && (
            <Button
              variant="primary"
              icon={HandCoins}
              className="w-full"
              onClick={() => onPay?.(credit)}
            >
              Registrar pago
            </Button>
          )}
          <div className="flex gap-2">
            <Button
              variant="secondary"
              icon={User}
              className="flex-1"
              onClick={() => onViewCustomer?.(credit)}
            >
              Ver cliente
            </Button>
            {canCancel && (
              <Button
                variant="danger"
                icon={Trash2}
                onClick={() => onCancel?.(credit)}
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, tone = 'neutral' }) {
  const tones = {
    neutral: 'text-brand-black dark:text-dark-text',
    danger:  'text-brand-red',
  }
  return (
    <div className="flex items-start gap-3">
      <Icon size={15} className="text-gray-400 mt-0.5 shrink-0" strokeWidth={2} />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider text-gray-400 dark:text-dark-muted">
          {label}
        </p>
        <p className={`text-sm font-medium ${tones[tone]}`}>{value}</p>
      </div>
    </div>
  )
}

function methodLabel(m) {
  if (m === 'cash') return 'Efectivo'
  if (m === 'card') return 'Tarjeta'
  if (m === 'transfer') return 'Transferencia'
  if (m === 'credit') return 'Crédito'
  return m || 'Otro'
}