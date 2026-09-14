import Card from '../../common/Card'

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX')}`

export default function CashCloseFinalSummary({ session, summary, counted }) {
  const diff = counted - (summary?.expectedCash || 0)
  const matches = Math.abs(diff) < 0.01

  return (
    <Card>
      <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text mb-4">
        Resumen del cierre
      </h2>

      <ul className="space-y-2.5">
        <Row label="Caja"                value={session?.cashLabel} />
        <Row label="Sesión"              value={session?.id} mono />
        <Row label="Responsable"         value={session?.responsibleName} />
        <Row label="Fondo inicial"       value={fmt(summary?.initialFund)} />
        <Row label="Ventas en efectivo"  value={fmt(summary?.cashSales)} />
        <Row label="Entradas"            value={fmt(summary?.cashIn)} />
        <Row label="Retiros"             value={`-${fmt(summary?.cashOut)}`} />
        <Row label="Reembolsos"          value={fmt(summary?.refunds)} />
        <Row label="Efectivo esperado"   value={fmt(summary?.expectedCash)} emphasis />
        <Row label="Efectivo contado"    value={fmt(counted)} emphasis />
        <Row
          label="Diferencia"
          value={`${diff >= 0 ? '+' : '-'}${fmt(diff)}`}
          tone={matches ? 'success' : diff > 0 ? 'warning' : 'danger'}
        />
      </ul>
    </Card>
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
    <li className="flex items-center justify-between gap-3 text-sm">
      <span className="text-gray-500 dark:text-dark-muted">{label}</span>
      <span className={`font-semibold ${tones[tone]} ${emphasis ? 'text-base' : ''} ${mono ? 'font-mono text-xs' : ''}`}>
        {value || '—'}
      </span>
    </li>
  )
}