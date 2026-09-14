import { useEffect, useMemo, useState } from 'react'
import { ChevronRight, Wallet } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Toast from '../components/common/Toast'
import CashHistoryHeader from '../components/cash/history/CashHistoryHeader'
import CashHistoryStats from '../components/cash/history/CashHistoryStats'
import CashHistoryFinancial from '../components/cash/history/CashHistoryFinancial'
import CashHistoryPeriodPicker from '../components/cash/history/CashHistoryPeriodPicker'
import CashHistoryOpenCard from '../components/cash/history/CashHistoryOpenCard'
import CashHistoryToolbar from '../components/cash/history/CashHistoryToolbar'
import CashHistoryQuickFilters from '../components/cash/history/CashHistoryQuickFilters'
import CashHistoryBulkBar from '../components/cash/history/CashHistoryBulkBar'
import CashHistoryTable from '../components/cash/history/CashHistoryTable'
import CashHistoryCardList from '../components/cash/history/CashHistoryCardList'
import CashHistoryDetailDrawer from '../components/cash/history/CashHistoryDetailDrawer'
import CashHistoryEmpty from '../components/cash/history/CashHistoryEmpty'
import { useView } from '../context/ViewContext'
import { useCash } from '../context/CashContext'
import { useSales } from '../context/SalesContext'

