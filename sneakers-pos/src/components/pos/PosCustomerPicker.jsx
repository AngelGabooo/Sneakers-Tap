// src/components/pos/PosCustomerPicker.jsx
import { useState, useMemo, useEffect } from 'react'
import { Search, UserPlus, X, Building2, User, Percent } from 'lucide-react'
import Button from '../common/Button'
import Badge from '../common/Badge'
import { useWholesale } from '../../context/WholesaleContext'
import { useView } from '../../context/ViewContext'

/**
 * Selector de cliente para el POS.
 * Permite elegir entre clientes generales y mayoristas.
 * Al seleccionar un mayorista, aplica automáticamente sus condiciones comerciales.
 */
export default function PosCustomerPicker({ open, onClose, onSelect, onClearCustomer }) {
  const { wholesales } = useWholesale()
  const { navigate } = useView()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('regular') // 'regular' | 'wholesale'

  // 🚧 TODO: reemplazar por clientes reales desde un `CustomersContext`
  const regularCustomers = []

  // Resetear query al abrir
  useEffect(() => {
    if (open) setQuery('')
  }, [open])

  // Filtrado local
  const filteredWholesales = useMemo(() => {
    if (!query.trim()) return wholesales
    const q = query.toLowerCase()
    return wholesales.filter((w) =>
      (w.name || '').toLowerCase().includes(q) ||
      (w.id || '').toLowerCase().includes(q) ||
      (w.contactName || '').toLowerCase().includes(q) ||
      (w.phone || '').toLowerCase().includes(q) ||
      (w.email || '').toLowerCase().includes(q),
    )
  }, [wholesales, query])

  const filteredRegular = useMemo(() => {
    if (!query.trim()) return regularCustomers
    const q = query.toLowerCase()
    return regularCustomers.filter((c) =>
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q),
    )
  }, [regularCustomers, query])

  if (!open) return null

  const handleSelectWholesale = (w) => {
    // ⭐ FIX: incluir discountTiers al pasar el cliente al carrito.
    //    Sin esto, CartContext no puede calcular el descuento por volumen.
    onSelect?.({
      id: w.id,
      name: w.name,
      isWholesale: true,
      condition: w.condition,
      priceList: w.priceList,
      defaultDiscount: Number(w.defaultDiscount) || 0,
      maxDiscount: Number(w.maxDiscount) || 0,
      // ⭐ NUEVO: normalizar tiers antes de pasarlos
      discountTiers: Array.isArray(w.discountTiers)
        ? w.discountTiers
            .map((t) => ({
              minQty: Number(t?.minQty) || 0,
              discount: Number(t?.discount) || 0,
            }))
            .filter((t) => t.minQty > 0 && t.discount >= 0)
            .sort((a, b) => a.minQty - b.minQty)
        : [],
      minPurchaseAmount: Number(w.minPurchaseAmount) || 0,
      minPurchaseUnits: Number(w.minPurchaseUnits) || 0,
      creditLimit: Number(w.creditLimit) || 0,
      creditUsed: Number(w.creditUsed) || 0,
      creditAvailable: Math.max(0, (Number(w.creditLimit) || 0) - (Number(w.creditUsed) || 0)),
      status: w.status,
      overdue: w.overdue,
      contactName: w.contactName,
      phone: w.phone,
      email: w.email,
    })
    setQuery('')
    onClose?.()
  }

  const handleSelectRegular = (c) => {
    onSelect?.({ ...c, isWholesale: false })
    setQuery('')
    onClose?.()
  }

  const handleGeneral = () => {
    onClearCustomer?.()
    setQuery('')
    onClose?.()
  }

  const handleNewCustomer = () => {
    onClose?.()
    if (tab === 'wholesale') {
      navigate('wholesale-new')
    } else {
      navigate('customers-new')
    }
  }

  const isWholesaleTab = tab === 'wholesale'
  const newButtonLabel = isWholesaleTab ? 'Nuevo cliente mayorista' : 'Nuevo cliente'

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-xl overflow-hidden bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border shadow-cardHover">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-dark-border shrink-0">
          <h3 className="text-sm font-semibold text-brand-black dark:text-dark-text">
            Asignar cliente
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-brand-black dark:hover:text-dark-text transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-5 pt-4 border-b border-gray-100 dark:border-dark-border shrink-0">
          <TabButton
            active={tab === 'regular'}
            icon={User}
            label="Clientes"
            onClick={() => setTab('regular')}
          />
          <TabButton
            active={tab === 'wholesale'}
            icon={Building2}
            label="Mayoristas"
            count={wholesales.length}
            onClick={() => setTab('wholesale')}
          />
        </div>

        {/* Búsqueda */}
        <div className="p-5 pb-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <Search size={17} strokeWidth={1.8} />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                isWholesaleTab
                  ? 'Buscar mayorista por nombre, empresa, contacto o ID...'
                  : 'Buscar por nombre, teléfono o correo...'
              }
              className="w-full h-11 pl-10 pr-3 rounded-lg text-sm bg-white dark:bg-dark-card text-brand-black dark:text-dark-text border border-gray-200 dark:border-dark-border focus:border-brand-blue focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/40 outline-none placeholder:text-gray-400 dark:placeholder:text-dark-muted"
            />
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2">
          {/* Venta general */}
          <button
            type="button"
            onClick={handleGeneral}
            className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-dark-surface flex items-center justify-center shrink-0">
              <UserPlus size={16} className="text-gray-500" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-brand-black dark:text-dark-text">
                Venta general
              </p>
              <p className="text-xs text-gray-500 dark:text-dark-muted">
                Sin cliente asignado
              </p>
            </div>
          </button>

          {/* Lista según tab */}
          {isWholesaleTab ? (
            filteredWholesales.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 dark:text-dark-muted">
                  {wholesales.length === 0
                    ? 'No hay clientes mayoristas registrados.'
                    : 'No hay mayoristas que coincidan con la búsqueda.'}
                </p>
                {wholesales.length === 0 && (
                  <button
                    type="button"
                    onClick={handleNewCustomer}
                    className="
                      mt-3 inline-flex items-center gap-1.5 text-sm font-medium
                      text-brand-blue hover:underline
                    "
                  >
                    <UserPlus size={14} strokeWidth={2.2} />
                    Crear el primer mayorista
                  </button>
                )}
              </div>
            ) : (
              filteredWholesales.map((w) => (
                <WholesaleItem
                  key={w.id}
                  wholesale={w}
                  onClick={() => handleSelectWholesale(w)}
                />
              ))
            )
          ) : filteredRegular.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-dark-muted text-center py-6">
              No hay clientes registrados aún.
            </p>
          ) : (
            filteredRegular.map((c) => (
              <RegularItem key={c.id} customer={c} onClick={() => handleSelectRegular(c)} />
            ))
          )}
        </div>

        {/* Nuevo cliente */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-dark-border shrink-0">
          <Button
            variant="primary"
            icon={UserPlus}
            className="w-full"
            onClick={handleNewCustomer}
          >
            {newButtonLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Subcomponentes                                                     */
/* ------------------------------------------------------------------ */

function TabButton({ active, icon: Icon, label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 pb-3 pt-1 text-sm font-medium border-b-2 transition-colors
        ${active
          ? 'border-brand-blue text-brand-blue'
          : 'border-transparent text-gray-500 dark:text-dark-muted hover:text-brand-black dark:hover:text-dark-text'}
      `}
    >
      <Icon size={15} strokeWidth={2} />
      {label}
      {count != null && count > 0 && (
        <span className={`text-[11px] font-semibold ${active ? 'text-brand-blue' : 'text-gray-400'}`}>
          ({count})
        </span>
      )}
    </button>
  )
}

function WholesaleItem({ wholesale, onClick }) {
  const creditAvailable = Math.max(
    0,
    (Number(wholesale.creditLimit) || 0) - (Number(wholesale.creditUsed) || 0),
  )

  // ⭐ FIX: mostrar el descuento base Y/O el primer escalón
  const baseDiscount = Number(wholesale.defaultDiscount) || 0
  const tiers = Array.isArray(wholesale.discountTiers) ? wholesale.discountTiers : []
  const firstTier = tiers.length > 0 ? tiers[0] : null

  // Etiqueta según qué tengamos
  let discountLabel = null
  if (firstTier && firstTier.discount > 0) {
    discountLabel = `${firstTier.minQty}+ pares → ${firstTier.discount}%`
  } else if (baseDiscount > 0) {
    discountLabel = `${baseDiscount}% dto.`
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-start gap-3 p-3 rounded-lg border border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors text-left"
    >
      <div className="w-9 h-9 rounded-full bg-brand-blue text-white flex items-center justify-center shrink-0 text-sm font-semibold">
        {wholesale.name?.[0]?.toUpperCase() || '?'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-brand-black dark:text-dark-text truncate">
            {wholesale.name}
          </p>
          <Badge variant="info">Mayorista</Badge>
        </div>
        <p className="text-xs text-gray-500 dark:text-dark-muted truncate mt-0.5">
          {wholesale.id} {wholesale.contactName && `· ${wholesale.contactName}`}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-[11px] text-gray-500 dark:text-dark-muted">
          {discountLabel && (
            <span className="inline-flex items-center gap-1 text-brand-blue font-medium">
              <Percent size={11} strokeWidth={2.4} />
              {discountLabel}
            </span>
          )}
          {creditAvailable > 0 && (
            <span>Crédito: ${creditAvailable.toLocaleString('es-MX')}</span>
          )}
          {wholesale.overdue && (
            <span className="text-brand-red font-medium">Pago vencido</span>
          )}
        </div>
      </div>
    </button>
  )
}

function RegularItem({ customer, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-surface/50 transition-colors text-left"
    >
      <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-dark-surface text-gray-700 dark:text-dark-text flex items-center justify-center shrink-0 text-sm font-semibold">
        {customer.name?.[0]?.toUpperCase() || '?'}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-brand-black dark:text-dark-text truncate">
          {customer.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-dark-muted truncate">
          {customer.phone || customer.email || '—'}
        </p>
      </div>
    </button>
  )
}