import { ShoppingCart, PackagePlus, Truck, SlidersHorizontal } from 'lucide-react'
import Button from '../common/Button'

const ACTIONS = [
  { key: 'new-sale',     label: 'Nueva venta',        icon: ShoppingCart,      primary: true },
  { key: 'add-product',  label: 'Agregar producto',   icon: PackagePlus },
  { key: 'register-buy', label: 'Registrar compra',   icon: Truck },
  { key: 'adjust-inv',   label: 'Ajustar inventario', icon: SlidersHorizontal },
]

/**
 * Fila compacta de acciones rápidas.
 * Sin Card, sin título — pensada para vivir en el header del dashboard.
 */
export default function QuickActions({ onAction }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {ACTIONS.map(({ key, label, icon: Icon, primary }) => (
        <Button
          key={key}
          variant={primary ? 'primary' : 'secondary'}
          size="md"
          icon={Icon}
          onClick={() => onAction?.(key)}
        >
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{label.split(' ')[0]}</span>
        </Button>
      ))}
    </div>
  )
}