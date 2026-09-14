/**
 * Catálogo central de tipos de reportes disponibles.
 * Sin datos: esto es solo la metadata para construir la vista.
 */

export const REPORT_CATEGORIES = [
  {
    key: 'sales',
    label: 'Ventas',
    icon: 'BarChart3',
    description: 'Analiza ingresos, tickets, productos vendidos y comportamiento de ventas.',
    reports: [
      { key: 'sales.by_period',  label: 'Ventas por periodo' },
      { key: 'sales.by_seller',  label: 'Ventas por vendedor' },
      { key: 'sales.by_product', label: 'Ventas por producto' },
      { key: 'sales.by_category',label: 'Ventas por categoría' },
      { key: 'sales.by_brand',   label: 'Ventas por marca' },
      { key: 'sales.by_branch',  label: 'Ventas por sucursal' },
      { key: 'sales.by_payment', label: 'Ventas por método de pago' },
      { key: 'sales.avg_ticket', label: 'Ticket promedio' },
      { key: 'sales.refunds',    label: 'Devoluciones y cancelaciones' },
    ],
  },
  {
    key: 'products',
    label: 'Productos',
    icon: 'Package',
    description: 'Identifica qué productos se venden mejor y cuáles tienen menor rotación.',
    reports: [
      { key: 'products.top',    label: 'Productos más vendidos' },
      { key: 'products.bottom', label: 'Productos menos vendidos' },
      { key: 'products.by_variant', label: 'Ventas por variante' },
      { key: 'products.by_category', label: 'Rendimiento por categoría' },
      { key: 'products.by_brand', label: 'Rendimiento por marca' },
    ],
  },
  {
    key: 'inventory',
    label: 'Inventario',
    icon: 'Warehouse',
    description: 'Analiza existencias, rotación, movimientos y necesidades de reposición.',
    reports: [
      { key: 'inventory.current',   label: 'Inventario actual' },
      { key: 'inventory.value',     label: 'Valor del inventario' },
      { key: 'inventory.rotation',  label: 'Rotación' },
      { key: 'inventory.low',       label: 'Stock bajo' },
      { key: 'inventory.out',       label: 'Agotados' },
      { key: 'inventory.movements', label: 'Movimientos' },
      { key: 'inventory.shrinkage', label: 'Mermas' },
      { key: 'inventory.damage',    label: 'Daños' },
      { key: 'inventory.no_move',   label: 'Sin movimiento' },
    ],
  },
  {
    key: 'purchases',
    label: 'Compras',
    icon: 'ShoppingBag',
    description: 'Analiza compras, proveedores y costos de abastecimiento.',
    reports: [
      { key: 'purchases.by_period',   label: 'Compras por periodo' },
      { key: 'purchases.by_supplier', label: 'Compras por proveedor' },
      { key: 'purchases.products',    label: 'Productos comprados' },
      { key: 'purchases.costs',       label: 'Costos de compra' },
      { key: 'purchases.received',    label: 'Recepciones' },
      { key: 'purchases.pending',     label: 'Compras pendientes' },
    ],
  },
  {
    key: 'cash',
    label: 'Caja',
    icon: 'Wallet',
    description: 'Consulta el comportamiento financiero de las cajas y sus conciliaciones.',
    reports: [
      { key: 'cash.by_register', label: 'Ventas por caja' },
      { key: 'cash.methods',     label: 'Métodos de pago' },
      { key: 'cash.movements',   label: 'Movimientos de caja' },
      { key: 'cash.differences', label: 'Diferencias de caja' },
      { key: 'cash.closures',    label: 'Cierres' },
      { key: 'cash.review',      label: 'Sobrantes y faltantes' },
    ],
  },
  {
    key: 'customers',
    label: 'Clientes',
    icon: 'Users',
    description: 'Conoce el comportamiento y valor de tus clientes.',
    reports: [
      { key: 'customers.new',       label: 'Clientes nuevos' },
      { key: 'customers.recurring', label: 'Clientes recurrentes' },
      { key: 'customers.by_client', label: 'Compras por cliente' },
      { key: 'customers.avg_ticket',label: 'Ticket promedio' },
      { key: 'customers.frequency', label: 'Frecuencia de compra' },
      { key: 'customers.inactive',  label: 'Clientes inactivos' },
    ],
  },
  {
    key: 'wholesale',
    label: 'Mayoreo',
    icon: 'UserCog',
    description: 'Analiza el rendimiento de tus clientes mayoristas y condiciones comerciales.',
    reports: [
      { key: 'wholesale.sales',       label: 'Ventas mayoristas' },
      { key: 'wholesale.by_client',   label: 'Compras por mayorista' },
      { key: 'wholesale.balance',     label: 'Saldo pendiente' },
      { key: 'wholesale.credit_used', label: 'Crédito utilizado' },
      { key: 'wholesale.credit_due',  label: 'Crédito vencido' },
      { key: 'wholesale.avg_ticket',  label: 'Ticket mayorista' },
      { key: 'wholesale.by_volume',   label: 'Clientes por volumen' },
    ],
  },
  {
    key: 'profit',
    label: 'Rentabilidad',
    icon: 'TrendingUp',
    description: 'Analiza ingresos, costos y márgenes estimados.',
    reports: [
      { key: 'profit.estimate',       label: 'Utilidad estimada' },
      { key: 'profit.by_product',     label: 'Margen por producto' },
      { key: 'profit.by_category',    label: 'Margen por categoría' },
      { key: 'profit.by_brand',       label: 'Margen por marca' },
      { key: 'profit.by_period',      label: 'Rentabilidad por periodo' },
      { key: 'profit.by_seller',      label: 'Rentabilidad por vendedor' },
      { key: 'profit.by_branch',      label: 'Rentabilidad por sucursal' },
    ],
  },
]

