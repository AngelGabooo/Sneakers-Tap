import { CheckCircle2, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import Card from '../../common/Card'
import Badge from '../../common/Badge'

const fmt = (n) => `$${Math.abs(Number(n || 0)).toLocaleString('es-MX')}`

export default function CashCloseReconciliation({ expected = 0, counted = 0 }) {
  const diff = counted - expected
  const matches = Math.abs(diff) < 0.01
  const isSobrante = diff > 0
  const isFaltante = diff < 0

  return (
    <Card>
      <header className="mb-4">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Conciliación
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Comparación entre el efectivo esperado y el contado.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <Stat label="Efectivo esperado" value={fmt(expected)} />
        <Stat label="Efectivo contado"  value={fmt(counted)} />
        <Stat
          label="Diferencia"
          value={`${diff >= 0 ? '+' : '-'}${fmt(diff)}`}
          tone={matches ? 'success' : isSobrante ? 'warning' : 'danger'}
          emphasis
        />
      </div>

      {matches && (
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
          <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={2.2} />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                Caja conciliada
              </p>
              <Badge variant="success">Conciliada</Badge>
            </div>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400 mt-0.5">
              El efectivo contado coincide exactamente con el efectivo esperado.
            </p>
          </div>
        </div>
      )}

      {!matches && isSobrante && (
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
          <TrendingUp size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" strokeWidth={2.2} />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Sobrante de {fmt(diff)}
              </p>
              <Badge variant="warning">Sobrante</Badge>
            </div>
            <p className="text-xs text-amber-700/80 dark:text-amber-400 mt-0.5">
              El efectivo contado es mayor al esperado. Registra una justificación.
            </p>
          </div>
        </div>
      )}

      {!matches && isFaltante && (
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50">
          <TrendingDown size={18} className="text-brand-red shrink-0 mt-0.5" strokeWidth={2.2} />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-brand-red">
                Faltante de {fmt(diff)}
              </p>
              <Badge variant="danger">Faltante</Badge>
            </div>
            <p className="text-xs text-red-600/80 dark:text-red-400 mt-0.5">
              El efectivo contado es menor al esperado. Registra una justificación.
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}

function Stat({ label, value, tone = 'neutral', emphasis = false }) {
  const tones = {
    neutral: 'text-brand-black dark:text-dark-text',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger:  'text-brand-red',
  }
  return (
    <div className="rounded-lg border border-gray-100 dark:border-dark-border p-3">
      <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted">
        {label}
      </p>
      <p className={`${emphasis ? 'text-xl font-bold' : 'text-lg font-semibold'} ${tones[tone]} mt-0.5`}>
        {value}
      </p>
    </div>
  )
}