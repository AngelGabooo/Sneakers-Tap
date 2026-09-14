import { CheckCircle2, AlertTriangle, XCircle, Ban } from 'lucide-react'
import Card from '../../common/Card'
import Badge from '../../common/Badge'

const fmt = (n) =>
  `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

const CONDITION = {
  basic:       'Mayoreo Básico',
  premium:     'Mayoreo Premium',
  distributor: 'Distribuidor',
  custom:      'Personalizado',
}

const PRICE_LIST = {
  public:      'Precio público',
  basic:       'Mayoreo Básico',
  premium:     'Mayoreo Premium',
  distributor: 'Distribuidor',
  custom:      'Personalizada',
}

function getHealth(w) {
  if (!w) return { label: '—', variant: 'neutral', icon: CheckCircle2 }
  if (w.status === 'blocked')  return { label: 'Bloqueado', variant: 'danger',  icon: Ban }
  if (w.status === 'suspended') return { label: 'Suspendido', variant: 'warning', icon: AlertTriangle }
  if (w.overdue && Number(w.balance) > 0) return { label: 'Vencido', variant: 'danger', icon: XCircle }

  const limit = Number(w.creditLimit) || 0
  const used = Number(w.creditUsed) || 0
  if (limit > 0 && used / limit >= 0.8) return { label: 'Atención', variant: 'warning', icon: AlertTriangle }

  return { label: 'Saludable', variant: 'success', icon: CheckCircle2 }
}

export default function WholesaleDetailSidebar({ form }) {
  const health = getHealth(form)
  const HealthIcon = health.icon
  const limit = Number(form?.creditLimit || 0)
  const used = Number(form?.creditUsed || 0)
  const available = Math.max(0, limit - used)

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-brand-blue text-white flex items-center justify-center font-bold text-base shrink-0">
            {(form?.name?.[0] || '?').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-brand-black dark:text-dark-text truncate">
              {form?.name || 'Cliente mayorista'}
            </p>
            <p className="text-xs font-mono text-gray-500 dark:text-dark-muted truncate">
              {form?.id || 'MAY-XXXXX'}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 dark:border-dark-border">
          <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted mb-1">
            Estado de la cuenta
          </p>
          <div className="flex items-center gap-2">
            <HealthIcon
              size={14}
              strokeWidth={2.2}
              className={
                health.variant === 'success' ? 'text-emerald-500'
                : health.variant === 'warning' ? 'text-amber-500'
                : health.variant === 'danger' ? 'text-brand-red'
                : 'text-gray-400'
              }
            />
            <Badge variant={health.variant}>{health.label}</Badge>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text mb-3">
          Condiciones
        </h3>
        <ul className="space-y-2 text-sm">
          <Row label="Condición"    value={CONDITION[form?.condition] || '—'} />
          <Row label="Lista"        value={PRICE_LIST[form?.priceList] || '—'} />
          <Row label="Descuento"    value={form?.defaultDiscount ? `${form.defaultDiscount}%` : '—'} />
          <Row label="Dto. máximo"  value={form?.maxDiscount ? `${form.maxDiscount}%` : '—'} />
          <Row label="Compra mín."  value={form?.minPurchaseAmount ? fmt(form.minPurchaseAmount) : '—'} />
        </ul>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text mb-3">
          Crédito
        </h3>
        <ul className="space-y-2 text-sm">
          <Row label="Límite"      value={fmt(limit)} />
          <Row label="Utilizado"   value={fmt(used)} />
          <Row label="Disponible"  value={fmt(available)} emphasis />
          <Row label="Saldo"       value={fmt(form?.balance)} />
        </ul>
      </Card>

      <Card>
        <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text mb-3">
          Responsable
        </h3>
        <ul className="space-y-2 text-sm">
          <Row label="Vendedor" value={form?.responsable || '—'} />
          <Row label="Sucursal" value={form?.branch || '—'} />
        </ul>
      </Card>
    </div>
  )
}

function Row({ label, value, emphasis = false }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-gray-500 dark:text-dark-muted">{label}</span>
      <span className={`font-medium truncate ${emphasis ? 'text-brand-blue' : 'text-brand-black dark:text-dark-text'}`}>
        {value || '—'}
      </span>
    </li>
  )
}