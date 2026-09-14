import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronRight, Save, X, PackageX } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import ProductGeneralSection from '../components/products/ProductGeneralSection'
import ProductIdentificationSection from '../components/products/ProductIdentificationSection'
import ProductImagesSection from '../components/products/ProductImagesSection'
import ProductPricingSection from '../components/products/ProductPricingSection'
import ProductVariantsSection from '../components/products/ProductVariantsSection'
import ProductInventorySection from '../components/products/ProductInventorySection'
import ProductSupplierSection from '../components/products/ProductSupplierSection'
import ProductStatusPanel from '../components/products/ProductStatusPanel'
import ProductSummaryPanel from '../components/products/ProductSummaryPanel'
import ProductPreviewPanel from '../components/products/ProductPreviewPanel'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import Skeleton from '../components/common/Skeleton'
import EmptyState from '../components/common/EmptyState'
import Toast from '../components/common/Toast'
import { useView } from '../context/ViewContext'
import { useProducts } from '../context/ProductsContext'
import { generateSku, generateBarcode } from '../utils/codeGenerator'

/**
 * Editar producto.
 * Carga el producto desde el store por id (viewParams.id),
 * precarga los campos y permite guardar los cambios.
 */
export default function ProductEdit() {
  const { setActiveView, viewParams } = useView()
  const { getProductById, updateProduct } = useProducts()

  const productId = viewParams?.id
  const product = productId ? getProductById(productId) : null

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [sizes, setSizes] = useState([])
  const [colors, setColors] = useState([])
  const [variants, setVariants] = useState([])
  const [images, setImages] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [dirty, setDirty] = useState(false)

  const barcodeAutoRef = useRef(true)

  // 🚧 TODO: cargar desde backend. Reemplazar por GET /api/products/:id
  useEffect(() => {
    if (!productId) { setNotFound(true); setLoading(false); return }
    if (!product) { setNotFound(true); setLoading(false); return }

    setForm({
      name: product.name || '',
      category: product.category || '',
      brand: product.brand || '',
      description: product.description || '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      costPrice: product.costPrice || '',
      salePrice: product.salePrice || '',
      wholesalePrice: product.wholesalePrice || '',
      initialStock: product.initialStock || '0',
      minStock: product.minStock || '3',
      location: product.location || '',
      supplier: product.supplier || '',
      status: product.status || 'active',
    })
    setSizes(product.sizes || [])
    setColors(product.colors || [])
    setVariants(product.variants || [])
    setImages(product.images || [])
    setLoading(false)
    setDirty(false)
    // Si el producto ya tenía un código, no forzamos regenerarlo al montar
    barcodeAutoRef.current = !product.barcode
  }, [productId, product])

  // 🚧 TODO: reemplazar por las opciones del backend
  const options = { categories: [], brands: [], locations: [], suppliers: [] }

  // -------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------

  const handleChange = (field, value) => {
    setForm((f) => {
      const next = { ...f, [field]: value }

      if (field === 'barcode') barcodeAutoRef.current = false

      return next
    })
    setDirty(true)
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  /**
   * 🔑 Regenerar código cuando cambia el nombre o el SKU base.
   * Solo si el usuario no ha editado el barcode manualmente.
   */
  useEffect(() => {
    if (!form) return
    if (!barcodeAutoRef.current) return
    if (!form.name || !form.sku) return

    const code = generateBarcode(form.sku)
    if (code !== form.barcode) {
      setForm((f) => ({ ...f, barcode: code }))
      setDirty(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form?.name, form?.sku])

  const handleChangeSizes = (next) => {
    setSizes(next)
    setVariants((list) => rebuildVariants(list, next, colors))
    setDirty(true)
  }

  const handleChangeColors = (next) => {
    setColors(next)
    setVariants((list) => rebuildVariants(list, sizes, next))
    setDirty(true)
  }

  const handleChangeVariant = (id, field, value) => {
    setVariants((list) =>
      list.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    )
    setDirty(true)
  }

  const handleRegenerateBarcode = () => {
    if (!form.sku) return
    barcodeAutoRef.current = true
    const code = generateBarcode(form.sku)
    setForm((f) => ({ ...f, barcode: code }))
    setDirty(true)
  }

  const handleGenerateSku = () => {
    const sku = generateSku({ brand: form.brand, name: form.name })
    setForm((f) => ({ ...f, sku }))
    barcodeAutoRef.current = true
    setDirty(true)
  }

  const handleScan = () => console.log('Escanear código')

  // -------------------------------------------------------------
  // Validación y guardado
  // -------------------------------------------------------------

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'El nombre del producto es obligatorio.'
    if (!form.category) e.category = 'Selecciona una categoría.'
    if (!form.brand) e.brand = 'Selecciona una marca.'
    if (!form.sku.trim()) e.sku = 'El SKU es obligatorio.'
    if (!form.salePrice || Number(form.salePrice) <= 0) {
      e.salePrice = 'Ingresa un precio válido.'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    setSubmitting(true)

    const payload = {
      ...form,
      sizes,
      colors,
      variants,
      images: images.map(({ id, isPrimary, url }) => ({ id, isPrimary, url })),
    }

    // 🚧 TODO: PUT /api/products/:id
    updateProduct(productId, payload)

    setTimeout(() => {
      setSubmitting(false)
      setDirty(false)
      setToast({
        title: 'Producto actualizado correctamente',
        description: `Los cambios de ${form.name} se guardaron.`,
      })
    }, 600)
  }

  const handleCancel = () => {
    if (dirty && !window.confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')) return
    setActiveView('products')
  }

  const handleBack = () => {
    if (dirty && !window.confirm('Tienes cambios sin guardar. ¿Salir sin guardar?')) return
    setActiveView('products')
  }

  const handleNavigate = (key) => setActiveView(key)

  // -------------------------------------------------------------
  // Derivados
  // -------------------------------------------------------------

  const summary = useMemo(() => ({
    name: form?.name || '',
    category: form?.category || '',
    brand: form?.brand || '',
    price: form?.salePrice ? `$${Number(form.salePrice).toLocaleString('es-MX')}` : '',
    variantsCount: variants.length,
    totalStock: variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0),
  }), [form, variants])

  const preview = useMemo(() => ({
    name: form?.name || '',
    brand: form?.brand || '',
    price: form?.salePrice ? `$${Number(form.salePrice).toLocaleString('es-MX')}` : '$0.00',
    status: form?.status || 'active',
    imageUrl: images[0]?.url || null,
  }), [form, images])

  // -------------------------------------------------------------
  // Render
  // -------------------------------------------------------------

  return (
    <DashboardLayout
      activeKey="products"
      onNavigate={handleNavigate}
      period={undefined}
      onPeriodChange={undefined}
    >
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm mb-5">
        <button
          onClick={handleBack}
          className="text-gray-500 dark:text-dark-muted hover:text-brand-blue transition-colors font-medium"
        >
          Productos
        </button>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-brand-black dark:text-dark-text font-medium">Editar producto</span>
      </nav>

      {/* Not found */}
      {!loading && notFound && (
        <Card>
          <EmptyState
            icon={PackageX}
            title="Producto no encontrado"
            description="El producto que intentas editar no existe o ya no está disponible."
            action={
              <Button variant="primary" onClick={() => setActiveView('products')}>
                Volver a productos
              </Button>
            }
          />
        </Card>
      )}

      {/* Loading */}
      {loading && !notFound && <EditSkeleton />}

      {/* Formulario */}
      {!loading && !notFound && form && (
        <>
          {/* Encabezado */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
                  Editar producto
                </h1>
                {dirty && <Badge variant="warning">Cambios sin guardar</Badge>}
              </div>
              <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
                Modifica la información y configuración del producto.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" icon={X} onClick={handleCancel}>
                Cancelar
              </Button>
              <Button variant="primary" icon={Save} onClick={handleSubmit} loading={submitting}>
                Guardar cambios
              </Button>
            </div>
          </div>

          {/* Identificación rápida del producto */}
          <Card className="mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-gray-100 dark:bg-dark-surface overflow-hidden shrink-0 flex items-center justify-center">
                {images[0]?.url
                  ? <img src={images[0].url} alt={form.name} className="w-full h-full object-cover" />
                  : <PackageX size={22} className="text-gray-400" strokeWidth={1.8} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-brand-black dark:text-dark-text truncate">
                  {form.name || 'Sin nombre'}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-muted truncate">
                  SKU: {form.sku || '—'} · {form.category || 'Sin categoría'} · {form.brand || 'Sin marca'}
                </p>
              </div>
              <Badge variant={form.status === 'active' ? 'success' : 'neutral'}>
                {form.status === 'active' ? 'Activo' : form.status === 'draft' ? 'Borrador' : 'Inactivo'}
              </Badge>
            </div>
          </Card>

          {/* Layout principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <ProductGeneralSection
                values={form}
                errors={errors}
                onChange={handleChange}
                options={options}
              />

              <ProductIdentificationSection
                values={form}
                errors={errors}
                onChange={handleChange}
                onGenerateSku={handleGenerateSku}
                onRegenerateBarcode={handleRegenerateBarcode}
                onScan={handleScan}
              />

              <ProductImagesSection images={images} onChange={(v) => { setImages(v); setDirty(true) }} />

              <ProductPricingSection values={form} errors={errors} onChange={handleChange} />

              <ProductVariantsSection
                sizes={sizes}
                colors={colors}
                variants={variants}
                onChangeSizes={handleChangeSizes}
                onChangeColors={handleChangeColors}
                onChangeVariant={handleChangeVariant}
              />

              <ProductInventorySection
                values={form}
                errors={errors}
                onChange={handleChange}
                options={options}
              />

              <ProductSupplierSection
                values={form}
                onChange={handleChange}
                options={options}
                onCreateSupplier={() => console.log('Crear proveedor → Vista #24 (pendiente)')}
              />

              {/* Acciones inferiores */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <Button variant="secondary" icon={X} onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button variant="primary" icon={Save} onClick={handleSubmit} loading={submitting}>
                  Guardar cambios
                </Button>
              </div>
            </div>

            {/* Panel lateral */}
            <aside className="lg:col-span-1 space-y-5 lg:sticky lg:top-20 lg:self-start">
              <ProductStatusPanel
                value={form.status}
                onChange={(v) => handleChange('status', v)}
              />
              <ProductSummaryPanel summary={summary} />
              <ProductPreviewPanel preview={preview} />

              {/* Última actualización */}
              <Card>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted mb-2">
                  Última actualización
                </p>
                <p className="text-sm text-brand-black dark:text-dark-text">
                  {product?.updatedAt ? new Date(product.updatedAt).toLocaleString('es-MX') : '—'}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
                  Actualizado por {product?.updatedBy || 'Henry'}
                </p>
              </Card>
            </aside>
          </div>

          <Toast
            open={!!toast}
            variant="success"
            title={toast?.title}
            description={toast?.description}
            onClose={() => setToast(null)}
          />
        </>
      )}
    </DashboardLayout>
  )
}

// -----------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------

/**
 * Reconstruye las variantes al cambiar tallas/colores,
 * conservando el stock existente de las combinaciones que ya estaban.
 */
function rebuildVariants(current, nextSizes, nextColors) {
  if (nextSizes.length === 0 || nextColors.length === 0) return []

  const map = new Map(current.map((v) => [v.id, v]))
  const generated = []

  nextSizes.forEach((size) => {
    nextColors.forEach((color) => {
      const id = `${size}-${color}`
      const prev = map.get(id)
      generated.push(
        prev || {
          id,
          label: `${size} / ${color}`,
          size,
          color,
          sku: '',
          barcode: '',
          stock: 0,
        },
      )
    })
  })
  return generated
}

function EditSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
          <Skeleton className="h-56 w-full rounded-xl" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  )
}