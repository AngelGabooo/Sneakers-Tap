import { useEffect, useRef, useState } from 'react'
import { Printer, X, Download, Mail, Loader2 } from 'lucide-react'
import Button from '../common/Button'
import { printReceipt } from '../../services/printerService'

const STORE = {
  name: 'SNEAKERS',
  tagline: 'Tenis · Bolsas · Mochilas · Accesorios',
  address: 'Av. Principal 123, Col. Centro',
  city: 'Ciudad de México, CDMX',
  phone: '+52 55 1234 5678',
  rfc: 'SNK240101ABC',
}

export default function PosTicketModal({
  open,
  sale,
  width = 58,
  onClose,
  onSendEmail,
}) {
  const [paperWidth, setPaperWidth] = useState(width)
  const [printing, setPrinting] = useState(false)
  const printRef = useRef(null)

  useEffect(() => {
    if (open) setPaperWidth(width)
  }, [open, width])

  if (!open || !sale) return null

  // -----------------------------------------------------------
  // Imprimir: intenta por backend primero, si falla cae al navegador
  // -----------------------------------------------------------
  const handlePrint = async () => {
    setPrinting(true)

    try {
      const result = await printReceipt(sale)
      if (result.ok) {
        console.log('✅ Ticket impreso por backend')
        setPrinting(false)
        return
      }
      console.warn('⚠️ Backend no disponible, usando window.print():', result.error)
    } catch (err) {
      console.warn('⚠️ Error con backend, usando window.print():', err)
    }

    // Fallback: navegador
    const content = printRef.current?.innerHTML
    if (content) {
      const printWindow = window.open('', '_blank', 'width=400,height=800')
      printWindow.document.write(`
        <html>
          <head>
            <title>Ticket ${sale.folio}</title>
            <style>
              @page { size: ${paperWidth}mm auto; margin: 3mm; }
              * { box-sizing: border-box; }
              html, body {
                background: #fff !important;
                color: #000 !important;
              }
              body {
                font-family: 'Courier New', ui-monospace, monospace;
                font-size: ${paperWidth === 58 ? '10px' : '12px'};
                margin: 0;
                padding: 0;
                width: ${paperWidth}mm;
                line-height: 1.35;
              }
              .ticket { padding: 2mm 1mm; color: #000; }
              @media print { body { width: ${paperWidth}mm; } }
            </style>
          </head>
          <body>
            <div class="ticket">${content}</div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.focus()
      setTimeout(() => printWindow.print(), 350)
    }

    setPrinting(false)
  }

  const methodLabel =
    sale.payment?.method === 'cash' ? 'Efectivo'
    : sale.payment?.method === 'card'
      ? `Tarjeta (${sale.payment?.cardType === 'credit' ? 'Crédito' : 'Débito'})`
    : sale.payment?.method === 'transfer' ? 'Transferencia'
    : sale.payment?.method === 'digital' ? 'Pago digital'
    : sale.methodLabel || 'Otro'

  const ticketStyles = {
    container: {
      width: paperWidth === 58 ? '58mm' : '80mm',
      padding: '4mm 3mm',
      fontFamily: "'Courier New', ui-monospace, monospace",
      fontSize: paperWidth === 58 ? '10px' : '12px',
      lineHeight: 1.35,
      backgroundColor: '#ffffff',
      color: '#000000',
      colorScheme: 'light',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      margin: '0 auto',
    },
    header: { textAlign: 'center', marginBottom: '3mm' },
    logo: { fontSize: '1.6em', fontWeight: 800, letterSpacing: '1px', color: '#000' },
    tagline: { fontSize: '0.9em', marginTop: '1mm', color: '#000' },
    small: { fontSize: '0.85em', marginTop: '2mm', color: '#000' },
    smallLine: { fontSize: '0.85em', color: '#000' },
    divider: { borderTop: '1px dashed #000', margin: '2mm 0' },
    meta: { fontSize: '0.9em', color: '#000' },
    metaRow: { display: 'flex', justifyContent: 'space-between', color: '#000' },
    bold: { fontWeight: 700 },
    itemBlock: { marginBottom: '1.5mm', color: '#000' },
    itemName: { fontWeight: 700, color: '#000' },
    itemMeta: { fontSize: '0.9em', color: '#000' },
    itemLine: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '0.95em',
      color: '#000',
    },
    totalsRow: { display: 'flex', justifyContent: 'space-between', color: '#000' },
    totalLine: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '1.4em',
      fontWeight: 700,
      color: '#000',
    },
    footer: { textAlign: 'center', fontSize: '0.9em', marginTop: '3mm', color: '#000' },
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-cardHover">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border shrink-0">
          <div className="flex items-center gap-2">
            <Printer size={16} className="text-brand-blue" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
              Ticket de venta
            </h3>
            <span className="text-xs font-mono text-gray-500 dark:text-dark-muted">
              {sale.folio}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-brand-black dark:hover:text-dark-text transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Selector de ancho */}
        <div className="px-5 py-2 border-b border-gray-100 dark:border-dark-border flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-500 dark:text-dark-muted">Formato:</span>
          {[58, 80].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setPaperWidth(w)}
              className={`
                h-7 px-2.5 rounded-md text-xs font-medium transition-colors
                ${paperWidth === w
                  ? 'bg-brand-blue text-white'
                  : 'bg-gray-100 dark:bg-dark-surface text-gray-600 dark:text-dark-muted hover:bg-gray-200 dark:hover:bg-dark-border'}
              `}
            >
              {w} mm
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-dark-surface flex justify-center">
          <div ref={printRef} style={ticketStyles.container}>
            <div style={ticketStyles.header}>
              <div style={ticketStyles.logo}>{STORE.name}</div>
              <div style={ticketStyles.tagline}>{STORE.tagline}</div>
              <div style={ticketStyles.small}>{STORE.address}</div>
              <div style={ticketStyles.smallLine}>{STORE.city}</div>
              <div style={ticketStyles.smallLine}>Tel: {STORE.phone}</div>
              <div style={ticketStyles.smallLine}>RFC: {STORE.rfc}</div>
            </div>

            <div style={ticketStyles.divider} />

            <div style={ticketStyles.meta}>
              <div style={ticketStyles.metaRow}>
                <span>Ticket:</span>
                <span style={ticketStyles.bold}>{sale.folio}</span>
              </div>
              <div style={ticketStyles.metaRow}>
                <span>Fecha:</span>
                <span>{new Date(sale.createdAt).toLocaleString('es-MX')}</span>
              </div>
              <div style={ticketStyles.metaRow}>
                <span>Cajero:</span>
                <span>{sale.cashier}</span>
              </div>
              <div style={ticketStyles.metaRow}>
                <span>Cliente:</span>
                <span>{sale.customerName || 'Venta general'}</span>
              </div>
            </div>

            <div style={ticketStyles.divider} />

            <div>
              {(sale.items || []).map((item, i) => (
                <div key={i} style={ticketStyles.itemBlock}>
                  <div style={ticketStyles.itemName}>{item.productName}</div>
                  <div style={ticketStyles.itemMeta}>
                    {item.variantLabel} · {item.sku}
                  </div>
                  <div style={ticketStyles.itemLine}>
                    <span>{item.quantity} × ${Number(item.price).toLocaleString('es-MX')}</span>
                    <span style={ticketStyles.bold}>
                      ${(item.quantity * item.price).toLocaleString('es-MX')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={ticketStyles.divider} />

            <div>
              <TicketRow style={ticketStyles.totalsRow} label="Subtotal" value={sale.totals.subtotal} />
              {sale.totals.discountAmount > 0 && (
                <TicketRow style={ticketStyles.totalsRow} label="Descuento" value={-sale.totals.discountAmount} />
              )}
              {sale.totals.tax > 0 && (
                <TicketRow style={ticketStyles.totalsRow} label="Impuestos" value={sale.totals.tax} />
              )}
            </div>

            <div style={ticketStyles.divider} />

            <div style={ticketStyles.totalLine}>
              <span>TOTAL</span>
              <span>${sale.totals.total.toLocaleString('es-MX')}</span>
            </div>

            <div style={ticketStyles.divider} />

            <div style={ticketStyles.meta}>
              <TicketRow style={ticketStyles.totalsRow} label="Método" value={methodLabel} currency={false} />
              {sale.payment?.method === 'cash' && (
                <>
                  <TicketRow style={ticketStyles.totalsRow} label="Recibido" value={sale.payment.cashReceived} />
                  <TicketRow style={ticketStyles.totalsRow} label="Cambio" value={sale.payment.change} />
                </>
              )}
              {sale.payment?.reference && (
                <TicketRow
                  style={ticketStyles.totalsRow}
                  label="Referencia"
                  value={sale.payment.reference}
                  currency={false}
                />
              )}
            </div>

            <div style={ticketStyles.divider} />

            <div style={ticketStyles.footer}>
              <div style={{ ...ticketStyles.bold, marginBottom: '1mm' }}>
                ¡Gracias por tu compra!
              </div>
              <div>Conserva tu ticket para cambios y devoluciones.</div>
              <div style={{ marginTop: '1mm' }}>*** {STORE.name} ***</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border shrink-0 flex-wrap">
          <Button variant="secondary" icon={Mail} onClick={() => onSendEmail?.(sale)}>
            Enviar
          </Button>
          <Button variant="secondary" icon={Download} onClick={() => console.log('Descargar PDF')}>
            PDF
          </Button>
          <Button
            variant="primary"
            icon={printing ? Loader2 : Printer}
            onClick={handlePrint}
            disabled={printing}
          >
            {printing ? 'Imprimiendo...' : 'Imprimir'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function TicketRow({ label, value, currency = true, style }) {
  const display =
    currency && typeof value === 'number'
      ? `${value < 0 ? '-' : ''}$${Math.abs(value).toLocaleString('es-MX')}`
      : value
  return (
    <div style={style}>
      <span>{label}:</span>
      <span style={{ fontWeight: 600 }}>{display}</span>
    </div>
  )
}