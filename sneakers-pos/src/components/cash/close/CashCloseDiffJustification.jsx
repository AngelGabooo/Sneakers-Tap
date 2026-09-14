import Card from '../../common/Card'

const MOTIVOS_ENTRADA = [
  { value: 'venta-no-registrada',      label: 'Venta no registrada' },
  { value: 'error-cobro',              label: 'Error de cobro' },
  { value: 'error-conteo',             label: 'Error de conteo' },
  { value: 'efectivo-no-registrado',   label: 'Efectivo ingresado no registrado' },
  { value: 'other',                    label: 'Otro' },
]

const MOTIVOS_SALIDA = [
  { value: 'error-cobro',              label: 'Error de cobro' },
  { value: 'cambio-incorrecto',        label: 'Cambio entregado incorrectamente' },
  { value: 'retiro-no-registrado',     label: 'Retiro no registrado' },
  { value: 'reembolso-no-registrado',  label: 'Reembolso no registrado' },
  { value: 'error-captura',            label: 'Error de captura' },
  { value: 'error-conteo',             label: 'Diferencia en conteo' },
  { value: 'perdida',                  label: 'Pérdida' },
  { value: 'other',                    label: 'Otro' },
]

export default function CashCloseDiffJustification({
  isSobrante,
  diff,
  reason, onReasonChange,
  notes, onNotesChange,
  errors,
}) {
  const motivos = isSobrante ? MOTIVOS_ENTRADA : MOTIVOS_SALIDA
  const requiresNotes = reason === 'other'

  return (
    <Card>
      <header className="mb-4">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Justificación de diferencia
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Explica la causa de la diferencia detectada ({isSobrante ? 'sobrante' : 'faltante'} de $
          {Math.abs(diff).toLocaleString('es-MX')}).
        </p>
      </header>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
            Motivo <span className="text-brand-red">*</span>
          </label>
          <select
            value={reason || ''}
            onChange={(e) => onReasonChange?.(e.target.value)}
            className={`
              w-full h-10 px-3 rounded-lg text-sm
              bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
              border outline-none
              ${errors?.reason
                ? 'border-brand-red focus:border-brand-red focus:ring-2 focus:ring-red-100'
                : 'border-gray-200 dark:border-dark-border focus:border-brand-blue'}
            `}
          >
            <option value="">Seleccionar motivo</option>
            {motivos.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          {errors?.reason && (
            <p className="mt-1.5 text-xs text-brand-red">{errors.reason}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
            Notas / explicación {requiresNotes && <span className="text-brand-red">*</span>}
          </label>
          <textarea
            rows={3}
            value={notes || ''}
            onChange={(e) => onNotesChange?.(e.target.value)}
            placeholder="Describe brevemente la causa de la diferencia..."
            className={`
              w-full rounded-lg text-sm p-3 resize-none
              bg-white dark:bg-dark-card text-brand-black dark:text-dark-text
              border outline-none
              ${errors?.notes
                ? 'border-brand-red focus:border-brand-red focus:ring-2 focus:ring-red-100'
                : 'border-gray-200 dark:border-dark-border focus:border-brand-blue'}
            `}
          />
          {errors?.notes && (
            <p className="mt-1.5 text-xs text-brand-red">{errors.notes}</p>
          )}
        </div>
      </div>
    </Card>
  )
}