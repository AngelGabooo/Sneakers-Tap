import { useEffect, useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Toast from '../components/common/Toast'
import AlertsHeader from '../components/inventory/alerts/AlertsHeader'
import AlertsStats from '../components/inventory/alerts/AlertsStats'
import AlertsOverviewBar from '../components/inventory/alerts/AlertsOverviewBar'
import AlertsFilters from '../components/inventory/alerts/AlertsFilters'
import AlertsQuickFilters from '../components/inventory/alerts/AlertsQuickFilters'
import AlertsBulkBar from '../components/inventory/alerts/AlertsBulkBar'
import AlertsTable from '../components/inventory/alerts/AlertsTable'
import AlertsDetailDrawer from '../components/inventory/alerts/AlertsDetailDrawer'
import AlertsReponerModal from '../components/inventory/alerts/AlertsReponerModal'
import { useView } from '../context/ViewContext'
import { useProducts } from '../context/ProductsContext'

const fmtCurrency = (n) =>
  `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

/**
 * Convierte el stock de las variantes en filas de alertas.
 * Orden de urgencia:
 *   critical (0 unidades) > high (stock <= min*0.5) > medium (stock <= min) > soon (stock <= min*1.5)
 */
function buildAlerts(products = []) {
  const alerts = []

  products.forEach((p) => {
    const minStock = Number(p.minStock) || 3
    const restockTarget = Number(p.restockTarget) || minStock * 3 // objetivo por defecto
    const purchasePrice = Number(p.costPrice) || 0
    const variants = p.variants || []

    // Producto sin variantes → evalúa stock raíz
    if (variants.length === 0) {
      const s = Number(p.initialStock) || 0
      const state = s === 0 ? 'out' : s <= minStock ? 'low' : null
      if (!state) return
      alerts.push({
        id: `${p.id}__root`,
        productId: p.id,
        productName: p.name || '—',
        imageUrl: p.images?.[0]?.url || null,
        variantId: null,
        label: '—',
        sku: p.sku || '',
        stock: s,
        minStock,
        missing: Math.max(0, minStock - s),
        restockSuggested: Math.max(0, restockTarget - s),
        supplier: p.supplier || '',
        purchasePrice,
        lastMovementAt: p.updatedAt || null,
        state,
        urgency: s === 0 ? 'critical' : s <= minStock / 2 ? 'high' : 'medium',
        urgencyOrder: s === 0 ? 0 : s <= minStock / 2 ? 1 : 2,
      })
      return
    }

    variants.forEach((v) => {
      const s = Number(v.stock) || 0
      const state =
        s === 0 ? 'out'
        : s <= minStock ? 'low'
        : s <= minStock * 1.5 ? 'soon'
        : null
      if (!state) return

      const urgency =
        s === 0 ? 'critical'
        : s <= minStock / 2 ? 'high'
        : s <= minStock ? 'medium'
        : 'soon'

      const urgencyOrder =
        s === 0 ? 0
        : s <= minStock / 2 ? 1
        : s <= minStock ? 2
        : 3

      alerts.push({
        id: `${p.id}__${v.id}`,
        productId: p.id,
        productName: p.name || '—',
        imageUrl: p.images?.[0]?.url || null,
        variantId: v.id,
        label: v.label || `${v.size} / ${v.color}`,
        sku: v.sku || p.sku || '',
        stock: s,
        minStock,
        missing: Math.max(0, minStock - s),
        restockSuggested: Math.max(0, restockTarget - s),
        supplier: p.supplier || '',
        purchasePrice,
        lastMovementAt: p.updatedAt || null,
        state,
        urgency,
        urgencyOrder,
      })
    })
  })

  return alerts
}

export default function InventoryAlerts() {
  const { navigate, viewParams } = useView()
  const { products } = useProducts()

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState('all')
  const [sort, setSort] = useState({ field: 'urgencyOrder', direction: 'asc' })
  const [selectedIds, setSelectedIds] = useState([])
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const [toast, setToast] = useState(null)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [reponerAlert, setReponerAlert] = useState(null)

  // Filtro inicial desde viewParams (ej. llegar desde "Críticas" del header)
  useEffect(() => {
    if (viewParams?.filter) setQuickFilter(viewParams.filter)
  }, [viewParams])

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 250)
    return () => clearTimeout(t)
  }, [])

  const allAlerts = useMemo(() => buildAlerts(products), [products])

  const filtered = useMemo(() => {
    let list = [...allAlerts]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (a) =>
          a.productName.toLowerCase().includes(q) ||
          a.sku.toLowerCase().includes(q) ||
          a.label.toLowerCase().includes(q) ||
          (a.supplier || '').toLowerCase().includes(q),
      )
    }

    if (quickFilter === 'out') list = list.filter((a) => a.state === 'out')
    else if (quickFilter === 'low') list = list.filter((a) => a.state === 'low')
    else if (quickFilter === 'soon') list = list.filter((a) => a.state === 'soon')
    else if (quickFilter === 'high') list = list.filter((a) => a.urgency === 'critical' || a.urgency === 'high')
    else if (quickFilter === 'restock') list = list.filter((a) => a.restockSuggested > 0)

    const dir = sort.direction === 'asc' ? 1 : -1
    list.sort((a, b) => {
      const va = a[sort.field] ?? ''
      const vb = b[sort.field] ?? ''
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir
      return String(va).localeCompare(String(vb)) * dir
    })

    return list
  }, [allAlerts, search, quickFilter, sort])

  const total = filtered.length
  const filtersActive = quickFilter !== 'all'

  const paged = useMemo(() => {
    const start = (page - 1) * perPage
    return filtered.slice(start, start + perPage)
  }, [filtered, page, perPage])

  // Stats
  const stats = useMemo(() => {
    const outOfStock = allAlerts.filter((a) => a.state === 'out').length
    const lowStock = allAlerts.filter((a) => a.state === 'low').length
    const soon = allAlerts.filter((a) => a.state === 'soon').length
    const restockValue = allAlerts.reduce(
      (acc, a) => acc + (Number(a.restockSuggested) || 0) * (Number(a.purchasePrice) || 0),
      0,
    )
    return { outOfStock, lowStock, soon, restockValue: fmtCurrency(restockValue) }
  }, [allAlerts])

  const quickCounts = useMemo(() => ({
    all: allAlerts.length,
    out: allAlerts.filter((a) => a.state === 'out').length,
    low: allAlerts.filter((a) => a.state === 'low').length,
    soon: allAlerts.filter((a) => a.state === 'soon').length,
    high: allAlerts.filter((a) => a.urgency === 'critical' || a.urgency === 'high').length,
    restock: allAlerts.filter((a) => a.restockSuggested > 0).length,
  }), [allAlerts])

  // Handlers
  const handleNavigate = (key) => navigate(key)
  const handleSortChange = (field, direction) => setSort({ field, direction })

  const handleToggleSelect = (id) => {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
  }
  const handleToggleSelectAll = (checked) => {
    setSelectedIds(checked ? paged.map((a) => a.id) : [])
  }

  const goToProduct = (productId) => navigate('product-detail', { id: productId })

  const goToInventoryRow = (alert) => {
    navigate('inventory', { search: alert.sku })
  }

  const goToMovements = (alert) => {
    navigate('inventory-movements', {
      productId: alert.productId,
      variantId: alert.variantId || undefined,
    })
  }

  const goToAdjust = (alert) => {
    navigate('inventory-adjust', {
      id: alert.productId,
      variantId: alert.variantId || undefined,
    })
  }

  const goToSupplier = (alert) => {
    navigate('suppliers', { name: alert.supplier })
  }

  const handleExport = () => {
    setToast({
      title: 'Exportación preparada correctamente',
      description: 'El archivo estará disponible en un momento.',
    })
  }

  const handleCreatePurchase = () => {
    const selected = allAlerts.filter((a) => selectedIds.includes(a.id))
    navigate('purchase-new', { items: selected })
  }

  const handleMarkReviewed = () => {
    setToast({
      title: 'Alertas marcadas como revisadas',
      description: `${selectedIds.length} alertas actualizadas.`,
    })
    setSelectedIds([])
  }

  const handleClearAll = () => {
    setSearch('')
    setQuickFilter('all')
    setPage(1)
  }

  const handleReponerConfirm = (item) => {
    setToast({
      title: 'Producto agregado a la compra',
      description: `${item.productName} · ${item.restockQuantity} unidades.`,
    })
    // 🚧 TODO: navigate('purchase-new', { item })
  }

  return (
    <DashboardLayout
      activeKey="inventory-alerts"
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
        <span className="text-brand-black dark:text-dark-text font-medium">Alertas de stock</span>
      </nav>

      <AlertsHeader
        onExport={handleExport}
        onCreatePurchase={handleCreatePurchase}
        selectedCount={selectedIds.length}
      />

      <AlertsStats
        stats={stats}
        onFilterClick={(key) => {
          if (key === 'out') setQuickFilter('out')
          else if (key === 'low') setQuickFilter('low')
          else if (key === 'soon') setQuickFilter('soon')
          setPage(1)
        }}
      />

      <AlertsOverviewBar stats={stats} />

      <AlertsFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        onToggleFilters={() => console.log('Filtros avanzados')}
        filtersActive={filtersActive}
        onClearFilters={handleClearAll}
      />

      <AlertsQuickFilters
        active={quickFilter}
        counts={quickCounts}
        onChange={(v) => { setQuickFilter(v); setPage(1) }}
      />

      <AlertsBulkBar
        count={selectedIds.length}
        onClear={() => setSelectedIds([])}
        onCreatePurchase={handleCreatePurchase}
        onMarkReviewed={handleMarkReviewed}
        onExport={handleExport}
        onViewInventory={() => navigate('inventory')}
      />

      <AlertsTable
        items={paged}
        loading={loading}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        sort={sort}
        onSortChange={handleSortChange}
        onViewProduct={goToProduct}
        onViewInventory={goToInventoryRow}
        onViewMovements={goToMovements}
        onAdjustStock={goToAdjust}
        onCreatePurchase={(row) => navigate('purchase-new', { item: row })}
        onViewSupplier={goToSupplier}
        onReponer={(row) => setReponerAlert(row)}
        searchQuery={search}
        filtersActive={filtersActive}
        onClearAll={handleClearAll}
        page={page}
        perPage={perPage}
        total={total}
        onPageChange={setPage}
        onPerPageChange={(n) => { setPerPage(n); setPage(1) }}
        onGoToInventory={() => navigate('inventory')}
      />

      <AlertsDetailDrawer
        open={!!selectedAlert}
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onViewProduct={(id) => { setSelectedAlert(null); goToProduct(id) }}
        onViewMovements={(a) => { setSelectedAlert(null); goToMovements(a) }}
        onAdjustStock={(a) => { setSelectedAlert(null); goToAdjust(a) }}
        onCreatePurchase={(a) => { setSelectedAlert(null); navigate('purchase-new', { item: a }) }}
      />

      <AlertsReponerModal
        open={!!reponerAlert}
        alert={reponerAlert}
        onClose={() => setReponerAlert(null)}
        onConfirm={handleReponerConfirm}
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