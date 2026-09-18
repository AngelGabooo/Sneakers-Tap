// src/pages/Wholesale.jsx
import { useEffect, useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Toast from '../components/common/Toast'
import WholesaleHeader from '../components/wholesale/WholesaleHeader'
import WholesaleStats from '../components/wholesale/WholesaleStats'
import WholesaleSecondaryStats from '../components/wholesale/WholesaleSecondaryStats'
import WholesalePeriodPicker from '../components/wholesale/WholesalePeriodPicker'
import WholesaleToolbar from '../components/wholesale/WholesaleToolbar'
import WholesaleQuickFilters from '../components/wholesale/WholesaleQuickFilters'
import WholesaleCreditSummary from '../components/wholesale/WholesaleCreditSummary'
import WholesaleAlerts from '../components/wholesale/WholesaleAlerts'
import WholesaleBulkBar from '../components/wholesale/WholesaleBulkBar'
import WholesaleTable from '../components/wholesale/WholesaleTable'
import WholesaleCardList from '../components/wholesale/WholesaleCardList'
import WholesaleInactive from '../components/wholesale/WholesaleInactive'
import ConfirmModal from '../components/common/ConfirmModal'         // ⭐ NUEVO
import { useView } from '../context/ViewContext'
import { useWholesale } from '../context/WholesaleContext'

function inPeriod(dateIso, period, customFrom, customTo) {
  if (!dateIso) return false
  const now = new Date()
  const d = new Date(dateIso)

  if (period === 'today') return d.toDateString() === now.toDateString()
  if (period === '7d')   return (now - d) / 86400000 <= 7
  if (period === '30d')  return (now - d) / 86400000 <= 30
  if (period === 'month') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }
  if (period === 'lastMonth') {
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear()
  }
  if (period === 'quarter') {
    const q = Math.floor(now.getMonth() / 3)
    const qStart = new Date(now.getFullYear(), q * 3, 1)
    return d >= qStart
  }
  if (period === 'custom') {
    const from = customFrom ? new Date(customFrom) : null
    const to = customTo ? new Date(customTo) : null
    if (from && d < from) return false
    if (to) {
      const toEnd = new Date(to)
      toEnd.setHours(23, 59, 59, 999)
      if (d > toEnd) return false
    }
    return true
  }
  return true
}

