import { Pencil, Warehouse, MoreHorizontal, Copy, Power, History, Trash2 } from 'lucide-react'
import Button from '../../common/Button'
import IconButton from '../../common/IconButton'
import Dropdown, { DropdownItem } from '../../common/Dropdown'

export default function ProductDetailActions({
  onEdit,
  onViewInventory,
  onDuplicate,
  onToggleActive,
  onViewHistory,
  onDelete,
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button variant="primary" icon={Pencil} onClick={onEdit}>
        Editar producto
      </Button>

      <Button variant="secondary" icon={Warehouse} onClick={onViewInventory}>
        Ver inventario
      </Button>

      <Dropdown
        trigger={<IconButton icon={MoreHorizontal} label="Más acciones" />}
      >
        <DropdownItem icon={Copy}    onClick={onDuplicate}>Duplicar producto</DropdownItem>
        <DropdownItem icon={Power}   onClick={onToggleActive}>Activar / Desactivar</DropdownItem>
        <DropdownItem icon={History} onClick={onViewHistory}>Ver historial</DropdownItem>
        <DropdownItem icon={Trash2}  danger onClick={onDelete}>Eliminar producto</DropdownItem>
      </Dropdown>
    </div>
  )
}