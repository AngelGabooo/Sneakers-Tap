import { useState, useEffect } from 'react'
import { Sparkles, PartyPopper, X, RefreshCw } from 'lucide-react'

const TOTAL_MS = 10 * 60 * 60 * 1000 // 10 horas
const STORAGE_KEY = 'update_target_time'

function getTargetTime() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return Number(saved)
    const target = Date.now() + TOTAL_MS
    localStorage.setItem(STORAGE_KEY, String(target))
    return target
  } catch {
    return Date.now() + TOTAL_MS
  }
}

const pad = (n) => String(n).padStart(2, '0')

// Tarjeta de reloj más pequeña y ajustada a los colores de la marca
function FlipUnit({ value, label, tick = false }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative overflow-hidden rounded-lg bg-brand-blue px-2.5 py-1.5 shadow-sm ring-1 ring-white/20">
        <span
          key={tick ? value : 'static'}
          className={`block text-xl font-bold tabular-nums leading-none text-white sm:text-2xl ${
            tick ? 'ua-tick' : ''
          }`}
        >
          {pad(value)}
        </span>
        {/* línea central y muescas */}
        <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-black/30" />
        <span className="pointer-events-none absolute -left-0.5 top-1/2 h-1.5 w-0.5 -translate-y-1/2 rounded-r bg-blue-900/80" />
        <span className="pointer-events-none absolute -right-0.5 top-1/2 h-1.5 w-0.5 -translate-y-1/2 rounded-l bg-blue-900/80" />
      </div>
      <span className="text-[10px] font-medium text-gray-500 dark:text-dark-muted">{label}</span>
    </div>
  )
}

export default function UpdateAlertBanner() {
  const [visible, setVisible] = useState(true)
  const [target] = useState(getTargetTime)
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, target - Date.now()))

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = target - Date.now()
      if (diff <= 0) {
        setTimeLeft(0)
        clearInterval(interval)
      } else {
        setTimeLeft(diff)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [target])

  if (!visible) return null

  const done = timeLeft <= 0
  const hours = Math.floor(timeLeft / 3600000)
  const minutes = Math.floor((timeLeft % 3600000) / 60000)
  const seconds = Math.floor((timeLeft % 60000) / 1000)
  const progress = Math.min(100, Math.max(0, (1 - timeLeft / TOTAL_MS) * 100))

  return (
    <div
      role="region"
      aria-label="Aviso de actualización"
      className="ua-enter relative z-[100] w-full overflow-hidden border-b border-blue-200 bg-white dark:border-dark-border dark:bg-dark-card"
    >
      <style>{`
        @keyframes ua-float-a { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,10px) scale(1.1); } }
        @keyframes ua-enter { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ua-tick { from { opacity: .3; transform: translateY(-35%); } to { opacity: 1; transform: translateY(0); } }
        .ua-blob-a { animation: ua-float-a 12s ease-in-out infinite; }
        .ua-enter { animation: ua-enter .5s ease-out both; }
        .ua-tick { animation: ua-tick .35s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .ua-blob-a, .ua-enter, .ua-tick { animation: none; }
        }
      `}</style>

      {/* Fondo sutil para modo claro y oscuro */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className={`ua-blob-a absolute -right-10 -top-20 h-48 w-48 rounded-full blur-3xl ${
            done ? 'bg-emerald-500/10' : 'bg-brand-blue/10'
          }`}
        />
      </div>

      {/* Contenido compacto */}
      <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-2.5 pr-10 sm:flex-row sm:px-6">
        
        {/* Texto */}
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${done ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50' : 'bg-brand-blue/10 text-brand-blue'}`}>
            {done ? <PartyPopper size={14} /> : <Sparkles size={14} />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-brand-black dark:text-dark-text">
              {done ? '¡Actualización lista!' : 'Nueva actualización en curso'}
            </h3>
            <p className="text-xs text-gray-500 dark:text-dark-muted">
              {done 
                ? 'Recarga la página para ver el apartado de reportes con nombre.' 
                : 'El apartado de reportes con nombre estará listo en:'}
            </p>
          </div>
        </div>

        {/* Reloj o Botón */}
        {done ? (
          <button
            onClick={() => window.location.reload()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <RefreshCw size={14} />
            Recargar ahora
          </button>
        ) : (
          <div
            role="timer"
            aria-label="Tiempo restante para la actualización"
            className="flex shrink-0 items-start gap-1.5"
          >
            <FlipUnit value={hours} label="hrs" />
            <FlipUnit value={minutes} label="min" />
            <FlipUnit value={seconds} label="seg" tick />
          </div>
        )}
      </div>

      {/* Cerrar */}
      <button
        onClick={() => setVisible(false)}
        aria-label="Cerrar aviso"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-dark-surface dark:hover:text-dark-text"
      >
        <X size={16} />
      </button>

      {/* Progreso */}
      <div className="relative h-0.5 w-full bg-gray-100 dark:bg-dark-surface">
        <div
          className={`h-full transition-[width] duration-1000 ease-linear motion-reduce:transition-none ${
            done ? 'bg-emerald-500' : 'bg-brand-blue'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}