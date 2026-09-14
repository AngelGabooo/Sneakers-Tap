import { BarChart3, Download, Plus } from 'lucide-react'
import Button from '../common/Button'

export default function ReportsHeader({ onNew, onExport }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
          <BarChart3 size={20} className="text-brand-blue" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
            Centro de reportes
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-1 max-w-2xl">
            Analiza las ventas, inventario, caja, compras y comportamiento de tus clientes.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button variant="secondary" icon={Download} onClick={onExport}>
          Exportar
        </Button>
        <Button variant="primary" icon={Plus} onClick={onNew}>
          Crear reporte
        </Button>
      </div>
    </div>
  )
}