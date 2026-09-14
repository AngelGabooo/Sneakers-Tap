// src/pages/Dashboard.jsx
import { useMemo, useState } from 'react'
import { DollarSign, ShoppingBag, TrendingUp, Warehouse } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout'
import StatCard from '../components/dashboard/StatCard'
import SalesChart from '../components/dashboard/SalesChart'
import CashStatusCard from '../components/dashboard/CashStatusCard'
import TopProductsCard from '../components/dashboard/TopProductsCard'
import InventoryAlertsCard from '../components/dashboard/InventoryAlertsCard'
import RecentSalesCard from '../components/dashboard/RecentSalesCard'
import RecentActivityCard from '../components/dashboard/RecentActivityCard'
import QuickActions from '../components/dashboard/QuickActions'
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

function endOfDay(d = new Date()) {
  const x = new Date(d)
  x.setHours(23, 59, 59, 999)
  return x
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
  /* Ventas: filtrar por periodo                                       */
  /* ---------------------------------------------------------------- */

  const periodSales = useMemo(() => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    switch (period) {
      case 'today':
        return sales.filter((s) => isSameDay(s.createdAt, today))
      case 'yesterday':
        return sales.filter((s) => isSameDay(s.createdAt, yesterday))
      case 'week': {
        const from = startOfDay(today)
        from.setDate(from.getDate() - 6)
        return sales.filter((s) => new Date(s.createdAt) >= from)
      }
      case 'month': {
        const from = new Date(today.getFullYear(), today.getMonth(), 1)
        return sales.filter((s) => new Date(s.createdAt) >= from)
      }
      case 'year': {
        const from = new Date(today.getFullYear(), 0, 1)
        return sales.filter((s) => new Date(s.createdAt) >= from)
      }
      default:
        return sales
    }
  }, [sales, period])

  /* Ventas de ayer (para delta) */
  const yesterdaySales = useMemo(() => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return sales.filter((s) => isSameDay(s.createdAt, yesterday))
  }, [sales])

  /* ---------------------------------------------------------------- */
  /* Stats principales                                                 */
  /* ---------------------------------------------------------------- */

  const stats = useMemo(() => {
    const totalToday = periodSales.reduce((acc, s) => acc + Number(s.totals?.total || 0), 0)
    const totalYesterday = yesterdaySales.reduce((acc, s) => acc + Number(s.totals?.total || 0), 0)

    const productsSoldToday = periodSales.reduce(
      (acc, s) => acc + (s.items?.reduce((a, it) => a + (it.quantity || 0), 0) || 0),
      0,
    )
    const productsSoldYesterday = yesterdaySales.reduce(
      (acc, s) => acc + (s.items?.reduce((a, it) => a + (it.quantity || 0), 0) || 0),
      0,
    )

    // Ganancia estimada: usamos (precio venta - basePrice) * cantidad
    const profitToday = periodSales.reduce((acc, s) => {
      const itemsProfit = (s.items || []).reduce((a, it) => {
        const unit = Number(it.price) || 0
        const base = Number(it.basePrice) || unit
        return a + (unit - base) * (it.quantity || 0)
      }, 0)
      return acc + itemsProfit
    }, 0)

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

    // Delta % vs ayer
    const deltaPct = (curr, prev) => {
      if (!prev) return curr > 0 ? '+100%' : null
      const diff = ((curr - prev) / prev) * 100
      const sign = diff >= 0 ? '+' : ''
      return `${sign}${diff.toFixed(0)}%`
    }

    return {
      salesToday: {
        value: formatCurrency(totalToday),
        delta: period === 'today' ? deltaPct(totalToday, totalYesterday) : null,
        compareLabel: period === 'today' ? 'vs. ayer' : 'del período',
      },
      productsSold: {
        value: productsSoldToday,
        delta: period === 'today' ? deltaPct(productsSoldToday, productsSoldYesterday) : null,
        compareLabel: period === 'today' ? 'vs. ayer' : 'del período',
      },
      estimatedProfit: {
        value: formatCurrency(profitToday),
        delta: null,
        compareLabel: 'vs. período anterior',
      },
      inventory: {
        value: totalStock,
        attention: lowStockCount > 0 ? `${lowStockCount} con stock bajo` : null,
      },
    }
  }, [periodSales, yesterdaySales, products, period])

  /* ---------------------------------------------------------------- */
  /* Gráfica de ventas: agrupar por hora/día según el periodo          */
  /* ---------------------------------------------------------------- */

  const salesChart = useMemo(() => {
    const currency = 'MXN'

    // Hoy / Ayer → agrupar por hora (0-23)
    if (period === 'today' || period === 'yesterday') {
      const labels = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}h`)
      const series = new Array(24).fill(0)
      periodSales.forEach((s) => {
        const h = new Date(s.createdAt).getHours()
        series[h] += Number(s.totals?.total || 0)
      })
      // Recortamos a las horas con datos para no mostrar 24 puntos vacíos
      const lastIdx = series.reduce((last, v, i) => (v > 0 ? i : last), -1)
      const cut = Math.max(lastIdx + 2, 8)
      return { labels: labels.slice(0, cut), series: series.slice(0, cut), currency }
    }

    // Semana / Mes → agrupar por día
    if (period === 'week' || period === 'month') {
      const days = period === 'week' ? 7 : new Date().getDate()
      const today = new Date()
      const labels = []
      const series = []

      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        const label = d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
        const total = periodSales
          .filter((s) => isSameDay(s.createdAt, d))
          .reduce((a, s) => a + Number(s.totals?.total || 0), 0)
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
        series[m] += Number(s.totals?.total || 0)
      })
      const lastIdx = series.reduce((last, v, i) => (v > 0 ? i : last), -1)
      const cut = Math.max(lastIdx + 1, 6)
      return { labels: labels.slice(0, cut), series: series.slice(0, cut), currency }
    }

    return { labels: [], series: [], currency }
  }, [periodSales, period])

  /* ---------------------------------------------------------------- */
  /* Estado de caja: sesión abierta (si existe)                        */
  /* ---------------------------------------------------------------- */

  const cashStatus = useMemo(() => {
    const open = sessions.find((s) => s.status === 'open')
    if (!open) return null

    const cashMovements = open.movements || []
    const lastMovement = cashMovements[cashMovements.length - 1]

    // Efectivo esperado = fondo inicial + ventas en efectivo + entradas - salidas
    // Nota: aquí simplificamos usando solo movimientos registrados en la sesión
    const expectedCash = cashMovements.reduce((acc, m) => {
      if (m.type === 'opening') return acc + Number(m.amount || 0)
      if (m.type === 'in') return acc + Number(m.amount || 0)
      if (m.type === 'out') return acc - Number(m.amount || 0)
      if (m.type === 'sale') return acc + Number(m.amount || 0)
      return acc
    }, 0)

    const cashSales = cashMovements
      .filter((m) => m.type === 'sale')
      .reduce((acc, m) => acc + Number(m.amount || 0), 0)

    return {
      registerId: open.cashLabel || open.cashId || 'Caja',
      status: open.status,
      responsible: open.responsibleName || '—',
      expectedCash: formatCurrency(expectedCash),
      cashSales: formatCurrency(cashSales),
      lastMovementAt: lastMovement?.at
        ? new Date(lastMovement.at).toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : '—',
    }
  }, [sessions])

  /* ---------------------------------------------------------------- */
  /* Productos más vendidos (top 5 en el periodo)                      */
  /* ---------------------------------------------------------------- */

  const topProducts = useMemo(() => {
    const map = new Map()

    periodSales.forEach((s) => {
      (s.items || []).forEach((it) => {
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
    // Los agotados primero
    return list.sort((a, b) => (a.level === b.level ? a.stock - b.stock : a.level === 'out' ? -1 : 1)).slice(0, 8)
  }, [products])

  /* ---------------------------------------------------------------- */
  /* Ventas recientes (últimas 5)                                      */
  /* ---------------------------------------------------------------- */

  const recentSales = useMemo(() => {
    return sales.slice(0, 5).map((s) => ({
      id: s.id,
      folio: s.folio,
      customer: s.customerName || 'Venta general',
      items: s.items?.reduce((a, it) => a + (it.quantity || 0), 0) || 0,
      total: formatCurrency(s.totals?.total || 0),
      method:
        s.payment?.method === 'cash' ? 'Efectivo'
        : s.payment?.method === 'card' ? 'Tarjeta'
        : s.payment?.method === 'transfer' ? 'Transferencia'
        : s.payment?.method === 'digital' ? 'Digital'
        : '—',
      cashier: s.cashier || '—',
      status: s.status || 'completed',
    }))
  }, [sales])

  /* ---------------------------------------------------------------- */
  /* Actividad reciente (mezcla ventas + movimientos)                  */
  /* ---------------------------------------------------------------- */

  const recentActivity = useMemo(() => {
    const fromSales = sales.slice(0, 5).map((s) => ({
      id: `sale-${s.id}`,
      user: s.cashier || 'Usuario',
      action: `registró la venta ${s.folio}`,
      at: new Date(s.createdAt).toLocaleString('es-MX', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      _ts: new Date(s.createdAt).getTime(),
    }))

    const fromMovements = movements.slice(0, 5).map((m) => ({
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

  const handleViewCash    = () => setActiveView('cash-current')
  const handleViewInv     = () => setActiveView('inventory')
  const handleViewSales   = () => setActiveView('sales-history')
  const handleViewTop     = () => setActiveView('products')

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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard
          icon={DollarSign}
          title="Ventas de hoy"
          value={stats.salesToday.value}
          delta={stats.salesToday.delta}
          compareLabel={stats.salesToday.compareLabel}
        />
        <StatCard
          icon={ShoppingBag}
          title="Productos vendidos"
          value={stats.productsSold.value}
          delta={stats.productsSold.delta}
          compareLabel={stats.productsSold.compareLabel}
        />
        <StatCard
          icon={TrendingUp}
          title="Ganancia estimada"
          value={stats.estimatedProfit.value}
          delta={stats.estimatedProfit.delta}
          compareLabel={stats.estimatedProfit.compareLabel}
        />
        <StatCard
          icon={Warehouse}
          title="Productos en inventario"
          value={stats.inventory.value}
          attention={stats.inventory.attention}
        />
      </div>

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
          <CashStatusCard cash={cashStatus} onView={handleViewCash} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <TopProductsCard products={topProducts} onViewAll={handleViewTop} />
        <InventoryAlertsCard alerts={inventoryAlerts} onViewInventory={handleViewInv} />
      </div>

      <div className="mb-5">
        <RecentSalesCard sales={recentSales} onViewAll={handleViewSales} />
      </div>

      <RecentActivityCard activities={recentActivity} />
    </DashboardLayout>
  )
}