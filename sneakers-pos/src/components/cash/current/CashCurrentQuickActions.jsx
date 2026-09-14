import { Plus, ArrowDownToLine, ArrowUpFromLine, Calculator, Receipt, History, Wallet } from 'lucide-react'
import Card from '../../common/Card'
import Button from '../../common/Button'

const ACTIONS = [
  { key: 'new-sale',   label: 'Nueva venta',       icon: Plus,            primary: true },
  { key: 'cash-in',    label: 'Registrar entrada', icon: ArrowDownToLine },
  { key: 'cash-out',   label: 'Registrar retiro',  icon: ArrowUpFromLine },
  { key: 'count',      label: 'Contar efectivo',   icon: Calculator },
  { key: 'view-sales', label: 'Ver ventas',        icon: Receipt },
  { key: 'view-movs',  label: 'Ver movimientos',   icon: History },
  { key: 'close',      label: 'Cerrar caja',       icon: Wallet },
]

export default function CashCurrentQuickActions({ onAction }) {
  return (
    <Card>
      <h2 className="text-base font-semibold text-brand-black dark:text-dark-text mb-3">
        Acciones rápidas
      </h2>
      <div className="grid grid-cols-2 gap-2">
        {ACTIONS.map(({ key, label, icon: Icon, primary }) => (
          <Button
            key={key}
            variant={primary ? 'primary' : 'secondary'}
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