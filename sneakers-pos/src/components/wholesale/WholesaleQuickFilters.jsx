const FILTERS = [
  { key: 'all',       label: 'Todos' },
  { key: 'active',    label: 'Activos' },
  { key: 'credit',    label: 'Con crédito' },
  { key: 'balance',   label: 'Saldo pendiente' },
  { key: 'overdue',   label: 'Crédito vencido' },
  { key: 'high',      label: 'Alta compra' },
  { key: 'inactive',  label: 'Sin compra reciente' },
]

export default function WholesaleQuickFilters({ active = 'all', counts = {}, onChange }) {
  return (
    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
      {FILTERS.map(({ key, label }) => {
        const isActive = active === key
        const count = counts[key]
        const destructive = key === 'overdue'
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange?.(key)}
            className={`
              shrink-0 h-8 px-3 rounded-full text-sm font-medium
              border transition-colors duration-150 flex items-center gap-1.5
              ${isActive
                ? destructive
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