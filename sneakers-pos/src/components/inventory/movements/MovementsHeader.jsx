import { Download, Plus } from 'lucide-react'
import Button from '../../common/Button'

export default function MovementsHeader({ onExport, onRegisterMovement }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
          Movimientos de inventario
        </h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
          Consulta el historial de entradas, salidas y ajustes de inventario de Sneakers.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" icon={Download} onClick={onExport}>
          Exportar
        </Button>
        <Button variant="primary" icon={Plus} onClick={onRegisterMovement}>
          Registrar movimiento
        </Button>
      </div>
    </div>
  )
}