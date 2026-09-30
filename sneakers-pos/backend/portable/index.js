import express from 'express'
import cors from 'cors'
import {
  createPrinter,
  sendToPrinter,
  sendImageToLabelPrinter,
  decodeDataUrl,
  PRINTER_PORT,
  PRINTER_NAME,
  LABEL_PRINTER_NAME,
} from './printer.js'
import { getOpenDrawerBuffer } from './cashdrawer.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// -------------------------------------------------------------
// Healthcheck
// -------------------------------------------------------------
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'sneakers-print-server',
    receiptPrinter: `${PRINTER_NAME} (${PRINTER_PORT})`,
    labelPrinter: LABEL_PRINTER_NAME,
    at: new Date().toISOString(),
  })
})

// -------------------------------------------------------------
// Abrir cajón de dinero
// -------------------------------------------------------------
app.post('/open-drawer', async (req, res) => {
  try {
    const buffer = getOpenDrawerBuffer(0) // pin 2
    await sendToPrinter(buffer)
    console.log('✅ Cajón abierto desde el POS')
    res.json({ ok: true, action: 'open-drawer' })
  } catch (err) {
    console.error('❌ Error al abrir el cajón:', err.message)
    res.status(500).json({ ok: false, error: err.message })
  }
})

// -------------------------------------------------------------
// Imprimir ticket — TODOS los datos vienen del frontend
// -------------------------------------------------------------
app.post('/print-receipt', async (req, res) => {
  try {
    const { sale } = req.body
    if (!sale) {
      return res.status(400).json({ ok: false, error: 'Falta el objeto "sale"' })
    }

    // DEBUG
    console.log('📥 Datos recibidos del frontend:')
    console.log(JSON.stringify({
      folio: sale.folio,
      payment: sale.payment,
      itemsCount: (sale.items || []).length,
      ticketHeader: sale.ticketHeader,
      ticketOptions: sale.ticketOptions,
      ticketFooter: sale.ticketFooter,
    }, null, 2))

    const printer = createPrinter()

    const header  = sale.ticketHeader  || {}
    const options = sale.ticketOptions || {}
    const footer  = sale.ticketFooter  || {}

    // -------- ENCABEZADO --------
    printer.alignCenter()

    if (header.name) {
      printer.bold(true)
      printer.setTextSize(1, 1)
      printer.println(header.name)
      printer.setTextSize(0, 0)
      printer.bold(false)
    }

    if (header.tagline) printer.println(header.tagline)
    if (header.address) printer.println(header.address)
    if (header.phone)   printer.println(`Tel: ${header.phone}`)
    if (header.email)   printer.println(header.email)
    if (header.rfc)     printer.println(`RFC: ${header.rfc}`)

    printer.newLine()

    // -------- META --------
    printer.alignLeft()
    if (options.showNumber)   printer.println(`Ticket:   ${sale.folio}`)
    if (options.showDate) {
      const d = new Date(sale.createdAt)
      printer.println(`Fecha:    ${d.toLocaleDateString('es-MX')}`)
    }
    if (options.showTime) {
      const d = new Date(sale.createdAt)
      printer.println(`Hora:     ${d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}`)
    }
    if (options.showSeller)   printer.println(`Vendedor: ${sale.cashier}`)
    if (options.showCash && sale.cashId)       printer.println(`Caja:     ${sale.cashId}`)
    if (options.showBranch && sale.branch)     printer.println(`Sucursal: ${sale.branch}`)
    if (options.showCustomer) printer.println(`Cliente:  ${sale.customerName || 'Venta general'}`)
    printer.drawLine()

    // -------- ITEMS --------
    ;(sale.items || []).forEach((item) => {
      printer.bold(true)
      printer.println(item.productName)
      printer.bold(false)
      if (item.variantLabel || item.sku) {
        printer.println(`  ${item.variantLabel || ''} - ${item.sku || ''}`)
      }
      printer.alignLeft()
      printer.println(`  ${item.quantity} x $${Number(item.price).toLocaleString('es-MX')}`)
      printer.alignRight()
      printer.println(`$${(item.quantity * item.price).toLocaleString('es-MX')}`)
      printer.alignLeft()
    })
    printer.drawLine()

    // -------- TOTALES --------
    printer.println(`Subtotal:   $${Number(sale.totals?.subtotal || 0).toLocaleString('es-MX')}`)
    if (sale.totals?.discountAmount > 0) {
      printer.println(`Descuento: -$${Number(sale.totals.discountAmount).toLocaleString('es-MX')}`)
    }
    if (sale.totals?.tax > 0) {
      printer.println(`Impuestos:  $${Number(sale.totals.tax).toLocaleString('es-MX')}`)
    }
    printer.drawLine()
    printer.bold(true)
    printer.setTextSize(1, 1)
    printer.println(`TOTAL: $${Number(sale.total || 0).toLocaleString('es-MX')}`)
    printer.setTextSize(0, 0)
    printer.bold(false)
    printer.drawLine()

    // -------- PAGO --------
    const methodLabel = (() => {
      const m = sale.payment?.method
      const cardType = sale.payment?.cardType

      if (m === 'cash')     return 'Efectivo'
      if (m === 'card')     return `Tarjeta (${cardType === 'credit' ? 'Credito' : 'Debito'})`
      if (m === 'transfer') return 'Transferencia'
      if (m === 'digital')  return 'Pago digital'
      if (m === 'other')    return 'Otro'
      return sale.payment?.methodLabel || 'Otro'
    })()

    printer.println(`Metodo:   ${methodLabel}`)

    if (sale.payment?.method === 'cash') {
      printer.println(`Recibido: $${Number(sale.payment.cashReceived || 0).toLocaleString('es-MX')}`)
      printer.println(`Cambio:   $${Number(sale.payment.change || 0).toLocaleString('es-MX')}`)
    }

    if (sale.payment?.reference) {
      printer.println(`Ref:      ${sale.payment.reference}`)
    }

    // -------- FOOTER --------
    printer.newLine()
    printer.alignCenter()
    if (footer.thankYouMessage) printer.println(footer.thankYouMessage)
    if (footer.returnPolicy)    printer.println(footer.returnPolicy)
    if (footer.website)         printer.println(footer.website)
    if (footer.name)            printer.println(`*** ${footer.name} ***`)
    printer.newLine()
    printer.newLine()
    printer.newLine()

    // -------- ENVIAR --------
    const buffer = printer.getBuffer()
    await sendToPrinter(buffer)

    console.log(`✅ Ticket impreso · ${sale.folio}`)
    res.json({ ok: true, action: 'print-receipt', folio: sale.folio })
  } catch (err) {
    console.error('❌ Error al imprimir:', err.message)
    res.status(500).json({ ok: false, error: err.message })
  }
})

