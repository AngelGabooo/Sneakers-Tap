import Card from '../../common/Card'
import TextField from '../../common/TextField'
import TextareaField from '../../common/TextareaField'

/**
 * Detalles del ajuste.
 * El motivo está fijo como "Error de captura" (no se selecciona).
 * Solo se muestra Notas y Referencia opcional.
 */
export default function AdjustReasonSection({
  documentRef, onDocumentRefChange,
  notes, onNotesChange,
}) {
  return (
    <Card>
      <header className="mb-4">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Detalles del ajuste
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Agrega notas o una referencia al documento que respalda este ajuste.
        </p>
      </header>

      <div className="space-y-4">
        {/* Motivo fijo */}
        <div>
          <label className="block text-sm font-medium text-brand-black dark:text-dark-text mb-1.5">
            Motivo
          </label>
          <div className="
            inline-flex items-center gap-2 h-10 px-3 rounded-lg
            bg-gray-50 dark:bg-dark-surface
            border border-gray-200 dark:border-dark-border
            text-sm text-brand-black dark:text-dark-text
          ">
            <span className="w-2 h-2 rounded-full bg-brand-blue" />
            Error de captura
          </div>
          <p className="text-xs text-gray-500 dark:text-dark-muted mt-1">
            Todos los ajustes se registran con este motivo.
          </p>
        </div>

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