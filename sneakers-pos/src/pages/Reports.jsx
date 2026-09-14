import { useMemo, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Toast from '../components/common/Toast'
import ReportsHeader from '../components/reports/ReportsHeader'
import ReportsFiltersBar from '../components/reports/ReportsFiltersBar'
import ReportsKPI from '../components/reports/ReportsKPI'
import ReportsOverview from '../components/reports/ReportsOverview'
import ReportsSalesChart from '../components/reports/ReportsSalesChart'
import ReportsPaymentDistribution from '../components/reports/ReportsPaymentDistribution'
import ReportsCategoryChart from '../components/reports/ReportsCategoryChart'
import ReportsTopProducts from '../components/reports/ReportsTopProducts'
import ReportsSellersTable from '../components/reports/ReportsSellersTable'
import ReportsBranchesTable from '../components/reports/ReportsBranchesTable'
import ReportsInventoryCard from '../components/reports/ReportsInventoryCard'
import ReportsProfitCard from '../components/reports/ReportsProfitCard'
import ReportsAvailableList from '../components/reports/ReportsAvailableList'
import ReportsQuickAccess from '../components/reports/ReportsQuickAccess'
import ReportsRecent from '../components/reports/ReportsRecent'
import ReportsSkeleton from '../components/reports/ReportsSkeleton'
import ReportsEmpty from '../components/reports/ReportsEmpty'
import { useView } from '../context/ViewContext'
import { useSales } from '../context/SalesContext'
import { useProducts } from '../context/ProductsContext'
import { useUsers } from '../context/UsersContext'
import { filterByPeriod } from '../data/reports'

export default function Reports() {
  const { navigate } = useView()
  const { sales, loading: salesLoading } = useSales()
  const { products } = useProducts()
  const { users } = useUsers()

  const [period, setPeriod] = useState('month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [compare, setCompare] = useState(false)
  const [compareWith, setCompareWith] = useState('previous')
  const [toast, setToast] = useState(null)

  const loading = salesLoading

  // --------------------------------------------------------------------
  // Filtrar ventas por periodo
  // --------------------------------------------------------------------
  const periodSales = useMemo(
    () => filterByPeriod(sales, period, customFrom, customTo, 'createdAt'),
    [sales, period, customFrom, customTo],
  )

  // --------------------------------------------------------------------
  // Calcular KPIs
  // --------------------------------------------------------------------
  const kpis = useMemo(() => {
    const valid = periodSales.filter((s) => s.status !== 'cancelled')
    const netSales = valid.reduce((a, s) => a + (Number(s.total) || 0), 0)
    const salesCount = valid.length
    const avgTicket = salesCount > 0 ? netSales / salesCount : 0
    const productsSold = valid.reduce((a, s) => {
      return a + (s.items || []).reduce((b, i) => b + (Number(i.quantity) || 0), 0)
    }, 0)
    return { netSales, salesCount, avgTicket, productsSold }
  }, [periodSales])

  // --------------------------------------------------------------------
  // Resumen ejecutivo
  // --------------------------------------------------------------------
  const summary = useMemo(() => {
    const valid = periodSales.filter((s) => s.status !== 'cancelled')
    const gross = valid.reduce((a, s) => a + (Number(s.totals?.subtotal) || 0), 0)
    const discounts = valid.reduce((a, s) => a + (Number(s.totals?.discountAmount) || 0), 0)
    const refunds = periodSales
      .filter((s) => s.status === 'returned' || s.status === 'partial_return')
      .reduce((a, s) => a + (Number(s.total) || 0), 0)
    const cancellations = periodSales
      .filter((s) => s.status === 'cancelled')
      .reduce((a, s) => a + (Number(s.total) || 0), 0)
    const netSales = kpis.netSales

    // Costo estimado desde productos
    const cost = valid.reduce((a, s) => {
      const itemCost = (s.items || []).reduce((b, i) => {
        const product = products.find((p) => p.id === i.productId)
        return b + (Number(product?.costPrice) || 0) * (Number(i.quantity) || 0)
      }, 0)
      return a + itemCost
    }, 0)

    const profit = netSales - cost

    return {
      grossSales: gross,
      discounts,
      refunds,
      cancellations,
      netSales,
      profit,
      cost,
    }
  }, [periodSales, products, kpis.netSales])

  // --------------------------------------------------------------------
  // Ventas por día (para la gráfica)
  // --------------------------------------------------------------------
  const salesChartData = useMemo(() => {
    const map = new Map()
    periodSales
      .filter((s) => s.status !== 'cancelled')
      .forEach((s) => {
        const key = new Date(s.createdAt).toLocaleDateString('es-MX', {
          day: '2-digit',
          month: 'short',
        })
        const curr = map.get(key) || { date: key, netSales: 0 }
        curr.netSales += Number(s.total) || 0
        map.set(key, curr)
      })
    return Array.from(map.values())
  }, [periodSales])

  // --------------------------------------------------------------------
  // Ventas por método de pago
  // --------------------------------------------------------------------
  const paymentDistribution = useMemo(() => {
    const dist = {}
    periodSales
      .filter((s) => s.status !== 'cancelled')
      .forEach((s) => {
        const m = s.payment?.method || 'other'
        if (!dist[m]) dist[m] = { amount: 0, count: 0 }
        dist[m].amount += Number(s.total) || 0
        dist[m].count++
      })
    return dist
  }, [periodSales])

  // --------------------------------------------------------------------
  // Ventas por categoría
  // --------------------------------------------------------------------
  const categoryData = useMemo(() => {
    const map = new Map()
    periodSales
      .filter((s) => s.status !== 'cancelled')
      .forEach((s) => {
        (s.items || []).forEach((i) => {
          const product = products.find((p) => p.id === i.productId)
          const cat = product?.category || 'Sin categoría'
          const curr = map.get(cat) || 0
          map.set(cat, curr + (Number(i.price) || 0) * (Number(i.quantity) || 0))
        })
      })
    return Array.from(map.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [periodSales, products])

  // --------------------------------------------------------------------
  // Top productos
  // --------------------------------------------------------------------
  const topProducts = useMemo(() => {
    const map = new Map()
    periodSales
      .filter((s) => s.status !== 'cancelled')
      .forEach((s) => {
        (s.items || []).forEach((i) => {
          const key = i.productId || i.productName
          const curr = map.get(key) || {
            key,
            name: i.productName,
            units: 0,
            sales: 0,
            revenue: 0,
          }
          curr.units += Number(i.quantity) || 0
          curr.sales += 1
          curr.revenue += (Number(i.price) || 0) * (Number(i.quantity) || 0)
          map.set(key, curr)
        })
      })
    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }, [periodSales])

  // --------------------------------------------------------------------
  // Rendimiento por vendedor
  // --------------------------------------------------------------------
  const sellersData = useMemo(() => {
    const map = new Map()
    periodSales
      .filter((s) => s.status !== 'cancelled')
      .forEach((s) => {
        const name = s.cashier || 'Sin asignar'
        const curr = map.get(name) || {
          name,
          count: 0,
          revenue: 0,
          refunds: 0,
        }
        curr.count++
        curr.revenue += Number(s.total) || 0
        map.set(name, curr)
      })
    periodSales
      .filter((s) => s.status === 'returned' || s.status === 'cancelled')
      .forEach((s) => {
        const name = s.cashier || 'Sin asignar'
        if (map.has(name)) map.get(name).refunds++
      })
    return Array.from(map.values()).map((s) => ({
      ...s,
      avgTicket: s.count > 0 ? s.revenue / s.count : 0,
    }))
  }, [periodSales])

  // --------------------------------------------------------------------
  // Rendimiento por sucursal
  // --------------------------------------------------------------------
  const branchesData = useMemo(() => {
    const map = new Map()
    periodSales
      .filter((s) => s.status !== 'cancelled')
      .forEach((s) => {
        const name = s.branch || 'Sin sucursal'
        const curr = map.get(name) || {
          name,
          count: 0,
          revenue: 0,
          products: 0,
        }
        curr.count++
        curr.revenue += Number(s.total) || 0
        curr.products += (s.items || []).reduce((a, i) => a + (Number(i.quantity) || 0), 0)
        map.set(name, curr)
      })
    return Array.from(map.values()).map((b) => ({
      ...b,
      avgTicket: b.count > 0 ? b.revenue / b.count : 0,
    }))
  }, [periodSales])

  // --------------------------------------------------------------------
  // Inventario (estado actual)
  // --------------------------------------------------------------------
  const inventoryData = useMemo(() => {
    let units = 0
    let value = 0
    let lowStock = 0
    let outOfStock = 0
    products.forEach((p) => {
      const min = Number(p.minStock) || 3
      const variants = p.variants || []
      if (variants.length === 0) {
        const stock = Number(p.initialStock) || 0
        units += stock
        value += stock * (Number(p.costPrice) || 0)
        if (stock === 0) outOfStock++
        else if (stock <= min) lowStock++
        return
      }
      variants.forEach((v) => {
        const stock = Number(v.stock) || 0
        units += stock
        value += stock * (Number(p.costPrice) || 0)
        if (stock === 0) outOfStock++
        else if (stock <= min) lowStock++
      })
    })
    return { units, value, lowStock, outOfStock }
  }, [products])

  const showSkeleton = loading && sales.length === 0
  const showEmpty = !loading && sales.length === 0

  // --------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------
  const handleNavigate = (key) => navigate(key)

  /**
   * Abrir categoría → navega a la vista de detalle del reporte.
   */
  const handleOpenCategory = (categoryKey) => {
    navigate('report-detail', { category: categoryKey })
  }

  /**
   * Reportes rápidos → combinación de categoría + preset de filtros.
   */
  const handleQuickOpen = (quickKey) => {
    const map = {
      sales_today:     { category: 'sales',     preset: 'today' },
      sales_by_seller: { category: 'sales',     preset: 'by_seller' },
      inventory_low:   { category: 'inventory', preset: 'low' },
      profit_month:    { category: 'profit',    preset: 'month' },
      cash_diff:       { category: 'cash',      preset: 'differences' },
      top_customers:   { category: 'customers', preset: 'top' },
    }
    const route = map[quickKey] || { category: 'sales' }
    navigate('report-detail', route)
  }

  const handleExport = () => {
    setToast({
      title: 'Exportación iniciada',
      description: 'Estamos preparando el archivo con los filtros actuales.',
    })
  }

  const handleNew = () => {
    // Abre ventas como reporte default
    navigate('report-detail', { category: 'sales' })
  }

  return (
    <DashboardLayout
      activeKey="reports"
      onNavigate={handleNavigate}
      period={undefined}
      onPeriodChange={undefined}
    >
      <ReportsHeader onNew={handleNew} onExport={handleExport} />

      <ReportsFiltersBar
        period={period}
        onPeriodChange={setPeriod}
        compare={compare}
        onCompareChange={setCompare}
        compareWith={compareWith}
        onCompareWithChange={setCompareWith}
        customFrom={customFrom}
        customTo={customTo}
        onCustomFromChange={setCustomFrom}
        onCustomToChange={setCustomTo}
      />

      {showSkeleton ? (
        <ReportsSkeleton />
      ) : showEmpty ? (
        <ReportsEmpty />
      ) : (
        <>
          <ReportsKPI kpis={kpis} compare={null} />

          <ReportsOverview summary={summary} />

          <ReportsSalesChart data={salesChartData} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <ReportsPaymentDistribution payments={paymentDistribution} />
            <ReportsCategoryChart data={categoryData} />
          </div>

          <div className="mb-5">
            <ReportsTopProducts products={topProducts} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <ReportsSellersTable sellers={sellersData} />
            <ReportsBranchesTable branches={branchesData} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
            <ReportsInventoryCard inventory={inventoryData} onView={() => navigate('inventory')} />
            <ReportsProfitCard profit={summary} />
          </div>

          <ReportsQuickAccess onOpen={handleQuickOpen} />

          <ReportsAvailableList onOpen={handleOpenCategory} />

          <ReportsRecent items={[]} />
        </>
      )}

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