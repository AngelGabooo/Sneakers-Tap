const VARIANTS = {
  success: 'bg-blue-50 text-brand-blue border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50',
  warning: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50',
  danger:  'bg-red-50 text-brand-red border-red-100 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50',
  info:    'bg-blue-50 text-brand-blue border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50',
  neutral: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-dark-surface dark:text-dark-muted dark:border-dark-border',
}

export default function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 rounded-md
        text-xs font-medium border
        ${VARIANTS[variant] || VARIANTS.neutral}
        ${className}
      `}
    >
      {children}
    </span>
  )
}