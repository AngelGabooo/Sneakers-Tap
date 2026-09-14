import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Toast from '../components/common/Toast'
import InventoryHeader from '../components/inventory/InventoryHeader'
import InventoryStats from '../components/inventory/InventoryStats'
import InventoryValueCards from '../components/inventory/InventoryValueCards'
import InventoryToolbar from '../components/inventory/InventoryToolbar'
import InventoryQuickFilters from '../components/inventory/InventoryQuickFilters'
import InventoryBulkBar from '../components/inventory/InventoryBulkBar'
import InventoryTable from '../components/inventory/InventoryTable'
import InventoryAlertsPanel from '../components/inventory/InventoryAlertsPanel'
import InventoryLowStockSection from '../components/inventory/InventoryLowStockSection'
import { useView } from '../context/ViewContext'
import { useProducts } from '../context/ProductsContext'

/**
 * Aplana los productos en filas de inventario: 1 fila por variante.
 */
function flattenInventory(products = []) {
  const rows = []
  products.forEach((p) => {
    const variants = p.variants || []
    const minStock = Number(p.minStock) || 3

    if (variants.length === 0) {
      rows.push({
        id: `${p.id}__root`,
        productId: p.id,
        productName: p.name || '—',
        category: p.category || '',
        imageUrl: p.images?.[0]?.url || null,
        variantId: null,
        label: '—',
        size: '',
        color: '',
        sku: p.sku || '',
        barcode: p.barcode || '',
        location: p.location || '',
        stock: Number(p.initialStock) || 0,
        minStock,
        productStatus: p.status,
        lastMovementAt: p.updatedAt || null,
        supplier: p.supplier || '',
        costPrice: Number(p.costPrice) || 0,
        salePrice: Number(p.salePrice) || 0,
      })
      return
    }

    variants.forEach((v) => {
      rows.push({
        id: `${p.id}__${v.id}`,
        productId: p.id,
        productName: p.name || '—',
        category: p.category || '',
        imageUrl: p.images?.[0]?.url || null,
        variantId: v.id,
        label: v.label || `${v.size} / ${v.color}`,
        size: v.size,
        color: v.color,
        sku: v.sku || p.sku || '',
        barcode: v.barcode || p.barcode || '',
        location: p.location || '',
        stock: Number(v.stock) || 0,
        minStock,
        productStatus: p.status,
        lastMovementAt: p.updatedAt || null,
        supplier: p.supplier || '',
        costPrice: Number(p.costPrice) || 0,
        salePrice: Number(p.salePrice) || 0,
      })
    })
  })
  return rows
}

