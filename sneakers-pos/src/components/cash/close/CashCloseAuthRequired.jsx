import { ShieldAlert, CheckCircle2 } from 'lucide-react'
import Card from '../../common/Card'
import Button from '../../common/Button'
import Badge from '../../common/Badge'

export default function CashCloseAuthRequired({
  diff,
  limit = 100,
  authorizedBy,
  authorizedAt,
  onRequestAuth,
}) {
  const needsAuth = Math.abs(diff) > limit
  if (!needsAuth) return null

  const isAuthorized = !!authorizedBy

  return (
    <Card>
      <header className="flex items-start gap-3 mb-4">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          isAuthorized
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
            : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
        }`}>
          {isAuthorized
            ? <CheckCircle2 size={17} strokeWidth={2} />
            : <ShieldAlert size={17} strokeWidth={2} />}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
            {isAuthorized ? 'Autorización aprobada' : 'Autorización requerida'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
            {isAuthorized
              ? `Autorizada por ${authorizedBy} · ${new Date(authorizedAt).toLocaleString('es-MX', { timeStyle: 'short' })}`
              : `La diferencia de $${Math.abs(diff).toLocaleString('es-MX')} supera el límite permitido ($${limit.toLocaleString('es-MX')}).`}
          </p>
        </div>
        <Badge variant={isAuthorized ? 'success' : 'warning'}>
          {isAuthorized ? 'Autorizada' : 'Pendiente'}
        </Badge>
      </header>

      {!isAuthorized && (
        <Button variant="primary" onClick={onRequestAuth} className="w-full">
          Solicitar autorización
        </Button>
      )}
    </Card>
  )
}