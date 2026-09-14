import { Search, Calendar, SlidersHorizontal } from 'lucide-react'
import { PERIOD_OPTIONS } from '../../data/audit'

export default function AuditToolbar({
  search, onSearchChange,
  period, onPeriodChange,
  customFrom, customTo, onCustomFromChange, onCustomToChange,
  onToggleFilters, filtersActive,
}) {
  return (
    <div className="flex flex-col gap-3 mb-3">
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Buscar por usuario, acción, producto, venta, caja, documento o descripción..."
            className="
              w-full h-11 pl-10 pr-4 rounded-lg
              bg-white dark:bg-dark-surface
              border border-gray-200 dark:border-dark-border
              text-sm text-brand-black dark:text-dark-text
              placeholder:text-gray-400 dark:placeholder:text-dark-muted
              focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue
              transition-colors
            "
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-dark-muted">
            <Calendar size={14} strokeWidth={2.2} />
            <span className="hidden sm:inline">Periodo</span>
          </div>

          <select
            value={period}
            onChange={(e) => onPeriodChange?.(e.target.value)}
            className="h-11 px-3 rounded-lg text-sm font-medium bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-brand-black dark:text-dark-text outline-none cursor-pointer"
          >
            {PERIOD_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>

          {period === 'custom' && (
            <>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => onCustomFromChange?.(e.target.value)}
                className="h-11 px-3 rounded-lg text-sm bg-white dark:bg-dark-surface text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border outline-none"
              />
              <span className="text-gray-400 text-sm">a</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => onCustomToChange?.(e.target.value)}
                className="h-11 px-3 rounded-lg text-sm bg-white dark:bg-dark-surface text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border outline-none"
              />
            </>
          )}

          <button
            type="button"
            onClick={onToggleFilters}
            className={`
              inline-flex items-center gap-2 h-11 px-4 rounded-lg border text-sm font-medium transition-colors
              ${filtersActive
                ? 'bg-blue-50 border-brand-blue text-brand-blue dark:bg-blue-950/40 dark:border-blue-700 dark:text-blue-300'
                : 'bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border text-gray-700 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-card'}
            `}
          >
            <SlidersHorizontal size={16} strokeWidth={2} />
            Filtros
          </button>
        </div>
      </div>
    </div>
  )
}