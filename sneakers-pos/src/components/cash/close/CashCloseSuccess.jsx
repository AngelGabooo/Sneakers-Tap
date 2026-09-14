import { CheckCircle2, History, Receipt, ArrowLeft } from 'lucide-react'
import Button from '../../common/Button'

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX')}`

export default function CashCloseSuccess({ session, summary, counted, onGoHistory, onGoSales, onGoDashboard }) {
  if (!session) return null

  const diff = counted - (summary?.expectedCash || 0)
  const matches = Math.abs(diff) < 0.01

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-cardHover p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 mx-auto flex items-center justify-center mb-4">
          <CheckCircle2 size={30} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
        </div>

        <h2 className="text-xl font-bold text-brand-black dark:text-dark-text">
          {matches ? 'Caja cerrada correctamente' : 'Caja cerrada con diferencia'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-2">
          La sesión de caja{' '}
          <span className="font-mono font-semibold text-brand-black dark:text-dark-text">
            {session.id}
          </span>{' '}
          fue cerrada y registrada correctamente.
        </p>

        <div className="mt-6 rounded-lg border border-gray-100 dark:border-dark-border p-5 text-left space-y-2 text-sm">
          <Row label="Caja"                value={session.cashLabel} />
          <Row label="Sesión"              value={session.id} mono />
          <Row label="Responsable"         value={session.responsibleName} />
          <Row label="Fondo inicial"       value={fmt(summary?.initialFund)} />
          <Row label="Ventas en efectivo"  value={fmt(summary?.cashSales)} />
          <Row label="Entradas"            value={fmt(summary?.cashIn)} />
          <Row label="Retiros"             value={`-${fmt(summary?.cashOut)}`} />
          <Row label="Efectivo esperado"   value={fmt(summary?.expectedCash)} emphasis />
          <Row label="Efectivo contado"    value={fmt(counted)} emphasis />
          <Row
            label="Diferencia"
            value={`${diff >= 0 ? '+' : '-'}${fmt(diff)}`}
            tone={matches ? 'success' : diff > 0 ? 'warning' : 'danger'}
          />
          <Row
            label="Estado"
            value={matches ? 'Cerrada y conciliada' : diff > 0 ? 'Cerrada con sobrante' : 'Cerrada con faltante'}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button variant="secondary" icon={History} onClick={onGoHistory}>
            Ver historial
          </Button>
          <Button variant="secondary" icon={Receipt} onClick={onGoSales}>
            Ver ventas
          </Button>
          <Button variant="primary" icon={ArrowLeft} onClick={onGoDashboard}>
            Volver al dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, tone = 'neutral', emphasis = false, mono = false }) {
  const tones = {
    neutral: 'text-brand-black dark:text-dark-text',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger:  'text-brand-red',
  }
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-500 dark:text-dark-muted">{label}</span>
      <span className={`font-semibold ${tones[tone]} ${emphasis ? 'text-base' : ''} ${mono ? 'font-mono text-xs' : ''}`}>
        {value || '—'}
      </span>
    </div>
  )
}