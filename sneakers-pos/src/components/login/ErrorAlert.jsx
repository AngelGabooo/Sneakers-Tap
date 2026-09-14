import { AlertCircle } from 'lucide-react'

export default function ErrorAlert({ message }) {
  if (!message) return null

  return (
    <div className="flex items-start gap-2.5 rounded-lg border px-3.5 py-3
                    border-red-200 bg-red-50
                    dark:border-red-900/50 dark:bg-red-950/40">
      <AlertCircle size={18} className="text-brand-red shrink-0 mt-0.5" strokeWidth={2} />
      <p className="text-sm text-brand-red dark:text-red-400 leading-snug">{message}</p>
    </div>
  )
}