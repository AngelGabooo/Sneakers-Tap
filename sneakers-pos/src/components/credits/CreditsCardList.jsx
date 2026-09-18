// src/components/credits/CreditsCardList.jsx
import { AlertTriangle, CheckCircle2, Clock, Ban, HandCoins } from 'lucide-react'
import Card from '../common/Card'
import Badge from '../common/Badge'

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 2 })}`

const fmtDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
}

const STATUS_CONFIG = {
  active:    { label: 'Activo',    variant: 'info',    icon: Clock },
  overdue:   { label: 'Vencido',   variant: 'danger',  icon: AlertTriangle },
  paid:      { label: 'Pagado',    variant: 'success', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', variant: 'neutral', icon: Ban },
}

export default function CreditsCardList({ credits, loading, onViewDetail, onPay }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <div className="h-20 rounded-lg bg-gray-100 dark:bg-dark-surface animate-pulse" />
          </Card>
        ))}
      </div>
    )
  }

  if (credits.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <HandCoins size={32} className="mx-auto mb-3 text-gray-300 dark:text-border" strokeWidth={1.5} />
          <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
            Sin créditos registrados
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {credits.map((c) => {
        const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.active
        const StatusIcon = cfg.icon

        return (
          <Card key={c.id}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-brand-black dark:text-dark-text truncate">
                  {c.customerName}
                </p>
                <p className="text-[11px] text-gray-500 dark:text-dark-muted">
                  Otorgado {fmtDate(c.createdAt)}
                </p>
              </div>
              <Badge variant={cfg.variant}>
                <StatusIcon size={11} strokeWidth={2.4} />
                {cfg.label}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
              <div>
                <p className="text-[10px] uppercase text-gray-400 dark:text-dark-muted">Otorgado</p>
                <p className="text-sm font-bold text-brand-black dark:text-dark-text">{fmt(c.amount)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-400 dark:text-dark-muted">Pagado</p>
                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{fmt(c.paidAmount)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-gray-400 dark:text-dark-muted">Saldo</p>
                <p className="text-sm font-bold text-brand-black dark:text-dark-text">{fmt(c.balance)}</p>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 dark:text-dark-muted mb-3">
              Vence: <span className="font-medium text-brand-black dark:text-dark-text">{fmtDate(c.dueDate)}</span>
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onViewDetail?.(c)}
                className="flex-1 h-9 rounded-lg text-xs font-medium text-gray-600 dark:text-dark-muted border border-gray-200 dark:border-dark-border hover:border-brand-blue transition-colors"
              >
                Ver detalle
              </button>
              {(c.status === 'active' || c.status === 'overdue') && (
                <button
                  type="button"
                  onClick={() => onPay?.(c)}
                  className="
                    flex-1 h-9 rounded-lg text-xs font-bold text-white
                    bg-brand-blue hover:bg-blue-700 transition-colors
                    inline-flex items-center justify-center gap-1
                  "
                >
                  <HandCoins size={12} strokeWidth={2.4} />
                  Cobrar
                </button>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}