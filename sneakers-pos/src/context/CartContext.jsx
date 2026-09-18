// src/context/CartContext.jsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { storageKey, readSessionJSON, writeSessionJSON } from '../utils/sessionKey'

const CartContext = createContext(null)

const EMPTY_CART = {
  items: [],
  customer: null,
  manualDiscount: null,
  note: '',
}

/**
 * Extrae la URL de la imagen de un producto de forma robusta.
 * Soporta:
 *   - Array de strings: ['url1', 'url2']
 *   - Array de objetos: [{ url: '...', isPrimary: true }]
 *   - String directa
 *   - null / undefined
 */
function extractImageUrl(images) {
  if (!images) return null
  if (typeof images === 'string') return images
  if (!Array.isArray(images) || images.length === 0) return null

  const primary = images.find((img) => img?.isPrimary)
  const first = primary || images[0]

  if (typeof first === 'string') return first
  if (first && typeof first === 'object') {
    return first.url || first.publicUrl || null
  }
  return null
}

/**
 * ⭐ Calcula el descuento por volumen según el total de pares en el carrito.
 *
 * Reglas:
 *   1. Se toma `defaultDiscount` como base (0-3 pares).
 *   2. Se aplica el tier más alto cuyo `minQty <= totalPares`.
 *   3. El resultado se cappe a `maxDiscount` si está definido (>0).
 *
 * @param {number} totalPares - Suma de quantity de todos los items
 * @param {object} customer   - Cliente mayorista
 * @returns {{ discount: number, tier: object|null, nextTier: object|null }}
 */
