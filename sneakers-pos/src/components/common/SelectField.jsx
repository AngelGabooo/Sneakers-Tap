import { AlertCircle, Info, ChevronDown } from 'lucide-react'
import Tooltip from './Tooltip'

export default function SelectField({
  id,
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Seleccionar...',
  error,
  hint,
  required = false,
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
        <select
          id={id}
          value={value}
          onChange={onChange}
          className={`
            w-full h-11 pl-3 pr-9 rounded-lg text-[15px] appearance-none cursor-pointer
            bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
            border transition-all duration-150 outline-none
            ${error
              ? 'border-brand-red focus:border-brand-red focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/40'
              : 'border-gray-200 dark:border-dark-border focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40'}
          `}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 pointer-events-none">
          <ChevronDown size={16} strokeWidth={2} />
        </span>
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