export const PERIOD_OPTIONS = [
  { value: 'today',     label: 'Hoy' },
  { value: 'yesterday', label: 'Ayer' },
  { value: '7d',        label: 'Últimos 7 días' },
  { value: '30d',       label: 'Últimos 30 días' },
  { value: 'month',     label: 'Este mes' },
  { value: 'lastMonth', label: 'Mes anterior' },
  { value: 'quarter',   label: 'Este trimestre' },
  { value: 'year',      label: 'Este año' },
  { value: 'custom',    label: 'Personalizado' },
]

export const COMPARE_OPTIONS = [
  { value: 'previous',  label: 'Periodo anterior' },
  { value: 'same_last', label: 'Mismo periodo anterior' },
  { value: 'custom',    label: 'Personalizado' },
]

/**
 * Filtra un arreglo de items por periodo.
 * Cada item debe tener `createdAt` (ISO) o `openedAt` / `closedAt`.
 * Reutilizable en cualquier reporte.
 */
export function filterByPeriod(items = [], period, customFrom, customTo, dateField = 'createdAt') {
  const now = new Date()
  const getDate = (it) => new Date(it[dateField] || it.createdAt || it.openedAt)

  return items.filter((it) => {
    const d = getDate(it)
    if (isNaN(d)) return false

    switch (period) {
      case 'today':
        return d.toDateString() === now.toDateString()
      case 'yesterday': {
        const y = new Date(now)
        y.setDate(y.getDate() - 1)
        return d.toDateString() === y.toDateString()
      }
      case '7d':   return (now - d) / 86400000 <= 7
      case '30d':  return (now - d) / 86400000 <= 30
      case 'month':
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      case 'lastMonth': {
        const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear()
      }
      case 'quarter': {
        const q = Math.floor(now.getMonth() / 3)
        const start = new Date(now.getFullYear(), q * 3, 1)
        return d >= start
      }
      case 'year':
        return d.getFullYear() === now.getFullYear()
      case 'custom': {
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
      default:
        return true
    }
  })
}

/**
 * Devuelve un rango de fechas según el periodo.
 */
export function getPeriodRange(period, customFrom, customTo) {
  const now = new Date()
  const endOfDay = (d) => {
    const x = new Date(d)
    x.setHours(23, 59, 59, 999)
    return x
  }
  const startOfDay = (d) => {
    const x = new Date(d)
    x.setHours(0, 0, 0, 0)
    return x
  }

  switch (period) {
    case 'today': {
      return { from: startOfDay(now), to: endOfDay(now) }
    }
    case 'yesterday': {
      const y = new Date(now)
      y.setDate(y.getDate() - 1)
      return { from: startOfDay(y), to: endOfDay(y) }
    }
    case '7d': {
      const from = new Date(now)
      from.setDate(from.getDate() - 7)
      return { from: startOfDay(from), to: endOfDay(now) }
    }
    case '30d': {
      const from = new Date(now)
      from.setDate(from.getDate() - 30)
      return { from: startOfDay(from), to: endOfDay(now) }
    }
    case 'month': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from, to: endOfDay(now) }
    }
    case 'lastMonth': {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const to   = new Date(now.getFullYear(), now.getMonth(), 0)
      return { from, to: endOfDay(to) }
    }
    case 'quarter': {
      const q = Math.floor(now.getMonth() / 3)
      const from = new Date(now.getFullYear(), q * 3, 1)
      return { from, to: endOfDay(now) }
    }
    case 'year': {
      const from = new Date(now.getFullYear(), 0, 1)
      return { from, to: endOfDay(now) }
    }
    case 'custom': {
      return {
        from: customFrom ? new Date(customFrom) : null,
        to:   customTo ? endOfDay(customTo) : null,
      }
    }
    default:
      return { from: null, to: null }
  }
}