import { Download, Wallet, FileSpreadsheet, FileText, FileDown } from 'lucide-react'
import Button from '../../common/Button'
import Dropdown, { DropdownItem } from '../../common/Dropdown'

export default function CashHistoryHeader({ onExport, onGoCurrent, hasOpenSession }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
          Historial de cajas
        </h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
          Consulta las sesiones de caja, sus movimientos, conciliaciones y resultados históricos.
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

        {hasOpenSession && (
          <Button variant="primary" icon={Wallet} onClick={onGoCurrent}>
            Ver caja actual
          </Button>
        )}
      </div>
    </div>
  )
}