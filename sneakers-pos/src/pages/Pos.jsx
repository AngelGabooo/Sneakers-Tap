// src/pages/Pos.jsx
import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Toast from '../components/common/Toast'
import PosHeader from '../components/pos/PosHeader'
import PosCashStatusBanner from '../components/pos/PosCashStatusBanner'
import PosSearchBar from '../components/pos/PosSearchBar'
import PosCategories from '../components/pos/PosCategories'
import PosProductGrid from '../components/pos/PosProductGrid'
import PosVariantSelector from '../components/pos/PosVariantSelector'
import PosCart from '../components/pos/PosCart'
import PosCartMobileBar from '../components/pos/PosCartMobileBar'
import PosCustomerPicker from '../components/pos/PosCustomerPicker'
import PosCheckoutModal from '../components/pos/PosCheckoutModal'
import PosSuccessModal from '../components/pos/PosSuccessModal'
import PosSuspendModal from '../components/pos/PosSuspendModal'
import PosTicketModal from '../components/pos/PosTicketModal'
import { useView } from '../context/ViewContext'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'
import { useSales } from '../context/SalesContext'
import { useCash } from '../context/CashContext'
import { useSettings } from '../context/SettingsContext'
import { openCashDrawer, printReceipt } from '../services/printerService'
import { notifySale } from '../utils/notifyAdmins'

