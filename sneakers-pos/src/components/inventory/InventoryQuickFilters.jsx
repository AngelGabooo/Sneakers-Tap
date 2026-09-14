const QUICK_FILTERS = [
  { key: 'all',      label: 'Todos' },
  { key: 'healthy',  label: 'Stock saludable' },
  { key: 'low',      label: 'Stock bajo' },
  { key: 'out',      label: 'Agotados' },
  { key: 'nomove',   label: 'Sin movimiento' },
  { key: 'recent',   label: 'Última recepción reciente' },
]

export default function InventoryQuickFilters({ active = 'all', onChange }) {
  return (
    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
      {QUICK_FILTERS.map(({ key, label }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange?.(key)}
            className={`
              shrink-0 h-8 px-3 rounded-full text-sm font-medium
              border transition-colors duration-150
              ${isActive
                ? 'bg-brand-blue text-white border-brand-blue'
                : 'bg-white dark:bg-dark-card text-gray-700 dark:text-dark-muted border-gray-200 dark:border-dark-border hover:border-brand-blue hover:text-brand-blue'}
            `}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}