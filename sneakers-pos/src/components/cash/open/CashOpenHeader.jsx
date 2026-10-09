// src/components/cash/open/CashOpenHeader.jsx
import { useState } from 'react'
import { X, Wallet } from 'lucide-react'
import Button from '../../common/Button'
import { openCashDrawer } from '../../../services/printerService'

export default function CashOpenHeader({ onCancel }) {
  const [loadingDrawer, setLoadingDrawer] = useState(false)
  const [toast, setToast] = useState(null)

  async function handleOpenDrawer() {
    if (loadingDrawer) return
    setLoadingDrawer(true)
    setToast(null)

    const res = await openCashDrawer()

    if (res?.ok) {
      setToast({ type: 'ok', msg: '✅ Cajón abierto' })
    } else {
      setToast({ type: 'err', msg: '❌ ' + (res?.error || 'No se pudo abrir el cajón') })
    }

    setLoadingDrawer(false)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-brand-black dark:text-dark-text tracking-tight">
          Apertura de caja
        </h1>
        <p className="text-sm text-gray-500 dark:text-dark-muted mt-1">
          Registra el fondo inicial y comienza una nueva jornada de operación.
        </p>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* 👇 ABRE EL CAJÓN FÍSICO */}
        <Button
          variant="primary"
          icon={Wallet}
          onClick={handleOpenDrawer}
          disabled={loadingDrawer}
        >
          {loadingDrawer ? 'Abriendo…' : 'Abrir cajón'}
        </Button>

        <Button variant="secondary" icon={X} onClick={onCancel}>
          Cancelar
        </Button>
      </div>

      {toast && (
        <div
          className={`
            fixed bottom-6 right-6 z-[9999]
            px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-xl
            ${toast.type === 'ok' ? 'bg-emerald-500' : 'bg-red-500'}
          `}
        >
          {toast.msg}
        </div>
      )}
    </div>
  )
}