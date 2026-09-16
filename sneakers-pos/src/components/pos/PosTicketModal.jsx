// src/components/pos/PosTicketModal.jsx
import { useEffect, useRef, useState } from 'react'
import { Printer, X, Download, Mail, Loader2 } from 'lucide-react'
import Button from '../common/Button'
import { printReceipt } from '../../services/printerService'
import { useSettings } from '../../context/SettingsContext'

export default function PosTicketModal({
  open,
  sale,
  width,
  onClose,
  onSendEmail,
}) {
  const { settings } = useSettings()
  const { store, ticket } = settings

  const defaultWidth = width || ticket.width || 80
  const [paperWidth, setPaperWidth] = useState(defaultWidth)
  const [printing, setPrinting] = useState(false)
  const printRef = useRef(null)

  useEffect(() => {
    if (open) setPaperWidth(width || ticket.width || 80)
  }, [open, width, ticket.width])

  if (!open || !sale) return null

  // -----------------------------------------------------------
  // Datos de la tienda
  // -----------------------------------------------------------
  const storeName    = ticket.header.name || store.commercialName || ''
  const storeTagline = ticket.header.tagline || ''
  const showLogo     = ticket.header.showLogo && store.logoUrl
  const showAddress  = ticket.header.showAddress && store.address?.street
  const showPhone    = ticket.header.showPhone && store.phone
  const showEmail    = ticket.header.showEmail && store.email
  const showRfc      = ticket.header.showRfc && store.rfc

  const addressLine = [store.address?.street, store.address?.exteriorNumber]
    .filter(Boolean).join(' ')

  const cityLine = [
    store.address?.neighborhood,
    store.address?.city,
    store.address?.state,
  ].filter(Boolean).join(', ')

  const postalLine = [
    store.address?.postalCode,
    store.address?.country,
  ].filter(Boolean).join(' · ')

  // -----------------------------------------------------------
  // Helper: arma el payload con datos configurables
  // -----------------------------------------------------------
  const buildPayload = () => {
    const buildAddress = () => {
      if (!ticket.header.showAddress) return null
      const parts = [
        store.address?.street,
        store.address?.exteriorNumber,
        store.address?.neighborhood,
        store.address?.city,
        store.address?.state,
        store.address?.postalCode,
      ].filter(Boolean)
      return parts.length ? parts.join(', ') : null
    }

    return {
      ...sale,
      ticketHeader: {
        name:    storeName || null,
        tagline: storeTagline || null,
        address: buildAddress(),
        phone:   ticket.header.showPhone ? store.phone || null : null,
        email:   ticket.header.showEmail ? store.email || null : null,
        rfc:     ticket.header.showRfc   ? store.rfc   || null : null,
      },
      ticketOptions: {
        showNumber:         ticket.sale.showNumber,
        showDate:           ticket.sale.showDate,
        showTime:           ticket.sale.showTime,
        showSeller:         ticket.sale.showSeller,
        showCash:           ticket.sale.showCash,
        showBranch:         ticket.sale.showBranch,
        showCustomer:       ticket.sale.showCustomer,
        showPaymentMethod:  ticket.sale.showPaymentMethod,
      },
      ticketFooter: {
        thankYouMessage: ticket.footer.showThankYou    ? ticket.footer.thankYouMessage || null : null,
        returnPolicy:    ticket.footer.showReturnPolicy ? ticket.footer.returnPolicy   || null : null,
        website:         ticket.footer.showWebsite      ? store.website || null : null,
        name:            storeName || null,
      },
    }
  }

  // -----------------------------------------------------------
  // Imprimir
  // -----------------------------------------------------------
  const handlePrint = async () => {
    setPrinting(true)
    try {
      const result = await printReceipt(buildPayload())
      if (result.ok) {
        setPrinting(false)
        return
      }
    } catch (err) {
      console.warn('Backend no disponible, usando window.print()')
    }

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
              html, body { background: #fff !important; color: #000 !important; }
              body {
                font-family: 'Courier New', ui-monospace, monospace;
                font-size: ${paperWidth === 58 ? '10px' : '12px'};
                margin: 0; padding: 0; width: ${paperWidth}mm; line-height: 1.35;
              }
              .ticket { padding: 2mm 1mm; color: #000; }
              @media print { body { width: ${paperWidth}mm; } }
            </style>
          </head>
          <body><div class="ticket">${content}</div></body>
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
    logoImg: { maxHeight: '14mm', maxWidth: '80%', margin: '0 auto 2mm', display: 'block' },
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
      display: 'flex', justifyContent: 'space-between',
      fontSize: '0.95em', color: '#000',
    },
    totalsRow: { display: 'flex', justifyContent: 'space-between', color: '#000' },
    totalLine: {
      display: 'flex', justifyContent: 'space-between',
      fontSize: '1.4em', fontWeight: 700, color: '#000',
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
            {/* Header */}
            <div style={ticketStyles.header}>
              {showLogo && (
                <img src={store.logoUrl} alt="Logo" style={ticketStyles.logoImg} />
              )}
              {storeName && (
                <div style={ticketStyles.logo}>{storeName}</div>
              )}
              {storeTagline && (
                <div style={ticketStyles.tagline}>{storeTagline}</div>
              )}
              {showAddress && (
                <div style={ticketStyles.small}>
                  {addressLine && <div>{addressLine}</div>}
                  {cityLine && <div style={ticketStyles.smallLine}>{cityLine}</div>}
                  {postalLine && <div style={ticketStyles.smallLine}>{postalLine}</div>}
                </div>
              )}
              {showPhone && (
                <div style={ticketStyles.smallLine}>Tel: {store.phone}</div>
              )}
              {showEmail && (
                <div style={ticketStyles.smallLine}>{store.email}</div>
              )}
              {showRfc && (
                <div style={ticketStyles.smallLine}>RFC: {store.rfc}</div>
              )}
            </div>

            <div style={ticketStyles.divider} />

            {/* Meta */}
            <div style={ticketStyles.meta}>
              {ticket.sale.showNumber && (
                <div style={ticketStyles.metaRow}>
                  <span>Ticket:</span>
                  <span style={ticketStyles.bold}>{sale.folio}</span>
                </div>
              )}
              {ticket.sale.showDate && (
                <div style={ticketStyles.metaRow}>
                  <span>Fecha:</span>
                  <span>{new Date(sale.createdAt).toLocaleDateString('es-MX')}</span>
                </div>
              )}
              {ticket.sale.showTime && (
                <div style={ticketStyles.metaRow}>
                  <span>Hora:</span>
                  <span>
                    {new Date(sale.createdAt).toLocaleTimeString('es-MX', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}
              {ticket.sale.showSeller && (
                <div style={ticketStyles.metaRow}>
                  <span>Vendedor:</span>
                  <span>{sale.cashier}</span>
                </div>
              )}
              {ticket.sale.showCash && sale.cashId && (
                <div style={ticketStyles.metaRow}>
                  <span>Caja:</span>
                  <span>{sale.cashId}</span>
                </div>
              )}
              {ticket.sale.showBranch && sale.branch && (
                <div style={ticketStyles.metaRow}>
                  <span>Sucursal:</span>
                  <span>{sale.branch}</span>
                </div>
              )}
              {ticket.sale.showCustomer && (
                <div style={ticketStyles.metaRow}>
                  <span>Cliente:</span>
                  <span>{sale.customerName || 'Venta general'}</span>
                </div>
              )}
            </div>

            <div style={ticketStyles.divider} />

            {/* Productos */}
            <div>
              {(sale.items || []).map((item, i) => (
                <div key={i} style={ticketStyles.itemBlock}>
                  {ticket.products.showName && (
                    <div style={ticketStyles.itemName}>{item.productName}</div>
                  )}
                  {ticket.products.showSize || ticket.products.showColor ? (
                    <div style={ticketStyles.itemMeta}>
                      {[
                        ticket.products.showSize ? item.size : null,
                        ticket.products.showColor ? item.color : null,
                      ].filter(Boolean).join(' · ')}
                    </div>
                  ) : null}
                  {ticket.products.showSku && item.sku && (
                    <div style={ticketStyles.itemMeta}>SKU: {item.sku}</div>
                  )}
                  <div style={ticketStyles.itemLine}>
                    <span>
                      {ticket.products.showQuantity ? `${item.quantity} × ` : ''}
                      {ticket.products.showUnitPrice
                        ? `$${Number(item.price).toLocaleString('es-MX')}`
                        : ''}
                    </span>
                    {ticket.products.showSubtotal && (
                      <span style={ticketStyles.bold}>
                        ${(item.quantity * item.price).toLocaleString('es-MX')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={ticketStyles.divider} />

            {/* Totales */}
            <div>
              <TicketRow style={ticketStyles.totalsRow} label="Subtotal" value={sale.totals.subtotal} />
              {ticket.products.showDiscount && sale.totals.discountAmount > 0 && (
                <TicketRow style={ticketStyles.totalsRow} label="Descuento" value={-sale.totals.discountAmount} />
              )}
              {ticket.products.showTax && sale.totals.tax > 0 && (
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
              {ticket.sale.showPaymentMethod && (
                <TicketRow style={ticketStyles.totalsRow} label="Método" value={methodLabel} currency={false} />
              )}
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

            {/* Footer */}
            <div style={ticketStyles.footer}>
              {ticket.footer.showThankYou && ticket.footer.thankYouMessage && (
                <div style={{ ...ticketStyles.bold, marginBottom: '1mm' }}>
                  {ticket.footer.thankYouMessage}
                </div>
              )}
              {ticket.footer.showReturnPolicy && ticket.footer.returnPolicy && (
                <div>{ticket.footer.returnPolicy}</div>
              )}
              {ticket.footer.showWebsite && store.website && (
                <div style={{ marginTop: '1mm' }}>{store.website}</div>
              )}
              {ticket.footer.showSocial && (
                <div style={{ marginTop: '1mm', fontSize: '0.85em' }}>
                  {store.contact?.instagram && <div>{store.contact.instagram}</div>}
                  {store.contact?.facebook && <div>{store.contact.facebook}</div>}
                  {store.contact?.whatsapp && <div>WhatsApp: {store.contact.whatsapp}</div>}
                </div>
              )}
              {ticket.footer.showQr && ticket.qr.enabled && ticket.qr.url && (
                <div style={{ marginTop: '2mm', textAlign: 'center' }}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(ticket.qr.url)}`}
                    alt="QR"
                    style={{ width: '20mm', height: '20mm' }}
                  />
                </div>
              )}
              {!ticket.footer.showThankYou && !ticket.footer.showReturnPolicy && storeName && (
                <div style={ticketStyles.bold}>*** {storeName} ***</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer del modal */}
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