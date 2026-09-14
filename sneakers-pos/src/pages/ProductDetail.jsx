import { useEffect, useMemo, useState } from 'react'
import { PackageX } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import EmptyState from '../components/common/EmptyState'
import Toast from '../components/common/Toast'
import ProductDetailHeader from '../components/products/detail/ProductDetailHeader'
import ProductDetailStats from '../components/products/detail/ProductDetailStats'
import ProductDetailTabs from '../components/products/detail/ProductDetailTabs'
import ProductDetailSummaryTab from '../components/products/detail/ProductDetailSummaryTab'
import ProductDetailVariantsTab from '../components/products/detail/ProductDetailVariantsTab'
import ProductDetailInventoryTab from '../components/products/detail/ProductDetailInventoryTab'
import ProductDetailSalesTab from '../components/products/detail/ProductDetailSalesTab'
import ProductDetailActivityTab from '../components/products/detail/ProductDetailActivityTab'
import ProductDetailQuickActions from '../components/products/detail/ProductDetailQuickActions'
import ProductDetailAlert from '../components/products/detail/ProductDetailAlert'
import ProductDetailSkeleton from '../components/products/detail/ProductDetailSkeleton'
import VariantsStockActionsModal from '../components/products/detail/VariantsStockActionsModal'
import VariantsLabelPrintModal from '../components/products/VariantsLabelPrintModal'
import { useView } from '../context/ViewContext'
import { useProducts } from '../context/ProductsContext'