export default function Pos() {
  const { navigate } = useView()
  const { user } = useAuth()
  const { products } = useProducts()
  const { createSale } = useSales()
  const { getAnyOpenSession } = useCash()
  const { settings } = useSettings()
  const { store, ticket } = settings

  const {
    items, customer, totals,
    addItem, updateQuantity, removeItem, clear,
    setCustomer,
  } = useCart()

  const openSession = getAnyOpenSession()
  const cashOpen = !!openSession
  const cashId = openSession?.cashLabel || 'Sin caja'
  const cashBranch = openSession?.branch || 'Tienda principal'

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  const [variantProduct, setVariantProduct] = useState(null)
  const [customerOpen, setCustomerOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successSale, setSuccessSale] = useState(null)
  const [suspendOpen, setSuspendOpen] = useState(false)
  const [ticketOpen, setTicketOpen] = useState(false)
  const [toast, setToast] = useState(null)

  const [mobileCartOpen, setMobileCartOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 200)
    return () => clearTimeout(t)
  }, [])

  // -------------------------------------------------------------
  // Helper: arma dirección de la tienda para el ticket
  // -------------------------------------------------------------
  const buildTicketAddress = () => {
    if (!ticket.header.showAddress) return null
    const a = store.address || {}
    const parts = [
      a.street,
      a.exteriorNumber,
      a.neighborhood,
      a.city,
      a.state,
      a.postalCode,
    ].filter(Boolean)
    return parts.length ? parts.join(', ') : null
  }

  // -------------------------------------------------------------
  // Helper: arma el objeto con TODOS los datos configurables
  // que el server necesita para imprimir
  // -------------------------------------------------------------
  const buildTicketPayload = (sale) => {
    const storeName = ticket.header.name || store.commercialName || ''

    return {
      ...sale,
      ticketHeader: {
        name:    storeName,
        tagline: ticket.header.tagline || null,
        address: buildTicketAddress(),
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

  // -------------------------------------------------------------
  // Filtro de productos
  // -------------------------------------------------------------
  const filtered = useMemo(() => {
    let list = [...products]

    if (category !== 'all') {
      list = list.filter((p) => (p.category || '').toLowerCase() === category.toLowerCase())
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.barcode || '').toLowerCase().includes(q) ||
        (p.brand || '').toLowerCase().includes(q) ||
        (p.variants || []).some((v) =>
          (v.sku || '').toLowerCase().includes(q) ||
          (v.barcode || '').toLowerCase().includes(q) ||
          (v.size || '').toLowerCase().includes(q) ||
          (v.color || '').toLowerCase().includes(q),
        ),
      )
    }

    return list
  }, [products, category, search])

  // -------------------------------------------------------------
  // Scanner robusto
  // -------------------------------------------------------------
  const sameCode = (a, b) => {
    const A = String(a || '').trim()
    const B = String(b || '').trim()
    if (!A || !B) return false
    if (A === B) return true
    if (A.replace(/^0+/, '') === B.replace(/^0+/, '')) return true
    if (A.length >= 8 && B.length >= 8 && A.slice(-8) === B.slice(-8)) return true
    return false
  }

  const handleScan = (rawCode) => {
    if (!rawCode) return

    const code = String(rawCode)
      .trim()
      .replace(/^\*+|\*+$/g, '')
      .replace(/[\r\n\t]+/g, '')

    if (!code) return

    for (const p of products) {
      const variant = (p.variants || []).find((v) => sameCode(v.barcode, code))
      if (variant) {
        addItem(p, variant, 1)
        setToast({
          title: 'Producto agregado al carrito',
          description: `${p.name} · ${variant.label}`,
        })
        return
      }
    }

    for (const p of products) {
      if (sameCode(p.barcode, code)) {
        if ((p.variants || []).length > 0) {
          setVariantProduct(p)
        } else {
          addItem(p, null, 1)
          setToast({ title: 'Producto agregado al carrito', description: p.name })
        }
        return
      }
    }

    for (const p of products) {
      const variant = (p.variants || []).find((v) => sameCode(v.sku, code))
      if (variant) {
        addItem(p, variant, 1)
        setToast({
          title: 'Producto agregado al carrito',
          description: `${p.name} · ${variant.label}`,
        })
        return
      }
    }

    for (const p of products) {
      if (sameCode(p.sku, code)) {
        if ((p.variants || []).length > 0) {
          setVariantProduct(p)
        } else {
          addItem(p, null, 1)
          setToast({ title: 'Producto agregado al carrito', description: p.name })
        }
        return
      }
    }

    setToast({
      title: 'Producto no encontrado',
      description: `Código escaneado: ${code}`,
    })
  }

  const handleProductClick = (product) => {
    if ((product.variants || []).length > 0) {
      setVariantProduct(product)
    } else {
      addItem(product, null, 1)
      setToast({ title: 'Producto agregado al carrito', description: product.name })
    }
  }

  const handleVariantSelect = (product, variant, quantity) => {
    addItem(product, variant, quantity)
    setToast({
      title: 'Producto agregado al carrito',
      description: `${product.name} · ${variant.label}`,
    })
  }

  const handleClearCart = () => {
    if (items.length && !window.confirm('¿Vaciar el carrito?')) return
    clear()
  }

  // -------------------------------------------------------------
  // Cobro
  // -------------------------------------------------------------
  const handleConfirmSale = async (payment) => {
    if (!cashOpen) {
      setToast({
        title: 'No hay una caja abierta',
        description: 'Debes abrir una caja antes de registrar ventas.',
      })
      return
    }

    if (customer?.isWholesale) {
      const minAmount = Number(customer.minPurchaseAmount) || 0
      const minUnits = Number(customer.minPurchaseUnits) || 0

      if (minAmount > 0 && totals.subtotal < minAmount) {
        setToast({
          title: 'Compra mínima no cumplida',
          description: `Este mayorista requiere un mínimo de $${minAmount.toLocaleString('es-MX')}.`,
        })
        return
      }

      if (minUnits > 0) {
        const totalUnits = items.reduce((a, i) => a + i.quantity, 0)
        if (totalUnits < minUnits) {
          setToast({
            title: 'Unidades mínimas no cumplidas',
            description: `Este mayorista requiere mínimo ${minUnits} unidades.`,
          })
          return
        }
      }
    }

    setSubmitting(true)

    const methodLabel =
      payment.method === 'cash' ? 'Efectivo'
      : payment.method === 'card'
        ? `Tarjeta (${payment.cardType === 'credit' ? 'Crédito' : 'Débito'})`
      : payment.method === 'transfer' ? 'Transferencia'
      : payment.method === 'digital' ? 'Pago digital'
      : 'Otro'

    const wholesaleSnapshot = customer?.isWholesale
      ? {
          id: customer.id,
          name: customer.name,
          condition: customer.condition,
          priceList: customer.priceList,
          defaultDiscount: customer.defaultDiscount,
          minPurchaseAmount: customer.minPurchaseAmount,
          minPurchaseUnits: customer.minPurchaseUnits,
          creditAvailable: customer.creditAvailable,
        }
      : null

    const sellerName = user?.name || 'Usuario'
    const sellerRole = user?.role || 'Vendedor'

    try {
      // ✅ AWAIT — antes faltaba
      const sale = await createSale({
        cashier: sellerName,
        cashierRole: sellerRole,
        sellerId: user?.id || null,
        customerId: customer?.id || null,
        customerName: customer?.name || null,
        customerType: customer?.isWholesale ? 'wholesale' : 'regular',
        wholesaleSnapshot,
        items: items.map((i) => ({
          key: i.key,
          productId: i.productId,
          productName: i.productName,
          variantId: i.variantId,
          variantLabel: i.variantLabel,
          sku: i.sku,
          imageUrl: i.imageUrl,
          price: i.price,
          basePrice: i.basePrice,
          quantity: i.quantity,
        })),
        totals: {
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
          wholesaleDiscountAmount: totals.wholesaleDiscountAmount,
          extraDiscount: totals.extraDiscount,
          tax: totals.tax,
          total: totals.total,
        },
        payment: {
          method: payment.method,
          methodLabel,
          cashReceived: payment.cashReceived || null,
          cardType: payment.cardType || null,
          reference: payment.reference || null,
          change: payment.change || 0,
        },
        change: payment.change || 0,
        total: totals.total,
        branch: cashBranch,
        cashId,
        cashSessionId: openSession?.id || null,
        cashRegisterId: openSession?.id || 'CAJ-000001',
        notes: '',
      })

      const fullSale = { ...sale, methodLabel }
      setSuccessSale(fullSale)
      setCheckoutOpen(false)
      setSubmitting(false)

      // 🔔 Notificar a los administradores
      notifySale({
        sale: fullSale,
        actorName: sellerName,
        actorRole: sellerRole,
        cashId,
        branch: cashBranch,
      })

      if (payment.method === 'cash') {
        const result = await openCashDrawer()
        if (!result.ok) {
          console.warn('⚠️ No se pudo abrir el cajón:', result.error)
          setToast({
            title: 'Cajón no disponible',
            description: 'Verifica que el servidor de impresión esté corriendo.',
          })
        }
      }
    } catch (err) {
      console.error('❌ Error creando venta:', err)
      setSubmitting(false)
      setToast({
        title: 'Error al registrar la venta',
        description: err.message || 'Intenta de nuevo.',
      })
    }
  }

  // -------------------------------------------------------------
  // Imprimir ticket
  // -------------------------------------------------------------
  const handlePrintTicket = async () => {
    if (!successSale) return

    const payload = buildTicketPayload(successSale)
    const result = await printReceipt(payload)

    if (result.ok) {
      setToast({
        title: 'Ticket impreso',
        description: `Se imprimió el ticket ${successSale.folio}.`,
      })
      return
    }

    setTicketOpen(true)
  }

  const handleCloseTicket = () => setTicketOpen(false)

  const handleSendEmail = (sale) => {
    setToast({
      title: 'Comprobante preparado',
      description: 'Función pendiente de conexión con el backend.',
    })
  }

  const handleNewSale = () => {
    setSuccessSale(null)
    setTicketOpen(false)
    clear()
    setSearch('')
    setCategory('all')
    setMobileCartOpen(false)
  }

  const handleSuspendConfirm = ({ reference }) => {
    setToast({ title: 'Venta suspendida', description: reference })
    clear()
    setMobileCartOpen(false)
  }

  const handleViewSaleDetail = () => {
    const saleId = successSale?.id
    setSuccessSale(null)
    setTicketOpen(false)
    clear()
    if (saleId) navigate('sale-detail', { id: saleId })
  }

  const cartCount = items.reduce((acc, i) => acc + i.quantity, 0)

  return (
    <DashboardLayout
      activeKey="pos"
      onNavigate={navigate}
      period={undefined}
      onPeriodChange={undefined}
    >
      <div className="flex flex-col md:h-[calc(100vh-112px)] md:min-h-[640px] gap-3">
        <div className="hidden md:block shrink-0">
          <PosHeader cashOpen={cashOpen} cashId={cashId} location={cashBranch} />
        </div>

        <div className="md:hidden flex items-center justify-between gap-2 shrink-0">
          <div>
            <h1 className="text-lg font-bold text-brand-black dark:text-dark-text">
              Punto de venta
            </h1>
            <p className="text-[11px] text-gray-500 dark:text-dark-muted">
              {cashId} · {cashOpen ? 'Abierta' : 'Cerrada'}
            </p>
          </div>
        </div>

        <PosCashStatusBanner open={cashOpen} onOpenCash={() => navigate('cash-open')} />

        <div className="flex-1 flex gap-4 min-h-0">
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            <PosSearchBar value={search} onChange={setSearch} onScan={handleScan} />
            <PosCategories active={category} onChange={setCategory} />
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 -mr-1">
              <PosProductGrid products={filtered} loading={loading} onProductClick={handleProductClick} />
            </div>
          </div>

          <aside className="hidden md:flex md:w-[360px] lg:w-[420px] xl:w-[460px] 2xl:w-[520px] shrink-0 min-h-0">
            <div className="w-full h-full">
              <PosCart
                items={items}
                totals={totals}
                customer={customer}
                onQuantityChange={updateQuantity}
                onRemove={removeItem}
                onClear={handleClearCart}
                onOpenCustomer={() => setCustomerOpen(true)}
                onOpenDiscount={() => setToast({ title: 'Descuento', description: 'Función pendiente.' })}
                onOpenNote={() => setToast({ title: 'Nota', description: 'Función pendiente.' })}
                onOpenSuspend={() => setSuspendOpen(true)}
                onCheckout={() => setCheckoutOpen(true)}
              />
            </div>
          </aside>
        </div>
      </div>

      <PosCartMobileBar
        count={cartCount}
        total={totals.total}
        onOpen={() => setMobileCartOpen(true)}
        hidden={items.length === 0}
      />

      {mobileCartOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm md:hidden"
            onClick={() => setMobileCartOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-[61] w-full sm:w-[420px] bg-white dark:bg-dark-card border-l border-gray-200 dark:border-dark-border shadow-cardHover md:hidden">
            <PosCart
              items={items}
              totals={totals}
              customer={customer}
              onQuantityChange={updateQuantity}
              onRemove={removeItem}
              onClear={handleClearCart}
              onOpenCustomer={() => setCustomerOpen(true)}
              onOpenDiscount={() => setToast({ title: 'Descuento', description: 'Función pendiente.' })}
              onOpenNote={() => setToast({ title: 'Nota', description: 'Función pendiente.' })}
              onOpenSuspend={() => setSuspendOpen(true)}
              onCheckout={() => { setMobileCartOpen(false); setCheckoutOpen(true) }}
              onClose={() => setMobileCartOpen(false)}
              showCloseButton
            />
          </div>
        </>
      )}

      <PosVariantSelector
        open={!!variantProduct}
        product={variantProduct}
        onClose={() => setVariantProduct(null)}
        onSelect={handleVariantSelect}
      />

      <PosCustomerPicker
        open={customerOpen}
        onClose={() => setCustomerOpen(false)}
        onSelect={setCustomer}
        onClearCustomer={() => setCustomer(null)}
      />

      <PosCheckoutModal
        open={checkoutOpen}
        totals={totals}
        onClose={() => setCheckoutOpen(false)}
        onConfirm={handleConfirmSale}
        submitting={submitting}
      />

      <PosSuccessModal
        open={!!successSale && !ticketOpen}
        sale={successSale}
        onClose={() => setSuccessSale(null)}
        onPrint={handlePrintTicket}
        onSendEmail={() => handleSendEmail(successSale)}
        onViewDetail={handleViewSaleDetail}
        onNewSale={handleNewSale}
      />

      <PosTicketModal
        open={ticketOpen}
        sale={successSale}
        width={58}
        onClose={handleCloseTicket}
        onSendEmail={handleSendEmail}
      />

      <PosSuspendModal
        open={suspendOpen}
        onClose={() => setSuspendOpen(false)}
        onConfirm={handleSuspendConfirm}
      />

      <Toast
        open={!!toast}
        variant={toast?.title === 'Producto no encontrado' ? 'error' : 'success'}
        title={toast?.title}
        description={toast?.description}
        onClose={() => setToast(null)}
      />
    </DashboardLayout>
  )
}