// src/components/settings/TicketPreview.jsx

export default function TicketPreview({ settings }) {
  const { store, ticket } = settings
  const width = ticket.width === 58 ? 220 : 300
  const is58 = ticket.width === 58

  const storeName = ticket.header.name || store.commercialName || ''
  const hasAnyHeader =
    storeName || ticket.header.tagline ||
    (ticket.header.showAddress && store.address?.street) ||
    (ticket.header.showPhone && store.phone) ||
    (ticket.header.showEmail && store.email) ||
    (ticket.header.showRfc && store.rfc)

  return (
    <div className="bg-white dark:bg-dark-surface rounded-xl border border-gray-200 dark:border-dark-border p-5">
      <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text mb-3">
        Vista previa del ticket
      </h3>

      <div className="flex justify-center">
        <div
          className="rounded-lg p-4 font-mono text-black bg-white"
          style={{
            width: `${width}px`,
            fontSize: is58 ? '10px' : '12px',
            lineHeight: 1.4,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            colorScheme: 'light',
          }}
        >
          {/* Header */}
          <div className="text-center mb-2">
            {ticket.header.showLogo && store.logoUrl && (
              <img
                src={store.logoUrl}
                alt="Logo"
                className="mx-auto mb-2 object-contain"
                style={{ maxHeight: is58 ? '40px' : '56px', maxWidth: '80%' }}
              />
            )}
            {storeName && (
              <div className="font-bold text-base tracking-wider">{storeName}</div>
            )}
            {ticket.header.tagline && (
              <div className="mt-0.5" style={{ fontSize: '0.9em' }}>
                {ticket.header.tagline}
              </div>
            )}
          </div>

          {/* Datos de la tienda */}
          {ticket.header.showAddress && store.address?.street && (
            <div className="text-center" style={{ fontSize: '0.85em' }}>
              {[store.address.street, store.address.exteriorNumber, store.address.neighborhood]
                .filter(Boolean)
                .join(' ')}
              <br />
              {[store.address.city, store.address.state].filter(Boolean).join(', ')}
              {store.address.postalCode ? `, ${store.address.postalCode}` : ''}
            </div>
          )}
          {ticket.header.showPhone && store.phone && (
            <div className="text-center" style={{ fontSize: '0.85em' }}>
              Tel: {store.phone}
            </div>
          )}
          {ticket.header.showEmail && store.email && (
            <div className="text-center" style={{ fontSize: '0.85em' }}>
              {store.email}
            </div>
          )}
          {ticket.header.showRfc && store.rfc && (
            <div className="text-center" style={{ fontSize: '0.85em' }}>
              RFC: {store.rfc}
            </div>
          )}

          {!hasAnyHeader && (
            <div className="text-center text-gray-400" style={{ fontSize: '0.8em' }}>
              (Sin encabezado configurado)
            </div>
          )}

          <Divider />

          {/* Datos de venta */}
          <div style={{ fontSize: '0.9em' }}>
            {ticket.sale.showNumber   && <Row label="Venta:"    value="#VTA-000000" bold />}
            {ticket.sale.showDate     && <Row label="Fecha:"    value="--/--/----" />}
            {ticket.sale.showTime     && <Row label="Hora:"     value="--:--" />}
            {ticket.sale.showSeller   && <Row label="Vendedor:" value="—" />}
            {ticket.sale.showCash     && <Row label="Caja:"     value="#---" />}
            {ticket.sale.showBranch   && <Row label="Sucursal:" value="—" />}
            {ticket.sale.showCustomer && <Row label="Cliente:"  value="Venta general" />}
          </div>

          <Divider />

          {/* Productos (placeholders) */}
          <div style={{ fontSize: '0.9em' }}>
            <div className="font-bold">Producto de ejemplo</div>
            <div style={{ fontSize: '0.85em' }}>Talla · Color</div>
            {ticket.products.showSku && (
              <div style={{ fontSize: '0.8em' }}>SKU: ---</div>
            )}
            <div className="flex justify-between">
              <span>1 × $0.00</span>
              <span className="font-bold">$0.00</span>
            </div>
          </div>

          <Divider />

          <Row label="Subtotal" value="$0.00" />
          {ticket.products.showDiscount && (
            <Row label="Descuento" value="-$0.00" />
          )}
          {ticket.products.showTax && (
            <Row label="Impuestos" value="$0.00" />
          )}

          <Divider />

          <div className="flex justify-between font-bold" style={{ fontSize: '1.25em' }}>
            <span>TOTAL</span>
            <span>$0.00</span>
          </div>

          <Divider />

          {ticket.sale.showPaymentMethod && (
            <Row label="Método:" value="—" />
          )}

          <Divider />

          {/* Footer */}
          <div className="text-center" style={{ fontSize: '0.9em' }}>
            {ticket.footer.showThankYou && ticket.footer.thankYouMessage && (
              <div className="font-bold mb-1">{ticket.footer.thankYouMessage}</div>
            )}
            {ticket.footer.showReturnPolicy && ticket.footer.returnPolicy && (
              <div style={{ fontSize: '0.85em' }}>{ticket.footer.returnPolicy}</div>
            )}
            {ticket.footer.showWebsite && store.website && (
              <div style={{ marginTop: '2mm' }}>{store.website}</div>
            )}
            {!ticket.footer.showThankYou &&
             !ticket.footer.showReturnPolicy &&
             !ticket.footer.showWebsite &&
             !storeName && (
              <div className="text-gray-400" style={{ fontSize: '0.8em' }}>
                (Sin pie configurado)
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function Divider() {
  return <div className="my-2 border-t border-dashed border-black" />
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className={bold ? 'font-bold' : ''}>{value}</span>
    </div>
  )
}