export default function Wholesale() {
  const { navigate } = useView()
  const { wholesales, deleteWholesale } = useWholesale()             // ⭐ NUEVO

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [quickFilter, setQuickFilter] = useState('all')
  const [view, setView] = useState('list')
  const [sort, setSort] = useState({ field: 'lastPurchaseAt', direction: 'desc' })
  const [selectedIds, setSelectedIds] = useState([])
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [toast, setToast] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)              // ⭐ NUEVO
  const [deleting, setDeleting] = useState(false)                     // ⭐ NUEVO

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 200)
    return () => clearTimeout(t)
  }, [])

  // Filtros
  const filtered = useMemo(() => {
    let list = [...wholesales]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((w) =>
        (w.name || '').toLowerCase().includes(q) ||
        (w.id || '').toLowerCase().includes(q) ||
        (w.contactName || '').toLowerCase().includes(q) ||
        (w.company || '').toLowerCase().includes(q) ||
        (w.phone || '').toLowerCase().includes(q) ||
        (w.email || '').toLowerCase().includes(q),
      )
    }

    if (quickFilter === 'active')   list = list.filter((w) => w.status === 'active')
    else if (quickFilter === 'credit')   list = list.filter((w) => (Number(w.creditLimit) || 0) > 0)
    else if (quickFilter === 'balance')  list = list.filter((w) => Number(w.balance) > 0)
    else if (quickFilter === 'overdue')  list = list.filter((w) => w.overdue && Number(w.balance) > 0)
    else if (quickFilter === 'high')     list = list.filter((w) => Number(w.salesInPeriod) >= 50000)
    else if (quickFilter === 'inactive') {
      list = list.filter((w) => {
        if (!w.lastPurchaseAt) return true
        const days = (Date.now() - new Date(w.lastPurchaseAt).getTime()) / 86400000
        return days > 30
      })
    }

    const dir = sort.direction === 'asc' ? 1 : -1
    list.sort((a, b) => {
      const va = a[sort.field] ?? ''
      const vb = b[sort.field] ?? ''
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir
      return String(va).localeCompare(String(vb)) * dir
    })

    return list
  }, [wholesales, search, quickFilter, sort])

  const total = filtered.length
  const filtersActive = quickFilter !== 'all'

  const paged = useMemo(() => {
    const start = (page - 1) * perPage
    return filtered.slice(start, start + perPage)
  }, [filtered, page, perPage])

  // Stats
  const stats = useMemo(() => {
    const total = wholesales.length
    const active = wholesales.filter((w) => w.status === 'active').length
    const withCredit = wholesales.filter((w) => (Number(w.creditLimit) || 0) > 0).length
    const pendingBalance = wholesales.reduce((a, w) => a + (Number(w.balance) || 0), 0)
    const overdueCount = wholesales.filter((w) => w.overdue && Number(w.balance) > 0).length
    return { total, active, withCredit, pendingBalance, overdueCount }
  }, [wholesales])

  const secondaryStats = useMemo(() => {
    const periodFiltered = wholesales.filter((w) => inPeriod(w.lastPurchaseAt, period, customFrom, customTo))
    const sales = wholesales.reduce((a, w) => a + (Number(w.salesInPeriod) || 0), 0)
    const orders = wholesales.reduce((a, w) => a + (Number(w.ordersInPeriod) || 0), 0)
    const avg = orders > 0 ? sales / orders : 0
    const creditAvailable = wholesales.reduce((a, w) => {
      const limit = Number(w.creditLimit) || 0
      const used = Number(w.creditUsed) || 0
      return a + Math.max(0, limit - used)
    }, 0)
    return { sales, orders, avgTicket: avg, creditAvailable }
  }, [wholesales, period, customFrom, customTo])

  const creditSummary = useMemo(() => {
    const totalCredit = wholesales.reduce((a, w) => a + (Number(w.creditLimit) || 0), 0)
    const used = wholesales.reduce((a, w) => a + (Number(w.creditUsed) || 0), 0)
    const overdue = wholesales
      .filter((w) => w.overdue && Number(w.balance) > 0)
      .reduce((a, w) => a + (Number(w.balance) || 0), 0)
    return { total: totalCredit, used, available: totalCredit - used, overdue }
  }, [wholesales])

  const quickCounts = useMemo(() => ({
    all:       wholesales.length,
    active:    wholesales.filter((w) => w.status === 'active').length,
    credit:    wholesales.filter((w) => (Number(w.creditLimit) || 0) > 0).length,
    balance:   wholesales.filter((w) => Number(w.balance) > 0).length,
    overdue:   wholesales.filter((w) => w.overdue && Number(w.balance) > 0).length,
    high:      wholesales.filter((w) => Number(w.salesInPeriod) >= 50000).length,
    inactive:  wholesales.filter((w) => {
      if (!w.lastPurchaseAt) return true
      return (Date.now() - new Date(w.lastPurchaseAt).getTime()) / 86400000 > 30
    }).length,
  }), [wholesales])

  // Alerts
  const alerts = useMemo(() => {
    const list = []
    if (quickCounts.overdue > 0) {
      list.push({
        type: 'overdue',
        label: `${quickCounts.overdue} clientes con pagos vencidos`,
        filter: 'overdue',
      })
    }
    if (quickCounts.inactive > 0) {
      list.push({
        type: 'inactive',
        label: `${quickCounts.inactive} clientes sin compra en 30 días`,
        filter: 'inactive',
      })
    }
    return list
  }, [quickCounts])

  const inactiveList = useMemo(() => {
    return wholesales
      .filter((w) => {
        if (!w.lastPurchaseAt) return true
        return (Date.now() - new Date(w.lastPurchaseAt).getTime()) / 86400000 > 30
      })
      .sort((a, b) => {
        const da = a.lastPurchaseAt ? new Date(a.lastPurchaseAt) : new Date(0)
        const db = b.lastPurchaseAt ? new Date(b.lastPurchaseAt) : new Date(0)
        return da - db
      })
  }, [wholesales])

  // Handlers
  const handleNavigate = (key) => navigate(key)
  const handleSortChange = (field, direction) => setSort({ field, direction })

  const handleToggleSelect = (id) => {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
  }
  const handleToggleSelectAll = (checked) => {
    setSelectedIds(checked ? paged.map((w) => w.id) : [])
  }

  const handleClearAll = () => {
    setSearch('')
    setQuickFilter('all')
    setPeriod('month')
    setCustomFrom('')
    setCustomTo('')
    setPage(1)
  }

  const handleNew = () => {
    navigate('wholesale-new')
  }

  const handleExport = (format) => {
    setToast({
      title: 'Exportación iniciada',
      description: `Estamos preparando el archivo ${String(format).toUpperCase()}.`,
    })
  }

  const handleEdit = (w) => navigate('wholesale-edit', { id: w.id })

  const handleToggleStatus = (w, status) => {
    setToast({
      title: 'Estado actualizado',
      description: `${w.name} fue marcado como ${status}.`,
    })
  }
  const handleBlock = (w) => {
    setToast({
      title: 'Cliente bloqueado',
      description: `${w.name} fue bloqueado para operaciones mayoristas.`,
    })
  }

  // ⭐ Abrir modal de confirmación
  const handleDelete = (w) => {
    setDeleteTarget(w)
  }

  // ⭐ Confirmar y eliminar
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteWholesale(deleteTarget.id)
      setDeleting(false)
      setDeleteTarget(null)
      setToast({
        title: 'Cliente eliminado',
        description: `${deleteTarget.name} fue eliminado permanentemente.`,
      })
    } catch (err) {
      console.error('❌ Error eliminando mayorista:', err)
      setDeleting(false)
      setToast({
        title: 'Error al eliminar',
        description: err.message || 'Intenta de nuevo.',
      })
    }
  }

  return (
    <DashboardLayout
      activeKey="wholesale"
      onNavigate={handleNavigate}
      period={undefined}
      onPeriodChange={undefined}
    >
      <nav className="flex items-center gap-1.5 text-sm mb-5">
        <button
          onClick={() => navigate('customers')}
          className="text-gray-500 dark:text-dark-muted hover:text-brand-blue transition-colors font-medium"
        >
          Mayoreo
        </button>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-brand-black dark:text-dark-text font-medium">Clientes mayoristas</span>
      </nav>

      <WholesaleHeader onNew={handleNew} onExport={handleExport} />

      <WholesaleStats stats={stats} />

      <WholesaleSecondaryStats stats={secondaryStats} />

      <WholesalePeriodPicker
        period={period}
        onPeriodChange={(v) => { setPeriod(v); setPage(1) }}
        customFrom={customFrom}
        customTo={customTo}
        onCustomFromChange={setCustomFrom}
        onCustomToChange={setCustomTo}
        onApplyCustom={() => setPage(1)}
      />

      <WholesaleToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        onToggleFilters={() => console.log('Abrir filtros avanzados')}
        filtersActive={filtersActive}
        onClearFilters={handleClearAll}
        view={view}
        onViewChange={setView}
      />

      <WholesaleQuickFilters
        active={quickFilter}
        counts={quickCounts}
        onChange={(v) => { setQuickFilter(v); setPage(1) }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2">
          <WholesaleCreditSummary credit={creditSummary} />
        </div>
        <div className="lg:col-span-1">
          <WholesaleAlerts
            alerts={alerts}
            onFilterClick={(f) => { setQuickFilter(f); setPage(1) }}
          />
        </div>
      </div>

      <WholesaleBulkBar
        count={selectedIds.length}
        onClear={() => setSelectedIds([])}
        onExport={() => handleExport('excel')}
        onActivate={() => console.log('Activar seleccionados')}
        onSuspend={() => console.log('Suspender seleccionados')}
        onAssign={() => console.log('Asignar responsable')}
      />

      {view === 'list' ? (
        <div className="hidden md:block">
          <WholesaleTable
            wholesales={paged}
            loading={loading}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            sort={sort}
            onSortChange={handleSortChange}
            onEdit={handleEdit}
            onToggleStatus={handleToggleStatus}
            onBlock={handleBlock}
            onDelete={handleDelete}
            searchQuery={search}
            filtersActive={filtersActive}
            onClearAll={handleClearAll}
            page={page}
            perPage={perPage}
            total={total}
            onPageChange={setPage}
            onPerPageChange={(n) => { setPerPage(n); setPage(1) }}
            onGoToNew={handleNew}
          />
        </div>
      ) : null}

      {/* Vista cards siempre en móvil, cards también si el usuario eligió grid */}
      <div className={view === 'grid' ? 'block' : 'md:hidden'}>
        <WholesaleCardList
          wholesales={paged}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchQuery={search}
          filtersActive={filtersActive}
          onClearAll={handleClearAll}
          onGoToNew={handleNew}
        />
      </div>

      <WholesaleInactive clients={inactiveList} onView={handleEdit} />

      {/* ⭐ Modal de confirmación para eliminar */}
      <ConfirmModal
        open={!!deleteTarget}
        title="¿Eliminar cliente permanentemente?"
        description={
          deleteTarget
            ? `"${deleteTarget.name}" será eliminado junto con todo su historial. Esta acción NO se puede deshacer.`
            : ''
        }
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        tone="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
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