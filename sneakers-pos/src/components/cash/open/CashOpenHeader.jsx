import { X } from 'lucide-react'
import Button from '../../common/Button'

export default function CashOpenHeader({ onCancel }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
          Apertura de caja
        </h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
          Registra el fondo inicial y comienza una nueva jornada de operación.
        </p>
      </div>

      <Button variant="secondary" icon={X} onClick={onCancel}>
        Cancelar
      </Button>
    </div>
  )
}