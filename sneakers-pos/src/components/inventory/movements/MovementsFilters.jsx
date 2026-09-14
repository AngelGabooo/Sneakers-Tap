import { Search, Filter, Calendar } from 'lucide-react'
import Button from '../../common/Button'

const PERIODS = [
  { value: 'today',   label: 'Hoy' },
  { value: 'yesterday', label: 'Ayer' },
  { value: '7d',      label: 'Últimos 7 días' },
  { value: '30d',     label: 'Últimos 30 días' },
  { value: 'month',   label: 'Este mes' },
  { value: 'lastMonth', label: 'Mes anterior' },
  { value: 'custom',  label: 'Personalizado' },
]

export default function MovementsFilters({
  search, onSearchChange,
  period, onPeriodChange,
  onToggleFilters, filtersActive,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-3">
      <div className="relative flex-1">
        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
          <Search size={17} strokeWidth={1.8} />
        </span>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Buscar por producto, SKU, variante, código de barras o usuario..."
          className="
            w-full h-10 pl-9 pr-3 rounded-lg text-sm
            bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
            border border-gray-200 dark:border-dark-border
            focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40
            outline-none placeholder:text-gray-400 dark:placeholder:text-dark-muted
            transition-all duration-150
          "
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
            <Calendar size={15} strokeWidth={1.8} />
          </span>
          <select
            value={period}
            onChange={(e) => onPeriodChange?.(e.target.value)}
            className="
              h-10 pl-9 pr-8 rounded-lg text-sm font-medium
              bg-white dark:bg-dark-card
              border border-gray-200 dark:border-dark-border
              text-brand-black dark:text-dark-text
              hover:border-brand-blue focus:border-brand-blue
              outline-none cursor-pointer appearance-none
            "
          >
            {PERIODS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        <Button
          variant={filtersActive ? 'outline' : 'secondary'}
          icon={Filter}
          onClick={onToggleFilters}
        >
          Filtros
        </Button>
      </div>
    </div>
  )
}