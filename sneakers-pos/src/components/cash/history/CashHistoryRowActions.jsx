import {
  MoreHorizontal, Eye, Receipt, Activity, History, Download, Wallet,
} from 'lucide-react'
import IconButton from '../../common/IconButton'
import Dropdown, { DropdownItem } from '../../common/Dropdown'

export default function CashHistoryRowActions({
  session,
  onViewDetail,
  onViewSales,
  onViewMovements,
  onViewAudit,
  onExport,
  onViewCurrent,
}) {
  const isOpen = session?.status === 'open'

  return (
    <Dropdown
      align="right"
      trigger={<IconButton icon={MoreHorizontal} label="Acciones" />}
    >
      <DropdownItem icon={Eye}      onClick={() => onViewDetail?.(session)}>Ver detalle</DropdownItem>
      <DropdownItem icon={Receipt}  onClick={() => onViewSales?.(session)}>Ver ventas</DropdownItem>
      <DropdownItem icon={Activity} onClick={() => onViewMovements?.(session)}>Ver movimientos</DropdownItem>
      <DropdownItem icon={History}  onClick={() => onViewAudit?.(session)}>Ver auditoría</DropdownItem>
      <DropdownItem icon={Download} onClick={() => onExport?.(session)}>Exportar cierre</DropdownItem>

      {isOpen && (
        <DropdownItem icon={Wallet} onClick={() => onViewCurrent?.(session)}>
          Ver caja actual
        </DropdownItem>
      )}
    </Dropdown>
  )
}