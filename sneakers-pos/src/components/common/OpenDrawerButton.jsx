// src/components/common/OpenDrawerButton.jsx
import { useState } from 'react'
import { openCashDrawer } from '../../services/printerService' // ajusta la ruta a tu cliente

export default function OpenDrawerButton() {
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null) // { type: 'ok' | 'err', msg }

  async function handleClick() {
    setLoading(true)
    setToast(null)

    const res = await openCashDrawer()

    if (res?.ok) {
      setToast({ type: 'ok', msg: '✅ Caja abierta' })
    } else {
      setToast({ type: 'err', msg: '❌ ' + (res?.error || 'Error') })
    }

    setLoading(false)
    setTimeout(() => setToast(null), 2500)
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={handleClick}
        disabled={loading}
        title="Abrir cajón de dinero"
        className="
          fixed bottom-6 right-6 z-[9999]
          w-16 h-16 rounded-full
          flex items-center justify-center
          text-2xl text-white
          bg-gradient-to-br from-emerald-500 to-emerald-600
          shadow-lg shadow-emerald-500/40
          hover:scale-110 active:scale-95
          transition-transform
          disabled:from-slate-500 disabled:to-slate-600 disabled:scale-100
        "
      >
        {loading ? '⏳' : '💰'}
      </button>

      {/* Toast */}
      {toast && (
        <div
          className={`
            fixed bottom-28 right-6 z-[9999]
            px-5 py-3 rounded-xl
            text-sm font-semibold text-white
            shadow-xl
            animate-in fade-in slide-in-from-bottom-2
            ${toast.type === 'ok' ? 'bg-emerald-500' : 'bg-red-500'}
          `}
        >
          {toast.msg}
        </div>
      )}
    </>
  )
}