// src/pages/Dashboard.jsx
import { useMemo, useState } from 'react'
import { DollarSign, ShoppingBag, TrendingUp, Warehouse, Receipt, HandCoins } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import StatCard from '../components/dashboard/StatCard'
import SalesChart from '../components/dashboard/SalesChart'
import CashStatusCard from '../components/dashboard/CashStatusCard'
import TopProductsCard from '../components/dashboard/TopProductsCard'
import InventoryAlertsCard from '../components/dashboard/InventoryAlertsCard'
import RecentSalesCard from '../components/dashboard/RecentSalesCard'
import RecentActivityCard from '../components/dashboard/RecentActivityCard'
import QuickActions from '../components/dashboard/QuickActions'
import TopCustomersCard from '../components/dashboard/TopCustomersCard'
import TopSellersCard from '../components/dashboard/TopSellersCard'
import PaymentMethodsCard from '../components/dashboard/PaymentMethodsCard'
import { useAuth } from '../context/AuthContext'
import { useView } from '../context/ViewContext'
import { useSales } from '../context/SalesContext'
import { useProducts } from '../context/ProductsContext'
import { useCash } from '../context/CashContext'
import { useMovements } from '../context/MovementsContext'

/* ------------------------------------------------------------------ */
/* Helpers de fechas                                                   */
/* ------------------------------------------------------------------ */

function startOfDay(d = new Date()) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function startOfWeek(d = new Date()) {
  const x = startOfDay(d)
  const day = x.getDay() // 0 = domingo
  const diff = day === 0 ? 6 : day - 1 // lunes como inicio
  x.setDate(x.getDate() - diff)
  return x
}

function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1)
}

function startOfPreviousMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth() - 1, 1)
}

function endOfPreviousMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59, 999)
}

function isSameDay(a, b) {
  const da = new Date(a)
  const db = new Date(b)
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  )
}

function formatCurrency(n, currency = 'MXN') {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(n) || 0)
}

/**
 * Calcula la ganancia real de una venta.
 * Usa `basePrice` como costo estimado si no hay costPrice.
 */
function computeSaleProfit(sale) {
  return (sale.items || []).reduce((acc, it) => {
    const unit = Number(it.price) || 0
    const cost = Number(it.basePrice) || unit
    return acc + (unit - cost) * (Number(it.quantity) || 0)
  }, 0)
}

/* ------------------------------------------------------------------ */
/* Componente                                                          */
/* ------------------------------------------------------------------ */

