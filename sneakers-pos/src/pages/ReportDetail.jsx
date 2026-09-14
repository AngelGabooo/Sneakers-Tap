import { useMemo, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Toast from '../components/common/Toast'
import ReportDetailHeader from '../components/reports/ReportDetailHeader'
import ReportDetailFilters from '../components/reports/ReportDetailFilters'
import ReportDetailKPI from '../components/reports/ReportDetailKPI'
import ReportDetailChart from '../components/reports/ReportDetailChart'
import ReportDetailTable from '../components/reports/ReportDetailTable'
import ReportPrintModal from '../components/reports/ReportPrintModal'
import { useView } from '../context/ViewContext'
import { useSales } from '../context/SalesContext'
import { useProducts } from '../context/ProductsContext'
import { useUsers } from '../context/UsersContext'
import { filterByPeriod, REPORT_CATEGORIES, PERIOD_OPTIONS } from '../data/reports'

const fmtMoney = (n) =>
  `$${Number(n || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}`

export default function ReportDetail() {
  const { navigate, viewParams } = useView()
  const { sales } = useSales()
  const { products } = useProducts()
  const { users } = useUsers()

  const category = viewParams?.category || 'sales'
  const preset = viewParams?.preset || null

  const [period, setPeriod] = useState(preset === 'today' ? 'today' : 'month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [toast, setToast] = useState(null)
  const [printOpen, setPrintOpen] = useState(false)

  const categoryMeta = useMemo(
    () => REPORT_CATEGORIES.find((c) => c.key === category) || REPORT_CATEGORIES[0],
    [category],
  )

  const reportTitle = categoryMeta?.label || 'Reporte'

  const filteredSales = useMemo(
    () => filterByPeriod(sales, period, customFrom, customTo, 'createdAt'),
    [sales, period, customFrom, customTo],
  )

  // ------------------------------------------------------------------
  // Cálculos por categoría
  // ------------------------------------------------------------------
  const { kpis, chart, table } = useMemo(() => {
    // ------- VENTAS -------
    if (category === 'sales') {
      const valid = filteredSales.filter((s) => s.status !== 'cancelled')
      const netSales = valid.reduce((a, s) => a + (Number(s.total) || 0), 0)
      const count = valid.length
      const avgTicket = count > 0 ? netSales / count : 0
      const productsSold = valid.reduce(
        (a, s) => a + (s.items || []).reduce((b, i) => b + (Number(i.quantity) || 0), 0),
        0,
      )

      const dayMap = new Map()
      valid.forEach((s) => {
        const key = new Date(s.createdAt).toLocaleDateString('es-MX', {
          day: '2-digit', month: 'short',
        })
        const curr = dayMap.get(key) || { label: key, value: 0 }
        curr.value += Number(s.total) || 0
        dayMap.set(key, curr)
      })

      const rows = valid.map((s) => ({
        id: s.id,
        folio: `#${s.folio}`,
        customer: s.customerName || 'Venta general',
        items: (s.items || []).length,
        total: Number(s.total) || 0,
        payment: s.payment?.methodLabel || '—',
        cashier: s.cashier || '—',
        date: new Date(s.createdAt).toLocaleDateString('es-MX'),
      }))

      return {
        kpis: [
          { key: 'net',      label: 'Ventas netas',       value: fmtMoney(netSales),  helper: `${count} ventas` },
          { key: 'avg',      label: 'Ticket promedio',    value: fmtMoney(avgTicket), helper: 'por venta' },
          { key: 'products', label: 'Productos vendidos', value: productsSold,        helper: 'unidades' },
        ],
        chart: {
          title: 'Ventas por día',
          subtitle: 'Evolución diaria en el periodo seleccionado.',
          type: 'line',
          data: Array.from(dayMap.values()),
        },
        table: {
          columns: [
            { key: 'folio',    label: 'Folio',     emphasis: true },
            { key: 'date',     label: 'Fecha' },
            { key: 'customer', label: 'Cliente' },
            { key: 'items',    label: 'Productos', align: 'right' },
            { key: 'total',    label: 'Total', align: 'right', emphasis: true, renderPrint: (r) => fmtMoney(r.total) },
            { key: 'payment',  label: 'Método' },
            { key: 'cashier',  label: 'Cajero' },
          ],
          rows,
        },
      }
    }

    // ------- PRODUCTOS -------
    if (category === 'products') {
      const map = new Map()
      filteredSales.filter((s) => s.status !== 'cancelled').forEach((s) => {
        (s.items || []).forEach((i) => {
          const key = i.productId || i.productName
          const curr = map.get(key) || { id: key, name: i.productName, units: 0, sales: 0, revenue: 0 }
          curr.units += Number(i.quantity) || 0
          curr.sales += 1
          curr.revenue += (Number(i.price) || 0) * (Number(i.quantity) || 0)
          map.set(key, curr)
        })
      })
      const list = Array.from(map.values()).sort((a, b) => b.revenue - a.revenue)
      const totalRevenue = list.reduce((a, p) => a + p.revenue, 0)
      const totalUnits = list.reduce((a, p) => a + p.units, 0)

      return {
        kpis: [
          { key: 'revenue', label: 'Ingresos',          value: fmtMoney(totalRevenue), helper: `${list.length} productos` },
          { key: 'units',   label: 'Unidades vendidas', value: totalUnits,             helper: 'unidades' },
          { key: 'top',     label: 'Top producto',      value: list[0]?.name || '—',   helper: list[0] ? fmtMoney(list[0].revenue) : '' },
        ],
        chart: {
          title: 'Top productos por ingresos',
          subtitle: 'Los 8 productos con más ingresos.',
          type: 'bar',
          data: list.slice(0, 8).map((p) => ({ label: p.name.slice(0, 14), value: p.revenue })),
        },
        table: {
          columns: [
            { key: 'name',    label: 'Producto', emphasis: true },
            { key: 'units',   label: 'Unidades', align: 'right' },
            { key: 'sales',   label: 'Ventas',   align: 'right' },
            { key: 'revenue', label: 'Ingresos', align: 'right', emphasis: true, renderPrint: (r) => fmtMoney(r.revenue) },
          ],
          rows: list.slice(0, 20),
        },
      }
    }

    // ------- INVENTARIO -------
    if (category === 'inventory') {
      const rows = []
      products.forEach((p) => {
        const min = Number(p.minStock) || 3
        const variants = p.variants || []
        if (variants.length === 0) {
          const stock = Number(p.initialStock) || 0
          rows.push({
            id: `${p.id}__root`,
            name: p.name,
            variant: '—',
            sku: p.sku,
            stock,
            min,
            cost: Number(p.costPrice) || 0,
            value: stock * (Number(p.costPrice) || 0),
            state: stock === 0 ? 'Agotado' : stock <= min ? 'Stock bajo' : 'Normal',
          })
        } else {
          variants.forEach((v) => {
            const stock = Number(v.stock) || 0
            rows.push({
              id: `${p.id}__${v.id}`,
              name: p.name,
              variant: v.label,
              sku: v.sku,
              stock,
              min,
              cost: Number(p.costPrice) || 0,
              value: stock * (Number(p.costPrice) || 0),
              state: stock === 0 ? 'Agotado' : stock <= min ? 'Stock bajo' : 'Normal',
            })
          })
        }
      })
      const totalValue = rows.reduce((a, r) => a + r.value, 0)
      const totalUnits = rows.reduce((a, r) => a + r.stock, 0)
      const low = rows.filter((r) => r.state === 'Stock bajo').length
      const out = rows.filter((r) => r.state === 'Agotado').length

      return {
        kpis: [
          { key: 'value', label: 'Valor de inventario', value: fmtMoney(totalValue), helper: `${rows.length} variantes` },
          { key: 'units', label: 'Unidades totales',    value: totalUnits,            helper: 'en stock' },
          { key: 'low',   label: 'Stock bajo',          value: low,                   helper: 'variantes', tone: 'warning' },
          { key: 'out',   label: 'Agotados',            value: out,                   helper: 'variantes', tone: 'danger' },
        ],
        chart: null,
        table: {
          columns: [
            { key: 'name',    label: 'Producto',   emphasis: true },
            { key: 'variant', label: 'Variante' },
            { key: 'sku',     label: 'SKU' },
            { key: 'stock',   label: 'Stock',      align: 'right' },
            { key: 'min',     label: 'Mínimo',     align: 'right' },
            { key: 'value',   label: 'Valor',      align: 'right', renderPrint: (r) => fmtMoney(r.value) },
            { key: 'state',   label: 'Estado' },
          ],
          rows,
        },
      }
    }

    // ------- COMPRAS -------
    if (category === 'purchases') {
      return {
        kpis: [],
        chart: null,
        table: { columns: [], rows: [], emptyMessage: 'El módulo de compras aún no tiene registros.' },
      }
    }

    // ------- CAJA -------
    if (category === 'cash') {
      const map = new Map()
      filteredSales.forEach((s) => {
        const key = s.payment?.method || 'other'
        const curr = map.get(key) || { id: key, method: s.payment?.methodLabel || key, count: 0, amount: 0 }
        curr.count++
        curr.amount += Number(s.total) || 0
        map.set(key, curr)
      })
      const list = Array.from(map.values())
      const total = list.reduce((a, r) => a + r.amount, 0)

      return {
        kpis: [
          { key: 'methods', label: 'Métodos usados', value: list.length,       helper: 'métodos distintos' },
          { key: 'total',   label: 'Total cobrado',  value: fmtMoney(total),   helper: `${filteredSales.length} ventas` },
        ],
        chart: {
          title: 'Métodos de pago',
          subtitle: 'Distribución por método en el periodo.',
          type: 'bar',
          data: list.map((r) => ({ label: r.method, value: r.amount })),
        },
        table: {
          columns: [
            { key: 'method', label: 'Método', emphasis: true },
            { key: 'count',  label: 'Ventas', align: 'right' },
            { key: 'amount', label: 'Importe', align: 'right', emphasis: true, renderPrint: (r) => fmtMoney(r.amount) },
          ],
          rows: list,
        },
      }
    }

    // ------- CLIENTES -------
    if (category === 'customers') {
      const map = new Map()
      filteredSales.filter((s) => s.status !== 'cancelled').forEach((s) => {
        const key = s.customerId || s.customerName || 'general'
        const curr = map.get(key) || {
          id: key,
          name: s.customerName || 'Venta general',
          orders: 0,
          revenue: 0,
        }
        curr.orders++
        curr.revenue += Number(s.total) || 0
        map.set(key, curr)
      })
      const list = Array.from(map.values()).sort((a, b) => b.revenue - a.revenue)
      const totalRevenue = list.reduce((a, c) => a + c.revenue, 0)

      return {
        kpis: [
          { key: 'count', label: 'Clientes únicos',  value: list.length,             helper: 'en el periodo' },
          { key: 'total', label: 'Ingresos totales', value: fmtMoney(totalRevenue) },
          { key: 'top',   label: 'Top cliente',      value: list[0]?.name || '—',    helper: list[0] ? fmtMoney(list[0].revenue) : '' },
        ],
        chart: {
          title: 'Top clientes por ingresos',
          subtitle: 'Los 8 clientes que más compraron.',
          type: 'bar',
          data: list.slice(0, 8).map((c) => ({ label: c.name.slice(0, 14), value: c.revenue })),
        },
        table: {
          columns: [
            { key: 'name',    label: 'Cliente',  emphasis: true },
            { key: 'orders',  label: 'Pedidos',  align: 'right' },
            { key: 'revenue', label: 'Ingresos', align: 'right', emphasis: true, renderPrint: (r) => fmtMoney(r.revenue) },
          ],
          rows: list.slice(0, 20),
        },
      }
    }

    // ------- MAYOREO -------
    if (category === 'wholesale') {
      const map = new Map()
      filteredSales
        .filter((s) => s.customerType === 'wholesale' && s.status !== 'cancelled')
        .forEach((s) => {
          const key = s.customerId || s.customerName
          const curr = map.get(key) || {
            id: key,
            name: s.customerName || 'Mayorista',
            orders: 0,
            revenue: 0,
          }
          curr.orders++
          curr.revenue += Number(s.total) || 0
          map.set(key, curr)
        })
      const list = Array.from(map.values()).sort((a, b) => b.revenue - a.revenue)
      const totalRevenue = list.reduce((a, c) => a + c.revenue, 0)

      return {
        kpis: [
          { key: 'count', label: 'Mayoristas activos',  value: list.length,            helper: 'en el periodo' },
          { key: 'total', label: 'Ingresos mayoristas', value: fmtMoney(totalRevenue) },
        ],
        chart: null,
        table: {
          columns: [
            { key: 'name',    label: 'Mayorista', emphasis: true },
            { key: 'orders',  label: 'Pedidos',   align: 'right' },
            { key: 'revenue', label: 'Ingresos',  align: 'right', emphasis: true, renderPrint: (r) => fmtMoney(r.revenue) },
          ],
          rows: list,
          emptyMessage: 'No hay ventas mayoristas en el periodo.',
        },
      }
    }

    // ------- RENTABILIDAD -------
    if (category === 'profit') {
      const valid = filteredSales.filter((s) => s.status !== 'cancelled')
      const netSales = valid.reduce((a, s) => a + (Number(s.total) || 0), 0)
      const cost = valid.reduce((a, s) => {
        return a + (s.items || []).reduce((b, i) => {
          const product = products.find((p) => p.id === i.productId)
          return b + (Number(product?.costPrice) || 0) * (Number(i.quantity) || 0)
        }, 0)
      }, 0)
      const profit = netSales - cost
      const margin = netSales > 0 ? (profit / netSales) * 100 : 0

      return {
        kpis: [
          { key: 'sales',  label: 'Ingresos', value: fmtMoney(netSales), helper: `${valid.length} ventas` },
          { key: 'cost',   label: 'Costo',    value: fmtMoney(cost) },
          { key: 'profit', label: 'Utilidad', value: fmtMoney(profit),   helper: 'estimada' },
          { key: 'margin', label: 'Margen',   value: `${margin.toFixed(2)}%`, tone: margin > 30 ? 'success' : 'warning' },
        ],
        chart: null,
        table: {
          columns: [],
          rows: [],
          emptyMessage: 'El desglose de rentabilidad estará disponible cuando el backend calcule los costos históricos.',
        },
      }
    }

    return {
      kpis: [],
      chart: null,
      table: { columns: [], rows: [], emptyMessage: 'Este reporte se conectará con datos reales próximamente.' },
    }
  }, [category, filteredSales, products, users])

  const handleNavigate = (key) => navigate(key)
  const handleBack = () => navigate('reports')

  const handleExport = () => {
    setToast({
      title: 'Exportación iniciada',
      description: 'Estamos preparando el archivo con los filtros actuales.',
    })
  }

  const handlePrint = () => {
    setPrintOpen(true)
  }

  const handleSave = () => {
    setToast({
      title: 'Función pendiente',
      description: 'Guardar reportes estará disponible próximamente.',
    })
  }

  // ------------------------------------------------------------------
  // Datos para el documento imprimible
  // ------------------------------------------------------------------
  const periodLabel =
    PERIOD_OPTIONS.find((p) => p.value === period)?.label || 'Este mes'

  const printData = {
    categoryLabel: categoryMeta?.label || 'Reporte',
    reportTitle,
    periodLabel,
    filtersLabel: customFrom && customTo ? `${customFrom} a ${customTo}` : '',
    generatedAt: {
      date: new Date().toLocaleDateString('es-MX', {
        day: '2-digit', month: 'long', year: 'numeric',
      }),
      time: new Date().toLocaleTimeString('es-MX', {
        hour: '2-digit', minute: '2-digit',
      }),
    },
    generatedBy: 'Henry Sneakers',
    kpis,
    tableColumns: table.columns,
    tableRows: table.rows,
  }

  return (
    <DashboardLayout
      activeKey="reports"
      onNavigate={handleNavigate}
      period={undefined}
      onPeriodChange={undefined}
    >
      <ReportDetailHeader
        category={category}
        reportTitle={reportTitle}
        onBack={handleBack}
        onExport={handleExport}
        onPrint={handlePrint}
        onSave={handleSave}
      />

      <ReportDetailFilters
        period={period}
        onPeriodChange={setPeriod}
        customFrom={customFrom}
        customTo={customTo}
        onCustomFromChange={setCustomFrom}
        onCustomToChange={setCustomTo}
        onRefresh={() => {}}
        onClear={() => {
          setPeriod('month')
          setCustomFrom('')
          setCustomTo('')
        }}
      />

      <ReportDetailKPI kpis={kpis} />

      {chart && (
        <ReportDetailChart
          title={chart.title}
          subtitle={chart.subtitle}
          type={chart.type}
          data={chart.data}
        />
      )}

      <ReportDetailTable
        columns={table.columns}
        rows={table.rows}
        emptyMessage={table.emptyMessage}
      />

      <ReportPrintModal
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        data={printData}
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