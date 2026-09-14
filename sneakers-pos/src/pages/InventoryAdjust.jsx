import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, ShieldOff } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import Toast from '../components/common/Toast'
import AdjustHeader from '../components/inventory/adjust/AdjustHeader'
import AdjustControlNotice from '../components/inventory/adjust/AdjustControlNotice'
import AdjustProductSection from '../components/inventory/adjust/AdjustProductSection'
import AdjustStockCard from '../components/inventory/adjust/AdjustStockCard'
import AdjustMovementTypeSection from '../components/inventory/adjust/AdjustMovementTypeSection'
import AdjustQuantitySection from '../components/inventory/adjust/AdjustQuantitySection'
import AdjustReasonSection from '../components/inventory/adjust/AdjustReasonSection'
import AdjustSummaryPanel from '../components/inventory/adjust/AdjustSummaryPanel'
import AdjustUserPanel from '../components/inventory/adjust/AdjustUserPanel'
import AdjustTraceabilityPanel from '../components/inventory/adjust/AdjustTraceabilityPanel'
import AdjustConfirmModal from '../components/inventory/adjust/AdjustConfirmModal'
import AdjustSuccessToast from '../components/inventory/adjust/AdjustSuccessToast'
import { useView } from '../context/ViewContext'
import { useAuth } from '../context/AuthContext'
import { useProducts } from '../context/ProductsContext'
import { useMovements } from '../context/MovementsContext'

const LOCATIONS = [
  { value: 'store',    label: 'Tienda principal' },
  { value: 'warehouse',label: 'Almacén' },
  { value: 'stock',    label: 'Bodega' },
]

const REASON_LABELS = {
  physical:   'Conteo físico',
  reception:  'Recepción de mercancía',
  return:     'Devolución de cliente',
  damage:     'Daño',
  shrinkage:  'Merma',
  loss:       'Pérdida',
  correction: 'Corrección',
  error:      'Error de captura',
  initial:    'Inventario inicial',
  transfer:   'Transferencia',
  other:      'Otro',
}

const INITIAL_FORM = {
  productId: null,
  variantId: null,
  location: '',
  type: 'in',
  quantity: '',
  adjustMode: 'new',
  reason: '',
  documentRef: '',
  notes: '',
}

