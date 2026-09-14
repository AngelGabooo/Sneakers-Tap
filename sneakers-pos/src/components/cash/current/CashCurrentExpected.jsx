import { Info, Wallet } from 'lucide-react'
import Card from '../../common/Card'
import Tooltip from '../../common/Tooltip'

const fmt = (n) => `$${Number(n || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`

export default function CashCurrentExpected({ expectedCash, onCount }) {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-dark-card border-blue-100 dark:border-blue-900/50">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-brand-blue text-white flex items-center justify-center shrink-0">
            <Wallet size={16} strokeWidth={2} />
          </div>
          <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
            Efectivo esperado en caja
          </h3>
        </div>
        <Tooltip content="Este valor se calcula a partir del fondo inicial, ventas en efectivo y movimientos de efectivo registrados.">
          <span className="text-gray-400 hover:text-brand-blue cursor-help">
            <Info size={14} strokeWidth={2} />
          </span>
        </Tooltip>
      </div>

      <p className="text-3xl lg:text-4xl font-bold text-brand-black dark:text-dark-text tracking-tight">
        {fmt(expectedCash)}
      </p>
      <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">
        Monto que debería encontrarse físicamente en la caja.
      </p>

      {onCount && (
        <button
          onClick={onCount}
          className="mt-4 text-xs font-medium text-brand-blue hover:underline"
        >
          Realizar conteo parcial
        </button>
      )}
    </Card>
  )
}