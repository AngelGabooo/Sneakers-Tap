import {
  MoreHorizontal, Eye, Printer, Mail, RotateCcw, XCircle, History,
} from 'lucide-react'
import IconButton from '../../common/IconButton'
import Dropdown, { DropdownItem } from '../../common/Dropdown'

export default function SalesHistoryRowActions({
  sale,
  onViewDetail,
  onPrint,
  onSend,
  onReturn,
  onCancel,
  onViewAudit,
}) {
  const isCancelled = sale?.status === 'cancelled'
  const isReturned = sale?.status === 'returned'
  const canReturn = !isCancelled && !isReturned
  const canCancel = !isCancelled && !isReturned

  return (
    <Dropdown
      align="right"
      trigger={<IconButton icon={MoreHorizontal} label="Acciones" />}
    >
      <DropdownItem icon={Eye}      onClick={() => onViewDetail?.(sale.id)}>Ver detalle</DropdownItem>
      <DropdownItem icon={Printer}  onClick={() => onPrint?.(sale)}>Imprimir ticket</DropdownItem>
      <DropdownItem icon={Mail}     onClick={() => onSend?.(sale)}>Enviar comprobante</DropdownItem>

      {canReturn && (
        <DropdownItem icon={RotateCcw} onClick={() => onReturn?.(sale)}>
          Devolver productos
        </DropdownItem>
      )}

      {canCancel && (
        <DropdownItem icon={XCircle} danger onClick={() => onCancel?.(sale)}>
          Cancelar venta
        </DropdownItem>
      )}

      <DropdownItem icon={History} onClick={() => onViewAudit?.(sale)}>Ver auditoría</DropdownItem>
    </Dropdown>
  )
}