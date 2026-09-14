/**
 * Contrato de datos del Dashboard.
 * Actualmente todo viene vacío / null.
 * Cuando conectes el backend, reemplaza estos valores con la respuesta de tu API.
 */

export const dashboardMock = {
  period: 'today',             // today | week | month | year | custom
  stats: {
    salesToday:     { value: null, delta: null, compareLabel: 'vs. ayer' },
    productsSold:   { value: null, delta: null, compareLabel: 'vs. ayer' },
    estimatedProfit:{ value: null, delta: null, compareLabel: 'vs. período anterior' },
    inventory:      { value: null, attention: null },
  },
  salesChart: {
    labels: [],                // ej: ['Lun','Mar','Mié',...]
    series: [],                // ej: [3200, 4100, ...]
    currency: 'MXN',
  },
  cashStatus: {
    registerId: null,          // 'Caja #01'
    status: 'closed',          // 'open' | 'closed'
    responsible: null,
    expectedCash: null,
    cashSales: null,
    lastMovementAt: null,
  },
  topProducts: [],             // [{ id, name, category, units, revenue, imageUrl }]
  inventoryAlerts: [],         // [{ id, name, variant, stock, level: 'low'|'out' }]
  recentSales: [],             // [{ id, folio, customer, items, total, method, cashier, status }]
  recentActivity: [],          // [{ id, user, action, at, avatarUrl }]
}