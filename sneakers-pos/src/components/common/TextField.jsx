import { AlertCircle, Info } from 'lucide-react'
import Tooltip from './Tooltip'

export default function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  hint,
  required = false,
  icon: Icon,
  type = 'text',
  autoComplete = 'off',
  rightAction,
  className = '',
}) {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="flex items-center gap-1 text-sm font-medium text-brand-black dark:text-dark-text">
          {label}
          {required && <span className="text-brand-red">*</span>}
          {hint && (
            <Tooltip content={hint}>
              <span className="text-gray-400 hover:text-brand-blue cursor-help">
                <Info size={13} strokeWidth={2} />
              </span>
            </Tooltip>
          )}
        </label>
        {rightAction}
      </div>

      <div className="relative">
        {Icon && (
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 dark:text-dark-muted pointer-events-none">
            <Icon size={17} strokeWidth={1.8} />
          </span>
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`
            w-full h-11 rounded-lg text-[15px]
            bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
            border transition-all duration-150 outline-none
            placeholder:text-gray-400 dark:placeholder:text-dark-muted
            ${Icon ? 'pl-10 pr-3' : 'px-3'}
            ${error
              ? 'border-brand-red focus:border-brand-red focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/40'
              : 'border-gray-200 dark:border-dark-border focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40'}
          `}
        />
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-brand-red flex items-center gap-1">
          <AlertCircle size={12} strokeWidth={2} />
          {error}
        </p>
      )}
    </div>
  )
}