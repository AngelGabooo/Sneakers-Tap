import { Download, Filter, History, FileSpreadsheet, FileText, FileDown } from 'lucide-react'
import Button from '../common/Button'
import Dropdown, { DropdownItem } from '../common/Dropdown'

export default function AuditHeader({ onExport, onToggleFilters, filtersActive }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
          <History size={20} className="text-brand-blue" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
            Historial y auditoría
          </h1>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-1 max-w-2xl">
            Consulta las acciones realizadas en Sneakers y mantén la trazabilidad de las operaciones importantes.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant={filtersActive ? 'outline' : 'secondary'}
          icon={Filter}
          onClick={onToggleFilters}
        >
          Filtros
        </Button>

        <Dropdown
          align="right"
          trigger={
            <span className="inline-flex">
              <Button variant="primary" icon={Download}>Exportar</Button>
            </span>
          }
        >
          <DropdownItem icon={FileSpreadsheet} onClick={() => onExport?.('excel')}>Excel</DropdownItem>
          <DropdownItem icon={FileDown}        onClick={() => onExport?.('csv')}>CSV</DropdownItem>
          <DropdownItem icon={FileText}        onClick={() => onExport?.('pdf')}>PDF</DropdownItem>
        </Dropdown>
      </div>
    </div>
  )
}