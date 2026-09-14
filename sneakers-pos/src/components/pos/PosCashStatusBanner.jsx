import { AlertCircle, Wallet } from 'lucide-react'
import Button from '../common/Button'

export default function PosCashStatusBanner({ open, onOpenCash }) {
  if (open) return null

  return (
    <div className="
      flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 mb-4 rounded-lg
      bg-red-50 dark:bg-red-950/30
      border border-red-200 dark:border-red-900/50
    ">
      <div className="flex items-start gap-2 flex-1 min-w-0">
        <AlertCircle size={16} strokeWidth={2.2} className="text-brand-red shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-brand-red">
            No hay una caja abierta
          </p>
          <p className="text-xs text-brand-red/80 dark:text-red-400 mt-0.5">
            Debes abrir una caja antes de registrar ventas.
          </p>
        </div>
      </div>

      <Button variant="primary" icon={Wallet} onClick={onOpenCash}>
        Abrir caja
      </Button>
    </div>
  )
}