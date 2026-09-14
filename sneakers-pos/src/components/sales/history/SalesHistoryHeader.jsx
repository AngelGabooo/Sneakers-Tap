import { Download, Plus, FileSpreadsheet, FileText, FileDown } from 'lucide-react'
import Button from '../../common/Button'
import Dropdown, { DropdownItem } from '../../common/Dropdown'
import IconButton from '../../common/IconButton'

export default function SalesHistoryHeader({ onNewSale, onExport }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
          Historial de ventas
        </h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
          Consulta y administra todas las ventas registradas en Sneakers.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Dropdown
          align="right"
          trigger={
            <span className="inline-flex">
              <Button variant="secondary" icon={Download}>Exportar</Button>
            </span>
          }
        >
          <DropdownItem icon={FileSpreadsheet} onClick={() => onExport?.('excel')}>Excel</DropdownItem>
          <DropdownItem icon={FileDown}        onClick={() => onExport?.('csv')}>CSV</DropdownItem>
          <DropdownItem icon={FileText}        onClick={() => onExport?.('pdf')}>PDF</DropdownItem>
        </Dropdown>

        <Button variant="primary" icon={Plus} onClick={onNewSale}>
          Nueva venta
        </Button>
      </div>
    </div>
  )
}