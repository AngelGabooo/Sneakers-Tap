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
import { useCart } from '../context/CartContext'
import { useProducts } from '../context/ProductsContext'
import { useSales } from '../context/SalesContext'
import { useCash } from '../context/CashContext'

export default function Pos() {
  const { navigate } = useView()
  const { products } = useProducts()
  const { createSale } = useSales()
  const { getAnyOpenSession } = useCash()
  const {
    items, customer, totals,
    addItem, updateQuantity, removeItem, clear,
    setCustomer,
  } = useCart()

  // 🔑 Caja actual desde CashContext
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

  // 📱 Panel del carrito en móvil
  const [mobileCartOpen, setMobileCartOpen] = useState(false)

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 200)
    return () => clearTimeout(t)
  }, [])

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

  const handleScan = (code) => {
    if (!code) return

    for (const p of products) {
      const variant = (p.variants || []).find((v) => v.barcode === code)
      if (variant) {
        addItem(p, variant, 1)
        setToast({
          title: 'Producto agregado al carrito',
          description: `${p.name} · ${variant.label}`,
        })
        return
      }
      if (p.barcode === code) {
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

  /**
   * 🔑 Al confirmar la venta:
   * 1. Validar que haya caja abierta.
   * 2. Guardar la venta completa en SalesContext.
   * 3. Asociarla a la sesión de caja activa.
   * 4. Mostrar el modal de éxito.
   */
  const handleConfirmSale = (payment) => {
    // Bloqueo duro: no permitir cobrar sin caja abierta
    if (!cashOpen) {
      setToast({
        title: 'No hay una caja abierta',
        description: 'Debes abrir una caja antes de registrar ventas.',
      })
      return
    }

    setSubmitting(true)

    setTimeout(() => {
      const methodLabel =
        payment.method === 'cash' ? 'Efectivo'
        : payment.method === 'card'
          ? `Tarjeta (${payment.cardType === 'credit' ? 'Crédito' : 'Débito'})`
        : payment.method === 'transfer' ? 'Transferencia'
        : payment.method === 'digital' ? 'Pago digital'
        : 'Otro'

      // 1. Guardar la venta completa
      const sale = createSale({
        cashier: 'Henry Sneakers',
        cashierRole: 'Administrador',
        customerId: customer?.id || null,
        customerName: customer?.name || null,
        customerType: customer?.isWholesale ? 'wholesale' : 'regular',
        items: items.map((i) => ({
          key: i.key,
          productId: i.productId,
          productName: i.productName,
          variantId: i.variantId,
          variantLabel: i.variantLabel,
          sku: i.sku,
          imageUrl: i.imageUrl,
          price: i.price,
          quantity: i.quantity,
        })),
        totals: {
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
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

      // 🚧 TODO: cuando conectes backend, aquí irá:
      // - POST /api/sales
      // - POST /api/inventory/movements por cada item
      // - PUT /api/products/:id (stock)
      // - POST /api/cash/sessions/:id/movements
      // - POST /api/audit

      setSuccessSale({
        ...sale,
        methodLabel,
      })

      setCheckoutOpen(false)
      setSubmitting(false)
    }, 700)
  }

  const handlePrintTicket = () => {
    if (!successSale) return
    setTicketOpen(true)
  }

  const handleCloseTicket = () => setTicketOpen(false)

  const handleSendEmail = (sale) => {
    console.log('Enviar ticket por correo:', sale)
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
    console.log('Venta suspendida:', reference, items)
    setToast({ title: 'Venta suspendida', description: reference })
    clear()
    setMobileCartOpen(false)
  }

  /** 🔑 Navega al detalle de la venta guardada */
  const handleViewSaleDetail = () => {
    const saleId = successSale?.id
    setSuccessSale(null)
    setTicketOpen(false)
    clear()
    if (saleId) {
      navigate('sale-detail', { id: saleId })
    }
  }

  const cartCount = items.reduce((acc, i) => acc + i.quantity, 0)

  return (
    <DashboardLayout
      activeKey="pos"
      onNavigate={navigate}
      period={undefined}
      onPeriodChange={undefined}
    >
      {/* Contenedor principal: altura de viewport SOLO en md+ */}
      <div className="flex flex-col md:h-[calc(100vh-112px)] md:min-h-[640px] gap-3">

        {/* Header del POS (solo en desktop) */}
        <div className="hidden md:block shrink-0">
          <PosHeader
            cashOpen={cashOpen}
            cashId={cashId}
            location={cashBranch}
          />
        </div>

        {/* Header móvil compacto */}
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

        {/* Banner de caja */}
        <PosCashStatusBanner
          open={cashOpen}
          onOpenCash={() => navigate('cash-open')}
        />

        {/* Layout principal: 2 columnas desde md */}
        <div className="flex-1 flex gap-4 min-h-0">

          {/* ============ COLUMNA IZQUIERDA: PRODUCTOS ============ */}
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            <PosSearchBar
              value={search}
              onChange={setSearch}
              onScan={handleScan}
            />

            <PosCategories active={category} onChange={setCategory} />

            {/* Grid con scroll propio */}
            <div className="flex-1 overflow-y-auto min-h-0 pr-1 -mr-1">
              <PosProductGrid
                products={filtered}
                loading={loading}
                onProductClick={handleProductClick}
              />
            </div>
          </div>

          {/* ============ COLUMNA DERECHA: CARRITO (md+) ============ */}
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
                onOpenDiscount={() => setToast({
                  title: 'Descuento',
                  description: 'Función pendiente de implementación.',
                })}
                onOpenNote={() => setToast({
                  title: 'Nota',
                  description: 'Función pendiente de implementación.',
                })}
                onOpenSuspend={() => setSuspendOpen(true)}
                onCheckout={() => setCheckoutOpen(true)}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* ============ BARRA FLOTANTE DEL CARRITO (solo móvil) ============ */}
      <PosCartMobileBar
        count={cartCount}
        total={totals.total}
        onOpen={() => setMobileCartOpen(true)}
        hidden={items.length === 0}
      />

      {/* ============ PANEL LATERAL DEL CARRITO (solo móvil) ============ */}
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
              onOpenDiscount={() => setToast({
                title: 'Descuento',
                description: 'Función pendiente de implementación.',
              })}
              onOpenNote={() => setToast({
                title: 'Nota',
                description: 'Función pendiente de implementación.',
              })}
              onOpenSuspend={() => setSuspendOpen(true)}
              onCheckout={() => {
                setMobileCartOpen(false)
                setCheckoutOpen(true)
              }}
              onClose={() => setMobileCartOpen(false)}
              showCloseButton
            />
          </div>
        </>
      )}

      {/* ============ MODALES ============ */}
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