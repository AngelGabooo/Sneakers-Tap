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

  // Preferir la marcada como primary
  const primary = images.find((img) => img?.isPrimary)
  const first = primary || images[0]

  if (typeof first === 'string') return first
  if (first && typeof first === 'object') {
    return first.url || first.publicUrl || null
  }
  return null
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

  const priceFactor = useMemo(() => {
    if (!customer?.isWholesale) return 1
    const d = Number(customer.defaultDiscount) || 0
    return Math.max(0, 1 - d / 100)
  }, [customer])

  const addItem = useCallback(
    (product, variant, quantity = 1) => {
      const key = variant ? `${product.id}__${variant.id}` : `${product.id}__root`
      const basePrice = Number(product.salePrice) || 0
      const price = basePrice * priceFactor
      const variantLabel = variant?.label || '—'
      const sku = variant?.sku || product.sku || ''
      const stock = variant ? Number(variant.stock) || 0 : Number(product.initialStock) || 0

      // ⭐ Extraer imagen de forma robusta
      const imageUrl = extractImageUrl(product.images)

      console.log('🖼️ addItem imagen:', {
        productName: product.name,
        images: product.images,
        imageUrl,
      })

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

  // Recalcular precios cuando cambia el cliente
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

  const totals = useMemo(() => {
    const subtotal = items.reduce((acc, i) => acc + (i.basePrice || 0) * i.quantity, 0)
    const discounted = items.reduce((acc, i) => acc + i.price * i.quantity, 0)

    const wholesaleDiscountAmount = subtotal - discounted

    let extraDiscount = 0
    if (manualDiscount?.scope === 'cart') {
      extraDiscount = manualDiscount.type === 'percent'
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