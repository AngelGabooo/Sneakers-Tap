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

export function CartProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id || null

  const [items, setItems] = useState([])
  const [customer, setCustomer] = useState(null)
  const [manualDiscount, setManualDiscount] = useState(null)
  const [note, setNote] = useState('')

  // -------------------------------------------------------------
  // Cargar carrito al cambiar de usuario
  // Cada usuario tiene su propia clave en sessionStorage
  // -------------------------------------------------------------
  useEffect(() => {
    if (!userId) {
      // Sin usuario → carrito vacío
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

  // -------------------------------------------------------------
  // Persistir el carrito automáticamente
  // (solo si hay usuario)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!userId) return
    const key = storageKey('cart', userId)
    writeSessionJSON(key, { items, customer, manualDiscount, note })
  }, [userId, items, customer, manualDiscount, note])

  /**
   * Factor multiplicador del precio según el cliente mayorista.
   */
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
            imageUrl: product.images?.[0]?.url || null,
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

  // Recalcular precios cuando cambia el cliente (mayorista ↔ regular)
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

  // Totales
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