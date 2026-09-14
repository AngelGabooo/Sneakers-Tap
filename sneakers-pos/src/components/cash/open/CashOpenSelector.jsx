import { Store, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import Card from '../../common/Card'
import Badge from '../../common/Badge'

/**
 * Selector de caja + validación de estado.
 * Cuando la caja ya está abierta, no deja continuar y ofrece ir a la caja actual.
 */
export default function CashOpenSelector({
  cashes = [],
  cashId,
  onChangeCash,
  openSession,   // sesión activa de esa caja, si existe
  onGoToCurrent,
}) {
  const selected = cashes.find((c) => c.id === cashId) || null
  const isOpen = !!openSession
  const isBlocked = selected?.status === 'blocked'

  return (
    <Card>
      <header className="mb-4">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Caja
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Selecciona la caja que deseas abrir.
        </p>
      </header>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
            Caja <span className="text-brand-red">*</span>
          </label>
          <select
            value={cashId || ''}
            onChange={(e) => onChangeCash?.(e.target.value)}
            className="
              w-full h-11 px-3 rounded-lg text-sm
              bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
              border border-gray-200 dark:border-dark-border
              focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40
              outline-none cursor-pointer
            "
          >
            <option value="">Seleccionar caja</option>
            {cashes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label} · {c.branch} · {c.status === 'open' ? 'Abierta' : c.status === 'blocked' ? 'Bloqueada' : 'Cerrada'}
              </option>
            ))}
          </select>
        </div>

        {selected && (
          <div className="rounded-lg border border-gray-100 dark:border-dark-border p-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                <Store size={16} className="text-brand-blue" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-brand-black dark:text-dark-text">
                  {selected.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-muted">
                  {selected.branch}
                </p>
                <div className="mt-2">
                  {isOpen ? (
                    <Badge variant="danger">Abierta</Badge>
                  ) : isBlocked ? (
                    <Badge variant="warning">Bloqueada</Badge>
                  ) : (
                    <Badge variant="success">Cerrada</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Validación */}
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-dark-border">
              {isOpen ? (
                <div>
                  <div className="flex items-start gap-2 text-xs text-brand-red">
                    <AlertTriangle size={13} strokeWidth={2.2} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">Esta caja ya está abierta</p>
                      <p className="text-red-600/80 dark:text-red-400 mt-0.5">
                        Abierta por {openSession.responsibleName} · {new Date(openSession.openedAt).toLocaleString('es-MX')}
                      </p>
                      <p className="text-red-600/80 dark:text-red-400">
                        Fondo inicial: ${Number(openSession.initialFund).toLocaleString('es-MX')}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onGoToCurrent}
                    className="mt-3 text-xs font-medium text-brand-blue hover:underline"
                  >
                    Ir a caja actual
                  </button>
                </div>
              ) : isBlocked ? (
                <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-400">
                  <XCircle size={13} strokeWidth={2.2} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Caja no disponible</p>
                    <p className="opacity-80 mt-0.5">Esta caja requiere revisión antes de poder abrirse.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 size={13} strokeWidth={2.2} className="mt-0.5 shrink-0" />
                  <span className="font-medium">Caja disponible para apertura</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}