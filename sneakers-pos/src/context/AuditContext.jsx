// src/context/AuditContext.jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useSales } from './SalesContext'
import { useMovements } from './MovementsContext'
import { useCash } from './CashContext'
import { useUsers } from './UsersContext'
import { useProducts } from './ProductsContext'
import { useRoles } from './RolesContext'
import { useWholesale } from './WholesaleContext'
import { useAuth } from './AuthContext'

const AuditContext = createContext(null)

const EMPTY_STATS = { total: 0, admin: 0, critical: 0, activeUsers: 0 }
const EMPTY_SECURITY = {
  compromised: 0,
  failedLogins: 0,
  recentPermissionChanges: 0,
  remoteLogouts: 0,
}

const DEFAULT_FILTERS = {
  user: 'all',
  module: 'all',
  action: 'all',
  result: 'all',
  level: 'all',
  entity: 'all',
  branch: 'all',
}

/** Rango de fechas según el periodo seleccionado */
function getPeriodRange(period, customFrom, customTo) {
  const now = new Date()
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)

  switch (period) {
    case 'today':      return { from: startOfDay(now), to: endOfDay(now) }
    case 'yesterday': {
      const y = new Date(now); y.setDate(y.getDate() - 1)
      return { from: startOfDay(y), to: endOfDay(y) }
    }
    case 'last7': {
      const s = new Date(now); s.setDate(s.getDate() - 6)
      return { from: startOfDay(s), to: endOfDay(now) }
    }
    case 'last30': {
      const s = new Date(now); s.setDate(s.getDate() - 29)
      return { from: startOfDay(s), to: endOfDay(now) }
    }
    case 'thisMonth':
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: endOfDay(now) }
    case 'lastMonth': {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const e = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999)
      return { from: s, to: e }
    }
    case 'thisQuarter': {
      const q = Math.floor(now.getMonth() / 3)
      return { from: new Date(now.getFullYear(), q * 3, 1), to: endOfDay(now) }
    }
    case 'thisYear':
      return { from: new Date(now.getFullYear(), 0, 1), to: endOfDay(now) }
    case 'custom':
      return {
        from: customFrom ? new Date(customFrom) : null,
        to: customTo ? new Date(`${customTo}T23:59:59.999`) : null,
      }
    default:
      return { from: null, to: null }
  }
}

/** Genera un ID de auditoría estable a partir de un prefijo + id origen */
function makeAuditId(prefix, sourceId) {
  return `AUD-${prefix}-${String(sourceId).slice(-8).toUpperCase()}`
}