// -------------------------------------------------------------
// Imprimir etiqueta(s) en Brother QL-800 (DK-1201 · 29×90 mm)
// Body:
//   { imageDataUrl: "data:image/png;base64,..." }   → 1 etiqueta
//   { images: ["data:image/png;base64,...", ...] }  → lote
// -------------------------------------------------------------
app.post('/print-label', async (req, res) => {
  try {
    const { imageDataUrl, images } = req.body

    const list = Array.isArray(images)
      ? images
      : imageDataUrl
        ? [imageDataUrl]
        : []

    if (list.length === 0) {
      return res.status(400).json({
        ok: false,
        error: 'Falta "imageDataUrl" o "images" (array de data URLs)',
      })
    }

    console.log(`🖨️  Imprimiendo ${list.length} etiqueta(s) en ${LABEL_PRINTER_NAME}`)

    let printed = 0
    for (const dataUrl of list) {
      const buffer = decodeDataUrl(dataUrl)
      await sendImageToLabelPrinter(buffer, {
        printerName: LABEL_PRINTER_NAME,
        paperWidth: 114,   // DK-1201 29mm
        paperHeight: 354,  // DK-1201 90mm
        landscape: true,   // ✅ el driver rota
      })
      printed++
    }

    console.log(`✅ ${printed} etiqueta(s) enviada(s)`)
    res.json({ ok: true, action: 'print-label', count: printed })
  } catch (err) {
    console.error('❌ Error al imprimir etiqueta:', err.message)
    res.status(500).json({ ok: false, error: err.message })
  }
})

// -------------------------------------------------------------
// Iniciar servidor
// -------------------------------------------------------------
app.listen(PORT, () => {
  console.log('🖨️  Sneakers Print Server')
  console.log(`   Corriendo en http://localhost:${PORT}`)
  console.log(`   Tickets:   ${PRINTER_NAME} en ${PRINTER_PORT}`)
  console.log(`   Etiquetas: ${LABEL_PRINTER_NAME}`)
  console.log('   Endpoints:')
  console.log('     GET  /health')
  console.log('     POST /open-drawer')
  console.log('     POST /print-receipt')
  console.log('     POST /print-label')
})