export default function Dashboard() {
  const { user } = useAuth()
  const { setActiveView } = useView()
  const { sales } = useSales()
  const { products } = useProducts()
  const { sessions } = useCash()
  const { movements } = useMovements()

  const [period, setPeriod] = useState('today')
  const [chartMetric, setChartMetric] = useState('sales')

  /* ---------------------------------------------------------------- */
  /* ⭐ Ventas filtradas por periodo (excluye canceladas)              */
  /* ---------------------------------------------------------------- */
  const periodSales = useMemo(() => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const completed = sales.filter((s) => s.status !== 'cancelled')

    switch (period) {
      case 'today':
        return completed.filter((s) => isSameDay(s.createdAt, today))
      case 'yesterday':
        return completed.filter((s) => isSameDay(s.createdAt, yesterday))
      case 'week': {
        const from = startOfWeek(today)
        return completed.filter((s) => new Date(s.createdAt) >= from)
      }
      case 'lastWeek': {
        const startThisWeek = startOfWeek(today)
        const startLastWeek = new Date(startThisWeek)
        startLastWeek.setDate(startLastWeek.getDate() - 7)
        const endLastWeek = new Date(startThisWeek)
        endLastWeek.setMilliseconds(-1)
        return completed.filter((s) => {
          const d = new Date(s.createdAt)
          return d >= startLastWeek && d <= endLastWeek
        })
      }
      case 'month': {
        const from = startOfMonth(today)
        return completed.filter((s) => new Date(s.createdAt) >= from)
      }
      case 'lastMonth': {
        const from = startOfPreviousMonth(today)
        const to = endOfPreviousMonth(today)
        return completed.filter((s) => {
          const d = new Date(s.createdAt)
          return d >= from && d <= to
        })
      }
      case 'year': {
        const from = new Date(today.getFullYear(), 0, 1)
        return completed.filter((s) => new Date(s.createdAt) >= from)
      }
      default:
        return completed
    }
  }, [sales, period])

  /* ⭐ Ventas de ayer (para delta de HOY) */
  const yesterdaySales = useMemo(() => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return sales.filter(
      (s) => s.status !== 'cancelled' && isSameDay(s.createdAt, yesterday),
    )
  }, [sales])

  /* ⭐ Ventas de la semana pasada */
  const lastWeekSales = useMemo(() => {
    const today = new Date()
    const startThisWeek = startOfWeek(today)
    const startLastWeek = new Date(startThisWeek)
    startLastWeek.setDate(startLastWeek.getDate() - 7)
    const endLastWeek = new Date(startThisWeek)
    endLastWeek.setMilliseconds(-1)
    return sales.filter((s) => {
      if (s.status === 'cancelled') return false
      const d = new Date(s.createdAt)
      return d >= startLastWeek && d <= endLastWeek
    })
  }, [sales])

  /* ⭐ Ventas del mes anterior */
  const lastMonthSales = useMemo(() => {
    const today = new Date()
    const from = startOfPreviousMonth(today)
    const to = endOfPreviousMonth(today)
    return sales.filter((s) => {
      if (s.status === 'cancelled') return false
      const d = new Date(s.createdAt)
      return d >= from && d <= to
    })
  }, [sales])

  /* ---------------------------------------------------------------- */
  /* ⭐ Stats principales + comparación con periodo anterior           */
  /* ---------------------------------------------------------------- */
  const stats = useMemo(() => {
    const totalSales = periodSales.reduce((acc, s) => acc + Number(s.total || s.totals?.total || 0), 0)
    const totalSalesYesterday = yesterdaySales.reduce((acc, s) => acc + Number(s.total || s.totals?.total || 0), 0)
    const totalSalesLastWeek = lastWeekSales.reduce((acc, s) => acc + Number(s.total || s.totals?.total || 0), 0)
    const totalSalesLastMonth = lastMonthSales.reduce((acc, s) => acc + Number(s.total || s.totals?.total || 0), 0)

    const productsSold = periodSales.reduce(
      (acc, s) => acc + (s.items?.reduce((a, it) => a + (Number(it.quantity) || 0), 0) || 0),
      0,
    )
    const productsSoldYesterday = yesterdaySales.reduce(
      (acc, s) => acc + (s.items?.reduce((a, it) => a + (Number(it.quantity) || 0), 0) || 0),
      0,
    )

    const profit = periodSales.reduce((acc, s) => acc + computeSaleProfit(s), 0)
    const profitYesterday = yesterdaySales.reduce((acc, s) => acc + computeSaleProfit(s), 0)

    const ticketAvg = periodSales.length > 0 ? totalSales / periodSales.length : 0
    const ticketAvgYesterday = yesterdaySales.length > 0 ? totalSalesYesterday / yesterdaySales.length : 0

    const totalStock = (products || []).reduce((acc, p) => {
      const variants = p.variants || []
      if (variants.length === 0) {
        return acc + (Number(p.initialStock) || 0)
      }
      return acc + variants.reduce((a, v) => a + (Number(v.stock) || 0), 0)
    }, 0)

    const lowStockCount = (products || []).reduce((acc, p) => {
      const min = Number(p.minStock) || 3
      const variants = p.variants || []
      if (variants.length === 0) {
        const s = Number(p.initialStock) || 0
        if (s > 0 && s <= min) return acc + 1
        return acc
      }
      return acc + variants.filter((v) => {
        const s = Number(v.stock) || 0
        return s > 0 && s <= min
      }).length
    }, 0)

    const deltaPct = (curr, prev) => {
      if (!prev) return curr > 0 ? { label: 'nuevo', positive: true } : null
      const diff = ((curr - prev) / prev) * 100
      return {
        label: `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`,
        positive: diff >= 0,
      }
    }

    // Comparación según el periodo seleccionado
    let salesComparison = null
    let profitComparison = null
    let ticketComparison = null

    if (period === 'today') {
      salesComparison = deltaPct(totalSales, totalSalesYesterday)
      profitComparison = deltaPct(profit, profitYesterday)
      ticketComparison = deltaPct(ticketAvg, ticketAvgYesterday)
    } else if (period === 'week') {
      salesComparison = deltaPct(totalSales, totalSalesLastWeek)
    } else if (period === 'month') {
      salesComparison = deltaPct(totalSales, totalSalesLastMonth)
    }

    return {
      sales: {
        value: formatCurrency(totalSales),
        raw: totalSales,
        delta: salesComparison,
        compareLabel:
          period === 'today' ? 'vs. ayer'
          : period === 'week' ? 'vs. semana pasada'
          : period === 'month' ? 'vs. mes pasado'
          : null,
      },
      transactions: {
        value: periodSales.length,
        raw: periodSales.length,
        compareLabel: 'transacciones',
      },
      productsSold: {
        value: productsSold,
        raw: productsSold,
        delta: period === 'today' ? deltaPct(productsSold, productsSoldYesterday) : null,
        compareLabel: period === 'today' ? 'vs. ayer' : 'productos',
      },
      profit: {
        value: formatCurrency(profit),
        raw: profit,
        delta: profitComparison,
        compareLabel: period === 'today' ? 'vs. ayer' : 'ganancia estimada',
      },
      ticketAvg: {
        value: formatCurrency(ticketAvg),
        raw: ticketAvg,
        delta: ticketComparison,
        compareLabel: period === 'today' ? 'vs. ayer' : 'ticket promedio',
      },
      inventory: {
        value: totalStock,
        attention: lowStockCount > 0 ? `${lowStockCount} con stock bajo` : null,
      },
    }
  }, [periodSales, yesterdaySales, lastWeekSales, lastMonthSales, products, period])

  /* ---------------------------------------------------------------- */
  /* Gráfica: agrupar por hora/día/mes                                 */
  /* ---------------------------------------------------------------- */
  const salesChart = useMemo(() => {
    const currency = 'MXN'

    // Hoy / Ayer → agrupar por hora (0-23)
    if (period === 'today' || period === 'yesterday') {
      const labels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}h`)
      const series = new Array(24).fill(0)
      periodSales.forEach((s) => {
        const h = new Date(s.createdAt).getHours()
        series[h] += Number(s.total || s.totals?.total || 0)
      })
      const lastIdx = series.reduce((last, v, i) => (v > 0 ? i : last), -1)
      const cut = Math.max(lastIdx + 2, 8)
      return { labels: labels.slice(0, cut), series: series.slice(0, cut), currency }
    }

    // Semana / Mes → agrupar por día
    if (period === 'week' || period === 'lastWeek' || period === 'month') {
      const today = new Date()
      const days = period === 'week' || period === 'lastWeek' ? 7 : today.getDate()
      const labels = []
      const series = []

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const label = d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
        const total = periodSales
          .filter((s) => isSameDay(s.createdAt, d))
          .reduce((a, s) => a + Number(s.total || s.totals?.total || 0), 0)
        labels.push(label)
        series.push(total)
      }
      return { labels, series, currency }
    }

    // Mes pasado → agrupar por día del mes pasado
    if (period === 'lastMonth') {
      const today = new Date()
      const daysInLastMonth = new Date(today.getFullYear(), today.getMonth(), 0).getDate()
      const labels = []
      const series = []

      for (let i = 1; i <= daysInLastMonth; i++) {
        const d = new Date(today.getFullYear(), today.getMonth() - 1, i)
        const label = d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
        const total = periodSales
          .filter((s) => isSameDay(s.createdAt, d))
          .reduce((a, s) => a + Number(s.total || s.totals?.total || 0), 0)
        labels.push(label)
        series.push(total)
      }
      return { labels, series, currency }
    }

    // Año → agrupar por mes
    if (period === 'year') {
      const labels = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      const series = new Array(12).fill(0)
      periodSales.forEach((s) => {
        const m = new Date(s.createdAt).getMonth()
        series[m] += Number(s.total || s.totals?.total || 0)
      })
      const lastIdx = series.reduce((last, v, i) => (v > 0 ? i : last), -1)
      const cut = Math.max(lastIdx + 1, 6)
      return { labels: labels.slice(0, cut), series: series.slice(0, cut), currency }
    }

    return { labels: [], series: [], currency }
  }, [periodSales, period])

  /* ---------------------------------------------------------------- */
  /* ⭐ Estado de caja                                                 */
  /* ---------------------------------------------------------------- */
  const cashStatus = useMemo(() => {
    const open = sessions.find((s) => s.status === 'open')
    if (!open) return null

    const cashMovements = open.movements || []

    // Ventas en efectivo de esta sesión
    const salesInSession = sales.filter(
      (s) => s.cashSessionId === open.id && s.status !== 'cancelled',
    )
    const cashSales = salesInSession
      .filter((s) => s.payment?.method === 'cash')
      .reduce((a, s) => a + (Number(s.total) || 0), 0)

    const cashIn = cashMovements
      .filter((m) => m.type === 'in' && m.label !== 'Apertura de caja')
      .reduce((a, m) => a + (Number(m.amount) || 0), 0)

    const cashOut = Math.abs(
      cashMovements
        .filter((m) => m.type === 'out')
        .reduce((a, m) => a + (Number(m.amount) || 0), 0),
    )

    const expectedCash =
      Number(open.initialFund || 0) + cashSales + cashIn - cashOut

    const lastMovement = cashMovements[cashMovements.length - 1]
    const lastAt = lastMovement?.at || lastMovement?.createdAt

    return {
      registerId: open.cashLabel || open.cashId || 'Caja',
      status: open.status,
      responsible: open.responsibleName || '—',
      expectedCash: formatCurrency(expectedCash),
      cashSales: formatCurrency(cashSales),
      lastMovementAt: lastAt
        ? new Date(lastAt).toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '—',
    }
  }, [sessions, sales])

  /* ---------------------------------------------------------------- */
  /* ⭐ Top productos                                                  */
  /* ---------------------------------------------------------------- */
  const topProducts = useMemo(() => {
    const map = new Map()

    periodSales.forEach((s) => {
      ;(s.items || []).forEach((it) => {
        const key = it.productId || it.productName
        if (!key) return
        const prev = map.get(key) || {
          id: key,
          name: it.productName || 'Producto',
          category: it.category || '',
          imageUrl: it.imageUrl || null,
          units: 0,
          revenue: 0,
        }
        prev.units += Number(it.quantity) || 0
        prev.revenue += (Number(it.price) || 0) * (Number(it.quantity) || 0)
        map.set(key, prev)
      })
    })

    return Array.from(map.values())
      .sort((a, b) => b.units - a.units)
      .slice(0, 5)
      .map((p) => ({
        ...p,
        revenue: formatCurrency(p.revenue),
      }))
  }, [periodSales])

  /* ---------------------------------------------------------------- */
  /* ⭐ Top clientes                                                   */
  /* ---------------------------------------------------------------- */
  const topCustomers = useMemo(() => {
    const map = new Map()

    periodSales.forEach((s) => {
      const name = s.customerName || 'Venta general'
      const prev = map.get(name) || {
        name,
        isWholesale: s.customerType === 'wholesale',
        transactions: 0,
        total: 0,
      }
      prev.transactions += 1
      prev.total += Number(s.total || s.totals?.total || 0)
      map.set(name, prev)
    })

    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((c) => ({
        ...c,
        totalFormatted: formatCurrency(c.total),
      }))
  }, [periodSales])

  /* ---------------------------------------------------------------- */
  /* ⭐ Top vendedores                                                 */
  /* ---------------------------------------------------------------- */
  const topSellers = useMemo(() => {
    const map = new Map()

    periodSales.forEach((s) => {
      const name = s.cashier || 'Usuario'
      const prev = map.get(name) || {
        name,
        transactions: 0,
        total: 0,
      }
      prev.transactions += 1
      prev.total += Number(s.total || s.totals?.total || 0)
      map.set(name, prev)
    })

    return Array.from(map.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
      .map((c) => ({
        ...c,
        totalFormatted: formatCurrency(c.total),
      }))
  }, [periodSales])

  /* ---------------------------------------------------------------- */
  /* ⭐ Ventas por método de pago                                      */
  /* ---------------------------------------------------------------- */
  const paymentMethods = useMemo(() => {
    const methods = {
      cash:     { label: 'Efectivo',      count: 0, total: 0, color: '#22C55E' },
      card:     { label: 'Tarjeta',       count: 0, total: 0, color: '#2563EB' },
      transfer: { label: 'Transferencia', count: 0, total: 0, color: '#8B5CF6' },
      digital:  { label: 'Pago digital',  count: 0, total: 0, color: '#F59E0B' },
      credit:   { label: 'Crédito',       count: 0, total: 0, color: '#EC4899' },   // ⭐ NUEVO
      other:    { label: 'Otro',          count: 0, total: 0, color: '#6B7280' },
    }

    periodSales.forEach((s) => {
      const m = s.payment?.method || 'other'
      if (!methods[m]) methods[m] = { label: 'Otro', count: 0, total: 0, color: '#6B7280' }
      methods[m].count += 1
      methods[m].total += Number(s.total || s.totals?.total || 0)
    })

    const total = Object.values(methods).reduce((a, m) => a + m.total, 0)

    return Object.entries(methods)
      .filter(([, m]) => m.count > 0)
      .map(([key, m]) => ({
        key,
        label: m.label,
        color: m.color,
        count: m.count,
        total: m.total,
        totalFormatted: formatCurrency(m.total),
        pct: total > 0 ? (m.total / total) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total)
  }, [periodSales])

  /* ---------------------------------------------------------------- */
  /* Alertas de inventario                                             */
  /* ---------------------------------------------------------------- */
  const inventoryAlerts = useMemo(() => {
    const list = []
    ;(products || []).forEach((p) => {
      const min = Number(p.minStock) || 3
      const variants = p.variants || []

      if (variants.length === 0) {
        const stock = Number(p.initialStock) || 0
        if (stock === 0) {
          list.push({ id: p.id, name: p.name, stock, level: 'out' })
        } else if (stock <= min) {
          list.push({ id: p.id, name: p.name, stock, level: 'low' })
        }
        return
      }

      variants.forEach((v) => {
        const stock = Number(v.stock) || 0
        if (stock === 0) {
          list.push({
            id: `${p.id}-${v.id}`,
            name: `${p.name} · ${v.label || ''}`.trim(),
            stock,
            level: 'out',
          })
        } else if (stock <= min) {
          list.push({
            id: `${p.id}-${v.id}`,
            name: `${p.name} · ${v.label || ''}`.trim(),
            stock,
            level: 'low',
          })
        }
      })
    })
    return list
      .sort((a, b) => (a.level === b.level ? a.stock - b.stock : a.level === 'out' ? -1 : 1))
      .slice(0, 8)
  }, [products])

  /* ---------------------------------------------------------------- */
  /* Ventas recientes                                                  */
  /* ---------------------------------------------------------------- */
  const recentSales = useMemo(() => {
    return sales
      .filter((s) => s.status !== 'cancelled')
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        folio: s.folio,
        customer: s.customerName || 'Venta general',
        items: s.items?.reduce((a, it) => a + (Number(it.quantity) || 0), 0) || 0,
        total: formatCurrency(s.total || s.totals?.total || 0),
        method:
          s.payment?.method === 'cash' ? 'Efectivo'
          : s.payment?.method === 'card' ? 'Tarjeta'
          : s.payment?.method === 'transfer' ? 'Transferencia'
          : s.payment?.method === 'digital' ? 'Digital'
          : s.payment?.method === 'credit' ? 'Crédito'   // ⭐ NUEVO
          : '—',
        cashier: s.cashier || '—',
        status: s.status || 'completed',
      }))
  }, [sales])

  /* ---------------------------------------------------------------- */
  /* Actividad reciente                                                */
  /* ---------------------------------------------------------------- */
  const recentActivity = useMemo(() => {
    const fromSales = sales
      .filter((s) => s.status !== 'cancelled')
      .slice(0, 5)
      .map((s) => ({
        id: `sale-${s.id}`,
        user: s.cashier || 'Usuario',
        action: `registró la venta ${s.folio} por ${formatCurrency(s.total || s.totals?.total || 0)}`,
        at: new Date(s.createdAt).toLocaleString('es-MX', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        _ts: new Date(s.createdAt).getTime(),
      }))

    const fromMovements = (movements || []).slice(0, 5).map((m) => ({
      id: `mov-${m.id}`,
      user: m.userName || 'Usuario',
      action: `ajustó inventario de ${m.productName || 'producto'}`,
      at: new Date(m.createdAt).toLocaleString('es-MX', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      _ts: new Date(m.createdAt).getTime(),
    }))

    return [...fromSales, ...fromMovements]
      .sort((a, b) => b._ts - a._ts)
      .slice(0, 5)
  }, [sales, movements])

  /* ---------------------------------------------------------------- */
  /* Navegación                                                        */
  /* ---------------------------------------------------------------- */
  const handleNavigate = (key) => setActiveView(key)

  const handleQuickAction = (key) => {
    const routes = {
      'new-sale':     'pos',
      'add-product':  'products',
      'register-buy': 'purchases',
      'adjust-inv':   'inventory',
    }
    const target = routes[key]
    if (target) setActiveView(target)
  }

  const handleViewCash = () => setActiveView('cash-current')
  const handleViewInv = () => setActiveView('inventory')
  const handleViewSales = () => setActiveView('sales-history')
  const handleViewTop = () => setActiveView('products')

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */
  return (
    <DashboardLayout
      activeKey="dashboard"
      onNavigate={handleNavigate}
      period={period}
      onPeriodChange={setPeriod}
    >
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
          Resumen general de tu tienda
        </p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
        <div>
          <p className="text-[15px] font-semibold text-brand-black dark:text-dark-text">
            Buenos días, {user?.name || 'Henry'} 👋
          </p>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            Aquí tienes un resumen de lo que está pasando en Sneakers.
          </p>
        </div>

        <QuickActions onAction={handleQuickAction} />
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard
          icon={DollarSign}
          title="Ventas"
          value={stats.sales.value}
          delta={stats.sales.delta?.label}
          deltaPositive={stats.sales.delta?.positive}
          compareLabel={stats.sales.compareLabel}
        />
        <StatCard
          icon={Receipt}
          title="Transacciones"
          value={stats.transactions.value}
          compareLabel={stats.transactions.compareLabel}
        />
        <StatCard
          icon={ShoppingBag}
          title="Productos vendidos"
          value={stats.productsSold.value}
          delta={stats.productsSold.delta?.label}
          deltaPositive={stats.productsSold.delta?.positive}
          compareLabel={stats.productsSold.compareLabel}
        />
        <StatCard
          icon={TrendingUp}
          title="Ganancia estimada"
          value={stats.profit.value}
          delta={stats.profit.delta?.label}
          deltaPositive={stats.profit.delta?.positive}
          compareLabel={stats.profit.compareLabel}
        />
      </div>

      {/* Segunda fila: ticket promedio + inventario */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard
          icon={DollarSign}
          title="Ticket promedio"
          value={stats.ticketAvg.value}
          delta={stats.ticketAvg.delta?.label}
          deltaPositive={stats.ticketAvg.delta?.positive}
          compareLabel={stats.ticketAvg.compareLabel}
        />
        <StatCard
          icon={Warehouse}
          title="Productos en inventario"
          value={stats.inventory.value}
          attention={stats.inventory.attention}
        />
        <div className="sm:col-span-2">
          <CashStatusCard cash={cashStatus} onView={handleViewCash} />
        </div>
      </div>

      {/* Gráfica + métodos de pago */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2">
          <SalesChart
            labels={salesChart.labels}
            series={salesChart.series}
            currency={salesChart.currency}
            metric={chartMetric}
            onMetricChange={setChartMetric}
          />
        </div>
        <div className="lg:col-span-1">
          <PaymentMethodsCard methods={paymentMethods} />
        </div>
      </div>

      {/* Top productos + alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <TopProductsCard products={topProducts} onViewAll={handleViewTop} />
        <InventoryAlertsCard alerts={inventoryAlerts} onViewInventory={handleViewInv} />
      </div>

      {/* Top clientes + vendedores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <TopCustomersCard customers={topCustomers} />
        <TopSellersCard sellers={topSellers} />
      </div>

      {/* Ventas recientes */}
      <div className="mb-5">
        <RecentSalesCard sales={recentSales} onViewAll={handleViewSales} />
      </div>

      {/* Actividad */}
      <RecentActivityCard activities={recentActivity} />
    </DashboardLayout>
  )
}