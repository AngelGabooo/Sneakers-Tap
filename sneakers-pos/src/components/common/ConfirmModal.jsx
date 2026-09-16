// src/components/common/ConfirmModal.jsx
import { useEffect } from 'react'
import { AlertTriangle, X, LogOut, CheckCircle2, ShieldAlert } from 'lucide-react'
import Button from './Button'

const TONES = {
  danger: {
    icon: AlertTriangle,
    iconBg: 'bg-red-100 dark:bg-red-950/40',
    iconColor: 'text-brand-red',
    confirmVariant: 'danger',
  },
  warning: {
    icon: ShieldAlert,
    iconBg: 'bg-amber-100 dark:bg-amber-950/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    confirmVariant: 'primary',
  },
  info: {
    icon: CheckCircle2,
    iconBg: 'bg-blue-100 dark:bg-blue-950/40',
    iconColor: 'text-brand-blue',
    confirmVariant: 'primary',
  },
  logout: {
    icon: LogOut,
    iconBg: 'bg-red-100 dark:bg-red-950/40',
    iconColor: 'text-brand-red',
    confirmVariant: 'danger',
  },
}

export default function ConfirmModal({
  open,
  title = '¿Estás seguro?',
  description,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  tone = 'warning',
  icon: CustomIcon,
  onConfirm,
  onCancel,
  loading = false,
  closeOnBackdrop = true,
}) {
  const config = TONES[tone] || TONES.warning
  const Icon = CustomIcon || config.icon

  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (e.key === 'Escape' && !loading) onCancel?.()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, loading, onCancel])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  if (!open) return null

  const handleBackdropClick = (e) => {
    if (!closeOnBackdrop || loading) return
    if (e.target === e.currentTarget) onCancel?.()
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onMouseDown={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/60 overflow-hidden">

        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="
            absolute top-3 right-3 z-10 p-1.5 rounded-lg
            text-gray-400 hover:text-brand-black dark:hover:text-dark-text
            hover:bg-gray-100 dark:hover:bg-dark-surface
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors
          "
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>

        <div className="p-6 pt-7">
          <div className="flex justify-center mb-4">
            <div className={`w-14 h-14 rounded-2xl ${config.iconBg} flex items-center justify-center`}>
              <Icon size={24} className={config.iconColor} strokeWidth={2} />
            </div>
          </div>

          <h3 className="text-lg font-bold text-brand-black dark:text-dark-text text-center leading-tight">
            {title}
          </h3>

          {description && (
            <p className="text-sm text-gray-500 dark:text-dark-muted text-center mt-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="flex gap-2 p-4 pt-0">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={config.confirmVariant}
            onClick={onConfirm}
            loading={loading}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}