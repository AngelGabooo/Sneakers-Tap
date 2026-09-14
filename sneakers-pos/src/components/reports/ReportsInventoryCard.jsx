import { Warehouse, ArrowRight } from 'lucide-react'
import Card from '../common/Card'

const fmtMoney = (n) =>
  `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

export default function ReportsInventoryCard({ inventory, onView }) {
  return (
    <Card>
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
            <Warehouse size={17} className="text-brand-blue" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-brand-black dark:text-dark-text">
              Inventario
            </h3>
            <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
              Estado del catálogo.
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="Valor de inventario" value={inventory?.value != null ? fmtMoney(inventory.value) : '—'} />
        <Stat label="Unidades"            value={inventory?.units ?? '—'} />
        <Stat label="Con stock bajo"      value={inventory?.lowStock ?? '—'} tone="warning" />
        <Stat label="Agotados"            value={inventory?.outOfStock ?? '—'} tone="danger" />
      </div>

      <button
        type="button"
        onClick={onView}
        className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
      >
        Ver reporte de inventario
        <ArrowRight size={11} strokeWidth={2.4} />
      </button>
    </Card>
  )
}

function Stat({ label, value, tone = 'neutral' }) {
  const tones = {
    neutral: 'text-brand-black dark:text-dark-text',
    warning: 'text-amber-600 dark:text-amber-400',
    danger:  'text-brand-red',
  }
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-dark-muted">
        {label}
      </p>
      <p className={`mt-0.5 text-base font-bold ${tones[tone]}`}>{value ?? '—'}</p>
    </div>
  )
}