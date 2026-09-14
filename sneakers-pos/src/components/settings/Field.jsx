// src/components/settings/Field.jsx

export function Label({ children, required }) {
  return (
    <label className="block text-xs font-medium text-gray-700 dark:text-dark-muted mb-1.5">
      {children}
      {required && <span className="text-brand-red ml-0.5">*</span>}
    </label>
  )
}

export function TextInput({ label, required, error, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <Label required={required}>{label}</Label>}
      <input
        {...props}
        className={`
          w-full h-10 px-3 rounded-lg text-sm
          bg-white dark:bg-dark-surface
          border ${error ? 'border-brand-red' : 'border-gray-200 dark:border-dark-border'}
          text-brand-black dark:text-dark-text
          placeholder:text-gray-400 dark:placeholder:text-dark-muted
          focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue
        `}
      />
      {error && <p className="text-xs text-brand-red mt-1">{error}</p>}
    </div>
  )
}

export function TextArea({ label, required, rows = 3, className = '', ...props }) {
  return (
    <div className={className}>
      {label && <Label required={required}>{label}</Label>}
      <textarea
        {...props}
        rows={rows}
        className="
          w-full px-3 py-2 rounded-lg text-sm resize-none
          bg-white dark:bg-dark-surface
          border border-gray-200 dark:border-dark-border
          text-brand-black dark:text-dark-text
          placeholder:text-gray-400 dark:placeholder:text-dark-muted
          focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue
        "
      />
    </div>
  )
}

export function Select({ label, options = [], className = '', ...props }) {
  return (
    <div className={className}>
      {label && <Label>{label}</Label>}
      <select
        {...props}
        className="
          w-full h-10 px-3 rounded-lg text-sm cursor-pointer
          bg-white dark:bg-dark-surface
          border border-gray-200 dark:border-dark-border
          text-brand-black dark:text-dark-text
          focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue
        "
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

export function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer py-1.5">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative shrink-0 w-10 h-6 rounded-full transition-colors mt-0.5
          ${checked ? 'bg-brand-blue' : 'bg-gray-300 dark:bg-dark-border'}
        `}
      >
        <span className={`
          absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
          ${checked ? 'translate-x-4' : 'translate-x-0'}
        `} />
      </button>
      <div className="min-w-0">
        <p className="text-sm font-medium text-brand-black dark:text-dark-text">
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
            {description}
          </p>
        )}
      </div>
    </label>
  )
}

export function Checkbox({ label, description, checked, onChange }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer py-1.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="
          mt-0.5 w-4 h-4 rounded border-gray-300 dark:border-dark-border
          text-brand-blue focus:ring-brand-blue/30
          bg-white dark:bg-dark-surface
        "
      />
      <div className="min-w-0">
        <p className="text-sm text-brand-black dark:text-dark-text">{label}</p>
        {description && (
          <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
            {description}
          </p>
        )}
      </div>
    </label>
  )
}

export function Section({ title, description, children, action }) {
  return (
    <section className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5 mb-5">
      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">
              {description}
            </p>
          )}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

export function Grid2({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  )
}

export function Grid3({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  )
}