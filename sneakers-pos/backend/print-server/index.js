import express from 'express'
import cors from 'cors'
import { createPrinter, PRINTER_CONFIG } from './printer.js'
import { openCashDrawer } from './cashdrawer.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '2mb' }))

// -------------------------------------------------------------
// Healthcheck
// -------------------------------------------------------------
app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'sneakers-print-server',
    printer: PRINTER_CONFIG.interface,
    at: new Date().toISOString(),
  })
})

// -------------------------------------------------------------
// Abrir cajón de dinero
// -------------------------------------------------------------
app.post('/open-drawer', async (req, res) => {
  try {
    const printer = createPrinter()

    // Abre el cajón (algunas impresoras requieren enviar el pulso)
    printer.openCashDrawer()

    // Algunas GTP58B1 requieren "pulse" para ejecutar el comando
    await printer.execute()

    console.log('✅ Cajón abierto desde el POS')
    res.json({ ok: true, action: 'open-drawer' })
  } catch (err) {
    console.error('❌ Error al abrir el cajón:', err)
    res.status(500).json({ ok: false, error: err.message })
  }
})

// -------------------------------------------------------------
// Imprimir ticket + abrir cajón
// -------------------------------------------------------------
app.post('/print-receipt', async (req, res) => {
  try {
    const { sale } = req.body
    if (!sale) {
      return res.status(400).json({ ok: false, error: 'Falta el objeto "sale"' })
    }

    const printer = createPrinter()

    // -------- ENCABEZADO --------
    printer.alignCenter()
    printer.bold(true)
    printer.setTextSize(1, 1) // doble alto/ancho
    printer.println('SNEAKERS')
    printer.setTextSize(0, 0)
    printer.bold(false)
    printer.println('Tenis · Bolsas · Mochilas · Accesorios')
    printer.println('Av. Principal 123, Col. Centro')
    printer.println('CDMX · Tel: 55 1234 5678')
    printer.println('RFC: SNK240101ABC')
    printer.newLine()

    // -------- META --------
    printer.alignLeft()
    printer.println(`Ticket: ${sale.folio}`)
    printer.println(`Fecha:  ${new Date(sale.createdAt).toLocaleString('es-MX')}`)
    printer.println(`Cajero: ${sale.cashier}`)
    printer.println(`Cliente: ${sale.customerName || 'Venta general'}`)
    printer.drawLine()

    // -------- ITEMS --------
    ;(sale.items || []).forEach((item) => {
      printer.bold(true)
      printer.println(item.productName)
      printer.bold(false)
      printer.println(`  ${item.variantLabel} · ${item.sku}`)
      printer.alignLeft()
      printer.println(
        `  ${item.quantity} x $${Number(item.price).toLocaleString('es-MX')}`,
      )
      printer.alignRight()
      printer.println(
        `$${(item.quantity * item.price).toLocaleString('es-MX')}`,
      )
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
    printer.println(`Método: ${sale.payment?.methodLabel || '—'}`)
    if (sale.payment?.method === 'cash') {
      printer.println(`Recibido: $${Number(sale.payment.cashReceived || 0).toLocaleString('es-MX')}`)
      printer.println(`Cambio:   $${Number(sale.payment.change || 0).toLocaleString('es-MX')}`)
    }
    if (sale.payment?.reference) {
      printer.println(`Ref: ${sale.payment.reference}`)
    }

    // -------- FOOTER --------
    printer.newLine()
    printer.alignCenter()
    printer.println('¡Gracias por tu compra!')
    printer.println('Conserva tu ticket para cambios y devoluciones.')
    printer.println('*** SNEAKERS ***')
    printer.newLine()
    printer.newLine()
    printer.newLine()

    // -------- ABRIR CAJÓN DESPUÉS DE IMPRIMIR --------
    printer.openCashDrawer()

    // -------- EJECUTAR --------
    await printer.execute()
    printer.clear()

    console.log(`✅ Ticket impreso y cajón abierto · ${sale.folio}`)
    res.json({ ok: true, action: 'print-receipt', folio: sale.folio })
  } catch (err) {
    console.error('❌ Error al imprimir:', err)
    res.status(500).json({ ok: false, error: err.message })
  }
})

// -------------------------------------------------------------
// Iniciar servidor
// -------------------------------------------------------------
app.listen(PORT, () => {
  console.log('🖨️  Sneakers Print Server')
  console.log(`   Corriendo en http://localhost:${PORT}`)
  console.log(`   Impresora: ${PRINTER_CONFIG.interface}`)
  console.log('   Endpoints:')
  console.log('     GET  /health')
  console.log('     POST /open-drawer')
  console.log('     POST /print-receipt')
})