export default function ProductDetail() {
  const { setActiveView, viewParams, navigate } = useView()
  const { getProductById, updateProduct } = useProducts()

  const productId = viewParams?.id
  const product = productId ? getProductById(productId) : null

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [activeTab, setActiveTab] = useState('summary')
  const [toast, setToast] = useState(null)
  const [stockModalOpen, setStockModalOpen] = useState(false)
  const [printModalOpen, setPrintModalOpen] = useState(false)

  useEffect(() => {
    if (!productId || !product) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setLoading(false)
  }, [productId, product])

  const variants = product?.variants || []
  const minStock = Number(product?.minStock) || 3
  const totalStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
  const activeVariants = variants.filter((v) => v.stock > 0).length
  const lowVariants = variants.filter((v) => v.stock > 0 && v.stock <= minStock)
  const outVariants = variants.filter((v) => v.stock === 0)

  const stats = useMemo(() => ({
    price: product?.salePrice,
    totalStock,
    activeVariants,
    monthSales: null,
  }), [product, totalStock, activeVariants])

  const alert = useMemo(() => {
    if (outVariants.length > 0) {
      const v = outVariants[0]
      return {
        type: 'danger',
        message: `La variante ${v.label} no tiene unidades disponibles.`,
        actionLabel: 'Ver inventario',
        onAction: () => setActiveTab('inventory'),
      }
    }
    if (lowVariants.length > 0) {
      const v = lowVariants[0]
      return {
        type: 'warning',
        message: `La variante ${v.label} tiene únicamente ${v.stock} unidades disponibles.`,
        actionLabel: 'Ver inventario',
        onAction: () => setActiveTab('inventory'),
      }
    }
    return null
  }, [lowVariants, outVariants])

  // Acciones
  const handleBack = () => setActiveView('products')
  const handleNavigate = (key) => setActiveView(key)

  const handleEdit = () => navigate('product-edit', { id: productId })
  const handleViewInventory = () => setActiveTab('inventory')
  const handleViewHistory = () => setActiveTab('activity')

  const handleDuplicate = () => console.log('Duplicar producto', productId)

  const handleToggleActive = () => {
    if (!product) return
    const next = product.status === 'active' ? 'inactive' : 'active'
    updateProduct(product.id, { status: next })
    setToast({
      title: next === 'active' ? 'Producto activado' : 'Producto desactivado',
      description: `${product.name} ahora está ${next === 'active' ? 'disponible para venta' : 'oculto para nuevas ventas'}.`,
    })
  }

  const handleDelete = () => {
    if (window.confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) {
      console.log('Eliminar producto', productId)
    }
  }

  const handleEditVariant = (variantId) => {
    navigate('product-edit', { id: productId, variantId })
  }

  /**
   * Ver movimientos: navega a la vista de movimientos
   * con el producto y (si aplica) la variante filtrados.
   */
  const handleViewMovements = (variantId) => {
    navigate('inventory-movements', {
      productId,
      variantId: variantId && variantId !== 'all' ? variantId : undefined,
    })
  }

  /**
   * Ajustar inventario: navega a la vista dedicada de ajuste.
   * Preselecciona producto y variante si se pasa variantId.
   */
  const handleAdjustInventory = (variantId) => {
    navigate('inventory-adjust', {
      id: productId,
      variantId: variantId || undefined,
    })
  }

  const handleAddStock = () => setStockModalOpen(true)

  const handleConfirmStock = (updates) => {
    if (!product) return
    const nextVariants = variants.map((v) => {
      const change = updates.find((u) => u.id === v.id)
      if (!change) return v
      const newStock = change.mode === 'add'
        ? Number(v.stock) + change.quantity
        : change.quantity
      return { ...v, stock: Math.max(0, newStock) }
    })
    updateProduct(product.id, { variants: nextVariants })
    setToast({
      title: 'Stock actualizado',
      description: `Se ajustó el stock de ${updates.length} ${updates.length === 1 ? 'variante' : 'variantes'}.`,
    })
  }

  const handlePrintLabels = () => setPrintModalOpen(true)

  const handleQuickAction = (key) => {
    const routes = {
      edit:      handleEdit,
      adjust:    () => navigate('inventory-adjust', { id: productId }),
      purchase:  () => navigate('purchase-new', { productId }),
      movements: () => navigate('inventory-movements', { productId }),
      sales:     () => setActiveTab('sales'),
      history:   () => setActiveTab('activity'),
    }
    routes[key]?.()
  }

  return (
    <DashboardLayout
      activeKey="products"
      onNavigate={handleNavigate}
      period={undefined}
      onPeriodChange={undefined}
    >
      {loading && <ProductDetailSkeleton />}

      {!loading && notFound && (
        <Card>
          <EmptyState
            icon={PackageX}
            title="Producto no encontrado"
            description="El producto que buscas no existe o ya no está disponible."
            action={
              <Button variant="primary" onClick={handleBack}>
                Volver a productos
              </Button>
            }
          />
        </Card>
      )}

      {!loading && !notFound && product && (
        <>
          <ProductDetailHeader
            product={product}
            onBack={handleBack}
            onEdit={handleEdit}
            onViewInventory={handleViewInventory}
            onDuplicate={handleDuplicate}
            onToggleActive={handleToggleActive}
            onViewHistory={handleViewHistory}
            onDelete={handleDelete}
          />

          <ProductDetailStats stats={stats} />

          {alert && <ProductDetailAlert {...alert} />}

          <ProductDetailTabs active={activeTab} onChange={setActiveTab} />

          {activeTab === 'summary' && (
            <ProductDetailSummaryTab
              product={product}
              variants={variants}
              onEdit={handleEdit}
              onViewVariantTab={() => setActiveTab('variants')}
            />
          )}

          {activeTab === 'variants' && (
            <ProductDetailVariantsTab
              product={product}
              variants={variants}
              onEditVariant={handleEditVariant}
              onViewInventory={handleViewInventory}
              onViewMovements={handleViewMovements}
              onAdjustStock={handleAdjustInventory}
              onAddStock={handleAddStock}
              onPrintLabels={handlePrintLabels}
            />
          )}

          {activeTab === 'inventory' && (
            <ProductDetailInventoryTab
              product={product}
              variants={variants}
              onViewMovements={() => handleViewMovements('all')}
              onAdjustInventory={handleAdjustInventory}
            />
          )}

          {activeTab === 'sales' && <ProductDetailSalesTab />}

          {activeTab === 'activity' && (
            <ProductDetailActivityTab
              productId={productId}
              onViewAllMovements={() => handleViewMovements('all')}
            />
          )}

          <div className="mt-5">
            <ProductDetailQuickActions onAction={handleQuickAction} />
          </div>
        </>
      )}

      <Toast
        open={!!toast}
        variant="success"
        title={toast?.title}
        description={toast?.description}
        onClose={() => setToast(null)}
      />

      <VariantsStockActionsModal
        open={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        variants={variants}
        onConfirm={handleConfirmStock}
      />

      <VariantsLabelPrintModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        product={{
          name: product?.name,
          salePrice: product?.salePrice,
        }}
        variants={variants}
        codeType={product?.codeType || 'barcode'}
      />
    </DashboardLayout>
  )
}