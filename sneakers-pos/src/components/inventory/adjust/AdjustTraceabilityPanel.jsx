import { Shield, ExternalLink } from 'lucide-react'
import Card from '../../common/Card'

export default function AdjustTraceabilityPanel({ onViewMovements }) {
  return (
    <Card>
      <h3 className="text-base font-semibold text-brand-black dark:text-dark-text mb-2 flex items-center gap-2">
        <Shield size={15} className="text-brand-blue" strokeWidth={2} />
        Trazabilidad
      </h3>
      <p className="text-xs text-gray-500 dark:text-dark-muted">
        Este registro generará automáticamente un movimiento de inventario inmutable en el historial.
      </p>

      <button
        type="button"
        onClick={onViewMovements}
        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
      >
        <ExternalLink size={12} strokeWidth={2.2} />
        Ver historial de movimientos
      </button>
    </Card>
  )
}