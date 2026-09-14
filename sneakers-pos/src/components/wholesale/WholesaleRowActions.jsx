import {
  MoreHorizontal, Eye, Pencil, ShoppingCart, Receipt, Wallet, History, Power, Ban,
} from 'lucide-react'
import IconButton from '../common/IconButton'
import Dropdown, { DropdownItem } from '../common/Dropdown'

export default function WholesaleRowActions({
  wholesale,
  onView, onEdit, onNewSale, onViewSales, onViewAccount, onViewAudit, onToggleStatus, onBlock,
}) {
  const isActive = wholesale?.status === 'active'
  const isBlocked = wholesale?.status === 'blocked'

  return (
    <Dropdown
      align="right"
      trigger={<IconButton icon={MoreHorizontal} label="Acciones" />}
    >
      <DropdownItem icon={Eye}          onClick={() => onView?.(wholesale)}>Ver detalle</DropdownItem>
      <DropdownItem icon={Pencil}       onClick={() => onEdit?.(wholesale)}>Editar mayorista</DropdownItem>
      <DropdownItem icon={ShoppingCart} onClick={() => onNewSale?.(wholesale)}>Nueva venta</DropdownItem>
      <DropdownItem icon={Receipt}      onClick={() => onViewSales?.(wholesale)}>Ver ventas</DropdownItem>
      <DropdownItem icon={Wallet}       onClick={() => onViewAccount?.(wholesale)}>Ver cuenta</DropdownItem>
      <DropdownItem icon={History}      onClick={() => onViewAudit?.(wholesale)}>Ver auditoría</DropdownItem>

      {isActive ? (
        <DropdownItem icon={Power} onClick={() => onToggleStatus?.(wholesale, 'suspended')}>
          Suspender
        </DropdownItem>
      ) : (
        <DropdownItem icon={Power} onClick={() => onToggleStatus?.(wholesale, 'active')}>
          Activar
        </DropdownItem>
      )}

      {!isBlocked && (
        <DropdownItem icon={Ban} danger onClick={() => onBlock?.(wholesale)}>
          Bloquear
        </DropdownItem>
      )}
    </Dropdown>
  )
}