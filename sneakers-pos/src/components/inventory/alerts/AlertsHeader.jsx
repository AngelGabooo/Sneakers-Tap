import { Download, ShoppingBag } from 'lucide-react'
import Button from '../../common/Button'

export default function AlertsHeader({ onExport, onCreatePurchase, selectedCount }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
          Alertas de stock
        </h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
          Monitorea productos con inventario bajo, agotado o próximo a requerir reposición.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" icon={Download} onClick={onExport}>
          Exportar
        </Button>
        <Button
          variant="primary"
          icon={ShoppingBag}
          onClick={onCreatePurchase}
          disabled={selectedCount === 0}
        >
          Crear compra
        </Button>
      </div>
    </div>
  )
}