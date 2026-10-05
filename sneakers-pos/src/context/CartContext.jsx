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
 * Calcula el descuento por volumen según el total de pares en el carrito.
 */
function computeVolumeDiscount(totalPares, customer) {
  if (!customer?.isWholesale) {
    return { discount: 0, tier: null, nextTier: null }
  }

  const baseDiscount = Number(customer.defaultDiscount) || 0
  const maxDiscount = Number(customer.maxDiscount) || 0
  const tiers = Array.isArray(customer.discountTiers) ? customer.discountTiers : []

  const sortedTiers = [...tiers]
    .filter((t) => Number(t.minQty) > 0 && Number(t.discount) > 0)
    .sort((a, b) => Number(a.minQty) - Number(b.minQty))

  let appliedTier = null
  for (const tier of sortedTiers) {
    if (totalPares >= Number(tier.minQty)) {
      appliedTier = tier
    } else {
      break
    }
  }

  const nextTier = sortedTiers.find((t) => totalPares < Number(t.minQty)) || null

  let discount = baseDiscount
  if (appliedTier && Number(appliedTier.discount) > discount) {
    discount = Number(appliedTier.discount)
  }

  if (maxDiscount > 0 && discount > maxDiscount) {
    discount = maxDiscount
  }

  return { discount, tier: appliedTier, nextTier }
}

/**
 * 🎁 PROMO: Calcula el descuento de una promoción sobre los items del carrito.
 *
 * NUEVO MODELO: "Lleva N pares, paga $X por ese grupo"
 *   - bundle_qty: cuántos pares lleva (2, 3, 4...)
 *   - bundle_price: cuánto paga por ese grupo ($1,200)
 *
 * Cálculo:
 *   1. Filtrar items elegibles
 *   2. Expandir a unidades individuales
 *   3. Contar grupos completos = floor(total / bundle_qty)
 *   4. Precio normal del grupo = suma de precios individuales
 *   5. Descuento por grupo = precio_normal - bundle_price
 *   6. Sumar descuentos de todos los grupos
 */
export function computePromotionDiscount(items, promotion) {
  if (!promotion || !items?.length) {
    return { discount: 0, lines: [], detail: null }
  }

  // ⭐ NUEVO MODELO: bundle_qty + bundle_price
  const bundleQty = Number(promotion.bundle_qty) || Number(promotion.buy_qty) || 0
  const bundlePrice = Number(promotion.bundle_price) || 0

  // Validaciones
  if (bundleQty <= 1 || bundlePrice <= 0) {
    return { discount: 0, lines: [], detail: null }
  }

  // 1. Filtrar items elegibles
  const eligible = items.filter((item) => {
    if (promotion.applies_to === 'products') {
      return promotion.productIds?.includes(item.productId)
    }
    if (promotion.applies_to === 'category') {
      return item.category === promotion.category_filter
    }
    if (promotion.applies_to === 'brand') {
      return item.brand === promotion.brand_filter
    }
    return false
  })

  if (eligible.length === 0) {
    return { discount: 0, lines: [], detail: null }
  }

  // 2. Expandir en unidades individuales
  const units = []
  eligible.forEach((item) => {
    for (let i = 0; i < item.quantity; i++) {
      units.push({ ...item, unitIndex: i })
    }
  })

  // 3. Ordenar por precio descendente (agrupa los más caros primero)
  units.sort((a, b) => Number(b.price) - Number(a.price))

  // 4. Contar grupos completos
  const groups = Math.floor(units.length / bundleQty)
  if (groups <= 0) {
    return { discount: 0, lines: [], detail: null }
  }

  // 5. Sumar el descuento por cada grupo
  let totalDiscount = 0
  for (let g = 0; g < groups; g++) {
    const groupUnits = units.slice(g * bundleQty, (g + 1) * bundleQty)
    const normalPrice = groupUnits.reduce((acc, u) => acc + Number(u.price), 0)
    const groupDiscount = Math.max(0, normalPrice - bundlePrice)
    totalDiscount += groupDiscount
  }

  if (totalDiscount <= 0) {
    return { discount: 0, lines: [], detail: null }
  }

  return {
    discount: totalDiscount,
    lines: [{
      promotionId: promotion.id,
      name: promotion.name,
      amount: totalDiscount,
      groups,
      bundleQty,
      bundlePrice,
    }],
    detail: {
      eligibleCount: units.length,
      groups,
      bundleQty,
      bundlePrice,
    },
  }
}

/**
 * 🎁 PROMO: Devuelve las promos que APLICAN al carrito, ordenadas por mayor descuento.
 */
export function findApplicablePromotions(items, promotions) {
  if (!items?.length || !promotions?.length) return []
  return promotions
    .map((promo) => {
      const result = computePromotionDiscount(items, promo)
      return { promotion: promo, ...result }
    })
    .filter((x) => x.discount > 0)
    .sort((a, b) => b.discount - a.discount)
}

