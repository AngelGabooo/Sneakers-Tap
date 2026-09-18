import { MoreHorizontal, Eye, Pencil, History, SlidersHorizontal, ShoppingBag } from 'lucide-react'
import IconButton from '../common/IconButton'
import Dropdown, { DropdownItem } from '../common/Dropdown'

export default function InventoryRowActions({
  onView,
  onEdit,
  onViewMovements,
  onAdjustStock,
  onRegisterPurchase,
}) {
  return (
    <Dropdown
      align="right"
      trigger={<IconButton icon={MoreHorizontal} label="Acciones" />}
    >
      <DropdownItem icon={Eye}               onClick={onView}>Ver producto</DropdownItem>
      <DropdownItem icon={Pencil}            onClick={onEdit}>Editar producto</DropdownItem>
      <DropdownItem icon={History}           onClick={onViewMovements}>Ver movimientos</DropdownItem>
      <DropdownItem icon={SlidersHorizontal} onClick={onAdjustStock}>Ajustar stock</DropdownItem>
    </Dropdown>
  )
}