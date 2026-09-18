import { MoreHorizontal, Eye, Package, FileText, User } from 'lucide-react'
import IconButton from '../../common/IconButton'
import Dropdown, { DropdownItem } from '../../common/Dropdown'

export default function MovementsRowActions({
  onViewDetail, onViewProduct, onViewDocument, onViewUser,
}) {
  return (
    <Dropdown
      align="right"
      trigger={<IconButton icon={MoreHorizontal} label="Acciones" />}
    >
      <DropdownItem icon={Eye}      onClick={onViewDetail}>Ver detalle</DropdownItem>
      <DropdownItem icon={Package}  onClick={onViewProduct}>Ver producto</DropdownItem>
¿¿    </Dropdown>
  )
}