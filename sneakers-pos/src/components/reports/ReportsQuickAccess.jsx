import { Zap } from 'lucide-react'
import Card from '../common/Card'

const QUICK = [
  { key: 'sales_today',      label: 'Ventas de hoy' },
  { key: 'sales_by_seller',  label: 'Ventas por vendedor' },
  { key: 'inventory_low',    label: 'Inventario bajo' },
  { key: 'profit_month',     label: 'Rentabilidad del mes' },
  { key: 'cash_diff',        label: 'Diferencias de caja' },
  { key: 'top_customers',    label: 'Clientes principales' },
]

export default function ReportsQuickAccess({ onOpen }) {
  return (
    <Card className="mb-5">
      <header className="flex items-center gap-2 mb-3">
        <Zap size={15} className="text-brand-blue" strokeWidth={2.2} />
        <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
          Reportes más utilizados
        </h3>
      </header>

      <div className="flex flex-wrap gap-2">
        {QUICK.map((q) => (
          <button
            key={q.key}
            type="button"
            onClick={() => onOpen?.(q.key)}
            className="
              h-8 px-3 rounded-full text-xs font-medium
              bg-gray-100 dark:bg-dark-surface
              text-gray-700 dark:text-dark-muted
              hover:bg-brand-blue hover:text-white
              transition-colors
            "
          >
            {q.label}
          </button>
        ))}
      </div>
    </Card>
  )
}