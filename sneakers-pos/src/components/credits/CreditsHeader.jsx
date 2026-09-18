// src/components/credits/CreditsHeader.jsx
import { Plus } from 'lucide-react'
import Button from '../common/Button'

export default function CreditsHeader({ onNew, stats }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
          Créditos y cobranza
        </h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
          Administra los créditos otorgados a tus clientes mayoristas.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="primary" icon={Plus} onClick={onNew}>
          Otorgar crédito
        </Button>
      </div>
    </div>
  )
}