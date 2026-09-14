import { Store, User, Clock, Calendar } from 'lucide-react'
import Card from '../../common/Card'
import Badge from '../../common/Badge'

function formatDuration(startIso) {
  if (!startIso) return '—'
  const diff = (Date.now() - new Date(startIso).getTime()) / 1000
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  return `${h} h ${m} min`
}

export default function CashCloseSession({ session }) {
  if (!session) return null

  const opened = new Date(session.openedAt)
  const now = new Date()

  return (
    <Card className="mb-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
          <Store size={20} className="text-brand-blue" strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-brand-black dark:text-dark-text">
              {session.cashLabel || 'Caja'}
            </h2>
            <Badge variant="success">Abierta</Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            {session.branch || 'Tienda principal'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 mt-4 text-xs">
            <Meta icon={Clock}    label="Sesión"       value={session.id} mono />
            <Meta icon={User}     label="Responsable"  value={session.responsibleName} />
            <Meta icon={Calendar} label="Apertura"     value={opened.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })} />
            <Meta icon={Clock}    label="Cierre"       value={now.toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })} />
            <Meta icon={Clock}    label="Duración"     value={formatDuration(session.openedAt)} />
            <Meta icon={Store}    label="Estado"       value="Abierta" />
          </div>
        </div>
      </div>
    </Card>
  )
}

function Meta({ icon: Icon, label, value, mono = false }) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <Icon size={12} strokeWidth={2} className="text-gray-400 shrink-0" />
      <span className="text-gray-500 dark:text-dark-muted shrink-0">{label}:</span>
      <span className={`font-medium text-brand-black dark:text-dark-text truncate ${mono ? 'font-mono' : ''}`}>
        {value || '—'}
      </span>
    </div>
  )
}