// src/components/credits/CreditsQuickFilters.jsx

const FILTERS = [
  { key: 'all',       label: 'Todos' },
  { key: 'active',    label: 'Activos' },
  { key: 'overdue',   label: 'Vencidos' },
  { key: 'paid',      label: 'Pagados' },
  { key: 'cancelled', label: 'Cancelados' },
]

export default function CreditsQuickFilters({ active, counts, onChange }) {
  return (
    <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
      {FILTERS.map(({ key, label }) => {
        const isActive = active === key
        const count = counts?.[key] ?? 0
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange?.(key)}
            className={`
              inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium
              whitespace-nowrap transition-colors border
              ${isActive
                ? 'bg-brand-blue text-white border-brand-blue'
                : 'bg-white dark:bg-dark-card text-gray-600 dark:text-dark-muted border-gray-200 dark:border-dark-border hover:border-brand-blue hover:text-brand-blue'}
            `}
          >
            {label}
            {count > 0 && (
              <span className={`
                inline-flex items-center justify-center
                h-4 min-w-[16px] px-1 rounded-full text-[10px] font-bold
                ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-dark-muted'}
              `}>
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}