import { useEffect } from 'react'
import { CheckCircle2, AlertCircle, X } from 'lucide-react'

const VARIANTS = {
  success: {
    icon: CheckCircle2,
    iconColor: 'text-brand-blue',
    bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50',
  },
  error: {
    icon: AlertCircle,
    iconColor: 'text-brand-red',
    bg: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50',
  },
  info: {
    icon: AlertCircle,
    iconColor: 'text-brand-blue',
    bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50',
  },
}

export default function Toast({ open, variant = 'success', title, description, onClose, duration = 4000 }) {
  useEffect(() => {
    if (!open || !onClose) return
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [open, onClose, duration])

  if (!open) return null

  const v = VARIANTS[variant] || VARIANTS.success
  const Icon = v.icon

  return (
    <div className="fixed top-5 right-5 z-[60] max-w-sm w-full animate-in fade-in slide-in-from-top-2">
      <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-cardHover ${v.bg}`}>
        <Icon size={20} className={`${v.iconColor} shrink-0 mt-0.5`} strokeWidth={2} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
            {title}
          </p>
          {description && (
            <p className="text-xs text-gray-600 dark:text-dark-muted mt-0.5">
              {description}
            </p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-brand-black dark:hover:text-dark-text transition-colors shrink-0"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  )
}