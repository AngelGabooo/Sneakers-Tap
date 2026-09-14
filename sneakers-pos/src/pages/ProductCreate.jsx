import { useEffect, useMemo, useRef, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import ProductFormHeader from '../components/products/ProductFormHeader'
import ProductGeneralSection from '../components/products/ProductGeneralSection'
import ProductIdentificationSection from '../components/products/ProductIdentificationSection'
import ProductImagesSection from '../components/products/ProductImagesSection'
import ProductPricingSection from '../components/products/ProductPricingSection'
import ProductVariantsSection, {
  buildVariantSku,
  buildVariantBarcode,
} from '../components/products/ProductVariantsSection'
import ProductInventorySection from '../components/products/ProductInventorySection'
import ProductSupplierSection from '../components/products/ProductSupplierSection'
import ProductStatusPanel from '../components/products/ProductStatusPanel'
import ProductSummaryPanel from '../components/products/ProductSummaryPanel'
import ProductPreviewPanel from '../components/products/ProductPreviewPanel'
import Toast from '../components/common/Toast'
import { useView } from '../context/ViewContext'
import { useProducts } from '../context/ProductsContext'
import { generateSku, generateBarcode } from '../utils/codeGenerator'

const INITIAL_FORM = {
  name: '',
  category: '',
  brand: '',
  description: '',
  sku: '',
  barcode: '',
  costPrice: '',
  salePrice: '',
  wholesalePrice: '',
  initialStock: '0',
  minStock: '3',
  location: '',
  supplier: '',
  status: 'active',
}

/**
 * Construye la lista completa de variantes
 * a partir de tallas × colores × SKU base.
 * Conserva el stock previo si la variante ya existía.
 */
function buildVariants(nextSizes, nextColors, baseSku, previous = []) {
  if (!baseSku || nextSizes.length === 0 || nextColors.length === 0) return []
  const prevMap = new Map(previous.map((v) => [v.id, v]))
  const list = []

  nextSizes.forEach((size) => {
    nextColors.forEach((color) => {
      const id = `${size}-${color}`
      const sku = buildVariantSku(baseSku, size, color)
      const barcode = buildVariantBarcode(sku)
      const prev = prevMap.get(id)
      list.push({
        id,
        label: `${size} / ${color}`,
        size,
        color,
        sku,
        barcode,
        stock: prev?.stock ?? 0,
      })
    })
  })
  return list
}

export default function ProductCreate() {
  const { setActiveView } = useView()
  const { createProduct } = useProducts()

  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [sizes, setSizes] = useState([])
  const [colors, setColors] = useState([])
  const [variants, setVariants] = useState([])
  const [images, setImages] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  // Tipo de código (barcode | qr) que viene de Identificación
  const [codeType, setCodeType] = useState('barcode')

  const barcodeAutoRef = useRef(true)

  // 🚧 TODO: cargar desde backend
  const options = {
    categories: [],
    brands: [],
    locations: [],
    suppliers: [],
  }

  // -------------------------------------------------------------
  // Cambios en el formulario
  // -------------------------------------------------------------
  const handleChange = (field, value) => {
    setForm((f) => {
      const next = { ...f, [field]: value }
      if (field === 'barcode') barcodeAutoRef.current = false
      if (!next.sku && next.brand && next.name) {
        next.sku = generateSku({ brand: next.brand, name: next.name })
      }
      return next
    })
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  // 🔑 Auto-generación del código base (identificador del producto raíz)
  useEffect(() => {
    if (!barcodeAutoRef.current) return
    if (!form.name || !form.sku) return
    const code = generateBarcode(form.sku)
    if (code !== form.barcode) {
      setForm((f) => ({ ...f, barcode: code }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name, form.sku])

  // 🔄 Regenerar variantes cuando cambian tallas, colores o SKU base
  useEffect(() => {
    setVariants((prev) => buildVariants(sizes, colors, form.sku, prev))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sizes, colors, form.sku])

  const handleChangeSizes = (next) => setSizes(next)
  const handleChangeColors = (next) => setColors(next)

  // -------------------------------------------------------------
  // SKU y código base
  // -------------------------------------------------------------
  const handleGenerateSku = () => {
    const sku = generateSku({ brand: form.brand, name: form.name })
    setForm((f) => ({ ...f, sku }))
    barcodeAutoRef.current = true
  }

  const handleRegenerateBarcode = () => {
    if (!form.sku) return
    barcodeAutoRef.current = true
    const code = generateBarcode(form.sku)
    setForm((f) => ({ ...f, barcode: code }))
  }

  const handleScan = () => console.log('Escanear código de barras')

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
      codeType,
      images: images.map(({ id, isPrimary, url }) => ({ id, isPrimary, url })),
    }

    // 🚧 TODO: POST /api/products
    const created = createProduct(payload)
    console.log('Producto creado →', created)

    setTimeout(() => {
      setSubmitting(false)
      setToast({
        title: 'Producto creado correctamente',
        description: `${form.name} fue agregado al catálogo.`,
      })
      setTimeout(() => setActiveView('products'), 800)
    }, 600)
  }

  const handleCancel = () => {
    const hasChanges = JSON.stringify(form) !== JSON.stringify(INITIAL_FORM)
    if (hasChanges && !window.confirm('¿Salir sin guardar? Los cambios se perderán.')) return
    setActiveView('products')
  }

  const handleBack = () => setActiveView('products')
  const handleNavigate = (key) => setActiveView(key)

  // -------------------------------------------------------------
  // Derivados
  // -------------------------------------------------------------
  const summary = useMemo(() => ({
    name: form.name,
    category: form.category,
    brand: form.brand,
    price: form.salePrice ? `$${Number(form.salePrice).toLocaleString('es-MX')}` : '',
    variantsCount: variants.length,
    totalStock: variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0),
  }), [form, variants])

  // 👇 Resumen de inventario para la sección Inventario
  const inventorySummary = useMemo(() => {
    const totalStock = variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
    const minStock = Number(form.minStock) || 0
    const lowStockCount = variants.filter(
      (v) => Number(v.stock) > 0 && Number(v.stock) <= minStock,
    ).length
    const outOfStockCount = variants.filter((v) => Number(v.stock) === 0).length
    return {
      totalStock,
      variantsCount: variants.length,
      lowStockCount,
      outOfStockCount,
    }
  }, [variants, form.minStock])

  const preview = useMemo(() => ({
    name: form.name,
    brand: form.brand,
    price: form.salePrice ? `$${Number(form.salePrice).toLocaleString('es-MX')}` : '$0.00',
    status: form.status,
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
      <ProductFormHeader
        onBack={handleBack}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        submitting={submitting}
      />

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
            onCodeTypeChange={setCodeType}
          />

          <ProductImagesSection images={images} onChange={setImages} />

          <ProductPricingSection values={form} errors={errors} onChange={handleChange} />

          <ProductVariantsSection
            sizes={sizes}
            colors={colors}
            variants={variants}
            baseSku={form.sku}
            codeType={codeType}
            productName={form.name}
            productPrice={form.salePrice}
            onChangeSizes={handleChangeSizes}
            onChangeColors={handleChangeColors}
            onChangeVariantsBulk={setVariants}
          />

          <ProductInventorySection
            values={form}
            errors={errors}
            onChange={handleChange}
            options={options}
            summary={inventorySummary}
          />

          <ProductSupplierSection
            values={form}
            onChange={handleChange}
            options={options}
            onCreateSupplier={() => console.log('Crear proveedor → Vista #24 (pendiente)')}
          />

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="h-11 px-5 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card text-brand-black dark:text-dark-text text-sm font-semibold hover:border-brand-blue hover:text-brand-blue transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="h-11 px-5 rounded-lg bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blueHover disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Guardando...' : 'Guardar producto'}
            </button>
          </div>
        </div>

        <aside className="lg:col-span-1 space-y-5 lg:sticky lg:top-20 lg:self-start">
          <ProductStatusPanel
            value={form.status}
            onChange={(v) => handleChange('status', v)}
          />
          <ProductSummaryPanel summary={summary} />
          <ProductPreviewPanel preview={preview} />
        </aside>
      </div>

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