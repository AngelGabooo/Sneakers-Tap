import { Wallet, Clock } from 'lucide-react'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Button from '../common/Button'

export default function CashStatusCard({ cash }) {
  const isEmpty = !cash || !cash.registerId

  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            Estado de caja
          </h3>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            {isEmpty ? 'Sin caja abierta' : cash.registerId}
          </p>
        </div>

        {!isEmpty && (
          <Badge variant={cash.status === 'open' ? 'success' : 'neutral'}>
            {cash.status === 'open' ? '● Abierta' : '● Cerrada'}
          </Badge>
        )}
      </div>

      <div className="flex-1 mt-5 space-y-3">
        {isEmpty ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 dark:bg-dark-surface flex items-center justify-center mb-3">
              <Wallet size={20} className="text-gray-400 dark:text-dark-muted" strokeWidth={1.8} />
            </div>
            <p className="text-sm text-gray-500 dark:text-dark-muted">
              No hay información de caja para mostrar.
            </p>
          </div>
        ) : (
          <>
            <Row label="Responsable"    value={cash.responsible || '—'} />
            <Row label="Efectivo esperado" value={cash.expectedCash || '—'} />
            <Row label="Ventas en efectivo" value={cash.cashSales || '—'} />
            <Row
              label="Último movimiento"
              value={
                <span className="inline-flex items-center gap-1 text-gray-500 dark:text-dark-muted">
                  <Clock size={13} strokeWidth={2} />
                  {cash.lastMovementAt || '—'}
                </span>
              }
            />
          </>
        )}
      </div>

      <div className="mt-5">
        <Button variant="secondary" className="w-full" disabled={isEmpty}>
          Ver caja
        </Button>
      </div>
    </Card>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500 dark:text-dark-muted">{label}</span>
      <span className="font-medium text-brand-black dark:text-dark-text">{value}</span>
    </div>
  )
}