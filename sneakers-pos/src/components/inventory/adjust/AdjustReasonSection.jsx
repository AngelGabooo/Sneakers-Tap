import Card from '../../common/Card'
import SelectField from '../../common/SelectField'
import TextField from '../../common/TextField'
import TextareaField from '../../common/TextareaField'

const REASONS = [
  { value: 'physical',   label: 'Conteo físico' },
  { value: 'reception',  label: 'Recepción de mercancía' },
  { value: 'return',     label: 'Devolución de cliente' },
  { value: 'damage',     label: 'Daño' },
  { value: 'shrinkage',  label: 'Merma' },
  { value: 'loss',       label: 'Pérdida' },
  { value: 'correction', label: 'Corrección' },
  { value: 'error',      label: 'Error de captura' },
  { value: 'initial',    label: 'Inventario inicial' },
  { value: 'transfer',   label: 'Transferencia' },
  { value: 'other',      label: 'Otro' },
]

export default function AdjustReasonSection({
  reason, onReasonChange,
  documentRef, onDocumentRefChange,
  notes, onNotesChange,
  errors,
}) {
  return (
    <Card>
      <header className="mb-4">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Detalles del ajuste
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Motivo, referencia y notas opcionales.
        </p>
      </header>

      <div className="space-y-4">
        <SelectField
          id="reason"
          label="Motivo"
          required
          value={reason}
          onChange={(e) => onReasonChange?.(e.target.value)}
          options={REASONS}
          placeholder="Seleccionar motivo"
          error={errors?.reason}
        />

        <TextField
          id="documentRef"
          label="Referencia o documento"
          value={documentRef}
          onChange={(e) => onDocumentRefChange?.(e.target.value)}
          placeholder="Ej. CMP-00428, VTA-00891 o número de documento..."
        />

        <TextareaField
          id="notes"
          label="Notas"
          value={notes}
          onChange={(e) => onNotesChange?.(e.target.value)}
          placeholder="Agrega información adicional sobre este ajuste..."
          rows={3}
        />
      </div>
    </Card>
  )
}