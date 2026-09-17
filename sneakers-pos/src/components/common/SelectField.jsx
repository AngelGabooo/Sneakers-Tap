// src/components/common/SelectField.jsx
export default function SelectField({
  label,
  options = [],
  error,
  className = '',
  ...props
}) {
  const isReadOnly = props.disabled || !props.onChange

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
          {label}
        </label>
      )}
      <select
        {...props}
        disabled={props.disabled}
        className={`
          w-full h-11 px-3 rounded-lg text-sm cursor-pointer
          bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
          border transition-colors outline-none
          ${error
            ? 'border-brand-red focus:border-brand-red focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/40'
            : 'border-gray-200 dark:border-dark-border focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40'}
          ${isReadOnly ? 'opacity-70 cursor-not-allowed' : ''}
        `}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-brand-red">{error}</p>}
    </div>
  )
}