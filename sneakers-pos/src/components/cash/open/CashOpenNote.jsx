import Card from '../../common/Card'
import TextareaField from '../../common/TextareaField'

export default function CashOpenNote({ value, onChange }) {
  return (
    <Card>
      <header className="mb-4">
        <h2 className="text-base lg:text-lg font-semibold text-brand-black dark:text-dark-text">
          Nota
        </h2>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">
          Agrega una observación sobre la apertura. (opcional)
        </p>
      </header>

      <TextareaField
        id="cash-note"
        label=""
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder="Ej. Fondo recibido del cierre anterior. Se realizó conteo físico antes de iniciar operaciones."
        rows={3}
      />
    </Card>
  )
}