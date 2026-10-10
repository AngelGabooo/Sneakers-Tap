// src/pages/ProductEdit.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronRight, Save, X, PackageX } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
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
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import Skeleton from '../components/common/Skeleton'
import EmptyState from '../components/common/EmptyState'
import Toast from '../components/common/Toast'
import { useView } from '../context/ViewContext'
import { useProducts } from '../context/ProductsContext'
import { useAuth } from '../context/AuthContext'
import { storageService } from '../services/storageService'
import { generateSku, generateBarcode } from '../utils/codeGenerator'
import { normalizeImages } from '../utils/storageHelpers'   // ⭐ NUEVO

function migrateToVariantsBySize(product) {
  if (!product) return {}
  if (product.variantsBySize && typeof product.variantsBySize === 'object') {
    return product.variantsBySize
  }
  const map = {}
  ;(product.variants || []).forEach((v) => {
    if (!v.size || !v.color) return
    if (!map[v.size]) map[v.size] = []
    if (!map[v.size].includes(v.color)) map[v.size].push(v.color)
  })
  if (Object.keys(map).length === 0 && product.sizes) {
    product.sizes.forEach((s) => { map[s] = [] })
  }
  return map
}

/**
 * Construye la lista de variantes a partir del mapa { size: [colors] }.
 *
 * Estrategia de preservación (edición):
 *   1) Buscar por id exacto `${size}-${color}` (caso normal).
 *   2) Si no existe, buscar por `color` en las variantes previas
 *      (asume que la talla cambió: ej. 8 → 28) y REUTILIZAR su barcode/sku.
 *   3) Solo si no se encuentra de ninguna forma, generar sku/barcode nuevos.
 *
 * Además, se conserva el `dbId` (UUID real en Supabase) para que el UPDATE
 * pegue sobre la fila existente y no borre/reinserte variantes.
 *
 * Esto garantiza que un cambio de talla NO rompa el QR ya impreso.
 */
function variantsFromSizeColorMap(variantsBySize, baseSku, previous = [], persistedVariants = []) {
  if (!baseSku) return []

  // Mapa por id exacto (size-color)
  const prevMap = new Map()
  persistedVariants.forEach((v) => {
    if (!v?.size || !v?.color) return
    prevMap.set(`${v.size}-${v.color}`, v)
  })
  previous.forEach((v) => {
    if (!v?.size || !v?.color) return
    prevMap.set(`${v.size}-${v.color}`, v)
  })

  // Mapa por color → variantes (para fallback cuando cambia la talla)
  const byColorMap = new Map()
  const registerByColor = (v) => {
    if (!v?.color) return
    const arr = byColorMap.get(v.color) || []
    arr.push(v)
    byColorMap.set(v.color, arr)
  }
  persistedVariants.forEach(registerByColor)
  previous.forEach(registerByColor)

  const list = []
  const usedDbIds = new Set()

  Object.entries(variantsBySize).forEach(([size, colors]) => {
    ;(colors || []).forEach((color) => {
      const id = `${size}-${color}`
      const prev = prevMap.get(id)

      // Fallback: si la talla cambió, reutilizamos por color
      // (solo si hay una única candidata con ese color y no se usó ya)
      let reused = prev
      if (!reused) {
        const candidates = (byColorMap.get(color) || []).filter(
          (c) => c?.barcode && !usedDbIds.has(c?.dbId || c?.id)
        )
        reused = candidates.length === 1 ? candidates[0] : null
      }

      const fallbackSku = buildVariantSku(baseSku, size, color)
      const fallbackBarcode = String(buildVariantBarcode(fallbackSku))

      const reusedId = reused?.dbId || reused?.id
      if (reusedId) usedDbIds.add(reusedId)

      list.push({
        id,                                 // id lógico local (para React keys)
        dbId: reused?.dbId || reused?.id || null,  // 🆕 UUID real en BD
        label: `${size} / ${color}`,
        size,
        color,
        // ✅ Conservamos SKU y barcode previos → el QR impreso sigue válido
        sku: reused?.sku || fallbackSku,
        barcode: reused?.barcode || fallbackBarcode,
        stock: reused?.stock ?? 0,
      })
    })
  })
  return list
}

