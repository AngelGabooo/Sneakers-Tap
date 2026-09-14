import { AlertCircle } from 'lucide-react'

export default function TextareaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  rows = 4,
  required = false,
  className = '',
}) {
  return (
    <div className={`w-full ${className}`}>
      <label htmlFor={id} className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
        {label}
        {required && <span className="text-brand-red"> *</span>}
      </label>

      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`
          w-full rounded-lg text-[15px] p-3 resize-y
          bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
          border transition-all duration-150 outline-none
          placeholder:text-gray-400 dark:placeholder:text-dark-muted
          ${error
            ? 'border-brand-red focus:border-brand-red focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/40'
            : 'border-gray-200 dark:border-dark-border focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40'}
        `}
      />

      {error && (
        <p className="mt-1.5 text-xs text-brand-red flex items-center gap-1">
          <AlertCircle size={12} strokeWidth={2} />
          {error}
        </p>
      )}
    </div>
  )
}