export default function InventoryAdjust() {
  const { navigate, viewParams } = useView()
  const { user } = useAuth()
  const { products, updateProduct } = useProducts()
  const { registerMovement } = useMovements()

  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [successMovement, setSuccessMovement] = useState(null)
  const [toast, setToast] = useState(null)
  const [dirty, setDirty] = useState(false)

  // Preselección desde viewParams (ej. llegas desde Inventario o Detalle con { id, variantId })
  useEffect(() => {
    if (viewParams?.id && !form.productId) {
      setForm((f) => ({
        ...f,
        productId: viewParams.id,
        variantId: viewParams.variantId || null,
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewParams])

  const selectedProduct = products.find((p) => p.id === form.productId) || null
  const selectedVariant = selectedProduct?.variants?.find((v) => v.id === form.variantId) || null

  const minStock = Number(selectedProduct?.minStock) || 3

  // Cálculo de delta y stock resultante
  const delta = useMemo(() => {
    if (!selectedVariant) return 0
    const s = Number(selectedVariant.stock) || 0
    const q = Number(form.quantity) || 0
    if (form.type === 'in') return q
    if (form.type === 'out') return -q
    if (form.type === 'adjust') return form.adjustMode === 'new' ? q - s : q
    return 0
  }, [selectedVariant, form.type, form.quantity, form.adjustMode])

  const stockAfter = Math.max(0, (Number(selectedVariant?.stock) || 0) + delta)

  // Validación
  const validate = () => {
    const e = {}
    if (!form.productId) e.productId = 'Selecciona un producto.'
    if (!form.variantId) e.variantId = 'Selecciona una variante.'
    if (!form.location) e.location = 'Selecciona una ubicación.'
    if (!form.type) e.type = 'Selecciona un tipo de movimiento.'
    const q = Number(form.quantity)
    if (!form.quantity || isNaN(q) || q <= 0) {
      e.quantity = 'Ingresa una cantidad válida mayor a cero.'
    }
    if (form.type === 'out' && q > (Number(selectedVariant?.stock) || 0)) {
      e.quantity = 'No puedes retirar más unidades que el stock disponible.'
    }
    if (!form.reason) e.reason = 'Selecciona un motivo.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const isFormValid = () => {
    const q = Number(form.quantity)
    return (
      form.productId &&
      form.variantId &&
      form.location &&
      form.type &&
      q > 0 &&
      form.reason &&
      !(form.type === 'out' && q > (Number(selectedVariant?.stock) || 0))
    )
  }

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
    setDirty(true)
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const handleSelectProduct = (id) => {
    setForm((f) => ({ ...f, productId: id, variantId: null }))
    setDirty(true)
    if (errors.productId) setErrors((e) => ({ ...e, productId: undefined }))
  }

  const handleSelectVariant = (id) => {
    setForm((f) => ({ ...f, variantId: id }))
    setDirty(true)
    if (errors.variantId) setErrors((e) => ({ ...e, variantId: undefined }))
  }

  const handleCancel = () => {
    if (dirty && !window.confirm('¿Salir sin guardar? Los datos del ajuste se perderán.')) return
    navigate('inventory')
  }

  const handleSubmit = () => {
    if (!validate()) return
    setConfirmOpen(true)
  }

  const handleConfirm = () => {
    if (!selectedProduct || !selectedVariant) return
    setSubmitting(true)

    setTimeout(() => {
      // 1) Actualiza stock
      const nextVariants = (selectedProduct.variants || []).map((v) =>
        v.id === selectedVariant.id ? { ...v, stock: stockAfter } : v,
      )
      updateProduct(selectedProduct.id, { variants: nextVariants })

      // 2) Registra movimiento inmutable
      const movement = registerMovement({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        variantId: selectedVariant.id,
        variantLabel: selectedVariant.label,
        sku: selectedVariant.sku || selectedProduct.sku,
        size: selectedVariant.size,
        color: selectedVariant.color,
        stockBefore: Number(selectedVariant.stock) || 0,
        stockAfter,
        quantity: delta,
        type: form.type,
        reason: form.reason,
        note: form.notes,
        location: LOCATIONS.find((l) => l.value === form.location)?.label || form.location,
        documentId: form.documentRef || '',
        documentType: form.documentRef ? 'manual' : '',
      })

      setSubmitting(false)
      setConfirmOpen(false)
      setSuccessMovement(movement)
      setDirty(false)
      setForm(INITIAL_FORM)
    }, 600)
  }

  const handleViewMovement = () => {
    setSuccessMovement(null)
    navigate('inventory-movements')
  }

  const handleViewInventory = () => {
    setSuccessMovement(null)
    navigate('inventory')
  }

  const handleViewMovementsAll = () => {
    navigate('inventory-movements')
  }

  const handleNavigate = (key) => navigate(key)

  // Resumen para el modal de confirmación
  const confirmData = selectedProduct && selectedVariant
    ? {
        productName: selectedProduct.name,
        variantLabel: selectedVariant.label,
        stockBefore: Number(selectedVariant.stock) || 0,
        delta,
        stockAfter,
        reasonLabel: REASON_LABELS[form.reason] || '—',
      }
    : null

  return (
    <DashboardLayout
      activeKey="inventory"
      onNavigate={handleNavigate}
      period={undefined}
      onPeriodChange={undefined}
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm mb-5">
        <button
          onClick={() => navigate('inventory')}
          className="text-gray-500 dark:text-dark-muted hover:text-brand-blue transition-colors font-medium"
        >
          Inventario
        </button>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-brand-black dark:text-dark-text font-medium">Ajuste de inventario</span>
      </nav>

      <AdjustHeader
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        submitting={submitting}
        disabled={!isFormValid()}
      />

      <AdjustControlNotice />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Formulario principal */}
        <div className="lg:col-span-2 space-y-5">
          <AdjustProductSection
            products={products}
            selectedProductId={form.productId}
            selectedVariantId={form.variantId}
            location={form.location}
            locations={LOCATIONS}
            errors={errors}
            onSelectProduct={handleSelectProduct}
            onSelectVariant={handleSelectVariant}
            onChangeLocation={(v) => handleChange('location', v)}
          />

          {selectedVariant && (
            <AdjustStockCard
              variant={selectedVariant}
              minStock={minStock}
            />
          )}

          <AdjustMovementTypeSection
            value={form.type}
            onChange={(v) => handleChange('type', v)}
            error={errors.type}
          />

          <AdjustQuantitySection
            type={form.type}
            stock={Number(selectedVariant?.stock) || 0}
            quantity={form.quantity}
            adjustMode={form.adjustMode}
            onChangeQuantity={(v) => handleChange('quantity', v)}
            onChangeAdjustMode={(v) => handleChange('adjustMode', v)}
            error={errors.quantity}
          />

          <AdjustReasonSection
            reason={form.reason}
            onReasonChange={(v) => handleChange('reason', v)}
            documentRef={form.documentRef}
            onDocumentRefChange={(v) => handleChange('documentRef', v)}
            notes={form.notes}
            onNotesChange={(v) => handleChange('notes', v)}
            errors={errors}
          />

          {/* Acciones inferiores */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={submitting}
              disabled={!isFormValid() || submitting}
            >
              {submitting ? 'Registrando...' : 'Registrar ajuste'}
            </Button>
          </div>
        </div>

        {/* Panel lateral */}
        <aside className="lg:col-span-1 space-y-5 lg:sticky lg:top-20 lg:self-start">
          <AdjustSummaryPanel
            product={selectedProduct}
            variant={selectedVariant}
            location={LOCATIONS.find((l) => l.value === form.location)?.label}
            type={form.type}
            quantity={form.quantity}
            adjustMode={form.adjustMode}
            minStock={minStock}
          />

          <AdjustUserPanel user={user} timestamp={new Date().toISOString()} />

          <AdjustTraceabilityPanel onViewMovements={handleViewMovementsAll} />
        </aside>
      </div>

      {/* Modal de confirmación */}
      <AdjustConfirmModal
        open={confirmOpen}
        data={confirmData}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        submitting={submitting}
      />

      {/* Toast de éxito */}
      <AdjustSuccessToast
        open={!!successMovement}
        movement={successMovement}
        onClose={() => setSuccessMovement(null)}
        onViewMovement={handleViewMovement}
        onViewInventory={handleViewInventory}
      />

      <Toast
        open={!!toast}
        variant="success"
        title={toast?.title}
        description={toast?.description}
        onClose={() => setToast(null)}
      />
    </DashboardLayout>
  )
}