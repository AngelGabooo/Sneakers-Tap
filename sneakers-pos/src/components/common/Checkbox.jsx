export default function Checkbox({ checked, indeterminate = false, onChange, className = '', ...props }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = indeterminate
      }}
      onChange={onChange}
      className={`
        w-4 h-4 rounded border-gray-300 dark:border-dark-border
        text-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40
        cursor-pointer transition-colors
        ${className}
      `}
      {...props}
    />
  )
}