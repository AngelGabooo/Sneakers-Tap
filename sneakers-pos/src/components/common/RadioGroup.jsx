export default function RadioGroup({ options = [], value, onChange, name, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {options.map((opt) => {
        const checked = value === opt.value
        return (
          <label
            key={opt.value}
            className={`
              flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors
              ${checked
                ? 'border-brand-blue bg-blue-50/60 dark:bg-blue-950/20'
                : 'border-gray-200 dark:border-dark-border hover:border-brand-blue/50'}
            `}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => onChange?.(opt.value)}
              className="mt-0.5 w-4 h-4 text-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 cursor-pointer"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-brand-black dark:text-dark-text">
                {opt.label}
              </p>
              {opt.description && (
                <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
                  {opt.description}
                </p>
              )}
            </div>
          </label>
        )
      })}
    </div>
  )
}