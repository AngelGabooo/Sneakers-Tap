const VARIANTS = {
  ghost:
    'text-gray-500 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-surface hover:text-brand-black dark:hover:text-dark-text',
  danger:
    'text-gray-500 dark:text-dark-muted hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-brand-red',
}

const SIZES = {
  sm: 'w-8 h-8',
  md: 'w-9 h-9',
}

export default function IconButton({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  className = '',
  label,
  ...props
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`
        inline-flex items-center justify-center rounded-lg
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]}
        ${SIZES[size]}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon size={16} strokeWidth={2} />}
    </button>
  )
}