import { Plus, MoreHorizontal, Download, Upload, History, Bell } from 'lucide-react'
import Button from '../common/Button'
import IconButton from '../common/IconButton'
import Dropdown, { DropdownItem } from '../common/Dropdown'

export default function InventoryHeader({
  onAdjustInventory,
  onExport,
  onImport,
  onViewMovements,
  onConfigureAlerts,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
          Inventario general
        </h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
          Consulta y controla las existencias de todos los productos y variantes de Sneakers.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="primary" icon={Plus} onClick={onAdjustInventory}>
          Ajustar inventario
        </Button>

        <Dropdown
          trigger={<IconButton icon={MoreHorizontal} label="Más acciones" />}
        >
          <DropdownItem icon={Download} onClick={onExport}>Exportar inventario</DropdownItem>
          <DropdownItem icon={Upload}   onClick={onImport}>Importar inventario</DropdownItem>
          <DropdownItem icon={History}  onClick={onViewMovements}>Ver movimientos</DropdownItem>
          <DropdownItem icon={Bell}     onClick={onConfigureAlerts}>Configurar alertas</DropdownItem>
        </Dropdown>
      </div>
    </div>
  )
}