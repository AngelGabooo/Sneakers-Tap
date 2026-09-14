const QUICK_FILTERS = [
  { key: 'all',    label: 'Todas' },
  { key: 'out',    label: 'Agotadas' },
  { key: 'low',    label: 'Stock bajo' },
  { key: 'soon',   label: 'Por agotarse' },
  { key: 'high',   label: 'Alta prioridad' },
  { key: 'restock',label: 'Pendientes de reposición' },
]

export default function AlertsQuickFilters({ active = 'all', counts = {}, onChange }) {
  return (
    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
      {QUICK_FILTERS.map(({ key, label }) => {
        const isActive = active === key
        const count = counts[key]
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange?.(key)}
            className={`
              shrink-0 h-8 px-3 rounded-full text-sm font-medium
              border transition-colors duration-150 flex items-center gap-1.5
              ${isActive
                ? 'bg-brand-blue text-white border-brand-blue'
                : 'bg-white dark:bg-dark-card text-gray-700 dark:text-dark-muted border-gray-200 dark:border-dark-border hover:border-brand-blue hover:text-brand-blue'}
            `}
          >
            {label}
            {count != null && count > 0 && (
              <span className={`text-[11px] font-semibold ${isActive ? 'text-white/80' : 'text-gray-400 dark:text-dark-muted'}`}>
                ({count})
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}