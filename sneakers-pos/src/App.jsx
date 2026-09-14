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
}

export default function App() {
  const { isAuthenticated } = useAuth()
  const { activeView } = useView()

  if (!isAuthenticated) return <Login />

  const CurrentView = VIEWS[activeView] || Dashboard
  return <CurrentView />
}