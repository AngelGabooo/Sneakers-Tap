// src/components/wholesale/WholesaleRowActions.jsx
import {
  MoreHorizontal, Pencil, Power, Ban, Trash2,
} from 'lucide-react'
import IconButton from '../common/IconButton'
import Dropdown, { DropdownItem } from '../common/Dropdown'

export default function WholesaleRowActions({
  wholesale,
  onEdit,
  onToggleStatus,
  onBlock,
  onDelete,
}) {
  const isActive = wholesale?.status === 'active'
  const isBlocked = wholesale?.status === 'blocked'

  return (
    <Dropdown
      align="right"
      trigger={<IconButton icon={MoreHorizontal} label="Acciones" />}
    >
      <DropdownItem icon={Pencil} onClick={() => onEdit?.(wholesale)}>
        Editar mayorista
      </DropdownItem>

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

      <DropdownItem icon={Trash2} danger onClick={() => onDelete?.(wholesale)}>
        Eliminar
      </DropdownItem>
    </Dropdown>
  )
}