const fmtCurrency = (n) =>
  `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

export default function Inventory() {
  const { navigate } = useView()
  const { products } = useProducts()

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [quickFilter, setQuickFilter] = useState('all')
  const [sort, setSort] = useState({ field: 'productName', direction: 'asc' })
  const [selectedIds, setSelectedIds] = useState([])
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const [toast, setToast] = useState(null)

  // 🚧 Simula carga local
  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 250)
    return () => clearTimeout(t)
  }, [])

  const rows = useMemo(() => flattenInventory(products), [products])

  const filtered = useMemo(() => {
    let list = [...rows]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          r.productName.toLowerCase().includes(q) ||
          r.sku.toLowerCase().includes(q) ||
          (r.barcode || '').toLowerCase().includes(q) ||
          (r.label || '').toLowerCase().includes(q) ||
          (r.size || '').toLowerCase().includes(q) ||
          (r.color || '').toLowerCase().includes(q),
      )
    }

    if (quickFilter === 'healthy') {
      list = list.filter((r) => r.stock > r.minStock)
    } else if (quickFilter === 'low') {
      list = list.filter((r) => r.stock > 0 && r.stock <= r.minStock)
    } else if (quickFilter === 'out') {
      list = list.filter((r) => r.stock === 0)
    }

    const dir = sort.direction === 'asc' ? 1 : -1
    list.sort((a, b) => {
      const va = a[sort.field] ?? ''
      const vb = b[sort.field] ?? ''
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir
      return String(va).localeCompare(String(vb)) * dir
    })

    return list
  }, [rows, search, quickFilter, sort])

  const total = filtered.length
  const filtersActive = useMemo(() => quickFilter !== 'all', [quickFilter])

  const paged = useMemo(() => {
    const start = (page - 1) * perPage
    return filtered.slice(start, start + perPage)
  }, [filtered, page, perPage])

  // Stats y valores
  const stats = useMemo(() => {
    const totalProducts = products.length
    const totalUnits = rows.reduce((acc, r) => acc + (Number(r.stock) || 0), 0)
    const lowStock = rows.filter((r) => r.stock > 0 && r.stock <= r.minStock).length
    const outOfStock = rows.filter((r) => r.stock === 0).length
    return { totalProducts, totalUnits, lowStock, outOfStock }
  }, [products, rows])

  const values = useMemo(() => {
    let costValue = 0
    let saleValue = 0
    rows.forEach((r) => {
      costValue += (Number(r.costPrice) || 0) * (Number(r.stock) || 0)
      saleValue += (Number(r.salePrice) || 0) * (Number(r.stock) || 0)
    })
    return {
      costValue: fmtCurrency(costValue),
      saleValue: fmtCurrency(saleValue),
      marginValue: fmtCurrency(saleValue - costValue),
    }
  }, [rows])

  // Alertas
  const alerts = useMemo(() => {
    return rows
      .filter((r) => r.stock <= r.minStock)
      .map((r) => ({
        id: r.id,
        productId: r.productId,
        productName: r.productName,
        label: r.label,
        stock: r.stock,
        minStock: r.minStock,
        level: r.stock === 0 ? 'out' : 'low',
      }))
      .sort((a, b) => (a.stock - b.stock))
  }, [rows])

  const lowStockRows = useMemo(() => {
    return rows
      .filter((r) => r.stock <= r.minStock)
      .map((r) => ({
        ...r,
        suggested: Math.max(r.minStock * 2 - r.stock, 5),
      }))
  }, [rows])

  // Handlers
  const handleNavigate = (key) => navigate(key)
  const handleSortChange = (field, direction) => setSort({ field, direction })

  const handleToggleSelect = (id) => {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
  }
  const handleToggleSelectAll = (checked) => {
    setSelectedIds(checked ? paged.map((r) => r.id) : [])
  }

  const goToDetail = (productId) => navigate('product-detail', { id: productId })
  const goToEdit = (productId) => navigate('product-edit', { id: productId })
  const goToCreate = () => navigate('product-new')

  /**
   * Ajustar stock: navega a la vista dedicada de ajuste.
   */
  const handleAdjustStock = (row) => {
    navigate('inventory-adjust', {
      id: row.productId,
      variantId: row.variantId || undefined,
    })
  }

  /**
   * Abre el ajuste desde el header.
   * - Si hay 1 fila seleccionada → preselecciona esa variante.
   * - Si no → abre la vista en blanco.
   */
  const handleAdjustFromHeader = () => {
    if (selectedIds.length === 1) {
      const row = rows.find((r) => r.id === selectedIds[0])
      if (row) {
        navigate('inventory-adjust', {
          id: row.productId,
          variantId: row.variantId || undefined,
        })
        return
      }
    }
    navigate('inventory-adjust')
  }

  const handleViewMovements = (productId, variantId) => {
    navigate('inventory-movements', { productId, variantId })
  }

  const handleRegisterPurchase = (row) => {
    console.log('Registrar compra', row)
  }

  const handleExport = () => {
    setToast({
      title: 'Exportación preparada correctamente',
      description: 'El archivo estará disponible en un momento.',
    })
  }

  const handleImport = () => console.log('Importar inventario → Vista pendiente')
  const handleViewMovements2 = () => navigate('inventory-movements')
  const handleConfigureAlerts = () => console.log('Configurar alertas')
  const handleCreatePurchase = () => console.log('Crear compra desde productos por reponer')

  return (
    <DashboardLayout
      activeKey="inventory"
      onNavigate={handleNavigate}
      period={undefined}
      onPeriodChange={undefined}
    >
      <InventoryHeader
        onAdjustInventory={handleAdjustFromHeader}
        onExport={handleExport}
        onImport={handleImport}
        onViewMovements={handleViewMovements2}
        onConfigureAlerts={handleConfigureAlerts}
      />

      <InventoryStats stats={stats} onFilterClick={(key) => { setQuickFilter(key); setPage(1) }} />

      <InventoryValueCards values={values} />

      <InventoryToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        onToggleFilters={() => console.log('Abrir filtros avanzados')}
        filtersActive={filtersActive}
        onExport={handleExport}
      />

      <InventoryQuickFilters
        active={quickFilter}
        onChange={(v) => { setQuickFilter(v); setPage(1) }}
      />

      <InventoryBulkBar
        count={selectedIds.length}
        onClear={() => setSelectedIds([])}
        onAdjust={() => {
          const row = rows.find((r) => r.id === selectedIds[0])
          if (row) {
            navigate('inventory-adjust', {
              id: row.productId,
              variantId: row.variantId || undefined,
            })
          }
        }}
        onExport={handleExport}
        onMarkForRestock={() => console.log('Marcar para reposición')}
      />

      <InventoryTable
        items={paged}
        loading={loading}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        sort={sort}
        onSortChange={handleSortChange}
        onView={goToDetail}
        onEdit={goToEdit}
        onViewMovements={handleViewMovements}
        onAdjustStock={handleAdjustStock}
        onRegisterPurchase={handleRegisterPurchase}
        searchQuery={search}
        onClearSearch={() => setSearch('')}
        filtersActive={filtersActive}
        onClearFilters={() => setQuickFilter('all')}
        onGoToCreate={goToCreate}
        onGoToPurchase={() => console.log('Registrar compra')}
        page={page}
        perPage={perPage}
        total={total}
        onPageChange={setPage}
        onPerPageChange={(n) => { setPerPage(n); setPage(1) }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
        <div className="lg:col-span-2">
          <InventoryLowStockSection
            items={lowStockRows}
            onCreatePurchase={handleCreatePurchase}
          />
        </div>
        <div className="lg:col-span-1">
          <InventoryAlertsPanel
            alerts={alerts}
            onViewAll={() => console.log('Ver todas las alertas')}
            onItemClick={(a) => goToDetail(a.productId)}
          />
        </div>
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