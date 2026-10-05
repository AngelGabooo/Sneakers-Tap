// src/components/promotions/PromotionEditorModal.jsx
import { useEffect, useMemo, useState } from 'react'
import {
  X, Tag, Search, Check, Package,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import Button from '../common/Button'

const EMPTY = {
  name: '',
  description: '',
  bundleQty: 2,
  bundlePrice: '',
  appliesTo: 'products',
  categoryFilter: '',
  brandFilter: '',
  startsAt: '',
  endsAt: '',
  active: true,
  productIds: [],
}

const PER_PAGE = 20

function extractImageUrl(images) {
  if (!images) return null
  if (typeof images === 'string') return images
  if (!Array.isArray(images) || images.length === 0) return null

  const primary = images.find((img) => img?.isPrimary)
  const first = primary || images[0]

  if (typeof first === 'string') return first
  if (first && typeof first === 'object') {
    return first.url || first.publicUrl || null
  }
  return null
}

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX')}`

export default function PromotionEditorModal({
  open, promotion, products = [], onClose, onSubmit, submitting,
}) {
  const [form, setForm] = useState(EMPTY)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (open) {
      if (promotion) {
        setForm({
          name: promotion.name || '',
          description: promotion.description || '',
          bundleQty: Number(promotion.bundle_qty) || Number(promotion.buy_qty) || 2,
          bundlePrice: promotion.bundle_price ? String(promotion.bundle_price) : '',
          appliesTo: promotion.applies_to || 'products',
          categoryFilter: promotion.category_filter || '',
          brandFilter: promotion.brand_filter || '',
          startsAt: promotion.starts_at ? promotion.starts_at.slice(0, 10) : '',
          endsAt: promotion.ends_at ? promotion.ends_at.slice(0, 10) : '',
          active: promotion.active !== false,
          productIds: promotion.productIds || [],
        })
      } else {
        setForm(EMPTY)
      }
      setSearch('')
      setPage(1)
    }
  }, [open, promotion])

  useEffect(() => {
    setPage(1)
  }, [search])

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q),
    )
  }, [products, search])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PER_PAGE))
  const pagedProducts = useMemo(() => {
    const start = (page - 1) * PER_PAGE
    return filteredProducts.slice(start, start + PER_PAGE)
  }, [filteredProducts, page])

  const startItem = filteredProducts.length === 0 ? 0 : (page - 1) * PER_PAGE + 1
  const endItem = Math.min(page * PER_PAGE, filteredProducts.length)

  const pageNumbers = useMemo(() => {
    const max = 5
    let from = Math.max(1, page - Math.floor(max / 2))
    let to = Math.min(totalPages, from + max - 1)
    if (to - from + 1 < max) from = Math.max(1, to - max + 1)
    const arr = []
    for (let i = from; i <= to; i++) arr.push(i)
    return arr
  }, [page, totalPages])

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [page, totalPages])

  const toggleProduct = (pid) => {
    setForm((f) => ({
      ...f,
      productIds: f.productIds.includes(pid)
        ? f.productIds.filter((x) => x !== pid)
        : [...f.productIds, pid],
    }))
  }

  // Ejemplo: precio normal estimado del grupo (usa el promedio de los productos seleccionados)
  const exampleCalculation = useMemo(() => {
    const qty = Number(form.bundleQty) || 0
    const price = Number(form.bundlePrice) || 0
    if (qty <= 1 || price <= 0) return null

    // Estimar precio normal promedio de los productos seleccionados
    const selectedProducts = products.filter((p) => form.productIds.includes(p.id))
    if (selectedProducts.length === 0) return { qty, price, normal: null, savings: null }

    const avgPrice = selectedProducts.reduce((acc, p) => acc + (Number(p.salePrice) || 0), 0) / selectedProducts.length
    const normal = avgPrice * qty
    const savings = Math.max(0, normal - price)
    return { qty, price, normal, savings, avgPrice }
  }, [form.bundleQty, form.bundlePrice, form.productIds, products])

  const canSubmit = useMemo(() => {
    if (!form.name.trim()) return false
    if (!(Number(form.bundleQty) > 1)) return false
    if (!(Number(form.bundlePrice) > 0)) return false
    if (form.appliesTo === 'products' && form.productIds.length === 0) return false
    if (form.appliesTo === 'category' && !form.categoryFilter.trim()) return false
    if (form.appliesTo === 'brand' && !form.brandFilter.trim()) return false
    return true
  }, [form])

  if (!open) return null

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit?.({
      name: form.name,
      description: form.description,
      // Guardamos también buy_qty/pay_qty para compatibilidad con el modelo viejo
      buyQty: Number(form.bundleQty) || 2,
      payQty: 1,
      bundleQty: Number(form.bundleQty) || 2,
      bundlePrice: Number(form.bundlePrice) || 0,
      appliesTo: form.appliesTo,
      categoryFilter: form.categoryFilter,
      brandFilter: form.brandFilter,
      startsAt: form.startsAt ? `${form.startsAt}T00:00:00.000Z` : null,
      endsAt: form.endsAt ? `${form.endsAt}T23:59:59.999Z` : null,
      active: form.active,
      productIds: form.productIds,
    })
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border shrink-0">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-brand-blue" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
              {promotion ? 'Editar promoción' : 'Nueva promoción'}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-brand-black dark:hover:text-dark-text transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted mb-1.5">
              Nombre
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ej. 2x1 Verano Nike"
              className="w-full h-11 px-3 rounded-lg text-sm bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue outline-none"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted mb-1.5">
              Descripción (opcional)
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Ej. Solo aplica en tenis seleccionados"
              className="w-full h-11 px-3 rounded-lg text-sm bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue outline-none"
            />
          </div>

          {/* 🎁 REGLA: Lleva N / Paga $X */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted mb-1.5">
              Regla de la promoción
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-gray-500 dark:text-dark-muted mb-1">
                  ¿Cuántos pares lleva?
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={2}
                    max={20}
                    value={form.bundleQty}
                    onChange={(e) => setForm((f) => ({ ...f, bundleQty: e.target.value }))}
                    placeholder="2"
                    className="w-full h-11 px-3 rounded-lg text-sm bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
                    pares
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-gray-500 dark:text-dark-muted mb-1">
                  ¿Cuánto paga por ese grupo?
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 pointer-events-none">
                    $
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={form.bundlePrice}
                    onChange={(e) => setForm((f) => ({ ...f, bundlePrice: e.target.value }))}
                    placeholder="1,200"
                    className="w-full h-11 pl-7 pr-3 rounded-lg text-sm bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Preview del cálculo */}
            {exampleCalculation && (
              <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                <p className="text-xs font-semibold text-brand-blue dark:text-blue-300 mb-1">
                  💡 Vista previa
                </p>
                <p className="text-[11px] text-gray-700 dark:text-dark-muted">
                  <strong>{exampleCalculation.qty} pares</strong> por{' '}
                  <strong>{fmt(exampleCalculation.price)}</strong>
                  {exampleCalculation.normal && (
                    <>
                      {' '}· Precio normal estimado: {fmt(exampleCalculation.normal)}
                      {' '}· <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        Ahorro: {fmt(exampleCalculation.savings)}
                      </span>
                    </>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Aplica a */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted mb-1.5">
              Aplica a
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'products', label: 'Productos específicos' },
                { key: 'category', label: 'Categoría' },
                { key: 'brand', label: 'Marca' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, appliesTo: opt.key }))}
                  className={`h-9 px-3 rounded-lg text-xs font-medium border transition-colors ${
                    form.appliesTo === opt.key
                      ? 'bg-brand-blue text-white border-brand-blue'
                      : 'bg-white dark:bg-dark-card text-gray-700 dark:text-dark-muted border-gray-200 dark:border-dark-border hover:border-brand-blue'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de productos */}
          {form.appliesTo === 'products' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted">
                  Productos en promo ({form.productIds.length})
                </label>
                {form.productIds.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, productIds: [] }))}
                    className="text-[11px] font-medium text-brand-red hover:underline"
                  >
                    Quitar todos
                  </button>
                )}
              </div>

              <div className="relative mb-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nombre, SKU, marca o categoría…"
                  className="w-full h-10 pl-9 pr-3 rounded-lg text-sm bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue outline-none"
                />
              </div>

              <div className="border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden">
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-dark-border">
                  {pagedProducts.length === 0 ? (
                    <p className="text-xs text-gray-500 dark:text-dark-muted text-center py-6">
                      Sin resultados
                    </p>
                  ) : (
                    pagedProducts.map((p) => {
                      const selected = form.productIds.includes(p.id)
                      const imageUrl = extractImageUrl(p.images)
                      const stock = Array.isArray(p.variants) && p.variants.length > 0
                        ? p.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
                        : Number(p.initialStock) || 0
                      const price = Number(p.salePrice) || 0

                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleProduct(p.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                            selected
                              ? 'bg-blue-50 dark:bg-blue-950/30'
                              : 'hover:bg-gray-50 dark:hover:bg-dark-surface'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                            selected ? 'bg-brand-blue border-brand-blue' : 'border-gray-300 dark:border-dark-border'
                          }`}>
                            {selected && <Check size={12} className="text-white" strokeWidth={3} />}
                          </div>

                          <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-dark-surface overflow-hidden shrink-0 flex items-center justify-center">
                            {imageUrl ? (
                              <img src={imageUrl} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package size={18} className="text-gray-400 dark:text-dark-muted" strokeWidth={1.8} />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-brand-black dark:text-dark-text truncate">
                              {p.name}
                            </p>
                            <p className="text-[11px] text-gray-500 dark:text-dark-muted truncate">
                              {p.sku || '—'} · {p.brand || 'Sin marca'}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <p className="text-sm font-bold text-brand-black dark:text-dark-text">
                              ${price.toLocaleString('es-MX')}
                            </p>
                            <p className={`text-[10px] font-medium ${
                              stock === 0
                                ? 'text-brand-red'
                                : stock <= 5
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-gray-500 dark:text-dark-muted'
                            }`}>
                              Stock: {stock}
                            </p>
                          </div>
                        </button>
                      )
                    })
                  )}
                </div>

                {filteredProducts.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-3 py-2.5 border-t border-gray-100 dark:border-dark-border bg-gray-50/60 dark:bg-dark-surface/40">
                    <p className="text-[11px] text-gray-500 dark:text-dark-muted">
                      Mostrando{' '}
                      <span className="font-semibold text-brand-black dark:text-dark-text">{startItem}</span>
                      –<span className="font-semibold text-brand-black dark:text-dark-text">{endItem}</span>
                      {' '}de{' '}
                      <span className="font-semibold text-brand-black dark:text-dark-text">{filteredProducts.length}</span>
                      {' '}productos
                    </p>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page <= 1}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-950/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Anterior"
                      >
                        <ChevronLeft size={14} />
                      </button>

                      {pageNumbers.map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setPage(n)}
                          className={`w-7 h-7 rounded-md text-xs font-semibold transition-colors ${
                            n === page
                              ? 'bg-brand-blue text-white'
                              : 'text-gray-600 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-surface'
                          }`}
                        >
                          {n}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:text-brand-blue hover:bg-blue-50 dark:hover:bg-blue-950/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Siguiente"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {form.appliesTo === 'category' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted mb-1.5">
                Categoría
              </label>
              <input
                type="text"
                value={form.categoryFilter}
                onChange={(e) => setForm((f) => ({ ...f, categoryFilter: e.target.value }))}
                placeholder="Ej. Tenis"
                className="w-full h-11 px-3 rounded-lg text-sm bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue outline-none"
              />
            </div>
          )}

          {form.appliesTo === 'brand' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted mb-1.5">
                Marca
              </label>
              <input
                type="text"
                value={form.brandFilter}
                onChange={(e) => setForm((f) => ({ ...f, brandFilter: e.target.value }))}
                placeholder="Ej. Nike"
                className="w-full h-11 px-3 rounded-lg text-sm bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue outline-none"
              />
            </div>
          )}

          {/* Vigencia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted mb-1.5">
                Vigente desde (opcional)
              </label>
              <input
                type="date"
                value={form.startsAt}
                onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                className="w-full h-11 px-3 rounded-lg text-sm bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted mb-1.5">
                Vigente hasta (opcional)
              </label>
              <input
                type="date"
                value={form.endsAt}
                onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                className="w-full h-11 px-3 rounded-lg text-sm bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue outline-none"
              />
            </div>
          </div>

          {/* Activa */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              className="w-4 h-4 accent-brand-blue"
            />
            <span className="text-sm text-brand-black dark:text-dark-text">
              Promoción activa
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border shrink-0">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={submitting}
            disabled={!canSubmit || submitting}
          >
            {promotion ? 'Guardar cambios' : 'Crear promoción'}
          </Button>
        </div>
      </div>
    </div>
  )
}