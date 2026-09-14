import {
  Printer, Mail, Plus, MoreHorizontal, RotateCcw, XCircle, History, Download,
} from 'lucide-react'
import Button from '../../common/Button'
import IconButton from '../../common/IconButton'
import Dropdown, { DropdownItem } from '../../common/Dropdown'

export default function SaleDetailActions({
  sale,
  onPrint, onSend, onNewSale, onReturn, onCancel, onViewAudit, onDownload,
}) {
  const isCancelled = sale?.status === 'cancelled'
  const isReturned = sale?.status === 'returned'

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button variant="secondary" icon={Printer} onClick={onPrint}>
        Imprimir ticket
      </Button>
      <Button variant="secondary" icon={Mail} onClick={onSend}>
        <span className="hidden sm:inline">Enviar comprobante</span>
        <span className="sm:hidden">Enviar</span>
      </Button>
      <Button variant="primary" icon={Plus} onClick={onNewSale}>
        Nueva venta
      </Button>

      <Dropdown
        align="right"
        trigger={<IconButton icon={MoreHorizontal} label="Más acciones" />}
      >
        <DropdownItem icon={RotateCcw} onClick={onReturn} disabled={isCancelled || isReturned}>
          Devolver productos
        </DropdownItem>
        <DropdownItem icon={Download} onClick={onDownload}>
          Descargar comprobante
        </DropdownItem>
        <DropdownItem icon={History} onClick={onViewAudit}>
          Ver auditoría
        </DropdownItem>
        <DropdownItem icon={XCircle} danger onClick={onCancel} disabled={isCancelled || isReturned}>
          Cancelar venta
        </DropdownItem>
      </Dropdown>
    </div>
  )
}