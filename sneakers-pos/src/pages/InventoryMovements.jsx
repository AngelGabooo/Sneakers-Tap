import { useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Toast from '../components/common/Toast'
import MovementsHeader from '../components/inventory/movements/MovementsHeader'
import MovementsStats from '../components/inventory/movements/MovementsStats'
import MovementsFilters from '../components/inventory/movements/MovementsFilters'
import MovementsQuickFilters from '../components/inventory/movements/MovementsQuickFilters'
import MovementsChart from '../components/inventory/movements/MovementsChart'
import MovementsTable from '../components/inventory/movements/MovementsTable'
import MovementDetailDrawer from '../components/inventory/movements/MovementDetailDrawer'
import { useView } from '../context/ViewContext'
import { useMovements } from '../context/MovementsContext'

const PERIOD_DAYS = {
  today: 1,
  yesterday: 1,
  '7d': 7,
  '30d': 30,
  month: 30,
  lastMonth: 60,
  custom: 9999,
}

function inPeriod(movement, period) {
  const now = new Date()
  const date = new Date(movement.createdAt)

  if (period === 'today') {
    return date.toDateString() === now.toDateString()
  }
  if (period === 'yesterday') {
    const y = new Date(now)
    y.setDate(y.getDate() - 1)
    return date.toDateString() === y.toDateString()
  }
  const days = PERIOD_DAYS[period] || 30
  const diff = (now - date) / (1000 * 60 * 60 * 24)
  return diff <= days
}

const TYPE_FILTERS = {
  all:      () => true,
  in:       (m) => m.type === 'in' || (m.type === 'adjust' && m.quantity > 0),
  out:      (m) => m.type === 'out' || (m.type === 'adjust' && m.quantity < 0),
  adjust:   (m) => m.type === 'adjust',
  return:   (m) => m.type === 'return',
  loss:     (m) => m.type === 'loss' || m.type === 'damage',
  transfer: (m) => m.type === 'transfer',
}

export default function InventoryMovements() {
  const { navigate, viewParams } = useView()
  const { movements, loading: loadingStore } = useMovements()

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('30d')
  const [quickFilter, setQuickFilter] = useState('all')
  const [sort, setSort] = useState({ field: 'createdAt', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const [toast, setToast] = useState(null)
  const [selectedMovement, setSelectedMovement] = useState(null)

  // Filtros precargados desde la vista anterior
  const presetProductId = viewParams?.productId
  const presetVariantId = viewParams?.variantId

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 250)
    return () => clearTimeout(t)
  }, [])

  // 1) Aplica filtros de periodo + preset + búsqueda + chip
  const filtered = useMemo(() => {
    let list = [...movements]

    // Preset desde viewParams
    if (presetProductId) list = list.filter((m) => m.productId === presetProductId)
    if (presetVariantId) list = list.filter((m) => m.variantId === presetVariantId)

    // Periodo
    list = list.filter((m) => inPeriod(m, period))

    // Chip
    const chipFn = TYPE_FILTERS[quickFilter] || TYPE_FILTERS.all
    list = list.filter(chipFn)

    // Búsqueda
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (m) =>
          m.productName?.toLowerCase().includes(q) ||
          m.sku?.toLowerCase().includes(q) ||
          m.variantLabel?.toLowerCase().includes(q) ||
          m.userName?.toLowerCase().includes(q) ||
          m.color?.toLowerCase().includes(q) ||
          m.size?.toLowerCase().includes(q),
      )
    }

    // Orden
    const dir = sort.direction === 'asc' ? 1 : -1
    list.sort((a, b) => {
      const va = a[sort.field] ?? ''
      const vb = b[sort.field] ?? ''
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir
      return String(va).localeCompare(String(vb)) * dir
    })

    return list
  }, [movements, period, quickFilter, search, sort, presetProductId, presetVariantId])

  const total = filtered.length
  const filtersActive = quickFilter !== 'all' || !!presetProductId || !!presetVariantId

  // Paginación
  const paged = useMemo(() => {
    const start = (page - 1) * perPage
    return filtered.slice(start, start + perPage)
  }, [filtered, page, perPage])

  // Stats
  const stats = useMemo(() => {
    const today = new Date().toDateString()
    const todayMovs = movements.filter((m) => new Date(m.createdAt).toDateString() === today)

    const inQty = filtered
      .filter((m) => Number(m.quantity) > 0)
      .reduce((acc, m) => acc + Number(m.quantity), 0)
    const outQty = filtered
      .filter((m) => Number(m.quantity) < 0)
      .reduce((acc, m) => acc + Math.abs(Number(m.quantity)), 0)
    const adjustCount = filtered.filter((m) => m.type === 'adjust').length

    return {
      todayCount: todayMovs.length,
      inQty,
      outQty,
      adjustCount,
    }
  }, [movements, filtered])

  // Chart data
  const chartData = useMemo(() => {
    const map = new Map()
    filtered.forEach((m) => {
      const key = new Date(m.createdAt).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
      const curr = map.get(key) || { date: key, in: 0, out: 0 }
      if (Number(m.quantity) > 0) curr.in += Number(m.quantity)
      else curr.out += Math.abs(Number(m.quantity))
      map.set(key, curr)
    })
    return Array.from(map.values()).reverse()
  }, [filtered])

  // Handlers
  const handleNavigate = (key) => navigate(key)
  const handleSortChange = (field, direction) => setSort({ field, direction })

  const goToDetail = (productId) => navigate('product-detail', { id: productId })
  const goToInventory = () => navigate('inventory')

  const handleRegisterMovement = () => {
    navigate('inventory')
    // 🚧 TODO: abrir directamente el modal de ajuste en Inventario
  }

  const handleExport = () => {
    setToast({
      title: 'Exportación preparada correctamente',
      description: 'El archivo estará disponible en un momento.',
    })
  }

  const handleClearAll = () => {
    setSearch('')
    setQuickFilter('all')
    setPeriod('30d')
    setPage(1)
  }

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
          onClick={goToInventory}
          className="text-gray-500 dark:text-dark-muted hover:text-brand-blue transition-colors font-medium"
        >
          Inventario
        </button>
        <span className="text-gray-400">/</span>
        <span className="text-brand-black dark:text-dark-text font-medium">
          Movimientos de inventario
        </span>
      </nav>

      <MovementsHeader
        onExport={handleExport}
        onRegisterMovement={handleRegisterMovement}
      />

      <MovementsStats stats={stats} />

      <MovementsFilters
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        period={period}
        onPeriodChange={(v) => { setPeriod(v); setPage(1) }}
        onToggleFilters={() => console.log('Filtros avanzados')}
        filtersActive={filtersActive}
      />

      <MovementsQuickFilters
        active={quickFilter}
        onChange={(v) => { setQuickFilter(v); setPage(1) }}
      />

      <MovementsChart data={chartData} />

      <MovementsTable
        items={paged}
        loading={loading || loadingStore}
        sort={sort}
        onSortChange={handleSortChange}
        onViewDetail={(m) => setSelectedMovement(m)}
        onViewProduct={goToDetail}
        onViewDocument={(m) => console.log('Ver documento', m.documentId)}
        onViewUser={(userName) => console.log('Ver usuario', userName)}
        searchQuery={search}
        filtersActive={filtersActive}
        onClearAll={handleClearAll}
        page={page}
        perPage={perPage}
        total={total}
        onPageChange={setPage}
        onPerPageChange={(n) => { setPerPage(n); setPage(1) }}
      />

      {/* Drawer de detalle */}
      <MovementDetailDrawer
        open={!!selectedMovement}
        movement={selectedMovement}
        onClose={() => setSelectedMovement(null)}
        onViewProduct={(id) => { setSelectedMovement(null); goToDetail(id) }}
        onViewDocument={(m) => console.log('Ver documento', m.documentId)}
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