export function AuditProvider({ children }) {
  const { user: currentUser } = useAuth()
  const { sales } = useSales()
  const { movements } = useMovements()
  const { sessions } = useCash()
  const { users } = useUsers()
  const { products } = useProducts()
  const { roles } = useRoles()
  const { wholesales } = useWholesale()

  const [search, setSearch] = useState('')
  const [period, setPeriod] = useState('last30')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [quickFilter, setQuickFilter] = useState('all')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)

  // -----------------------------------------------------------------
  // Derivar eventos de auditoría desde los datos locales
  // -----------------------------------------------------------------
  const allEvents = useMemo(() => {
    const list = []

    // ---- Ventas ----
    sales.forEach((s) => {
      list.push({
        id: `aud-sale-${s.id}`,
        auditId: makeAuditId('VTA', s.id),
        createdAt: s.createdAt,
        level: 'info',
        result: 'success',
        action: 'create',
        module: 'sales',
        entity: 'sale',
        entityId: s.folio,
        entityName: s.folio,
        description: `Venta registrada por $${Number(s.total || 0).toLocaleString('es-MX')}`,
        branch: s.branch || 'Tienda principal',
        user: {
          name: s.sellerName || s.userName || 'Usuario',
          role: s.sellerRole || 'Vendedor',
        },
        origin: {
          module: 'Punto de venta',
          screen: '#13',
          action: 'Registrar venta',
          device: 'Navegador web',
        },
      })

      // Si la venta tiene estado diferente a completed, agregar evento adicional
      if (s.status && s.status !== 'completed') {
        const statusMap = {
          cancelled: { action: 'cancel', level: 'critical', label: 'Venta cancelada' },
          returned:  { action: 'refund', level: 'important', label: 'Devolución total' },
          partial_return: { action: 'refund', level: 'important', label: 'Devolución parcial' },
        }
        const meta = statusMap[s.status]
        if (meta) {
          list.push({
            id: `aud-sale-status-${s.id}`,
            auditId: makeAuditId('VTA-ST', s.id),
            createdAt: s.updatedAt || s.createdAt,
            level: meta.level,
            result: 'success',
            action: meta.action,
            module: 'sales',
            entity: 'sale',
            entityId: s.folio,
            entityName: s.folio,
            description: `${meta.label} · ${s.folio}`,
            branch: s.branch || 'Tienda principal',
            user: { name: s.sellerName || 'Usuario', role: s.sellerRole || 'Vendedor' },
            reason: s.cancelReason || s.returnReason || 'Sin motivo registrado',
          })
        }
      }
    })

    // ---- Movimientos de inventario ----
    movements.forEach((m) => {
      const typeMap = {
        in:       { action: 'register', level: 'important', label: 'Entrada de inventario' },
        out:      { action: 'register', level: 'important', label: 'Salida de inventario' },
        adjust:   { action: 'adjust',   level: 'important', label: 'Ajuste de inventario' },
        return:   { action: 'refund',   level: 'info',      label: 'Devolución a inventario' },
        loss:     { action: 'adjust',   level: 'important', label: 'Merma registrada' },
        damage:   { action: 'adjust',   level: 'important', label: 'Producto dañado' },
        transfer: { action: 'adjust',   level: 'info',      label: 'Transferencia entre sucursales' },
      }
      const meta = typeMap[m.type] || typeMap.adjust
      const diff = Number(m.stockAfter || 0) - Number(m.stockBefore || 0)
      const diffLabel = diff > 0 ? `+${diff}` : `${diff}`

      list.push({
        id: `aud-mov-${m.id}`,
        auditId: makeAuditId('MOV', m.id),
        createdAt: m.createdAt,
        level: meta.level,
        result: 'success',
        action: meta.action,
        module: 'inventory',
        entity: 'inventory',
        entityId: m.id,
        entityName: m.productName ? `${m.productName}${m.variantLabel && m.variantLabel !== '—' ? ` / ${m.variantLabel}` : ''}` : m.id,
        description: `${meta.label} · Stock: ${m.stockBefore} → ${m.stockAfter} (${diffLabel})`,
        branch: m.location || 'Tienda principal',
        user: {
          name: m.userName || 'Usuario',
          role: m.userRole || 'Almacén',
        },
        origin: {
          module: 'Inventario',
          screen: '#11',
          action: meta.label,
          device: 'Navegador web',
        },
        changes: [
          { field: 'Stock', before: m.stockBefore, after: m.stockAfter },
        ],
        reason: m.reason || m.note || 'Sin motivo registrado',
      })
    })

    // ---- Cajas ----
    sessions.forEach((c) => {
      // Apertura
      list.push({
        id: `aud-cash-open-${c.id}`,
        auditId: makeAuditId('CAJ-OP', c.id),
        createdAt: c.openedAt,
        level: 'info',
        result: 'success',
        action: 'register',
        module: 'cash',
        entity: 'cash',
        entityId: c.id,
        entityName: c.cashLabel || c.id,
        description: `Apertura de caja · Fondo inicial $${Number(c.initialFund || 0).toLocaleString('es-MX')}`,
        branch: c.branch || 'Tienda principal',
        user: { name: c.responsibleName || 'Usuario', role: c.responsibleRole || 'Cajero' },
        origin: { module: 'Caja', screen: '#17', action: 'Apertura', device: 'Navegador web' },
      })

      // Cierre (si existe)
      if (c.closedAt) {
        const diff = Number(c.closingFund || 0) - Number(c.initialFund || 0)
        const isCritical = Math.abs(diff) > 0
        list.push({
          id: `aud-cash-close-${c.id}`,
          auditId: makeAuditId('CAJ-CL', c.id),
          createdAt: c.closedAt,
          level: isCritical ? 'important' : 'info',
          result: 'success',
          action: 'logout',
          module: 'cash',
          entity: 'cash',
          entityId: c.id,
          entityName: c.cashLabel || c.id,
          description: `Cierre de caja · Diferencia $${diff.toLocaleString('es-MX')}`,
          branch: c.branch || 'Tienda principal',
          user: { name: c.closedBy || c.responsibleName || 'Usuario', role: c.responsibleRole || 'Cajero' },
          origin: { module: 'Caja', screen: '#19', action: 'Cierre', device: 'Navegador web' },
        })
      }
    })

    // ---- Usuarios ----
    users.forEach((u) => {
      list.push({
        id: `aud-user-${u.id}`,
        auditId: makeAuditId('USR', u.id),
        createdAt: u.createdAt,
        level: 'important',
        result: 'success',
        action: 'create',
        module: 'users',
        entity: 'user',
        entityId: u.employeeId || u.id,
        entityName: u.fullName,
        description: `Usuario creado · Rol: ${u.role} · Sucursal: ${u.branch}`,
        branch: u.branch || 'Tienda principal',
        user: { name: u.createdBy || 'Sistema', role: 'Administrador' },
        origin: { module: 'Usuarios', screen: '#28', action: 'Crear usuario', device: 'Navegador web' },
      })
    })

    // ---- Productos ----
    products.forEach((p) => {
      list.push({
        id: `aud-product-${p.id}`,
        auditId: makeAuditId('PRD', p.id),
        createdAt: p.createdAt,
        level: 'info',
        result: 'success',
        action: 'create',
        module: 'products',
        entity: 'product',
        entityId: p.id,
        entityName: p.name,
        description: `Producto creado · Precio $${Number(p.salePrice || 0).toLocaleString('es-MX')}`,
        branch: 'Tienda principal',
        user: { name: p.updatedBy || 'Usuario', role: 'Almacén' },
        origin: { module: 'Productos', screen: '#4', action: 'Crear producto', device: 'Navegador web' },
      })

      // Si fue editado (updatedAt distinto a createdAt)
      if (p.updatedAt && p.updatedAt !== p.createdAt) {
        list.push({
          id: `aud-product-upd-${p.id}`,
          auditId: makeAuditId('PRD-UP', p.id),
          createdAt: p.updatedAt,
          level: 'info',
          result: 'success',
          action: 'update',
          module: 'products',
          entity: 'product',
          entityId: p.id,
          entityName: p.name,
          description: `Producto editado · ${p.name}`,
          branch: 'Tienda principal',
          user: { name: p.updatedBy || 'Usuario', role: 'Almacén' },
        })
      }
    })

    // ---- Roles ----
    roles.forEach((r) => {
      // Solo mostrar los roles custom, para no inundar con los del sistema
      if (r.type === 'custom') {
        list.push({
          id: `aud-role-${r.id}`,
          auditId: makeAuditId('ROL', r.id),
          createdAt: r.createdAt,
          level: 'critical',
          result: 'success',
          action: 'permissions',
          module: 'roles',
          entity: 'role',
          entityId: r.id,
          entityName: r.name,
          description: `Rol creado · ${r.permissions?.length || 0} permisos asignados`,
          branch: 'Tienda principal',
          user: { name: r.createdBy || 'Administrador', role: 'Administrador' },
          origin: { module: 'Roles y permisos', screen: '#29', action: 'Crear rol', device: 'Navegador web' },
          reason: r.description || 'Sin motivo registrado',
        })
      }
    })

    // ---- Clientes mayoristas ----
    wholesales.forEach((w) => {
      list.push({
        id: `aud-wholesale-${w.id}`,
        auditId: makeAuditId('MAY', w.id),
        createdAt: w.createdAt,
        level: 'important',
        result: 'success',
        action: 'create',
        module: 'wholesale',
        entity: 'customer',
        entityId: w.id,
        entityName: w.businessName || w.name || w.id,
        description: `Cliente mayorista registrado · Descuento ${w.defaultDiscount || 0}%`,
        branch: 'Tienda principal',
        user: { name: currentUser?.name || 'Usuario', role: currentUser?.role || 'Administrador' },
        origin: { module: 'Mayoreo', screen: '#26', action: 'Crear mayorista', device: 'Navegador web' },
      })
    })

    // Ordenar más recientes primero
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [sales, movements, sessions, users, products, roles, wholesales, currentUser])

  // -----------------------------------------------------------------
  // Aplicar filtros: búsqueda, periodo, quick filter y filtros avanzados
  // -----------------------------------------------------------------
  const filteredEvents = useMemo(() => {
    const { from, to } = getPeriodRange(period, customFrom, customTo)

    return allEvents.filter((e) => {
      // Periodo
      if (from || to) {
        const t = new Date(e.createdAt).getTime()
        if (from && t < from.getTime()) return false
        if (to && t > to.getTime()) return false
      }

      // Búsqueda libre
      if (search) {
        const q = search.toLowerCase()
        const haystack = [
          e.user?.name,
          e.action,
          e.module,
          e.entityId,
          e.entityName,
          e.description,
          e.branch,
        ].filter(Boolean).join(' ').toLowerCase()
        if (!haystack.includes(q)) return false
      }

      // Filtros avanzados
      if (filters.module !== 'all' && e.module !== filters.module) return false
      if (filters.action !== 'all' && e.action !== filters.action) return false
      if (filters.result !== 'all' && e.result !== filters.result) return false
      if (filters.level !== 'all' && e.level !== filters.level) return false
      if (filters.entity !== 'all' && e.entity !== filters.entity) return false
      if (filters.branch !== 'all' && e.branch !== filters.branch) return false
      if (filters.user !== 'all') {
        if (filters.user === 'current') {
          if (e.user?.name !== currentUser?.name) return false
        }
      }

      // Quick filter
      switch (quickFilter) {
        case 'today': {
          const today = new Date(); today.setHours(0, 0, 0, 0)
          if (new Date(e.createdAt).getTime() < today.getTime()) return false
          break
        }
        case 'critical':
          if (e.level !== 'critical') return false
          break
        case 'admin':
          if (!['users', 'roles', 'settings'].includes(e.module)) return false
          break
        case 'sales':
          if (e.module !== 'sales') return false
          break
        case 'inventory':
          if (e.module !== 'inventory') return false
          break
        case 'cash':
          if (e.module !== 'cash') return false
          break
        case 'security':
          if (e.level !== 'security') return false
          break
        case 'export':
          if (e.action !== 'export') return false
          break
        default:
          break
      }

      return true
    })
  }, [allEvents, period, customFrom, customTo, search, filters, quickFilter, currentUser])

  // -----------------------------------------------------------------
  // Stats y security derivados
  // -----------------------------------------------------------------
  const stats = useMemo(() => {
    const total = filteredEvents.length
    const admin = filteredEvents.filter((e) => ['users', 'roles', 'settings'].includes(e.module)).length
    const critical = filteredEvents.filter((e) => e.level === 'critical').length
    const activeUsers = new Set(
      filteredEvents.map((e) => e.user?.name).filter(Boolean)
    ).size
    return { total, admin, critical, activeUsers }
  }, [filteredEvents])

  const security = useMemo(() => {
    const failedLogins = allEvents.filter(
      (e) => e.module === 'auth' && e.result === 'rejected'
    ).length
    const recentPermissionChanges = allEvents.filter(
      (e) => e.module === 'roles' && e.action === 'permissions'
    ).length
    const remoteLogouts = allEvents.filter(
      (e) => e.action === 'logout' && e.module !== 'cash'
    ).length
    return {
      compromised: 0,
      failedLogins,
      recentPermissionChanges,
      remoteLogouts,
    }
  }, [allEvents])

  // -----------------------------------------------------------------
  // Paginación
  // -----------------------------------------------------------------
  const total = filteredEvents.length
  const events = useMemo(() => {
    const start = (page - 1) * perPage
    return filteredEvents.slice(start, start + perPage)
  }, [filteredEvents, page, perPage])

  // -----------------------------------------------------------------
  // Acciones
  // -----------------------------------------------------------------
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS)
    setSearch('')
    setQuickFilter('all')
    setPeriod('last30')
    setCustomFrom('')
    setCustomTo('')
    setPage(1)
  }, [])

  // Reset page al cambiar filtros
  useEffect(() => { setPage(1) }, [search, period, customFrom, customTo, quickFilter, filters])

  const value = {
    events,
    stats,
    security,
    loading: false,
    error: null,
    total,
    search, setSearch,
    period, setPeriod,
    customFrom, setCustomFrom,
    customTo, setCustomTo,
    quickFilter, setQuickFilter,
    filters, setFilters,
    page, setPage,
    perPage, setPerPage,
    resetFilters,
  }

  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>
}

export function useAudit() {
  const ctx = useContext(AuditContext)
  if (!ctx) throw new Error('useAudit debe usarse dentro de AuditProvider')
  return ctx
}