function inPeriod(session, period, customFrom, customTo) {
  const now = new Date()
  const d = new Date(session.openedAt)

  if (period === 'today') return d.toDateString() === now.toDateString()
  if (period === 'yesterday') {
    const y = new Date(now)
    y.setDate(y.getDate() - 1)
    return d.toDateString() === y.toDateString()
  }
  if (period === '7d')  return (now - d) / (1000 * 60 * 60 * 24) <= 7
  if (period === '30d') return (now - d) / (1000 * 60 * 60 * 24) <= 30
  if (period === 'month') {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }
  if (period === 'lastMonth') {
    const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear()
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

export default function CashHistory() {
  const { navigate } = useView()
  const { sessions, getAnyOpenSession } = useCash()
  const { sales } = useSales()

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('30d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [quickFilter, setQuickFilter] = useState('all')
  const [sort, setSort] = useState({ field: 'openedAt', direction: 'desc' })
  const [selectedIds, setSelectedIds] = useState([])
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [selectedSession, setSelectedSession] = useState(null)
  const [toast, setToast] = useState(null)

  const openSession = getAnyOpenSession()

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 200)
    return () => clearTimeout(t)
  }, [])

  // Enriquecer sesiones con ventas y esperado
  const enriched = useMemo(() => {
    return sessions.map((s) => {
      const sessionSales = sales.filter(
        (x) => x.cashSessionId === s.id && x.status !== 'cancelled',
      )
      const totalSales = sessionSales.reduce((a, x) => a + (Number(x.total) || 0), 0)

      let cashSales = 0
      sessionSales.forEach((x) => {
        if (x.payment?.method === 'cash') cashSales += Number(x.total) || 0
      })

      const movements = s.movements || []
      const cashIn = movements
        .filter((m) => m.type === 'in' && m.label !== 'Apertura de caja')
        .reduce((a, m) => a + Number(m.amount || 0), 0)
      const cashOut = Math.abs(
        movements
          .filter((m) => m.type === 'out')
          .reduce((a, m) => a + Number(m.amount || 0), 0),
      )

      const expectedCash =
        Number(s.initialFund || 0) + cashSales + cashIn - cashOut

      return {
        ...s,
        totalSales,
        salesCount: sessionSales.length,
        expectedCash,
        difference: s.status === 'closed' ? (Number(s.closingFund || 0) - expectedCash) : 0,
      }
    })
  }, [sessions, sales])

  const filtered = useMemo(() => {
    let list = [...enriched]

    list = list.filter((s) => inPeriod(s, period, customFrom, customTo))

    if (quickFilter === 'open')       list = list.filter((s) => s.status === 'open')
    else if (quickFilter === 'closed') list = list.filter((s) => s.status === 'closed')
    else if (quickFilter === 'reconciled') list = list.filter((s) => s.status === 'closed' && Math.abs(s.difference) < 0.01)
    else if (quickFilter === 'shortage')   list = list.filter((s) => s.status === 'closed' && s.difference < -0.01)
    else if (quickFilter === 'surplus')    list = list.filter((s) => s.status === 'closed' && s.difference > 0.01)
    else if (quickFilter === 'review')     list = list.filter((s) => s.status === 'closed' && Math.abs(s.difference) > 0.01)

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((s) =>
        (s.id || '').toLowerCase().includes(q) ||
        (s.cashLabel || '').toLowerCase().includes(q) ||
        (s.responsibleName || '').toLowerCase().includes(q) ||
        (s.branch || '').toLowerCase().includes(q),
      )
    }

    const dir = sort.direction === 'asc' ? 1 : -1
    list.sort((a, b) => {
      const va = a[sort.field] ?? ''
      const vb = b[sort.field] ?? ''
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir
      return String(va).localeCompare(String(vb)) * dir
    })

    return list
  }, [enriched, period, customFrom, customTo, quickFilter, search, sort])

  const total = filtered.length
  const filtersActive = quickFilter !== 'all'

  const paged = useMemo(() => {
    const start = (page - 1) * perPage
    return filtered.slice(start, start + perPage)
  }, [filtered, page, perPage])

  // Métricas
  const stats = useMemo(() => {
    const total = enriched.length
    const closed = enriched.filter((s) => s.status === 'closed').length
    const reconciled = enriched.filter((s) => s.status === 'closed' && Math.abs(s.difference) < 0.01).length
    const withDifference = enriched.filter((s) => s.status === 'closed' && Math.abs(s.difference) > 0.01).length
    return { total, closed, reconciled, withDifference }
  }, [enriched])

  const financial = useMemo(() => {
    const totalSales = filtered.reduce((a, s) => a + s.totalSales, 0)
    const expected = filtered.reduce((a, s) => a + s.expectedCash, 0)
    const counted  = filtered.reduce((a, s) => a + (s.status === 'closed' ? Number(s.closingFund || 0) : 0), 0)
    const netDiff  = filtered
      .filter((s) => s.status === 'closed')
      .reduce((a, s) => a + s.difference, 0)
    return { totalSales, expected, counted, netDiff }
  }, [filtered])

  const quickCounts = useMemo(() => ({
    all:        enriched.length,
    open:       enriched.filter((s) => s.status === 'open').length,
    closed:     enriched.filter((s) => s.status === 'closed').length,
    reconciled: enriched.filter((s) => s.status === 'closed' && Math.abs(s.difference) < 0.01).length,
    shortage:   enriched.filter((s) => s.status === 'closed' && s.difference < -0.01).length,
    surplus:    enriched.filter((s) => s.status === 'closed' && s.difference > 0.01).length,
    review:     enriched.filter((s) => s.status === 'closed' && Math.abs(s.difference) > 0.01).length,
  }), [enriched])

  // Handlers
  const handleNavigate = (key) => navigate(key)
  const handleSortChange = (field, direction) => setSort({ field, direction })

  const handleToggleSelect = (id) => {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
  }
  const handleToggleSelectAll = (checked) => {
    setSelectedIds(checked ? paged.map((s) => s.id) : [])
  }

  const handleViewDetail = (s) => setSelectedSession(s)
  const handleViewSales = (s) => navigate('sales-history', { cashId: s.cashId })
  const handleViewMovements = (s) => console.log('Ver movimientos de', s.id)
  const handleViewAudit = (s) => navigate('audit', { sessionId: s.id })
  const handleExport = (format) => {
    setToast({
      title: 'Exportación iniciada',
      description: `Estamos preparando el archivo ${String(format).toUpperCase()}.`,
    })
  }
  const handleViewCurrent = () => navigate('cash-current')

  const handleClearAll = () => {
    setSearch('')
    setQuickFilter('all')
    setPeriod('30d')
    setCustomFrom('')
    setCustomTo('')
    setPage(1)
  }

  return (
    <DashboardLayout
      activeKey="cash-history"
      onNavigate={handleNavigate}
      period={undefined}
      onPeriodChange={undefined}
    >
      <nav className="flex items-center gap-1.5 text-sm mb-5">
        <button
          onClick={() => navigate('cash-current')}
          className="text-gray-500 dark:text-dark-muted hover:text-brand-blue transition-colors font-medium"
        >
          Caja
        </button>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-brand-black dark:text-dark-text font-medium">Historial de cajas</span>
      </nav>

      {loading ? (
        <div className="space-y-5">
          <div className="h-16 rounded-lg bg-gray-100 dark:bg-dark-surface animate-pulse" />
          <div className="h-20 rounded-xl bg-gray-100 dark:bg-dark-surface animate-pulse" />
          <div className="h-64 rounded-xl bg-gray-100 dark:bg-dark-surface animate-pulse" />
        </div>
      ) : (
        <>
          <CashHistoryHeader
            onExport={handleExport}
            onGoCurrent={handleViewCurrent}
            hasOpenSession={!!openSession}
          />

          <CashHistoryStats stats={stats} />

          <CashHistoryFinancial financial={financial} />

          <p className="text-[11px] text-gray-400 dark:text-dark-muted mb-4">
            Nota: Las ventas totales no equivalen al efectivo físico. Solo el efectivo físico se concilia.
          </p>

          <CashHistoryPeriodPicker
            period={period}
            onPeriodChange={(v) => { setPeriod(v); setPage(1) }}
            customFrom={customFrom}
            customTo={customTo}
            onCustomFromChange={setCustomFrom}
            onCustomToChange={setCustomTo}
            onApplyCustom={() => setPage(1)}
          />

          {openSession && (
            <CashHistoryOpenCard
              session={openSession}
              onViewCurrent={handleViewCurrent}
            />
          )}

          <CashHistoryToolbar
            search={search}
            onSearchChange={(v) => { setSearch(v); setPage(1) }}
            onToggleFilters={() => console.log('Abrir panel de filtros avanzados')}
            filtersActive={filtersActive}
            onClearFilters={handleClearAll}
          />

          <CashHistoryQuickFilters
            active={quickFilter}
            counts={quickCounts}
            onChange={(v) => { setQuickFilter(v); setPage(1) }}
          />

          <CashHistoryBulkBar
            count={selectedIds.length}
            onClear={() => setSelectedIds([])}
            onExport={() => handleExport('excel')}
          />

          {enriched.length === 0 ? (
            <CashHistoryEmpty
              onChangePeriod={() => setPeriod('month')}
              onOpenCash={() => navigate('cash-open')}
              showOpenAction={!openSession}
            />
          ) : (
            <>
              <div className="hidden md:block">
                <CashHistoryTable
                  sessions={paged}
                  loading={false}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onToggleSelectAll={handleToggleSelectAll}
                  sort={sort}
                  onSortChange={handleSortChange}
                  onViewDetail={handleViewDetail}
                  onViewSales={handleViewSales}
                  onViewMovements={handleViewMovements}
                  onViewAudit={handleViewAudit}
                  onExport={handleExport}
                  onViewCurrent={handleViewCurrent}
                  searchQuery={search}
                  filtersActive={filtersActive}
                  onClearAll={handleClearAll}
                  page={page}
                  perPage={perPage}
                  total={total}
                  onPageChange={setPage}
                  onPerPageChange={(n) => { setPerPage(n); setPage(1) }}
                  onGoToOpen={() => navigate('cash-open')}
                />
              </div>

              <div className="md:hidden">
                <CashHistoryCardList
                  sessions={paged}
                  loading={false}
                  onViewDetail={handleViewDetail}
                  searchQuery={search}
                  filtersActive={filtersActive}
                  onClearAll={handleClearAll}
                  onGoToOpen={() => navigate('cash-open')}
                />
              </div>
            </>
          )}
        </>
      )}

      <CashHistoryDetailDrawer
        open={!!selectedSession}
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
        onViewSales={handleViewSales}
        onViewMovements={handleViewMovements}
        onViewAudit={handleViewAudit}
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