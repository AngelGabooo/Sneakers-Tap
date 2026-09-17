// src/components/common/TextField.jsx
export default function TextField({
  label,
  icon: Icon,
  error,
  hint,
  className = '',
  ...props
}) {
  // ⭐ Auto readOnly si no hay onChange (evita el warning de React)
  const isReadOnly = props.readOnly || props.disabled || !props.onChange

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
            <Icon size={17} strokeWidth={1.9} />
          </span>
        )}
        <input
          {...props}
          readOnly={isReadOnly}
          className={`
            w-full h-11 ${Icon ? 'pl-10' : 'pl-3'} pr-3 rounded-lg text-sm
            bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
            border transition-colors outline-none
            placeholder:text-gray-400 dark:placeholder:text-dark-muted
            ${error
              ? 'border-brand-red focus:border-brand-red focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/40'
              : 'border-gray-200 dark:border-dark-border focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40'}
            ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}
          `}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-brand-red">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-gray-500 dark:text-dark-muted">{hint}</p>}
    </div>
  )
}