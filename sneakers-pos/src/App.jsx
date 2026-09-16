// src/App.jsx
import { useAuth } from './context/AuthContext'
import { useView } from './context/ViewContext'
import { usePermissions } from './hooks/usePermissions'
import { FALLBACK_VIEW_ORDER } from './data/viewPermissions'
import OfflineBanner from './components/common/OfflineBanner'

import Login from './pages/Login'
import NoAccess from './pages/NoAccess'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Products from './pages/Products'
import ProductCreate from './pages/ProductCreate'
import ProductEdit from './pages/ProductEdit'
import ProductDetail from './pages/ProductDetail'
import Inventory from './pages/Inventory'
import InventoryMovements from './pages/InventoryMovements'
import InventoryAdjust from './pages/InventoryAdjust'
import InventoryAlerts from './pages/InventoryAlerts'
import Pos from './pages/Pos'
import SaleDetail from './pages/SaleDetail'
import SalesHistory from './pages/SalesHistory'
import CashOpen from './pages/CashOpen'
import CashCurrent from './pages/CashCurrent'
import CashClose from './pages/CashClose'
import CashHistory from './pages/CashHistory'
import Wholesale from './pages/Wholesale'
import WholesaleDetail from './pages/WholesaleDetail'
import WholesaleNew from './pages/WholesaleNew'
import Users from './pages/Users'
import UserCreate from './pages/UserCreate'
import UserEdit from './pages/UserEdit'
import UserActivity from './pages/UserActivity'
import UserSessions from './pages/UserSessions'
import Roles from './pages/Roles'
import RoleEditor from './pages/RoleEditor'
import Reports from './pages/Reports'
import ReportDetail from './pages/ReportDetail'
import Audit from './pages/Audit'
import Settings from './pages/Settings'

const VIEWS = {
  dashboard:              Dashboard,
  profile:                Profile,
  products:               Products,
  'product-new':          ProductCreate,
  'product-edit':         ProductEdit,
  'product-detail':       ProductDetail,
  inventory:              Inventory,
  'inventory-movements':  InventoryMovements,
  'inventory-adjust':     InventoryAdjust,
  'inventory-alerts':     InventoryAlerts,
  pos:                    Pos,
  'sale-detail':          SaleDetail,
  'sales-history':        SalesHistory,
  'cash-open':            CashOpen,
  'cash-current':         CashCurrent,
  'cash-close':           CashClose,
  'cash-history':         CashHistory,
  wholesale:              Wholesale,
  'wholesale-new':        WholesaleNew,
  'wholesale-edit':       WholesaleDetail,
  users:                  Users,
  'user-new':             UserCreate,
  'user-edit':            UserEdit,
  'user-activity':        UserActivity,
  'user-sessions':        UserSessions,
  roles:                  Roles,
  'role-new':             RoleEditor,
  'role-edit':            RoleEditor,
  reports:                Reports,
  'report-detail':        ReportDetail,
  audit:                  Audit,
  settings:               Settings,
}

export default function App() {
  const { isAuthenticated, loading } = useAuth()
  const { activeView } = useView()
  const { canView } = usePermissions()

  // Pantalla de carga mientras se verifica la sesión con Supabase
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-surface dark:bg-dark-bg">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-brand-blue/20 border-t-brand-blue rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-dark-muted">Cargando…</p>
        </div>
      </div>
    )
  }

  // No autenticado → Login + banner offline
  if (!isAuthenticated) {
    return (
      <>
        <OfflineBanner />
        <Login />
      </>
    )
  }

  // Vista no existe → buscar fallback permitido
  if (!VIEWS[activeView]) {
    const fallback = FALLBACK_VIEW_ORDER.find((v) => canView(v))
    if (fallback && VIEWS[fallback]) {
      const FallbackView = VIEWS[fallback]
      return (
        <>
          <OfflineBanner />
          <FallbackView />
        </>
      )
    }
    return (
      <>
        <OfflineBanner />
        <NoAccess />
      </>
    )
  }

  // Vista existe pero no tengo permiso → sin acceso
  if (!canView(activeView)) {
    return (
      <>
        <OfflineBanner />
        <NoAccess />
      </>
    )
  }

  // Vista normal
  const CurrentView = VIEWS[activeView]
  return (
    <>
      <OfflineBanner />
      <CurrentView />
    </>
  )
}