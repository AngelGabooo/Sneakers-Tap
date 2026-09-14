import { CheckCircle2, Printer, Mail, Eye, Plus } from 'lucide-react'
import Button from '../common/Button'

export default function PosSuccessModal({ open, sale, onClose, onPrint, onSendEmail, onViewDetail, onNewSale }) {
  if (!open || !sale) return null

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-cardHover">
        <div className="p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 size={28} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          </div>
          <h3 className="text-lg font-bold text-brand-black dark:text-dark-text">
            Venta realizada correctamente
          </h3>

          <div className="mt-4 space-y-1.5 text-sm">
            <Row label="Venta" value={sale.folio} mono />
            <Row label="Total" value={`$${Number(sale.total || sale.totals?.total || 0).toLocaleString('es-MX')}`} emphasis />
            <Row label="Cliente" value={sale.customerName || 'Venta general'} />
            <Row label="Método" value={sale.methodLabel} />
            {sale.change > 0 && (
              <Row label="Cambio" value={`$${sale.change.toLocaleString('es-MX')}`} />
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-dark-border p-4 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <Button variant="secondary" icon={Printer} onClick={onPrint} size="sm">
              Ticket
            </Button>
            <Button variant="secondary" icon={Mail} onClick={onSendEmail} size="sm">
              Correo
            </Button>
            <Button variant="secondary" icon={Eye} onClick={onViewDetail} size="sm">
              Detalle
            </Button>
          </div>

          <Button variant="primary" icon={Plus} className="w-full" onClick={onNewSale}>
            Nueva venta
          </Button>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, mono = false, emphasis = false }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-gray-500 dark:text-dark-muted">{label}</span>
      <span className={`font-semibold text-brand-black dark:text-dark-text ${mono ? 'font-mono text-xs' : ''} ${emphasis ? 'text-base' : ''}`}>
        {value}
      </span>
    </div>
  )
}