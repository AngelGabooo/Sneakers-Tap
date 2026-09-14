const CHIPS = [
  { key: 'all',      label: 'Todos' },
  { key: 'system',   label: 'Del sistema' },
  { key: 'custom',   label: 'Personalizados' },
  { key: 'active',   label: 'Activos' },
  { key: 'no-users', label: 'Sin usuarios' },
]

export default function RolesQuickFilters({ active = 'all', onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {CHIPS.map(({ key, label }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange?.(key)}
            className={`
              inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium
              border transition-colors
              ${isActive
                ? 'bg-blue-50 border-brand-blue text-brand-blue dark:bg-blue-950/40 dark:border-blue-700 dark:text-blue-300'
                : 'bg-white dark:bg-dark-surface border-gray-200 dark:border-dark-border text-gray-600 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-card'}
            `}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}