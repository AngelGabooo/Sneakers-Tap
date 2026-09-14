import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import Card from '../../common/Card'
import Badge from '../../common/Badge'

const fmt = (n) =>
  `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

export default function WholesaleDetailCredit({ credit }) {
  const limit = Number(credit?.limit || 0)
  const used = Number(credit?.used || 0)
  const available = Math.max(0, limit - used)
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0

  const overdue = credit?.overdue && credit?.balance > 0

  return (
    <Card className="mb-5">
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Estado de cuenta
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Situación actual de la línea de crédito.
          </p>
        </div>
        <Badge variant={overdue ? 'danger' : 'success'}>
          {overdue ? 'Pago vencido' : 'Al corriente'}
        </Badge>
      </header>

      <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
        <Stat label="Límite" value={fmt(limit)} />
        <Stat label="Utilizado" value={fmt(used)} />
        <Stat label="Disponible" value={fmt(available)} emphasis />
      </div>

      {/* Barra de utilización */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-dark-muted mb-1.5">
          <span>Utilización</span>
          <span className="font-medium text-brand-black dark:text-dark-text">
            {pct.toFixed(1)}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 dark:bg-dark-surface overflow-hidden">
          <div
            className={`h-full transition-all ${
              pct >= 90
                ? 'bg-brand-red'
                : pct >= 70
                  ? 'bg-amber-500'
                  : 'bg-brand-blue'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {overdue && (
        <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-brand-red">
          <AlertTriangle size={13} strokeWidth={2.2} className="mt-0.5 shrink-0" />
          <span>
            El cliente tiene pagos vencidos. Verifica antes de autorizar nuevas ventas a crédito.
          </span>
        </div>
      )}
    </Card>
  )
}

function Stat({ label, value, emphasis = false }) {
  return (
    <div className="rounded-lg border border-gray-100 dark:border-dark-border p-3">
      <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted">
        {label}
      </p>
      <p className={`mt-0.5 ${emphasis ? 'text-lg font-bold text-brand-blue' : 'text-base font-semibold text-brand-black dark:text-dark-text'}`}>
        {value}
      </p>
    </div>
  )
}