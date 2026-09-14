const FILTERS = [
  { key: 'all',        label: 'Todas' },
  { key: 'open',       label: 'Abiertas' },
  { key: 'closed',     label: 'Cerradas' },
  { key: 'reconciled', label: 'Conciliadas' },
  { key: 'shortage',   label: 'Con faltante' },
  { key: 'surplus',    label: 'Con sobrante' },
  { key: 'review',     label: 'Revisión requerida' },
]

export default function CashHistoryQuickFilters({ active = 'all', counts = {}, onChange }) {
  return (
    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
      {FILTERS.map(({ key, label }) => {
        const isActive = active === key
        const count = counts[key]
        const isDestructive = key === 'shortage' || key === 'review'
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange?.(key)}
            className={`
              shrink-0 h-8 px-3 rounded-full text-sm font-medium
              border transition-colors duration-150 flex items-center gap-1.5
              ${isActive
                ? isDestructive
                  ? 'bg-brand-red text-white border-brand-red'
                  : 'bg-brand-blue text-white border-brand-blue'
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