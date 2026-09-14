import { Download, FileSpreadsheet, Printer, X } from 'lucide-react'
import Button from '../../common/Button'
import IconButton from '../../common/IconButton'

export default function SalesHistoryBulkBar({
  count, onClear, onExportExcel, onExportCSV, onPrintTickets,
}) {
  if (!count) return null

  return (
    <div className="
      flex flex-wrap items-center gap-2 mb-3 px-3 py-2 rounded-lg
      bg-blue-50 dark:bg-blue-950/30
      border border-blue-100 dark:border-blue-900/50
    ">
      <span className="text-sm font-medium text-brand-blue dark:text-blue-300">
        {count} {count === 1 ? 'venta seleccionada' : 'ventas seleccionadas'}
      </span>

      <div className="flex flex-wrap items-center gap-2 ml-auto">
        <Button size="sm" variant="secondary" icon={FileSpreadsheet} onClick={onExportExcel}>
          Excel
        </Button>
        <Button size="sm" variant="secondary" icon={Download} onClick={onExportCSV}>
          CSV
        </Button>
        <Button size="sm" variant="secondary" icon={Printer} onClick={onPrintTickets}>
          <span className="hidden sm:inline">Imprimir tickets</span>
          <span className="sm:hidden">Imprimir</span>
        </Button>
        <IconButton icon={X} label="Cancelar selección" onClick={onClear} />
      </div>
    </div>
  )
}