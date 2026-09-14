import { useMemo, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import ProductsHeader from '../components/products/ProductsHeader'
import ProductsStats from '../components/products/ProductsStats'
import ProductsToolbar from '../components/products/ProductsToolbar'
import ProductsQuickFilters from '../components/products/ProductsQuickFilters'
import ProductsBulkBar from '../components/products/ProductsBulkBar'
import ProductsTable from '../components/products/ProductsTable'
import { useView } from '../context/ViewContext'
import { useProducts } from '../context/ProductsContext'

/**
 * Suma el stock de todas las variantes.
 * Si el producto tiene `variants`, se usa la suma.
 * Si no, cae al `initialStock` (por si algún producto viejo no tiene variantes).
 */
function getTotalStock(p) {
  if (Array.isArray(p.variants) && p.variants.length > 0) {
    return p.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
  }
  return Number(p.initialStock) || 0
}

/**
 * Cuenta tallas y colores reales del producto.
 * Prioriza `variants`, cae a `sizes`/`colors` si no hay variantes.
 */
function getVariantCounts(p) {
  if (Array.isArray(p.variants) && p.variants.length > 0) {
    const sizes = new Set(p.variants.map((v) => v.size))
    const colors = new Set(p.variants.map((v) => v.color))
    return { sizes: sizes.size, colors: colors.size }
  }
  return {
    sizes: p.sizes?.length || 0,
    colors: p.colors?.length || 0,
  }
}

/**
 * Formatea el resumen de variantes: "5 tallas · 2 colores"
 */
function formatVariants(p) {
  const { sizes, colors } = getVariantCounts(p)
  const parts = []
  if (sizes) parts.push(`${sizes} talla${sizes > 1 ? 's' : ''}`)
  if (colors) parts.push(`${colors} color${colors > 1 ? 'es' : ''}`)
  return parts.length ? parts.join(' · ') : '—'
}

/**
 * Convierte un producto del store al formato plano que espera ProductsTable.
 */
function normalizeProduct(p) {
  return {
    id: p.id,
    name: p.name || '—',
    sku: p.sku || '—',
    imageUrl: p.images?.[0]?.url || null,
    category: p.category || '—',
    brand: p.brand || '—',
    variants: formatVariants(p),
    price: p.salePrice ? `$${Number(p.salePrice).toLocaleString('es-MX')}` : '$0.00',
    stock: getTotalStock(p),
    status: p.status === 'active' ? 'active' : 'inactive',
  }
}

export default function Products() {
  const { navigate } = useView()
  const { products } = useProducts()

  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState('all')
  const [view, setView] = useState('list')
  const [sort, setSort] = useState({ field: 'name', direction: 'asc' })
  const [selectedIds, setSelectedIds] = useState([])

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)

  // Lista normalizada
  const normalized = useMemo(() => products.map(normalizeProduct), [products])

  const filtered = useMemo(() => {
    let list = [...normalized]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q),
      )
    }

    if (quickFilter === 'low') {
      list = list.filter((p) => p.stock > 0 && p.stock <= 5)
    } else if (quickFilter === 'out') {
      list = list.filter((p) => p.stock === 0)
    }

    const dir = sort.direction === 'asc' ? 1 : -1
    list.sort((a, b) => {
      const va = a[sort.field] ?? ''
      const vb = b[sort.field] ?? ''
      return String(va).localeCompare(String(vb)) * dir
    })

    return list
  }, [normalized, search, quickFilter, sort])

  const total = filtered.length
  const filtersActive = useMemo(() => quickFilter !== 'all', [quickFilter])

  const handleToggleSelect = (id) => {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
  }
  const handleToggleSelectAll = (checked) => {
    setSelectedIds(checked ? filtered.map((p) => p.id) : [])
  }

  const handleNavigate = (key) => navigate(key)
  const handleSortChange = (field, direction) => setSort({ field, direction })

  const goToCreate = () => navigate('product-new')
  const goToEdit = (id) => navigate('product-edit', { id })

  const stats = useMemo(() => ({
    total:      { value: normalized.length },
    active:     { value: normalized.filter((p) => p.status === 'active').length },
    lowStock:   { value: normalized.filter((p) => p.stock > 0 && p.stock <= 5).length },
    outOfStock: { value: normalized.filter((p) => p.stock === 0).length },
  }), [normalized])

  return (
    <DashboardLayout
      activeKey="products"
      onNavigate={handleNavigate}
      period={undefined}
      onPeriodChange={undefined}
    >
      <ProductsHeader
        onNew={goToCreate}
        onManageCatalog={() => console.log('Gestionar catálogo → Vista #8 (pendiente)')}
      />

      <ProductsStats stats={stats} />

      <ProductsToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        onToggleFilters={() => console.log('Abrir panel de filtros')}
        filtersActive={filtersActive}
        onExport={() => console.log('Exportar')}
        view={view}
        onViewChange={setView}
      />

      <ProductsQuickFilters
        active={quickFilter}
        onChange={(v) => { setQuickFilter(v); setPage(1) }}
      />

      <ProductsBulkBar
        count={selectedIds.length}
        onClear={() => setSelectedIds([])}
        onActivate={() => console.log('Activar seleccionados')}
        onDeactivate={() => console.log('Desactivar seleccionados')}
        onChangeCategory={() => console.log('Cambiar categoría')}
        onExport={() => console.log('Exportar seleccionados')}
        onDelete={() => console.log('Eliminar seleccionados')}
      />

      <ProductsTable
        items={filtered}
        loading={false}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        sort={sort}
        onSortChange={handleSortChange}
        onView={(id) => navigate('product-detail', { id })}
        onEdit={goToEdit}
        onDuplicate={(id) => console.log('Duplicar producto', id)}
        onToggleActive={(id) => console.log('Activar/Desactivar producto', id)}
        onDelete={(id) => console.log('Eliminar producto', id)}
        onNew={goToCreate}
        searchQuery={search}
        onClearSearch={() => setSearch('')}
        page={page}
        perPage={perPage}
        total={total}
        onPageChange={setPage}
        onPerPageChange={(n) => { setPerPage(n); setPage(1) }}
      />
    </DashboardLayout>
  )
}