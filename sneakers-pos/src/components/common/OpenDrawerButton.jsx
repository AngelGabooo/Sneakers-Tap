// src/components/common/OpenDrawerButton.jsx

import { useState } from 'react'
import { openCashDrawer } from '../../services/printerService' // ajusta la ruta a tu cliente

// ======================================================
// ICONO SVG DE CAJÓN DE DINERO
// ======================================================

const DrawerIcon = ({ size = 26 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
    <path d="M3 9V7a2 2 0 0 1 2-2h3l2-3h4l2 3h3a2 2 0 0 1 2 2v2" />
    <circle cx="12" cy="14" r="2.5" />
    <path d="M12 12.5v3" />
  </svg>
)

// ======================================================
// SPINNER
// ======================================================

const Spinner = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className="animate-spin"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeOpacity="0.25"
    />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
)

// ======================================================
// BOTÓN PRINCIPAL
// ======================================================

export default function OpenDrawerButton() {
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null) // { type: 'ok' | 'err', msg }
  const [showTooltip, setShowTooltip] = useState(false)

  async function handleClick() {
    setLoading(true)
    setToast(null)

    try {
      const res = await openCashDrawer()

      if (res?.ok) {
        setToast({ type: 'ok', msg: 'Caja abierta correctamente' })
      } else {
        setToast({
          type: 'err',
          msg: res?.error || 'No se pudo abrir la caja'
        })
      }
    } catch (error) {
      setToast({
        type: 'err',
        msg: error?.message || 'Error inesperado'
      })
    } finally {
      setLoading(false)
      setTimeout(() => setToast(null), 2800)
    }
  }

  return (
    <>
      {/* ================================================= */}
      {/* BOTÓN FLOTANTE */}
      {/* ================================================= */}

      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">

        {/* TOOLTIP */}
        <div
          className={`
            px-3 py-1.5 rounded-lg
            bg-slate-900/95 backdrop-blur-md
            border border-blue-400/30
            text-white text-xs font-medium
            whitespace-nowrap
            shadow-lg shadow-blue-500/20
            pointer-events-none
            transition-all duration-200
            ${
              showTooltip && !loading
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-2'
            }
          `}
        >
          Abrir cajón de dinero
          <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-slate-900/95 border-r border-b border-blue-400/30" />
        </div>

        {/* BOTÓN */}
        <button
          onClick={handleClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          disabled={loading}
          aria-label="Abrir cajón de dinero"
          className={`
            group relative
            w-16 h-16 rounded-2xl
            flex items-center justify-center
            text-white
            transition-all duration-300 ease-out

            /* Fondo azul con gradiente */
            bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700

            /* Bordes y sombra */
            border border-blue-400/40
            shadow-lg shadow-blue-500/40
            hover:shadow-xl hover:shadow-blue-500/60

            /* Transformaciones */
            hover:scale-110 hover:-translate-y-1
            active:scale-95 active:translate-y-0

            /* Estado deshabilitado */
            disabled:from-slate-500 disabled:via-slate-600 disabled:to-slate-700
            disabled:border-slate-400/30
            disabled:shadow-slate-500/20
            disabled:scale-100 disabled:translate-y-0
            disabled:cursor-not-allowed

            /* Aura de brillo animada */
            before:absolute before:inset-0 before:rounded-2xl
            before:bg-gradient-to-br before:from-blue-300/30 before:to-transparent
            before:opacity-0 hover:before:opacity-100
            before:transition-opacity before:duration-300
            before:pointer-events-none

            /* Anillo brillante */
            after:absolute after:-inset-1 after:rounded-3xl
            after:bg-blue-400/20 after:blur-xl
            after:opacity-0 hover:after:opacity-100
            after:transition-opacity after:duration-500
            after:pointer-events-none after:-z-10
          `}
        >
          {/* Contenido con z-index superior */}
          <span className="relative z-10">
            {loading ? <Spinner /> : <DrawerIcon />}
          </span>

          {/* Punto indicador de actividad */}
          {!loading && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.9)] animate-pulse" />
          )}
        </button>
      </div>

      {/* ================================================= */}
      {/* TOAST */}
      {/* ================================================= */}

      {toast && (
        <div
          className={`
            fixed bottom-28 right-6 z-[9999]
            flex items-center gap-3
            px-5 py-3.5 rounded-2xl
            text-sm font-semibold text-white
            shadow-2xl
            border backdrop-blur-md
            transition-all duration-300

            ${
              toast.type === 'ok'
                ? 'bg-emerald-500/95 border-emerald-400/50 shadow-emerald-500/40'
                : 'bg-red-500/95 border-red-400/50 shadow-red-500/40'
            }
          `}
          style={{
            animation: 'slideInToast 0.3s ease-out'
          }}
        >
          {/* Icono de estado */}
          <div
            className={`
              w-7 h-7 rounded-full flex items-center justify-center shrink-0
              ${
                toast.type === 'ok'
                  ? 'bg-emerald-600'
                  : 'bg-red-600'
              }
            `}
          >
            {toast.type === 'ok' ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
          </div>

          <span>{toast.msg}</span>
        </div>
      )}

      {/* ================================================= */}
      {/* KEYFRAMES */}
      {/* ================================================= */}

      <style>{`
        @keyframes slideInToast {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  )
}