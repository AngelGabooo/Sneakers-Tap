import {
  BarChart3, Package, Warehouse, ShoppingBag, Wallet,
  Users, UserCog, TrendingUp, ArrowRight,
} from 'lucide-react'
import Card from '../common/Card'
import { REPORT_CATEGORIES } from '../../data/reports'

const ICONS = {
  BarChart3: BarChart3,
  Package: Package,
  Warehouse: Warehouse,
  ShoppingBag: ShoppingBag,
  Wallet: Wallet,
  Users: Users,
  UserCog: UserCog,
  TrendingUp: TrendingUp,
}

export default function ReportsAvailableList({ onOpen }) {
  return (
    <Card className="mb-5">
      <header className="mb-4">
        <h3 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          ¿Qué quieres analizar?
        </h3>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Selecciona una categoría para ver los reportes disponibles.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {REPORT_CATEGORIES.map((cat) => {
          const Icon = ICONS[cat.icon] || BarChart3
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => onOpen?.(cat.key)}
              className="
                flex items-start gap-3 p-4 rounded-lg border text-left
                border-gray-200 dark:border-dark-border
                bg-white dark:bg-dark-card
                hover:border-brand-blue hover:shadow-cardHover
                transition-all
              "
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                <Icon size={17} className="text-brand-blue" strokeWidth={1.9} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
                  {cat.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5 line-clamp-2">
                  {cat.description}
                </p>
                <p className="text-[11px] text-brand-blue mt-1.5 font-medium">
                  {cat.reports.length} reportes
                </p>
              </div>
              <ArrowRight size={14} className="text-gray-300 shrink-0 mt-0.5" />
            </button>
          )
        })}
      </div>
    </Card>
  )
}