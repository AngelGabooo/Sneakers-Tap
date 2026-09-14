import { X, Check } from 'lucide-react'
import Button from '../../common/Button'

export default function AdjustHeader({ onCancel, onSubmit, submitting, disabled }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
          Ajuste de inventario
        </h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
          Registra una entrada, salida o corrección de existencias de forma segura y trazable.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" icon={X} onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          icon={Check}
          onClick={onSubmit}
          loading={submitting}
          disabled={disabled || submitting}
        >
          {submitting ? 'Registrando...' : 'Registrar ajuste'}
        </Button>
      </div>
    </div>
  )
}