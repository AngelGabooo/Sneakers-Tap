// src/components/common/TextareaField.jsx
export default function TextareaField({
  label,
  error,
  hint,
  rows = 3,
  className = '',
  ...props
}) {
  const isReadOnly = props.readOnly || props.disabled || !props.onChange

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
          {label}
        </label>
      )}
      <textarea
        {...props}
        rows={rows}
        readOnly={isReadOnly}
        className={`
          w-full px-3 py-2 rounded-lg text-sm resize-none
          bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
          border transition-colors outline-none
          placeholder:text-gray-400 dark:placeholder:text-dark-muted
          ${error
            ? 'border-brand-red focus:border-brand-red focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/40'
            : 'border-gray-200 dark:border-dark-border focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40'}
          ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}
        `}
      />
      {error && <p className="mt-1.5 text-xs text-brand-red">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-gray-500 dark:text-dark-muted">{hint}</p>}
    </div>
  )
}