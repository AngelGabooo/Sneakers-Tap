import { useEffect, useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Toast from '../components/common/Toast'
import SalesHistoryHeader from '../components/sales/history/SalesHistoryHeader'
import SalesHistoryPeriodPicker from '../components/sales/history/SalesHistoryPeriodPicker'
import SalesHistoryStats from '../components/sales/history/SalesHistoryStats'
import SalesHistoryChart from '../components/sales/history/SalesHistoryChart'
import SalesHistoryToolbar from '../components/sales/history/SalesHistoryToolbar'
import SalesHistoryQuickFilters from '../components/sales/history/SalesHistoryQuickFilters'
import SalesHistoryBulkBar from '../components/sales/history/SalesHistoryBulkBar'
import SalesHistoryTable from '../components/sales/history/SalesHistoryTable'
import SalesHistoryCardList from '../components/sales/history/SalesHistoryCardList'
import SalesHistoryCancelModal from '../components/sales/history/SalesHistoryCancelModal'
import { useView } from '../context/ViewContext'
import { useSales } from '../context/SalesContext'
import { useProducts } from '../context/ProductsContext'

const fmtCurrency = (n) =>
  `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

function inPeriod(sale, period, customFrom, customTo) {
  const now = new Date()
  const d = new Date(sale.createdAt)

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
    const to   = customTo   ? new Date(customTo)   : null
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

export default function SalesHistory() {
  const { navigate, viewParams } = useView()
  const { sales, updateSale } = useSales()
  const { products } = useProducts()

  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('30d')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [quickFilter, setQuickFilter] = useState('all')
  const [sort, setSort] = useState({ field: 'createdAt', direction: 'desc' })
  const [chartMetric, setChartMetric] = useState('amount')
  const [selectedIds, setSelectedIds] = useState([])
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const [toast, setToast] = useState(null)
  const [cancelSale, setCancelSale] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Filtros preestablecidos desde viewParams
  useEffect(() => {
    if (viewParams?.customerId) {
      setSearch(viewParams.customerName || '')
    }
    if (viewParams?.cashId) {
      setSearch(viewParams.cashId)
    }
    if (viewParams?.wholesaleId) {
      setSearch(viewParams.wholesaleName || '')
    }
  }, [viewParams])

  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 250)
    return () => clearTimeout(t)
  }, [])

  const filtered = useMemo(() => {
    let list = [...sales]

    list = list.filter((s) => inPeriod(s, period, customFrom, customTo))

    if (quickFilter !== 'all') {
      list = list.filter((s) => s.status === quickFilter)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((s) => {
        const folio = (s.folio || '').toLowerCase()
        const customer = (s.customerName || '').toLowerCase()
        const cashier = (s.cashier || '').toLowerCase()
        const ticket = `tkt-${folio.replace('vta-', '')}`
        const wholesaleName = (s.wholesaleSnapshot?.name || '').toLowerCase()
        const itemsText = (s.items || [])
          .map((i) => `${i.productName || ''} ${i.sku || ''}`)
          .join(' ')
          .toLowerCase()

        return (
          folio.includes(q) ||
          customer.includes(q) ||
          cashier.includes(q) ||
          ticket.includes(q) ||
          wholesaleName.includes(q) ||
          itemsText.includes(q)
        )
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
  }, [sales, period, customFrom, customTo, quickFilter, search, sort])

  const total = filtered.length
  const filtersActive = quickFilter !== 'all'

  const paged = useMemo(() => {
    const start = (page - 1) * perPage
    return filtered.slice(start, start + perPage)
  }, [filtered, page, perPage])

  const stats = useMemo(() => {
    const count = filtered.length
    const gross = filtered.reduce((acc, s) => acc + (Number(s.total) || 0), 0)
    const discount = filtered.reduce(
      (acc, s) => acc + (Number(s.totals?.discountAmount) || 0),
      0,
    )
    const net = gross - discount
    const avg = count > 0 ? gross / count : 0

    return {
      count,
      gross: fmtCurrency(gross),
      discount: `-${fmtCurrency(discount)}`,
      net: fmtCurrency(net),
      avgTicket: fmtCurrency(avg),
    }
  }, [filtered])

  const chartData = useMemo(() => {
    const map = new Map()
    filtered.forEach((s) => {
      const key = new Date(s.createdAt).toLocaleDateString('es-MX', {
        day: '2-digit', month: 'short',
      })
      const curr = map.get(key) || { date: key, amount: 0, count: 0 }
      curr.amount += Number(s.total) || 0
      curr.count += 1
      map.set(key, curr)
    })
    return Array.from(map.values()).reverse()
  }, [filtered])

  const quickCounts = useMemo(() => {
    const counts = {
      all: sales.length,
      completed: 0,
      pending: 0,
      partial_return: 0,
      returned: 0,
      cancelled: 0,
    }
    sales.forEach((s) => {
      if (counts[s.status] != null) counts[s.status]++
    })
    return counts
  }, [sales])

  const handleNavigate = (key) => navigate(key)
  const handleSortChange = (field, direction) => setSort({ field, direction })

  const handleToggleSelect = (id) => {
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
  }
  const handleToggleSelectAll = (checked) => {
    setSelectedIds(checked ? paged.map((s) => s.id) : [])
  }

  const goToDetail = (id) => navigate('sale-detail', { id })
  const goToNewSale = () => navigate('pos')

  const handlePrint = (sale) => {
    console.log('Imprimir ticket', sale)
    setToast({
      title: 'Impresión preparada',
      description: `Ticket de ${sale.folio} listo para imprimir.`,
    })
  }

  const handleSend = (sale) => {
    console.log('Enviar comprobante', sale)
    setToast({
      title: 'Comprobante enviado',
      description: `El comprobante de ${sale.folio} fue enviado.`,
    })
  }

  const handleReturn = (sale) => {
    console.log('Devolución', sale)
    setToast({
      title: 'Devolución',
      description: 'Función pendiente: conectar con Vista #16.',
    })
  }

  const handleCancel = (sale) => setCancelSale(sale)

  const handleConfirmCancel = ({ reason, notes }) => {
    if (!cancelSale) return
    setSubmitting(true)
    setTimeout(() => {
      updateSale(cancelSale.id, {
        status: 'cancelled',
        cancelReason: reason,
        cancelNotes: notes,
        cancelledAt: new Date().toISOString(),
        cancelledBy: 'Henry Sneakers',
      })
      setSubmitting(false)
      setCancelSale(null)
      setToast({
        title: 'Venta cancelada',
        description: `La venta ${cancelSale.folio} fue cancelada y quedó registrada en auditoría.`,
      })
    }, 500)
  }

  const handleViewAudit = (sale) => {
    console.log('Ver auditoría', sale)
    setToast({
      title: 'Auditoría',
      description: 'Función pendiente: conectar con Vista #31.',
    })
  }

  const handleExport = (format) => {
    setToast({
      title: 'Exportación iniciada',
      description: `Estamos preparando el archivo ${format.toUpperCase()} con las ventas seleccionadas.`,
    })
  }

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
      activeKey="sales-history"
      onNavigate={handleNavigate}
      period={undefined}
      onPeriodChange={undefined}
    >
      <nav className="flex items-center gap-1.5 text-sm mb-5">
        <button
          onClick={goToNewSale}
          className="text-gray-500 dark:text-dark-muted hover:text-brand-blue transition-colors font-medium"
        >
          Ventas
        </button>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="text-brand-black dark:text-dark-text font-medium">Historial de ventas</span>
      </nav>

      <SalesHistoryHeader
        onNewSale={goToNewSale}
        onExport={handleExport}
      />

      <SalesHistoryPeriodPicker
        period={period}
        onPeriodChange={(v) => { setPeriod(v); setPage(1) }}
        customFrom={customFrom}
        customTo={customTo}
        onCustomFromChange={setCustomFrom}
        onCustomToChange={setCustomTo}
        onApplyCustom={() => setPage(1)}
      />

      <SalesHistoryStats stats={stats} />

      <SalesHistoryChart
        data={chartData}
        metric={chartMetric}
        onMetricChange={setChartMetric}
      />

      <SalesHistoryToolbar
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1) }}
        onToggleFilters={() => console.log('Abrir filtros avanzados')}
        filtersActive={filtersActive}
        onClearFilters={handleClearAll}
        onToggleColumns={() => console.log('Menú de columnas')}
      />

      <SalesHistoryQuickFilters
        active={quickFilter}
        counts={quickCounts}
        onChange={(v) => { setQuickFilter(v); setPage(1) }}
      />

      <SalesHistoryBulkBar
        count={selectedIds.length}
        onClear={() => setSelectedIds([])}
        onExportExcel={() => handleExport('excel')}
        onExportCSV={() => handleExport('csv')}
        onPrintTickets={() => console.log('Imprimir tickets seleccionados')}
      />

      <div className="hidden md:block">
        <SalesHistoryTable
          sales={paged}
          loading={loading}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          sort={sort}
          onSortChange={handleSortChange}
          onViewDetail={goToDetail}
          onViewCustomer={(id) => navigate('customers', { id })}
          onPrint={handlePrint}
          onSend={handleSend}
          onReturn={handleReturn}
          onCancel={handleCancel}
          onViewAudit={handleViewAudit}
          searchQuery={search}
          filtersActive={filtersActive}
          onClearAll={handleClearAll}
          page={page}
          perPage={perPage}
          total={total}
          onPageChange={setPage}
          onPerPageChange={(n) => { setPerPage(n); setPage(1) }}
          onGoToPos={goToNewSale}
        />
      </div>

      <div className="md:hidden">
        <SalesHistoryCardList
          sales={paged}
          loading={loading}
          onViewDetail={goToDetail}
          searchQuery={search}
          filtersActive={filtersActive}
          onClearAll={handleClearAll}
          onGoToPos={goToNewSale}
        />
      </div>

      <SalesHistoryCancelModal
        open={!!cancelSale}
        sale={cancelSale}
        onClose={() => setCancelSale(null)}
        onConfirm={handleConfirmCancel}
        submitting={submitting}
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