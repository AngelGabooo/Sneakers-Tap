const TABS = [
  { key: 'summary',  label: 'Resumen' },
  { key: 'sales',    label: 'Ventas' },
  { key: 'account',  label: 'Cuenta' },
  { key: 'activity', label: 'Actividad' },
  { key: 'audit',    label: 'Auditoría' },
]

export default function WholesaleDetailTabs({ active, onChange }) {
  return (
    <div className="flex items-center gap-1 mb-5 border-b border-gray-200 dark:border-dark-border overflow-x-auto">
      {TABS.map((t) => {
        const isActive = active === t.key
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange?.(t.key)}
            className={`
              relative px-4 py-2.5 text-sm font-medium whitespace-nowrap
              transition-colors
              ${isActive
                ? 'text-brand-blue'
                : 'text-gray-500 dark:text-dark-muted hover:text-brand-black dark:hover:text-dark-text'}
            `}
          >
            {t.label}
            {isActive && (
              <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-brand-blue rounded-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}