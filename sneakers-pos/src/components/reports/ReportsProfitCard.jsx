import { TrendingUp } from 'lucide-react'
import Card from '../common/Card'

const fmtMoney = (n) =>
  `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

export default function ReportsProfitCard({ profit }) {
  const margin =
    profit?.netSales > 0 && profit?.profit != null
      ? ((profit.profit / profit.netSales) * 100).toFixed(2)
      : null

  return (
    <Card>
      <header className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
          <TrendingUp size={17} className="text-brand-blue" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-brand-black dark:text-dark-text">
            Rentabilidad estimada
          </h3>
          <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
            Cálculo del periodo seleccionado.
          </p>
        </div>
      </header>

      <ul className="space-y-2 text-sm">
        <Row label="Ingresos"        value={fmtMoney(profit?.netSales)} />
        <Row label="Costo mercancía" value={fmtMoney(profit?.cost)} />
        <Row label="Descuentos"      value={fmtMoney(profit?.discounts)} />
        <Row label="Utilidad"        value={fmtMoney(profit?.profit)} emphasis />
        <Row label="Margen"          value={margin != null ? `${margin}%` : '—'} emphasis />
      </ul>

      <p className="mt-3 text-[11px] text-gray-400 dark:text-dark-muted">
        Esta es una estimación operativa, no reemplaza la utilidad contable o fiscal.
      </p>
    </Card>
  )
}

function Row({ label, value, emphasis = false }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-gray-500 dark:text-dark-muted">{label}</span>
      <span className={emphasis
        ? 'font-bold text-brand-blue text-base'
        : 'font-medium text-brand-black dark:text-dark-text'}>
        {value ?? '—'}
      </span>
    </li>
  )
}