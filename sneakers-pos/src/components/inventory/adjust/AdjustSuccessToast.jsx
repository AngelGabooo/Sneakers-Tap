import { CheckCircle2, X, Eye } from 'lucide-react'
import Button from '../../common/Button'

export default function AdjustSuccessToast({ open, movement, onClose, onViewMovement, onViewInventory }) {
  if (!open || !movement) return null

  return (
    <div className="fixed top-5 right-5 z-[80] max-w-md w-full">
      <div className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-dark-card border border-blue-200 dark:border-blue-900/50 shadow-cardHover">
        <CheckCircle2 size={20} className="text-brand-blue shrink-0 mt-0.5" strokeWidth={2} />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
            Ajuste registrado correctamente
          </p>
          <p className="text-xs text-gray-600 dark:text-dark-muted mt-0.5">
            El inventario se actualizó y el movimiento quedó registrado en el historial.
          </p>
          <p className="text-xs font-mono text-gray-500 dark:text-dark-muted mt-1">
            {movement.id}
          </p>

          <div className="flex items-center gap-2 mt-3">
            <Button size="sm" variant="secondary" icon={Eye} onClick={onViewMovement}>
              Ver movimiento
            </Button>
            <Button size="sm" variant="ghost" onClick={onViewInventory}>
              Ver inventario
            </Button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-brand-black dark:hover:text-dark-text transition-colors shrink-0"
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}