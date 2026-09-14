const CATEGORIES = [
  { key: 'all',         label: 'Todos' },
  { key: 'Tenis',       label: 'Tenis' },
  { key: 'Bolsas',      label: 'Bolsas' },
  { key: 'Mochilas',    label: 'Mochilas' },
  { key: 'Accesorios',  label: 'Accesorios' },
]

export default function PosCategories({ active = 'all', onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {CATEGORIES.map(({ key, label }) => {
        const isActive = active === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange?.(key)}
            className={`
              h-8 px-3 rounded-full text-sm font-medium
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