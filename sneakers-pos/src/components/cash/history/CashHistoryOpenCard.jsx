import { Wallet, ArrowRight } from 'lucide-react'
import Card from '../../common/Card'
import Badge from '../../common/Badge'

export default function CashHistoryOpenCard({ session, onViewCurrent }) {
  if (!session) return null

  const opened = new Date(session.openedAt)

  return (
    <Card className="mb-5 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-white dark:bg-dark-card flex items-center justify-center shrink-0">
            <Wallet size={18} className="text-brand-blue" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
                Caja actualmente abierta
              </p>
              <Badge variant="info">En curso</Badge>
            </div>
            <p className="text-xs text-gray-600 dark:text-dark-muted mt-1">
              <span className="font-medium">{session.cashLabel}</span> · Sesión{' '}
              <span className="font-mono">{session.id}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-dark-muted mt-0.5">
              Responsable: {session.responsibleName} · Abierta:{' '}
              {opened.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })}
            </p>
          </div>
        </div>

        <button
          onClick={onViewCurrent}
          className="inline-flex items-center gap-1 text-sm font-medium text-brand-blue hover:underline shrink-0"
        >
          Ver caja actual
          <ArrowRight size={14} strokeWidth={2.4} />
        </button>
      </div>
    </Card>
  )
}