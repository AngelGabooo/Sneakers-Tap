import { MoreHorizontal, Eye, Warehouse, History, SlidersHorizontal, ShoppingBag, UserCog, PackagePlus } from 'lucide-react'
import IconButton from '../../common/IconButton'
import Dropdown, { DropdownItem } from '../../common/Dropdown'

export default function AlertsRowActions({
  onViewProduct,
  onViewInventory,
  onViewMovements,
  onAdjustStock,
  onCreatePurchase,
  onViewSupplier,
  onReponer,
}) {
  return (
    <Dropdown
      align="right"
      trigger={<IconButton icon={MoreHorizontal} label="Acciones" />}
    >
      <DropdownItem icon={PackagePlus}       onClick={onReponer}>Reponer</DropdownItem>
      <DropdownItem icon={Eye}               onClick={onViewProduct}>Ver producto</DropdownItem>
      <DropdownItem icon={Warehouse}         onClick={onViewInventory}>Ver inventario</DropdownItem>
      <DropdownItem icon={History}           onClick={onViewMovements}>Ver movimientos</DropdownItem>
      <DropdownItem icon={SlidersHorizontal} onClick={onAdjustStock}>Ajustar inventario</DropdownItem>
      <DropdownItem icon={ShoppingBag}       onClick={onCreatePurchase}>Crear compra</DropdownItem>
      <DropdownItem icon={UserCog}           onClick={onViewSupplier}>Ver proveedor</DropdownItem>
    </Dropdown>
  )
}