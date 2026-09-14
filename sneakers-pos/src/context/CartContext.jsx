import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])           // items del carrito
  const [customer, setCustomer] = useState(null)   // { id, name, isWholesale, discount }
  const [discount, setDiscount] = useState(null)   // { type: 'percent'|'amount', value, scope: 'cart'|'item', itemId }
  const [note, setNote] = useState('')

  /**
   * Agrega un item al carrito.
   * @param {object} product   - producto padre
   * @param {object} variant   - variante seleccionada (o null si producto sin variantes)
   * @param {number} quantity
   */
  const addItem = useCallback((product, variant, quantity = 1) => {
    const key = variant ? `${product.id}__${variant.id}` : `${product.id}__root`
    const price = Number(product.salePrice) || 0
    const variantLabel = variant?.label || '—'
    const sku = variant?.sku || product.sku || ''
    const stock = variant ? Number(variant.stock) || 0 : Number(product.initialStock) || 0

    setItems((list) => {
      const existing = list.find((i) => i.key === key)
      if (existing) {
        const nextQty = Math.min(stock, existing.quantity + quantity)
        return list.map((i) =>
          i.key === key ? { ...i, quantity: nextQty } : i,
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
          price,
          quantity: Math.min(stock, quantity),
          stock,
        },
      ]
    })
  }, [])

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
    setDiscount(null)
    setNote('')
  }, [])

  // -------------------------------------------------------------
  // Totales (sin impuestos por ahora — se conectará después)
  // -------------------------------------------------------------
  const totals = useMemo(() => {
    const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0)
    let discountAmount = 0

    // Descuento global
    if (discount?.scope === 'cart') {
      discountAmount = discount.type === 'percent'
        ? (subtotal * Number(discount.value)) / 100
        : Number(discount.value) || 0
    }
    // Descuento por item
    else if (discount?.scope === 'item' && discount.itemId) {
      const item = items.find((i) => i.key === discount.itemId)
      if (item) {
        const itemSubtotal = item.price * item.quantity
        discountAmount = discount.type === 'percent'
          ? (itemSubtotal * Number(discount.value)) / 100
          : Number(discount.value) || 0
      }
    }

    const taxableBase = Math.max(0, subtotal - discountAmount)
    const tax = 0 // 🚧 conectar cuando tengas IVA configurado
    const total = taxableBase + tax

    return { subtotal, discountAmount, tax, total }
  }, [items, discount])

  const value = {
    items,
    customer,
    discount,
    note,
    totals,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    setCustomer,
    setDiscount,
    setNote,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}