export default function ProductEdit() {
  const { setActiveView, viewParams } = useView()
  const { user } = useAuth()
  const { getProductById, updateProduct } = useProducts()

  const productId = viewParams?.id
  const product = productId ? getProductById(productId) : null

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})
  const [variantsBySize, setVariantsBySize] = useState({})
  const [variants, setVariants] = useState([])
  const [images, setImages] = useState([])
  const [codeType, setCodeType] = useState('barcode')
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState(null)
  const [dirty, setDirty] = useState(false)

  const barcodeAutoRef = useRef(true)

  // -------------------------------------------------------------
  // Carga inicial del producto
  // -------------------------------------------------------------
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

    const migrated = migrateToVariantsBySize(product)
    setVariantsBySize(migrated)
    setVariants(product.variants || [])
    setImages(product.images || [])
    setCodeType(product.codeType || 'barcode')
    setLoading(false)
    setDirty(false)
    barcodeAutoRef.current = !product.barcode
    setInitialized(true)
  }, [productId, product])

  const options = { categories: [], brands: [], locations: [], suppliers: [] }

  const handleChange = (field, value) => {
    setForm((f) => {
      const next = { ...f, [field]: value }
      if (field === 'barcode') barcodeAutoRef.current = false
      return next
    })
    setDirty(true)
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  // Auto-generación de barcode
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

  // Reconstrucción de variantes cuando cambia el mapa de tallas/colores
  useEffect(() => {
    if (!initialized) return
    if (!form?.sku) return
    setVariants((prev) =>
      variantsFromSizeColorMap(
        variantsBySize,
        form.sku,
        prev,
        product?.variants || []
      )
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantsBySize, form?.sku, initialized])

  const handleChangeVariantsBySize = (next) => {
    setVariantsBySize(next)
    setDirty(true)
  }

  // 🆕 Editar talla in-place: mueve el color de talla vieja a nueva
  //    conservando SIEMPRE sku y barcode originales de la variante.
  const handleEditVariantSize = (variantId, rawValue) => {
    const trimmed = String(rawValue || '').trim()
    setVariants((list) => {
      const target = list.find((v) => v.id === variantId)
      if (!target) return list

      const oldSize = target.size
      // Si está vacío, no propagamos (deja que el usuario siga escribiendo)
      if (!trimmed) {
        return list.map((v) =>
          v.id === variantId ? { ...v, size: '', label: ` / ${v.color}` } : v
        )
      }
      if (trimmed === oldSize) return list

      // Actualizar el mapa variantsBySize moviendo el color
      setVariantsBySize((prevMap) => {
        const next = { ...prevMap }
        const colorsOld = next[oldSize] || []
        if (colorsOld.includes(target.color)) {
          next[oldSize] = colorsOld.filter((c) => c !== target.color)
          if (next[oldSize].length === 0) delete next[oldSize]
        }
        const colorsNew = next[trimmed] || []
        if (!colorsNew.includes(target.color)) {
          next[trimmed] = [...colorsNew, target.color]
        }
        return next
      })

      // ⚠️ NO tocamos sku ni barcode
      return list.map((v) =>
        v.id === variantId
          ? { ...v, size: trimmed, label: `${trimmed} / ${v.color}` }
          : v
      )
    })
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

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitting(true)
    setUploading(true)

    try {
      // ─────────────────────────────────────────────────────────────
      // 1. Normalizar imágenes originales (para tener su path garantizado)
      //    Esto NO toca la BD, solo es una copia de trabajo en memoria.
      //    Si la imagen ya tenía path, se respeta.
      //    Si no, se reconstruye desde la URL (compatibilidad con datos viejos).
      // ─────────────────────────────────────────────────────────────
      const originalNormalized = normalizeImages(product?.images || [])
      const originalPaths = originalNormalized
        .map((img) => img.path)
        .filter(Boolean)

      // ─────────────────────────────────────────────────────────────
      // 2. Subir imágenes nuevas (uploadMany respeta las que ya tienen url)
      //    ⚠️ AQUÍ AÚN NO BORRAMOS NADA del storage.
      // ─────────────────────────────────────────────────────────────
      let finalImages = []
      if (images.length > 0) {
        finalImages = await storageService.uploadMany(images, 'products')
      }

      // ─────────────────────────────────────────────────────────────
      // 3. Comparar rutas para saber cuáles imágenes fueron eliminadas
      //    por el usuario (estaban en la BD pero ya no están en la lista final)
      // ─────────────────────────────────────────────────────────────
      const finalPaths = finalImages.map((img) => img.path).filter(Boolean)
      const pathsToDelete = originalPaths.filter((p) => !finalPaths.includes(p))

      // ─────────────────────────────────────────────────────────────
      // 4. Preparar variantes (igual que antes)
      // ─────────────────────────────────────────────────────────────
      const safeVariants = variants.map((v) => {
        const variantSku = v.sku || buildVariantSku(form.sku, v.size, v.color)
        const variantBarcode = v.barcode || buildVariantBarcode(variantSku)
        return {
          ...v,
          // 🔑 Si tenemos dbId (UUID real), lo usamos como id para que el UPDATE pegue
          id: v.dbId || v.id,
          sku: String(variantSku || ''),
          barcode: String(variantBarcode || ''),
          stock: Number(v.stock) || 0,
        }
      })

      const sizesList = Object.keys(variantsBySize)
      const colorsList = Array.from(new Set(Object.values(variantsBySize).flat()))

      // ─────────────────────────────────────────────────────────────
      // 5. Payload final — ahora images YA incluye { url, path, isPrimary }
      // ─────────────────────────────────────────────────────────────
      const payload = {
        ...form,
        sizes: sizesList,
        colors: colorsList,
        variants: safeVariants,
        variantsBySize,
        codeType,
        images: finalImages,   // ⭐ cada item: { url, path, isPrimary }
        updatedBy: user?.name || 'Sistema',
      }

      // ─────────────────────────────────────────────────────────────
      // 6. Guardar en la BD PRIMERO. Si esto falla, NO borramos nada.
      // ─────────────────────────────────────────────────────────────
      await updateProduct(productId, payload)

      // ─────────────────────────────────────────────────────────────
      // 7. SOLO SI la BD se actualizó con éxito, limpiamos Storage.
      //    Si falla el borrado, NO rompemos el guardado (solo warning).
      // ─────────────────────────────────────────────────────────────
      if (pathsToDelete.length > 0) {
        try {
          await storageService.removeMany(pathsToDelete)
          console.log(`🗑️ ${pathsToDelete.length} imagen(es) eliminada(s) del storage`)
        } catch (err) {
          console.warn('⚠️ No se pudieron eliminar imágenes del storage:', err)
          // No lanzamos el error: el guardado ya fue exitoso.
        }
      }

      // ─────────────────────────────────────────────────────────────
      // 8. Actualizar el estado local con las imágenes definitivas
      //    (para que si el usuario sigue editando, no intente borrar
      //    imágenes que ya no existen en Storage).
      // ─────────────────────────────────────────────────────────────
      setImages(finalImages)

      setSubmitting(false)
      setUploading(false)
      setDirty(false)
      setToast({
        title: 'Producto actualizado correctamente',
        description: pathsToDelete.length > 0
          ? `Se guardaron los cambios y se eliminaron ${pathsToDelete.length} imagen(es) antiguas.`
          : `Los cambios de ${form.name} se guardaron.`,
      })
    } catch (err) {
      console.error('❌ Error actualizando producto:', err)
      setSubmitting(false)
      setUploading(false)
      setToast({
        title: 'Error al guardar',
        description: err.message || 'Intenta de nuevo.',
      })
    }
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

  return (
    <DashboardLayout
      activeKey="products"
      onNavigate={handleNavigate}
      period={undefined}
      onPeriodChange={undefined}
    >
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

      {loading && !notFound && <EditSkeleton />}

      {!loading && !notFound && form && (
        <>
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
              <Button variant="secondary" icon={X} onClick={handleCancel} disabled={submitting}>
                Cancelar
              </Button>
              <Button variant="primary" icon={Save} onClick={handleSubmit} loading={submitting}>
                Guardar cambios
              </Button>
            </div>
          </div>

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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <ProductGeneralSection values={form} errors={errors} onChange={handleChange} options={options} />

              <ProductIdentificationSection
                values={form}
                errors={errors}
                onChange={handleChange}
                onGenerateSku={handleGenerateSku}
                onRegenerateBarcode={handleRegenerateBarcode}
                onScan={handleScan}
                onCodeTypeChange={setCodeType}
              />

              <ProductImagesSection
                images={images}
                onChange={(v) => { setImages(v); setDirty(true) }}
                uploading={uploading}
              />

              <ProductPricingSection values={form} errors={errors} onChange={handleChange} />

              <ProductVariantsSection
                variantsBySize={variantsBySize}
                variants={variants}
                baseSku={form.sku}
                codeType={codeType}
                productName={form.name}
                productPrice={form.salePrice}
                onChangeVariantsBySize={handleChangeVariantsBySize}
                onChangeVariantsBulk={(updater) => {
                  setVariants((list) => {
                    const next = typeof updater === 'function' ? updater(list) : updater
                    return next
                  })
                  setDirty(true)
                }}
                onEditVariantSize={handleEditVariantSize}
              />

              <ProductInventorySection
                values={form}
                errors={errors}
                onChange={handleChange}
                options={options}
                summary={{
                  totalStock: variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0),
                  variantsCount: variants.length,
                  lowStockCount: variants.filter(
                    (v) => Number(v.stock) > 0 && Number(v.stock) <= (Number(form.minStock) || 0),
                  ).length,
                  outOfStockCount: variants.filter((v) => Number(v.stock) === 0).length,
                }}
              />

              <ProductSupplierSection
                values={form}
                onChange={handleChange}
                options={options}
                onCreateSupplier={() => console.log('Crear proveedor → Vista #24 (pendiente)')}
              />

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <Button variant="secondary" icon={X} onClick={handleCancel} disabled={submitting}>
                  Cancelar
                </Button>
                <Button variant="primary" icon={Save} onClick={handleSubmit} loading={submitting}>
                  Guardar cambios
                </Button>
              </div>
            </div>

            <aside className="lg:col-span-1 space-y-5 lg:sticky lg:top-20 lg:self-start">
              <ProductStatusPanel value={form.status} onChange={(v) => handleChange('status', v)} />
              <ProductSummaryPanel summary={summary} />
              <ProductPreviewPanel preview={preview} />

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
            variant={toast?.title?.includes('Error') ? 'error' : 'success'}
            title={toast?.title}
            description={toast?.description}
            onClose={() => setToast(null)}
          />
        </>
      )}
    </DashboardLayout>
  )
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