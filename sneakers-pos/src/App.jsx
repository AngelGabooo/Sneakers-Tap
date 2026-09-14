// src/App.jsx
import { useAuth } from './context/AuthContext'
import { useView } from './context/ViewContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
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
import UserActivity from './pages/UserActivity'      // 👈 NUEVO
import UserSessions from './pages/UserSessions'      // 👈 NUEVO
import Roles from './pages/Roles'
import RoleEditor from './pages/RoleEditor'
import Reports from './pages/Reports'
import ReportDetail from './pages/ReportDetail'
import Audit from './pages/Audit'
import Settings from './pages/Settings'

const VIEWS = {
  dashboard:              Dashboard,
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
  'user-activity':        UserActivity,   // 👈 NUEVO
  'user-sessions':        UserSessions,   // 👈 NUEVO
  roles:                  Roles,
  'role-new':             RoleEditor,
  'role-edit':            RoleEditor,
  reports:                Reports,
  'report-detail':        ReportDetail,
  audit:                  Audit,
  settings:               Settings,
}

export default function App() {
  const { isAuthenticated } = useAuth()
  const { activeView } = useView()

  if (!isAuthenticated) return <Login />

  const CurrentView = VIEWS[activeView] || Dashboard
  return <CurrentView />
}