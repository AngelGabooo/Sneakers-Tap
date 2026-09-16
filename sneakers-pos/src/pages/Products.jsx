// src/pages/Products.jsx
import { useMemo, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import ProductsHeader from '../components/products/ProductsHeader'
import ProductsStats from '../components/products/ProductsStats'
import ProductsToolbar from '../components/products/ProductsToolbar'
import ProductsQuickFilters from '../components/products/ProductsQuickFilters'
import ProductsBulkBar from '../components/products/ProductsBulkBar'
import ProductsTable from '../components/products/ProductsTable'
import ConfirmModal from '../components/common/ConfirmModal'
import Toast from '../components/common/Toast'
import { useView } from '../context/ViewContext'
import { useProducts } from '../context/ProductsContext'

function getTotalStock(p) {
  if (Array.isArray(p.variants) && p.variants.length > 0) {
    return p.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
  }
  return Number(p.initialStock) || 0
}

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

function formatVariants(p) {
  const { sizes, colors } = getVariantCounts(p)
  const parts = []
  if (sizes) parts.push(`${sizes} talla${sizes > 1 ? 's' : ''}`)
  if (colors) parts.push(`${colors} color${colors > 1 ? 'es' : ''}`)
  return parts.length ? parts.join(' · ') : '—'
}

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
  const { products, deleteProduct, toggleProductStatus } = useProducts()

  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState('all')
  const [view, setView] = useState('list')
  const [sort, setSort] = useState({ field: 'name', direction: 'asc' })
  const [selectedIds, setSelectedIds] = useState([])

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)

  // Modal de eliminación
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, ids: [] })
  const [deleting, setDeleting] = useState(false)

  // Modal de activar/desactivar (bulk)
  const [statusConfirm, setStatusConfirm] = useState({ open: false, ids: [], status: null })

  // Toast
  const [toast, setToast] = useState(null)

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

  // ============================================================
  // ACCIONES
  // ============================================================

  /**
   * Abre el modal de confirmación para eliminar 1 producto.
   */
  const handleDelete = (id) => {
    setDeleteConfirm({ open: true, ids: [id] })
  }

  /**
   * Abre el modal de confirmación para eliminar los seleccionados.
   */
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return
    setDeleteConfirm({ open: true, ids: [...selectedIds] })
  }

  /**
   * Ejecuta la eliminación.
   */
  const handleConfirmDelete = async () => {
    setDeleting(true)
    try {
      for (const id of deleteConfirm.ids) {
        await deleteProduct(id)
      }
      setToast({
        title: 'Productos eliminados',
        description: `Se eliminaron ${deleteConfirm.ids.length} producto${deleteConfirm.ids.length > 1 ? 's' : ''}.`,
      })
      setSelectedIds([])
      setDeleteConfirm({ open: false, ids: [] })
    } catch (err) {
      console.error('❌ Error eliminando:', err)
      setToast({
        title: 'Error al eliminar',
        description: err.message || 'Intenta de nuevo.',
      })
    } finally {
      setDeleting(false)
    }
  }

  /**
   * Alternar activo/inactivo de un producto individual.
   */
  const handleToggleActive = async (id) => {
    const product = products.find((p) => p.id === id)
    if (!product) return
    const nextStatus = product.status === 'active' ? 'inactive' : 'active'
    try {
      await toggleProductStatus(id, nextStatus)
      setToast({
        title: nextStatus === 'active' ? 'Producto activado' : 'Producto desactivado',
        description: `${product.name} ahora está ${nextStatus === 'active' ? 'disponible para venta' : 'oculto para nuevas ventas'}.`,
      })
    } catch (err) {
      console.error('❌ Error cambiando status:', err)
      setToast({
        title: 'Error',
        description: err.message || 'Intenta de nuevo.',
      })
    }
  }

  /**
   * Bulk: cambiar status (activar o desactivar).
   */
  const handleBulkStatus = (status) => {
    if (selectedIds.length === 0) return
    setStatusConfirm({ open: true, ids: [...selectedIds], status })
  }

  const handleConfirmBulkStatus = async () => {
    setDeleting(true)
    try {
      for (const id of statusConfirm.ids) {
        await toggleProductStatus(id, statusConfirm.status)
      }
      const isActive = statusConfirm.status === 'active'
      setToast({
        title: isActive ? 'Productos activados' : 'Productos desactivados',
        description: `${statusConfirm.ids.length} producto${statusConfirm.ids.length > 1 ? 's' : ''} ${isActive ? 'activado' : 'desactivado'}${statusConfirm.ids.length > 1 ? 's' : ''}.`,
      })
      setSelectedIds([])
      setStatusConfirm({ open: false, ids: [], status: null })
    } catch (err) {
      console.error('❌ Error bulk status:', err)
      setToast({
        title: 'Error',
        description: err.message || 'Intenta de nuevo.',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleDuplicate = (id) => {
    const original = products.find((p) => p.id === id)
    if (!original) return
    setToast({
      title: 'Duplicar producto',
      description: 'Esta función estará disponible próximamente.',
    })
  }

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
        onDuplicate={handleDuplicate}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
        onNew={goToCreate}
        searchQuery={search}
        onClearSearch={() => setSearch('')}
        page={page}
        perPage={perPage}
        total={total}
        onPageChange={setPage}
        onPerPageChange={(n) => { setPerPage(n); setPage(1) }}
      />

      {/* BulkBar flotante */}
      <ProductsBulkBar
        count={selectedIds.length}
        onClear={() => setSelectedIds([])}
        onActivate={() => handleBulkStatus('active')}
        onDeactivate={() => handleBulkStatus('inactive')}
        onChangeCategory={() => setToast({ title: 'Cambiar categoría', description: 'Próximamente' })}
        onExport={() => setToast({ title: 'Exportar', description: 'Próximamente' })}
        onDelete={handleBulkDelete}
      />

      {/* Modal de eliminación */}
      <ConfirmModal
        open={deleteConfirm.open}
        tone="danger"
        title={
          deleteConfirm.ids.length === 1
            ? '¿Eliminar este producto?'
            : `¿Eliminar ${deleteConfirm.ids.length} productos?`
        }
        description="Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, ids: [] })}
      />

      {/* Modal de activar/desactivar */}
      <ConfirmModal
        open={statusConfirm.open}
        tone={statusConfirm.status === 'active' ? 'info' : 'warning'}
        title={
          statusConfirm.status === 'active'
            ? '¿Activar los productos?'
            : '¿Desactivar los productos?'
        }
        description={
          statusConfirm.status === 'active'
            ? 'Los productos estarán disponibles para venta.'
            : 'Los productos quedarán ocultos para nuevas ventas.'
        }
        confirmText={statusConfirm.status === 'active' ? 'Sí, activar' : 'Sí, desactivar'}
        cancelText="Cancelar"
        loading={deleting}
        onConfirm={handleConfirmBulkStatus}
        onCancel={() => setStatusConfirm({ open: false, ids: [], status: null })}
      />

      <Toast
        open={!!toast}
        variant={toast?.title?.includes('Error') ? 'error' : 'success'}
        title={toast?.title}
        description={toast?.description}
        onClose={() => setToast(null)}
      />
    </DashboardLayout>
  )
}