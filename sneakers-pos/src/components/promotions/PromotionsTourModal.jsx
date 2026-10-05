// src/components/promotions/PromotionsTourModal.jsx
import { useEffect, useState } from 'react'
import {
  X, ChevronLeft, ChevronRight, Check,
  Tag, Search, DollarSign, Package, Calendar,
  Power, ShoppingCart, Receipt,
} from 'lucide-react'
import Button from '../common/Button'

const STEPS = [
  {
    icon: Tag,
    color: 'from-brand-blue to-blue-600',
    badge: 'Paso 1',
    title: 'Crea una promoción',
    description:
      'Entra a la sección Promociones y presiona "Nueva promoción". Aquí defines el nombre que verá el cajero (ej: "2x1 Verano Nike").',
    bullets: [
      'Escribe el nombre de la promoción',
      'La descripción es opcional (solo para ti)',
      'Actívala o desactívala con el checkbox',
    ],
    tip: '💡 Usa nombres cortos y claros. Aparecerán en el selector del POS.',
  },
  {
    icon: DollarSign,
    color: 'from-emerald-500 to-teal-600',
    badge: 'Paso 2',
    title: 'Define cuántos pares y cuánto paga',
    description:
      'Aquí está la magia. Escribe cuántos pares lleva el cliente y cuánto paga por ese grupo.',
    bullets: [
      'Ej: Lleva 2 pares, paga $1,200',
      'Ej: Lleva 3 pares, paga $1,500',
      'Ej: Lleva 4 pares, paga $2,000',
    ],
    tip: '💡 Si el cliente lleva más grupos, se aplica múltiples veces automáticamente.',
  },
  {
    icon: Package,
    color: 'from-purple-500 to-indigo-600',
    badge: 'Paso 3',
    title: 'Selecciona los productos',
    description:
      'Elige qué pares entran en la promoción. Puedes seleccionar varios productos a la vez.',
    bullets: [
      'Usa el buscador para encontrar productos rápido',
      'La paginación te permite ver todos los productos',
      'Puedes quitar uno por uno o "Quitar todos"',
    ],
    tip: '💡 Los productos en promo se mostrarán con un badge azul.',
  },
  {
    icon: Calendar,
    color: 'from-amber-500 to-orange-600',
    badge: 'Paso 4',
    title: 'Programa la vigencia (opcional)',
    description:
      'Si quieres que la promo solo esté activa en ciertas fechas, define el rango.',
    bullets: [
      'Vigente desde: cuándo empieza la promo',
      'Vigente hasta: cuándo termina',
      'Si las dejas vacías, la promo está activa hasta que la desactives',
    ],
    tip: '💡 Útil para promociones de temporada (ej: Buen Fin, Navidad).',
  },
  {
    icon: Power,
    color: 'from-gray-600 to-gray-800',
    badge: 'Paso 5',
    title: 'Activa y administra',
    description:
      'Desde la lista de promociones puedes activar, editar o eliminar cada una.',
    bullets: [
      'Botón ⚡: activar / desactivar la promo',
      'Botón ✏️: editar la promoción',
      'Botón 🗑️: eliminar la promoción',
    ],
    tip: '💡 Una promo inactiva no aparece en el POS.',
  },
  {
    icon: ShoppingCart,
    color: 'from-pink-500 to-rose-600',
    badge: 'Paso 6',
    title: 'Aplica la promo desde el POS',
    description:
      'Cuando el cliente lleve los pares en promo, el cajero presiona el botón "🎁 Promoción" en el carrito.',
    bullets: [
      'Se abrirá un modal con las promos aplicables',
      'Se muestra cuánto se ahorra el cliente',
      'El cajero elige cuál aplicar (o ninguna)',
      'También puede quitarla antes de cobrar',
    ],
    tip: '💡 El cajero SIEMPRE decide. La promo no se aplica automáticamente.',
  },
  {
    icon: Receipt,
    color: 'from-slate-600 to-slate-800',
    badge: 'Paso 7',
    title: 'Se refleja en el ticket',
    description:
      'Al cobrar, el ticket muestra el descuento de la promo automáticamente.',
    bullets: [
      'Subtotal antes del descuento',
      'Línea "🎁 Nombre de la promo" con el monto',
      'TOTAL ya con el descuento aplicado',
    ],
    tip: '💡 Tu servidor de impresión no necesita cambios. Ya funciona así.',
  },
]

export default function PromotionsTourModal({ open, onClose }) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (open) setStep(0)
  }, [open])

  if (!open) return null

  const current = STEPS[step]
  const Icon = current.icon
  const isLast = step === STEPS.length - 1
  const isFirst = step === 0
  const progress = ((step + 1) / STEPS.length) * 100

  const handleNext = () => {
    if (isLast) {
      onClose?.()
    } else {
      setStep((s) => s + 1)
    }
  }

  const handlePrev = () => {
    if (!isFirst) setStep((s) => s - 1)
  }

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border shrink-0">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-brand-blue" strokeWidth={2} />
            <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
              Cómo funciona el módulo de promociones
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-brand-black dark:hover:text-dark-text transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Barra de progreso */}
        <div className="h-1 bg-gray-100 dark:bg-dark-surface shrink-0">
          <div
            className="h-full bg-brand-blue transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Body scrollable */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {/* Ícono del paso */}
          <div className="flex items-center gap-4 mb-5">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${current.color} flex items-center justify-center shrink-0 shadow-lg`}>
              <Icon size={28} className="text-white" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-brand-blue bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-md mb-1">
                {current.badge} de {STEPS.length}
              </span>
              <h4 className="text-xl font-bold text-brand-black dark:text-dark-text">
                {current.title}
              </h4>
            </div>
          </div>

          {/* Descripción */}
          <p className="text-sm text-gray-600 dark:text-dark-muted leading-relaxed mb-4">
            {current.description}
          </p>

          {/* Bullets */}
          <ul className="space-y-2 mb-4">
            {current.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Check size={11} className="text-emerald-600 dark:text-emerald-400" strokeWidth={3} />
                </div>
                <span className="text-sm text-gray-700 dark:text-dark-muted leading-relaxed">
                  {b}
                </span>
              </li>
            ))}
          </ul>

          {/* Tip */}
          {current.tip && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
              <p className="text-[12px] text-amber-800 dark:text-amber-300 leading-relaxed">
                {current.tip}
              </p>
            </div>
          )}
        </div>

        {/* Footer con navegación */}
        <div className="flex items-center justify-between gap-2 px-5 py-4 border-t border-gray-100 dark:border-dark-border shrink-0">
          {/* Indicador de pasos */}
          <div className="hidden sm:flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStep(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === step
                    ? 'w-6 bg-brand-blue'
                    : i < step
                      ? 'w-1.5 bg-brand-blue/60'
                      : 'w-1.5 bg-gray-300 dark:bg-dark-border'
                }`}
                aria-label={`Ir al paso ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="secondary"
              icon={ChevronLeft}
              onClick={handlePrev}
              disabled={isFirst}
            >
              Anterior
            </Button>
            <Button
              variant="primary"
              onClick={handleNext}
              icon={isLast ? Check : ChevronRight}
            >
              {isLast ? 'Finalizar' : 'Siguiente'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}