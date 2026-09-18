// src/components/wholesale/detail/WholesaleCreditSection.jsx
import { HandCoins, Calendar, AlertTriangle, CheckCircle2, Clock, Ban } from 'lucide-react'
import Badge from '../../common/Badge'
import Button from '../../common/Button'

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 2 })}`

const fmtDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })
}

const STATUS_CONFIG = {
  active:    { label: 'Activo',    variant: 'info',    icon: Clock },
  overdue:   { label: 'Vencido',   variant: 'danger',  icon: AlertTriangle },
  paid:      { label: 'Pagado',    variant: 'success', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', variant: 'neutral', icon: Ban },
}

export default function WholesaleCreditSection({ credit, onGrant, onViewDetail }) {
  // Sin crédito activo → botón para otorgar
  if (!credit) {
    return (
      <div className="
        p-4 rounded-lg
        bg-gray-50 dark:bg-dark-surface
        border border-dashed border-gray-300 dark:border-dark-border
      ">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-dark-card flex items-center justify-center shrink-0">
            <HandCoins size={18} className="text-gray-500" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
              Sin crédito otorgado
            </p>
            <p className="text-[11px] text-gray-500 dark:text-dark-muted mt-0.5">
              Este cliente no tiene un crédito activo. Puedes otorgarle uno dentro de su límite configurado.
            </p>
            <button
              type="button"
              onClick={onGrant}
              className="
                mt-3 inline-flex items-center gap-1.5 h-8 px-3 rounded-md
                text-[11px] font-bold
                bg-brand-blue text-white hover:bg-blue-700
                transition-colors
              "
            >
              <HandCoins size={12} strokeWidth={2.4} />
              Otorgar crédito
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Con crédito activo → mostrar info + acciones
  const cfg = STATUS_CONFIG[credit.status] || STATUS_CONFIG.active
  const StatusIcon = cfg.icon
  const canPay = credit.status === 'active' || credit.status === 'overdue'

  return (
    <div className="
      p-4 rounded-lg
      bg-blue-50/60 dark:bg-blue-950/20
      border border-blue-200 dark:border-blue-900/40
    ">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <HandCoins size={16} className="text-brand-blue shrink-0" strokeWidth={2.2} />
          <p className="text-sm font-bold text-brand-black dark:text-dark-text">
            Crédito otorgado
          </p>
        </div>
        <Badge variant={cfg.variant}>
          <StatusIcon size={11} strokeWidth={2.4} />
          {cfg.label}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <p className="text-[10px] uppercase text-gray-500 dark:text-dark-muted">Otorgado</p>
          <p className="text-sm font-bold text-brand-black dark:text-dark-text">{fmt(credit.amount)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-gray-500 dark:text-dark-muted">Pagado</p>
          <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{fmt(credit.paidAmount)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-gray-500 dark:text-dark-muted">Saldo</p>
          <p className="text-sm font-bold text-brand-blueDark dark:text-blue-200">{fmt(credit.balance)}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-dark-muted mb-3">
        <Calendar size={11} strokeWidth={2} />
        Vence: <span className="font-semibold text-brand-black dark:text-dark-text">{fmtDate(credit.dueDate)}</span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={onViewDetail}>
          Ver detalle
        </Button>
        {canPay && (
          <Button variant="primary" size="sm" icon={HandCoins} onClick={onViewDetail}>
            Cobrar
          </Button>
        )}
      </div>
    </div>
  )
}