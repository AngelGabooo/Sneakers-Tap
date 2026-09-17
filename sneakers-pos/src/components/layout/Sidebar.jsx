// src/components/layout/Sidebar.jsx
import { useMemo } from 'react'
import {
  LayoutDashboard, ShoppingCart, Package, Warehouse, ShoppingBag,
  Wallet, Users, UserCog, ShieldCheck, BarChart3, Bell,
  History, Settings, X, Activity, AlertTriangle, SlidersHorizontal,
  Receipt,
} from 'lucide-react'
import SneakersLogo from '../login/SneakersLogo'
import ThemeToggle from '../common/ThemeToggle'
import { useProducts } from '../../context/ProductsContext'
import { usePermissions } from '../../hooks/usePermissions'

const NAV_SECTIONS = [
  {
    label: 'Principal',
    items: [
      { key: 'dashboard',     label: 'Dashboard',           icon: LayoutDashboard, permission: 'dashboard.view' },
      { key: 'pos',           label: 'Punto de venta',      icon: ShoppingCart,    permission: 'pos.access' },
      { key: 'sales-history', label: 'Historial de ventas', icon: Receipt,         permission: 'sales.view' },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { key: 'products', label: 'Productos', icon: Package, permission: 'products.view' },
    ],
  },
  {
    label: 'Inventario',
    items: [
      { key: 'inventory',           label: 'Inventario general', icon: Warehouse,          permission: 'inventory.view' },
      { key: 'inventory-movements', label: 'Movimientos',        icon: Activity,           permission: 'inventory.movements' },
      { key: 'inventory-adjust',    label: 'Ajuste',             icon: SlidersHorizontal,  permission: 'inventory.adjust' },
      { key: 'inventory-alerts',    label: 'Alertas de stock',   icon: AlertTriangle,      permission: 'inventory.view', badge: 'alerts' },
    ],
  },
  {
    label: 'Compras',
    items: [
      { key: 'purchases', label: 'Compras', icon: ShoppingBag, permission: 'purchases.view' },
    ],
  },
  {
    label: 'Caja',
    items: [
      { key: 'cash-open',    label: 'Apertura de caja',   icon: Wallet,  permission: 'cash.open' },
      { key: 'cash-current', label: 'Caja actual',        icon: Wallet,  permission: 'cash.view' },
      { key: 'cash-close',   label: 'Cierre de caja',     icon: Wallet,  permission: 'cash.close' },
      { key: 'cash-history', label: 'Historial de cajas', icon: History, permission: 'cash.history' },
    ],
  },
  {
    label: 'Operación',
    items: [
      { key: 'wholesale', label: 'Clientes mayoristas', icon: UserCog, permission: 'wholesale.view' },
    ],
  },
  {
    label: 'Administración',
    items: [
      { key: 'users',   label: 'Usuarios y empleados', icon: Users,        permission: 'users.view' },
      { key: 'roles',   label: 'Roles y permisos',     icon: ShieldCheck,  permission: 'roles.view' },
      { key: 'reports', label: 'Reportes',             icon: BarChart3,    permission: 'reports.view' },
      { key: 'audit',   label: 'Historial y auditoría', icon: History,     permission: 'audit.view' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { key: 'settings', label: 'Configuración', icon: Settings, permission: 'settings.view' },
    ],
  },
]

export default function Sidebar({ activeKey = 'dashboard', onNavigate, mobileOpen, onCloseMobile, user }) {
  const { products } = useProducts()
  const { can } = usePermissions()

  /**
   * Cuenta global de alertas de stock (agotados + stock bajo).
   */
  const alertCount = useMemo(() => {
    let count = 0
    ;(products || []).forEach((p) => {
      const min = Number(p.minStock) || 3
      const variants = p.variants || []

      if (variants.length === 0) {
        const s = Number(p.initialStock) || 0
        if (s === 0 || s <= min) count++
        return
      }

      variants.forEach((v) => {
        const s = Number(v.stock) || 0
        if (s === 0 || s <= min) count++
      })
    })
    return count
  }, [products])

  /**
   * Filtra las secciones según permisos del usuario.
   * Una sección que queda vacía no se muestra.
   */
  const visibleSections = useMemo(() => {
    return NAV_SECTIONS
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => can(item.permission)),
      }))
      .filter((section) => section.items.length > 0)
  }, [can])

  const handleClick = (key) => {
    onNavigate?.(key)
    onCloseMobile?.()
  }

  return (
    <>
      {/* Overlay móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* ⭐ Añadido: safe-sidebar (respeta notch arriba y home indicator abajo en móvil) */}
      <aside
        className={`
          safe-sidebar
          fixed lg:sticky top-0 left-0 z-50
          h-screen w-72 shrink-0
          flex flex-col
          bg-white dark:bg-dark-surface
          border-r border-gray-200 dark:border-dark-border
          transition-transform duration-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-gray-100 dark:border-dark-border">
          <SneakersLogo variant="dark" />
          <button
            className="lg:hidden text-gray-500 hover:text-brand-black dark:hover:text-dark-text"
            onClick={onCloseMobile}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {visibleSections.length === 0 ? (
            <p className="px-3 py-6 text-xs text-gray-500 dark:text-dark-muted text-center">
              No tienes acceso a ningún módulo.
            </p>
          ) : (
            visibleSections.map((section) => (
              <div key={section.label}>
                <p className="px-3 mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-dark-muted">
                  {section.label}
                </p>
                <ul className="space-y-0.5">
                  {section.items.map(({ key, label, icon: Icon, badge }) => {
                    const active = key === activeKey
                    const showBadge = badge === 'alerts' && alertCount > 0

                    return (
                      <li key={key}>
                        <button
                          type="button"
                          onClick={() => handleClick(key)}
                          className={`
                            w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium
                            transition-colors duration-150
                            ${active
                              ? 'bg-blue-50 text-brand-blue dark:bg-blue-950/40 dark:text-blue-300'
                              : 'text-gray-700 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-card hover:text-brand-black dark:hover:text-dark-text'}
                          `}
                        >
                          <Icon size={18} strokeWidth={1.9} />
                          <span className="truncate flex-1 text-left">{label}</span>
                          {showBadge && (
                            <span className={`
                              inline-flex items-center justify-center
                              h-5 min-w-[20px] px-1.5 rounded-full
                              text-[11px] font-semibold
                              ${active
                                ? 'bg-brand-blue text-white'
                                : 'bg-brand-red text-white'}
                            `}>
                              {alertCount > 99 ? '99+' : alertCount}
                            </span>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))
          )}
        </nav>

        {/* Theme toggle + Perfil */}
        <div className="p-3 border-t border-gray-100 dark:border-dark-border space-y-3">
          <div className="flex justify-center">
            <ThemeToggle variant="full" />
          </div>

          <button
            type="button"
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-card transition-colors text-left"
          >
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-brand-blue text-white flex items-center justify-center font-semibold text-sm">
                {(user?.name?.[0] || 'H').toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-dark-surface" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-brand-black dark:text-dark-text truncate">
                {user?.name || 'Henry'}
              </p>
              <p className="text-xs text-gray-500 dark:text-dark-muted truncate">
                {user?.email || 'henry@sneakers.com'}
              </p>
            </div>
          </button>
        </div>
      </aside>
    </>
  )
}