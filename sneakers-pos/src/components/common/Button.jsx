import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary:
    'bg-brand-blue text-white hover:bg-brand-blueHover active:bg-brand-blueDark border-transparent',
  secondary:
    'bg-white dark:bg-dark-surface text-brand-black dark:text-dark-text border-gray-200 dark:border-dark-border hover:border-brand-blue hover:text-brand-blue',
  outline:
    'bg-transparent text-brand-blue border-brand-blue hover:bg-blue-50 dark:hover:bg-blue-950/30',
  ghost:
    'bg-transparent text-gray-600 dark:text-dark-muted border-transparent hover:bg-gray-100 dark:hover:bg-dark-surface',
  danger:
    'bg-brand-red text-white hover:bg-red-700 border-transparent',
    
}

const SIZES = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-5 text-[15px]',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg border font-semibold
        transition-colors duration-150
        disabled:opacity-60 disabled:cursor-not-allowed
        ${VARIANTS[variant]}
        ${SIZES[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : Icon ? <Icon size={16} strokeWidth={2} /> : null}
      {children}
    </button>
  )
}