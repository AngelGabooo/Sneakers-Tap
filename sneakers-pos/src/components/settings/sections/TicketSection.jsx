// src/components/settings/sections/TicketSection.jsx
import { Section, TextInput, TextArea, Grid2, Checkbox, Toggle, Select } from '../Field'
import TicketPreview from '../TicketPreview'
import { TICKET_WIDTHS, QR_TARGETS } from '../../../data/settings'

export default function TicketSection({ draft, updateSection }) {
  const { ticket } = draft
  const setTicket = (patch) => updateSection('ticket', patch)
  const setHeader = (patch) => setTicket({ header: { ...ticket.header, ...patch } })
  const setSale = (patch) => setTicket({ sale: { ...ticket.sale, ...patch } })
  const setProducts = (patch) => setTicket({ products: { ...ticket.products, ...patch } })
  const setFooter = (patch) => setTicket({ footer: { ...ticket.footer, ...patch } })
  const setQr = (patch) => setTicket({ qr: { ...ticket.qr, ...patch } })

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
      <div>
        <Section title="Encabezado">
          <Grid2>
            <TextInput
              label="Nombre que aparece en el ticket"
              value={ticket.header.name}
              onChange={(e) => setHeader({ name: e.target.value })}
            />
            <TextInput
              label="Texto debajo del nombre"
              value={ticket.header.tagline}
              onChange={(e) => setHeader({ tagline: e.target.value })}
            />
          </Grid2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
            <Checkbox label="Mostrar logotipo" checked={ticket.header.showLogo}    onChange={(v) => setHeader({ showLogo: v })} />
            <Checkbox label="Mostrar dirección" checked={ticket.header.showAddress} onChange={(v) => setHeader({ showAddress: v })} />
            <Checkbox label="Mostrar teléfono"  checked={ticket.header.showPhone}   onChange={(v) => setHeader({ showPhone: v })} />
            <Checkbox label="Mostrar correo"    checked={ticket.header.showEmail}   onChange={(v) => setHeader({ showEmail: v })} />
            <Checkbox label="Mostrar RFC"       checked={ticket.header.showRfc}     onChange={(v) => setHeader({ showRfc: v })} />
          </div>
        </Section>

        <Section title="Información de la venta">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Checkbox label="Número de venta" checked={ticket.sale.showNumber}   onChange={(v) => setSale({ showNumber: v })} />
            <Checkbox label="Fecha"           checked={ticket.sale.showDate}     onChange={(v) => setSale({ showDate: v })} />
            <Checkbox label="Hora"            checked={ticket.sale.showTime}     onChange={(v) => setSale({ showTime: v })} />
            <Checkbox label="Vendedor"        checked={ticket.sale.showSeller}   onChange={(v) => setSale({ showSeller: v })} />
            <Checkbox label="Caja"            checked={ticket.sale.showCash}     onChange={(v) => setSale({ showCash: v })} />
            <Checkbox label="Sucursal"        checked={ticket.sale.showBranch}   onChange={(v) => setSale({ showBranch: v })} />
            <Checkbox label="Cliente"         checked={ticket.sale.showCustomer} onChange={(v) => setSale({ showCustomer: v })} />
            <Checkbox label="Método de pago"  checked={ticket.sale.showPaymentMethod} onChange={(v) => setSale({ showPaymentMethod: v })} />
          </div>
        </Section>

        <Section title="Información de productos">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Checkbox label="Nombre"         checked={ticket.products.showName}      onChange={(v) => setProducts({ showName: v })} />
            <Checkbox label="Talla"          checked={ticket.products.showSize}      onChange={(v) => setProducts({ showSize: v })} />
            <Checkbox label="Color"          checked={ticket.products.showColor}     onChange={(v) => setProducts({ showColor: v })} />
            <Checkbox label="SKU"            checked={ticket.products.showSku}       onChange={(v) => setProducts({ showSku: v })} />
            <Checkbox label="Cantidad"       checked={ticket.products.showQuantity}  onChange={(v) => setProducts({ showQuantity: v })} />
            <Checkbox label="Precio unitario"checked={ticket.products.showUnitPrice} onChange={(v) => setProducts({ showUnitPrice: v })} />
            <Checkbox label="Descuento"      checked={ticket.products.showDiscount}  onChange={(v) => setProducts({ showDiscount: v })} />
            <Checkbox label="Impuesto"       checked={ticket.products.showTax}       onChange={(v) => setProducts({ showTax: v })} />
            <Checkbox label="Subtotal"       checked={ticket.products.showSubtotal}  onChange={(v) => setProducts({ showSubtotal: v })} />
          </div>
        </Section>

        <Section title="Pie del ticket">
          <TextArea
            label="Mensaje de agradecimiento"
            value={ticket.footer.thankYouMessage}
            onChange={(e) => setFooter({ thankYouMessage: e.target.value })}
            placeholder="Gracias por tu compra. ¡Te esperamos pronto!"
          />
          <TextArea
            label="Política de cambios y devoluciones"
            className="mt-4"
            value={ticket.footer.returnPolicy}
            onChange={(e) => setFooter({ returnPolicy: e.target.value })}
            placeholder="Los cambios y devoluciones están sujetos a las políticas vigentes de SNEAKERS."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
            <Checkbox label="Mostrar mensaje de agradecimiento" checked={ticket.footer.showThankYou}    onChange={(v) => setFooter({ showThankYou: v })} />
            <Checkbox label="Mostrar política de cambios"        checked={ticket.footer.showReturnPolicy} onChange={(v) => setFooter({ showReturnPolicy: v })} />
            <Checkbox label="Mostrar redes sociales"             checked={ticket.footer.showSocial}       onChange={(v) => setFooter({ showSocial: v })} />
            <Checkbox label="Mostrar sitio web"                  checked={ticket.footer.showWebsite}      onChange={(v) => setFooter({ showWebsite: v })} />
          </div>
        </Section>

        <Section title="Código QR">
          <Toggle
            label="Mostrar código QR en el ticket"
            description="Cuando esté activo, el QR se genera con la información que selecciones."
            checked={ticket.qr.enabled}
            onChange={(v) => setQr({ enabled: v })}
          />
          {ticket.qr.enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <Select
                label="Destino del QR"
                value={ticket.qr.target}
                onChange={(e) => setQr({ target: e.target.value })}
                options={QR_TARGETS}
              />
              <TextInput
                label="URL"
                value={ticket.qr.url}
                onChange={(e) => setQr({ url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          )}
        </Section>

        <Section title="Formato de impresión">
          <Select
            label="Ancho del ticket"
            value={ticket.width}
            onChange={(e) => setTicket({ width: Number(e.target.value) })}
            options={TICKET_WIDTHS.map((w) => ({ value: w.value, label: w.label }))}
          />
          <p className="text-xs text-gray-500 dark:text-dark-muted mt-2">
            Vista previa de impresión — no registra ninguna venta.
          </p>
        </Section>
      </div>

      <div className="xl:sticky xl:top-4 self-start">
        <TicketPreview settings={{ ...draft, ticket }} />
      </div>
    </div>
  )
}