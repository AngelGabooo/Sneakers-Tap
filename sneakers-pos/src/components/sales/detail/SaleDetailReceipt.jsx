import { Printer, Download, Mail, FileText } from 'lucide-react'
import Card from '../../common/Card'
import Button from '../../common/Button'
import Badge from '../../common/Badge'

export default function SaleDetailReceipt({ sale, onPrint, onDownload, onSend }) {
  const ticket = {
    code: `TKT-${String(sale?.folio || '').replace('VTA-', '')}`,
    status: 'Generado',
    date: sale?.createdAt,
  }

  return (
    <Card>
      <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text mb-4">
        Comprobante
      </h2>

      <div className="flex items-start gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
          <FileText size={16} className="text-brand-blue" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-brand-black dark:text-dark-text">
            Ticket de venta
          </p>
          <p className="text-xs text-gray-500 dark:text-dark-muted font-mono">
            {ticket.code}
          </p>
        </div>
        <Badge variant="success">{ticket.status}</Badge>
      </div>

      <p className="text-xs text-gray-500 dark:text-dark-muted mb-3">
        {ticket.date && new Date(ticket.date).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}
      </p>

      <div className="grid grid-cols-3 gap-2">
        <Button size="sm" variant="secondary" icon={Printer} onClick={onPrint}>
          Imprimir
        </Button>
        <Button size="sm" variant="secondary" icon={Download} onClick={onDownload}>
          Descargar
        </Button>
        <Button size="sm" variant="secondary" icon={Mail} onClick={onSend}>
          Enviar
        </Button>
      </div>
    </Card>
  )
}