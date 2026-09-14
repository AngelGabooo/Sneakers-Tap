import { Plus, Download, FileSpreadsheet, FileText, FileDown } from 'lucide-react'
import Button from '../common/Button'
import Dropdown, { DropdownItem } from '../common/Dropdown'

export default function WholesaleHeader({ onNew, onExport }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
          Clientes mayoristas
        </h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
          Administra tus clientes de mayoreo, condiciones comerciales y actividad de compra.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
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

        <Button variant="primary" icon={Plus} onClick={onNew}>
          Nuevo mayorista
        </Button>
      </div>
    </div>
  )
}