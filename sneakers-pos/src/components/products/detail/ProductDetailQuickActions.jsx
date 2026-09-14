import { Pencil, Warehouse, ShoppingBag, History, TrendingUp, Activity } from 'lucide-react'
import Card from '../../common/Card'
import Button from '../../common/Button'

const ACTIONS = [
  { key: 'edit',         label: 'Editar producto',    icon: Pencil },
  { key: 'adjust',       label: 'Ajustar inventario', icon: Warehouse },
  { key: 'purchase',     label: 'Registrar compra',   icon: ShoppingBag },
  { key: 'movements',    label: 'Ver movimientos',    icon: Activity },
  { key: 'sales',        label: 'Ver ventas',         icon: TrendingUp },
  { key: 'history',      label: 'Ver historial',      icon: History },
]

export default function ProductDetailQuickActions({ onAction }) {
  return (
    <Card>
      <h2 className="text-base font-semibold text-brand-black dark:text-dark-text mb-3">
        Acciones rápidas
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {ACTIONS.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant="secondary"
            icon={Icon}
            size="sm"
            className="w-full justify-start"
            onClick={() => onAction?.(key)}
          >
            {label}
          </Button>
        ))}
      </div>
    </Card>
  )
}