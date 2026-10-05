// src/components/promotions/PromotionsWelcomeModal.jsx
import { useEffect, useState } from 'react'
import { Tag, Sparkles, X } from 'lucide-react'
import Button from '../common/Button'

const STORAGE_KEY = 'promotions-onboarding-seen-v1'

export function hasSeenPromotionsOnboarding() {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function markPromotionsOnboardingSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, 'true')
  } catch {}
}

export default function PromotionsWelcomeModal({ open, onClose, onOpenTour }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      // Animación de entrada
      const t = setTimeout(() => setMounted(true), 10)
      return () => clearTimeout(t)
    }
  }, [open])

  if (!open) return null

  const handleUnderstood = () => {
    markPromotionsOnboardingSeen()
    onClose?.()
  }

  const handleLater = () => {
    // No marca como visto → vuelve a salir la próxima vez
    onClose?.()
  }

  const handleSeeSteps = () => {
    markPromotionsOnboardingSeen()
    onClose?.()
    onOpenTour?.()
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className={`
          w-full max-w-lg rounded-2xl overflow-hidden
          bg-white dark:bg-dark-card
          border border-gray-200 dark:border-dark-border
          shadow-2xl transition-all duration-300
          ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
      >
        {/* Header con gradiente */}
        <div className="relative px-6 pt-6 pb-8 bg-gradient-to-br from-brand-blue via-blue-600 to-indigo-600 text-white">
          {/* Botón cerrar */}
          <button
            onClick={handleLater}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar"
          >
            <X size={16} />
          </button>

          {/* Ícono decorativo */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-4 border border-white/20">
              <Tag size={28} className="text-white" strokeWidth={2.2} />
            </div>

            {/* Badge "NUEVO" */}
            <span className="absolute -top-1 left-14 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400 text-amber-900 text-[10px] font-bold uppercase tracking-wider shadow-lg">
              <Sparkles size={10} strokeWidth={2.5} />
              Nuevo
            </span>
          </div>

          <h2 className="text-2xl font-bold mb-2">
            Nueva vista de promociones
          </h2>
          <p className="text-sm text-blue-100 leading-relaxed">
            Ahora puedes crear ofertas como <strong className="text-white">"2 pares por $1,200"</strong> y
            aplicarlas fácilmente desde el punto de venta.
          </p>
        </div>

        {/* Body con bullets */}
        <div className="px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-dark-muted mb-3">
            ¿Qué puedes hacer?
          </p>

          <ul className="space-y-2.5">
            <Feature
              icon="🎯"
              title="Elige los pares en promo"
              description="Selecciona qué productos entran en la oferta."
            />
            <Feature
              icon="💲"
              title="Define precio especial"
              description="Ej: los 2 pares por $1,200 en lugar de $2,400."
            />
            <Feature
              icon="🎁"
              title="Aplica desde el POS"
              description="El cajero decide cuándo aplicar la promo al cobrar."
            />
            <Feature
              icon="📅"
              title="Controla la vigencia"
              description="Programa fechas de inicio y fin opcionales."
            />
          </ul>
        </div>

        {/* Footer con botones */}
        <div className="flex flex-col sm:flex-row gap-2 px-6 pb-6">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleLater}
          >
            Ver después
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={handleSeeSteps}
          >
            Ver pasos
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleUnderstood}
          >
            Entendido
          </Button>
        </div>
      </div>
    </div>
  )
}

function Feature({ icon, title, description }) {
  return (
    <li className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-lg shrink-0">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
          {title}
        </p>
        <p className="text-[11px] text-gray-500 dark:text-dark-muted leading-relaxed">
          {description}
        </p>
      </div>
    </li>
  )
}