import { MoreHorizontal, Eye, Pencil, Copy, Power, Trash2 } from 'lucide-react'
import IconButton from '../common/IconButton'
import Dropdown, { DropdownItem } from '../common/Dropdown'

export default function ProductRowActions({ onView, onEdit, onDuplicate, onToggleActive, onDelete }) {
  return (
    <div className="flex items-center justify-end gap-1">
      <IconButton icon={Eye} label="Ver producto" onClick={onView} />
      <IconButton icon={Pencil} label="Editar producto" onClick={onEdit} />
      <Dropdown
        trigger={
          <IconButton icon={MoreHorizontal} label="Más acciones" />
        }
      >
        <DropdownItem icon={Eye}      onClick={onView}>Ver producto</DropdownItem>
        <DropdownItem icon={Pencil}   onClick={onEdit}>Editar producto</DropdownItem>
        <DropdownItem icon={Copy}     onClick={onDuplicate}>Duplicar producto</DropdownItem>
        <DropdownItem icon={Power}    onClick={onToggleActive}>Activar / Desactivar</DropdownItem>
        <DropdownItem icon={Trash2} danger onClick={onDelete}>Eliminar producto</DropdownItem>
      </Dropdown>
    </div>
  )
}