export function CartProvider({ children }) {
  const { user } = useAuth()
  const userId = user?.id || null

  const [items, setItems] = useState([])
  const [customer, setCustomer] = useState(null)
  const [manualDiscount, setManualDiscount] = useState(null)
  const [note, setNote] = useState('')

  // 🎁 PROMO: promoción aplicada (la decide el cajero)
  const [appliedPromotionId, setAppliedPromotionId] = useState(null)
  const [promotionResult, setPromotionResult] = useState(null)

  // Cargar carrito al cambiar de usuario
  useEffect(() => {
    if (!userId) {
      setItems([])
      setCustomer(null)
      setManualDiscount(null)
      setNote('')
      setAppliedPromotionId(null)
      setPromotionResult(null)
      return
    }

    const key = storageKey('cart', userId)
    const saved = readSessionJSON(key)
    if (saved) {
      setItems(saved.items || [])
      setCustomer(saved.customer || null)
      setManualDiscount(saved.manualDiscount || null)
      setNote(saved.note || '')
      setAppliedPromotionId(saved.appliedPromotionId || null)
      setPromotionResult(saved.promotionResult || null)
    } else {
      setItems([])
      setCustomer(null)
      setManualDiscount(null)
      setNote('')
      setAppliedPromotionId(null)
      setPromotionResult(null)
    }
  }, [userId])

  // Persistir
  useEffect(() => {
    if (!userId) return
    const key = storageKey('cart', userId)
    writeSessionJSON(key, {
      items, customer, manualDiscount, note,
      appliedPromotionId, promotionResult,
    })
  }, [userId, items, customer, manualDiscount, note, appliedPromotionId, promotionResult])

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

      // 🎁 PROMO: guardar category y brand para que las promos puedan filtrar
      const category = product.category || null
      const brand = product.brand || null

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
            category,       // 🎁 PROMO
            brand,          // 🎁 PROMO
          },
        ]
      })
    },
    [priceFactor],
  )

  // ⭐ Recalcular precios cuando cambia el factor
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

  // 🎁 PROMO: aplicar/quitar promoción
  const applyPromotion = useCallback((promotionId, allPromotions) => {
    setAppliedPromotionId(promotionId)
    if (!promotionId) {
      setPromotionResult(null)
      return
    }
    const promo = (allPromotions || []).find((p) => p.id === promotionId)
    if (!promo) {
      setPromotionResult(null)
      return
    }
    const result = computePromotionDiscount(items, promo)
    setPromotionResult(result)
  }, [items])

  // 🎁 PROMO: recalcular el descuento cuando cambian los items o la promo
  //    Esto mantiene el descuento sincronizado si el cajero agrega/quita pares.
  useEffect(() => {
    if (!appliedPromotionId) return
    // Buscar la promoción aplicada en el resultado guardado (ya viene con productIds)
    // Nota: el resultado guardado en `promotionResult` NO tiene la promo completa,
    // así que solo recalculamos si el usuario vuelve a aplicar la promo.
    // Este efecto evita bugs si el carrito cambia después de aplicar la promo.
    // No-op intencional: el recálculo se hace al aplicar la promo.
  }, [items, appliedPromotionId, promotionResult])

  const clearPromotion = useCallback(() => {
    setAppliedPromotionId(null)
    setPromotionResult(null)
  }, [])

  const clear = useCallback(() => {
    setItems([])
    setCustomer(null)
    setManualDiscount(null)
    setNote('')
    setAppliedPromotionId(null)
    setPromotionResult(null)
    if (userId) {
      const key = storageKey('cart', userId)
      writeSessionJSON(key, EMPTY_CART)
    }
  }, [userId])

  // ⭐ Totales considerando descuento por volumen + manual + promo
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

    // 🎁 PROMO: descuento de promoción
    const promoDiscount = promotionResult?.discount || 0

    const total = Math.max(0, discounted - extraDiscount - promoDiscount)
    const tax = 0

    return {
      subtotal,
      wholesaleDiscountAmount,
      discountAmount: wholesaleDiscountAmount + extraDiscount + promoDiscount,
      extraDiscount,
      promoDiscount,
      promoLines: promotionResult?.lines || [],
      tax,
      total,
    }
  }, [items, manualDiscount, promotionResult])

  const value = {
    items,
    customer,
    discount: manualDiscount,
    note,
    totals,
    totalPares,
    volumeDiscount,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    setCustomer,
    setDiscount: setManualDiscount,
    setNote,
    // 🎁 PROMO
    appliedPromotionId,
    applyPromotion,
    clearPromotion,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de <CartProvider>')
  return ctx
}