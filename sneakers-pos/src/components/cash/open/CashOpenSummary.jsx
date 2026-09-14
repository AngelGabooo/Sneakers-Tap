import { CheckCircle2 } from 'lucide-react'
import Card from '../../common/Card'

export default function CashOpenSummary({
  cash, user, date,
  initialFund, breakdownTotal, breakdownEnabled,
  allValid,
  onOpen,
  submitting,
}) {
  return (
    <Card className="lg:sticky lg:top-20">
      <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text mb-4">
        Resumen de apertura
      </h2>

      <div className="space-y-2 pb-4 border-b border-gray-100 dark:border-dark-border">
        <Row label="Caja"        value={cash?.label || '—'} />
        <Row label="Sucursal"    value={cash?.branch || '—'} />
        <Row label="Responsable" value={user?.name || '—'} />
        <Row label="Fecha"       value={date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })} />
        <Row label="Hora"        value={date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} />
      </div>

      <div className="py-4 border-b border-gray-100 dark:border-dark-border">
        <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted mb-1">
          Fondo inicial
        </p>
        <p className="text-3xl font-bold text-brand-black dark:text-dark-text">
          ${Number(initialFund || 0).toLocaleString('es-MX')}
        </p>
      </div>

      {/* Validaciones */}
      <ul className="py-4 space-y-2 border-b border-gray-100 dark:border-dark-border">
        <Check label="Caja disponible"     ok={!!cash && cash.status !== 'open' && cash.status !== 'blocked'} />
        <Check label="Responsable autorizado" ok={!!user} />
        <Check label="Fondo inicial válido" ok={Number(initialFund) > 0} />
        {breakdownEnabled && (
          <Check
            label="Conteo verificado"
            ok={Math.abs((Number(breakdownTotal) || 0) - (Number(initialFund) || 0)) < 0.01}
          />
        )}
        {!breakdownEnabled && (
          <Check label="Fondo inicial registrado" ok={Number(initialFund) > 0} />
        )}
      </ul>

      <button
        type="button"
        onClick={onOpen}
        disabled={!allValid || submitting}
        className={`
          mt-4 w-full h-12 rounded-lg text-base font-semibold text-white
          transition-colors
          ${!allValid || submitting
            ? 'bg-gray-300 dark:bg-dark-border cursor-not-allowed'
            : 'bg-brand-blue hover:bg-brand-blueHover active:bg-brand-blueDark'}
        `}
      >
        {submitting ? 'Abriendo caja...' : 'Abrir caja'}
      </button>
    </Card>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-gray-500 dark:text-dark-muted">{label}</span>
      <span className="font-medium text-brand-black dark:text-dark-text text-right truncate">
        {value}
      </span>
    </div>
  )
}

function Check({ label, ok }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <CheckCircle2
        size={14}
        strokeWidth={2.2}
        className={ok ? 'text-emerald-500' : 'text-gray-300 dark:text-dark-border'}
      />
      <span className={ok ? 'text-brand-black dark:text-dark-text' : 'text-gray-400 dark:text-dark-muted'}>
        {label}
      </span>
    </li>
  )
}