function computeVolumeDiscount(totalPares, customer) {
  if (!customer?.isWholesale) {
    return { discount: 0, tier: null, nextTier: null }
  }

  const baseDiscount = Number(customer.defaultDiscount) || 0
  const maxDiscount = Number(customer.maxDiscount) || 0
  const tiers = Array.isArray(customer.discountTiers) ? customer.discountTiers : []

  // Ordenar tiers por minQty ascendente
  const sortedTiers = [...tiers]
    .filter((t) => Number(t.minQty) > 0 && Number(t.discount) > 0)
    .sort((a, b) => Number(a.minQty) - Number(b.minQty))

  // Tier aplicable: el más alto cuyo minQty <= totalPares
  let appliedTier = null
  for (const tier of sortedTiers) {
    if (totalPares >= Number(tier.minQty)) {
      appliedTier = tier
    } else {
      break
    }
  }

  // Siguiente tier alcanzable (para hint de UX)
  const nextTier = sortedTiers.find((t) => totalPares < Number(t.minQty)) || null

  // El descuento base vs el del tier: se toma el MAYOR
  let discount = baseDiscount
  if (appliedTier && Number(appliedTier.discount) > discount) {
    discount = Number(appliedTier.discount)
  }

  // Capar al máximo si está definido
  if (maxDiscount > 0 && discount > maxDiscount) {
    discount = maxDiscount
  }

  return { discount, tier: appliedTier, nextTier }
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id || null

  const [items, setItems] = useState([])
  const [customer, setCustomer] = useState(null)
  const [manualDiscount, setManualDiscount] = useState(null)
  const [note, setNote] = useState('')

  // Cargar carrito al cambiar de usuario
  useEffect(() => {
    if (!userId) {
      setItems([])
      setCustomer(null)
      setManualDiscount(null)
      setNote('')
      return
    }

    const key = storageKey('cart', userId)
    const saved = readSessionJSON(key)
    if (saved) {
      setItems(saved.items || [])
      setCustomer(saved.customer || null)
      setManualDiscount(saved.manualDiscount || null)
      setNote(saved.note || '')
    } else {
      setItems([])
      setCustomer(null)
      setManualDiscount(null)
      setNote('')
    }
  }, [userId])

  // Persistir
  useEffect(() => {
    if (!userId) return
    const key = storageKey('cart', userId)
    writeSessionJSON(key, { items, customer, manualDiscount, note })
  }, [userId, items, customer, manualDiscount, note])

  // ⭐ Total de pares en el carrito
  const totalPares = useMemo(
    () => items.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0),
    [items],
  )

  // ⭐ Descuento por volumen calculado
  const volumeDiscount = useMemo(
    () => computeVolumeDiscount(totalPares, customer),
    [totalPares, customer],
  )

  // ⭐ Factor de precio aplicado a TODOS los items
  const priceFactor = useMemo(() => {
    if (!customer?.isWholesale) return 1
    const d = volumeDiscount.discount
    return Math.max(0, 1 - d / 100)
  }, [customer, volumeDiscount.discount])

  const addItem = useCallback(
    (product, variant, quantity = 1) => {
      const key = variant ? `${product.id}__${variant.id}` : `${product.id}__root`
      const basePrice = Number(product.salePrice) || 0
      const price = basePrice * priceFactor
      const variantLabel = variant?.label || '—'
      const sku = variant?.sku || product.sku || ''
      const stock = variant ? Number(variant.stock) || 0 : Number(product.initialStock) || 0
      const imageUrl = extractImageUrl(product.images)

      setItems((list) => {
        const existing = list.find((i) => i.key === key)
        if (existing) {
          const nextQty = Math.min(stock, existing.quantity + quantity)
          return list.map((i) =>
            i.key === key ? { ...i, quantity: nextQty, price } : i,
          )
        }
        return [
          ...list,
          {
            key,
            productId: product.id,
            productName: product.name,
            variantId: variant?.id || null,
            variantLabel,
            sku,
            imageUrl,
            basePrice,
            price,
            quantity: Math.min(stock, quantity),
            stock,
          },
        ]
      })
    },
    [priceFactor],
  )

  // ⭐ Recalcular precios cuando cambia el factor (por cambio de cliente o volumen)
  useEffect(() => {
    setItems((list) =>
      list.map((i) => ({ ...i, price: (i.basePrice || 0) * priceFactor })),
    )
  }, [priceFactor])

  const updateQuantity = useCallback((key, quantity) => {
    setItems((list) =>
      list.map((i) => {
        if (i.key !== key) return i
        const next = Math.max(1, Math.min(i.stock, Number(quantity) || 1))
        return { ...i, quantity: next }
      }),
    )
  }, [])

  const removeItem = useCallback((key) => {
    setItems((list) => list.filter((i) => i.key !== key))
  }, [])

  const clear = useCallback(() => {
    setItems([])
    setCustomer(null)
    setManualDiscount(null)
    setNote('')
    if (userId) {
      const key = storageKey('cart', userId)
      writeSessionJSON(key, EMPTY_CART)
    }
  }, [userId])

  // ⭐ Totales considerando descuento por volumen + manual
  const totals = useMemo(() => {
    const subtotal = items.reduce((acc, i) => acc + (i.basePrice || 0) * i.quantity, 0)
    const discounted = items.reduce((acc, i) => acc + i.price * i.quantity, 0)

    const wholesaleDiscountAmount = subtotal - discounted

    let extraDiscount = 0
    if (manualDiscount?.scope === 'cart') {
      extraDiscount =
        manualDiscount.type === 'percent'
          ? (discounted * Number(manualDiscount.value)) / 100
          : Number(manualDiscount.value) || 0
    }

    const total = Math.max(0, discounted - extraDiscount)
    const tax = 0

    return {
      subtotal,
      wholesaleDiscountAmount,
      discountAmount: wholesaleDiscountAmount + extraDiscount,
      extraDiscount,
      tax,
      total,
    }
  }, [items, manualDiscount])

  const value = {
    items,
    customer,
    discount: manualDiscount,
    note,
    totals,
    // ⭐ Exponer datos del volumen
    totalPares,
    volumeDiscount,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    setCustomer,
    setDiscount: setManualDiscount,
    setNote,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}