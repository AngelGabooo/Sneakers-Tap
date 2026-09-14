import { AlertTriangle, PackageX } from 'lucide-react'

export default function ProductDetailAlert({ type, message, actionLabel, onAction }) {
  if (!message) return null

  const tones = {
    warning: {
      wrap: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300',
      icon: <AlertTriangle size={16} strokeWidth={2.2} />,
    },
    danger: {
      wrap: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-brand-red dark:text-red-400',
      icon: <PackageX size={16} strokeWidth={2.2} />,
    },
  }
  const tone = tones[type] || tones.warning

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-lg border mb-5 ${tone.wrap}`}>
      <div className="flex items-start gap-2 flex-1 min-w-0">
        <span className="shrink-0 mt-0.5">{tone.icon}</span>
        <p className="text-sm leading-snug">{message}</p>
      </div>
      {actionLabel && (
        <button
          onClick={onAction}
          className="text-sm font-medium underline hover:no-underline self-start sm:self-auto shrink-0"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}