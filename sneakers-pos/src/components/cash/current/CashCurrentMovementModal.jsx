import { useEffect, useState } from 'react'
import { X, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react'
import Button from '../../common/Button'

const MOTIVOS = {
  in: [
    { value: 'fondo',      label: 'Fondo adicional' },
    { value: 'cambio',     label: 'Cambio' },
    { value: 'reposicion', label: 'Reposición de efectivo' },
    { value: 'correccion', label: 'Corrección' },
    { value: 'other',      label: 'Otro' },
  ],
  out: [
    { value: 'parcial',    label: 'Retiro parcial' },
    { value: 'deposito',   label: 'Depósito bancario' },
    { value: 'gastos',     label: 'Gastos autorizados' },
    { value: 'cambio',     label: 'Cambio' },
    { value: 'seguridad',  label: 'Seguridad' },
    { value: 'other',      label: 'Otro' },
  ],
}

export default function CashCurrentMovementModal({
  open,
  currentExpected = 0,
  initialType = 'in',
  onClose,
  onConfirm,
  submitting,
}) {
  const [type, setType] = useState(initialType)
  const [amount, setAmount] = useState('')
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (open) {
      setType(initialType)
      setAmount('')
      setReason(MOTIVOS[initialType][0].value)
      setNote('')
    }
  }, [open, initialType])

  if (!open) return null

  const num = Number(amount) || 0
  const delta = type === 'in' ? num : -num
  const newExpected = Math.max(0, currentExpected + delta)

  const canConfirm = num > 0 && reason

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md max-h-[90vh] flex flex-col rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-cardHover">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border shrink-0">
          <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
            Registrar movimiento de efectivo
          </h3>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-brand-black dark:hover:text-dark-text transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
              Tipo <span className="text-brand-red">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'in',  label: 'Entrada', icon: ArrowDownToLine },
                { key: 'out', label: 'Retiro',  icon: ArrowUpFromLine },
              ].map(({ key, label, icon: Icon }) => {
                const active = type === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setType(key); setReason(MOTIVOS[key][0].value) }}
                    className={`
                      flex items-center justify-center gap-2 h-10 rounded-lg border text-sm font-medium
                      transition-colors
                      ${active
                        ? 'bg-brand-blue text-white border-brand-blue'
                        : 'bg-white dark:bg-dark-card text-gray-700 dark:text-dark-muted border-gray-200 dark:border-dark-border hover:border-brand-blue'}
                    `}
                  >
                    <Icon size={15} strokeWidth={2.2} />
                    {label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Importe */}
          <div>
            <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
              Importe <span className="text-brand-red">*</span>
            </label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full h-11 px-3 rounded-lg text-lg font-semibold bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 outline-none"
            />
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
              Motivo <span className="text-brand-red">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-10 px-3 rounded-lg text-sm bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue outline-none"
            >
              {MOTIVOS[type].map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Nota */}
          <div>
            <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
              Nota <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Detalles adicionales..."
              className="w-full rounded-lg text-sm p-3 resize-none bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue outline-none"
            />
          </div>

          {/* Preview */}
          <div className="rounded-lg border border-gray-100 dark:border-dark-border p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-dark-muted">Efectivo actual</span>
              <span className="font-medium text-brand-black dark:text-dark-text">
                ${currentExpected.toLocaleString('es-MX')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-dark-muted">Movimiento</span>
              <span className={`font-medium ${delta > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand-red'}`}>
                {delta >= 0 ? '+' : ''}${Math.abs(delta).toLocaleString('es-MX')}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-gray-100 dark:border-dark-border">
              <span className="text-gray-500 dark:text-dark-muted">Nuevo efectivo</span>
              <span className="font-bold text-brand-black dark:text-dark-text">
                ${newExpected.toLocaleString('es-MX')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border shrink-0">
          <Button variant="secondary" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button
            variant="primary"
            onClick={() => onConfirm({ type, amount: num, reason, note })}
            loading={submitting}
            disabled={!canConfirm || submitting}
          >
            {submitting ? 'Registrando...' : 'Registrar movimiento'}
          </Button>
        </div>
      </div>
    </div>
  )
}