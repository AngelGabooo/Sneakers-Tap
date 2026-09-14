import { useState } from 'react'
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

export default function Dashboard() {
  const { user } = useAuth()
  const { setActiveView } = useView()
  const [period, setPeriod] = useState('today')
  const [chartMetric, setChartMetric] = useState('sales')

  // 🚧 TODO: conectar al backend.
  const data = {
    stats: {
      salesToday:      { value: null, delta: null, compareLabel: 'vs. ayer' },
      productsSold:    { value: null, delta: null, compareLabel: 'vs. ayer' },
      estimatedProfit: { value: null, delta: null, compareLabel: 'vs. período anterior' },
      inventory:       { value: null, attention: null },
    },
    salesChart: { labels: [], series: [], currency: 'MXN' },
    cashStatus: null,
    topProducts: [],
    inventoryAlerts: [],
    recentSales: [],
    recentActivity: [],
  }

  const handleNavigate = (key) => {
    setActiveView(key)
  }

  const handleQuickAction = (key) => {
    // Mapeo de acciones rápidas a vistas existentes o futuras
    const routes = {
      'new-sale':     'pos',
      'add-product':  'products',
      'register-buy': 'purchases',
      'adjust-inv':   'inventory',
    }
    const target = routes[key]
    if (target) setActiveView(target)
    else console.log('Acción rápida pendiente:', key)
  }

  return (
    <DashboardLayout
      activeKey="dashboard"
      onNavigate={handleNavigate}
      period={period}
      onPeriodChange={setPeriod}
    >
      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
          Dashboard
        </h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
          Resumen general de tu tienda
        </p>
      </div>

      {/* Saludo + Acciones rápidas (misma fila) */}
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

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard
          icon={DollarSign}
          title="Ventas de hoy"
          value={data.stats.salesToday.value}
          delta={data.stats.salesToday.delta}
          compareLabel={data.stats.salesToday.compareLabel}
        />
        <StatCard
          icon={ShoppingBag}
          title="Productos vendidos"
          value={data.stats.productsSold.value}
          delta={data.stats.productsSold.delta}
          compareLabel={data.stats.productsSold.compareLabel}
        />
        <StatCard
          icon={TrendingUp}
          title="Ganancia estimada"
          value={data.stats.estimatedProfit.value}
          delta={data.stats.estimatedProfit.delta}
          compareLabel={data.stats.estimatedProfit.compareLabel}
        />
        <StatCard
          icon={Warehouse}
          title="Productos en inventario"
          value={data.stats.inventory.value}
          attention={data.stats.inventory.attention}
        />
      </div>

      {/* Gráfica + Estado de caja */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2">
          <SalesChart
            labels={data.salesChart.labels}
            series={data.salesChart.series}
            currency={data.salesChart.currency}
            metric={chartMetric}
            onMetricChange={setChartMetric}
          />
        </div>
        <div className="lg:col-span-1">
          <CashStatusCard cash={data.cashStatus} />
        </div>
      </div>

      {/* Productos más vendidos + Alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <TopProductsCard products={data.topProducts} />
        <InventoryAlertsCard alerts={data.inventoryAlerts} />
      </div>

      {/* Ventas recientes (ancho completo) */}
      <div className="mb-5">
        <RecentSalesCard sales={data.recentSales} />
      </div>

      {/* Actividad reciente (ancho completo) */}
      <RecentActivityCard activities={data.recentActivity} />
    </DashboardLayout>
  )
}