// src/context/PromotionsContext.jsx
import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react'
import { promotionsRepo } from '../repositories/promotionsRepo'
import { useNetwork } from './NetworkContext'
import { useAuth } from './AuthContext'

const PromotionsContext = createContext(null)

/**
 * 🎁 NUEVO MODELO:
 *   El dueño configura: "lleva N pares, paga $X por ese grupo"
 *   - bundle_qty: cuántos pares lleva (2, 3, 4...)
 *   - bundle_price: cuánto paga por ese grupo ($1,200)
 *
 * Cálculo:
 *   1. Filtrar items elegibles
 *   2. Expandir a unidades individuales
 *   3. Contar grupos completos = floor(total / bundle_qty)
 *   4. Precio normal del grupo = suma de precios individuales del grupo
 *   5. Descuento por grupo = precio_normal - bundle_price
 *   6. Si el grupo es positivo → descuento total
 */
export function computePromotionDiscount(items, promotion, customer = null) {
  if (!promotion || !items?.length) return { discount: 0, lines: [], detail: null }

  const bundleQty = Number(promotion.bundle_qty) || Number(promotion.buy_qty) || 0
  const bundlePrice = Number(promotion.bundle_price) || 0

  // Validaciones
  if (bundleQty <= 1 || bundlePrice <= 0) {
    return { discount: 0, lines: [], detail: null }
  }

  // 1. Filtrar items elegibles según applies_to
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

  if (eligible.length === 0) return { discount: 0, lines: [], detail: null }

  // 2. Expandir a unidades individuales
  const units = []
  eligible.forEach((item) => {
    for (let i = 0; i < item.quantity; i++) {
      units.push({ ...item, unitIndex: i })
    }
  })

  // 3. Ordenar por precio DESC (para agrupar los más caros primero)
  units.sort((a, b) => Number(b.price) - Number(a.price))

  // 4. Calcular grupos completos
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
 * Devuelve las promos que APLICAN a un carrito (con el descuento calculado).
 */
export function findApplicablePromotions(items, promotions, customer = null) {
  if (!items?.length || !promotions?.length) return []
  return promotions
    .map((promo) => {
      const result = computePromotionDiscount(items, promo, customer)
      return { promotion: promo, ...result }
    })
    .filter((x) => x.discount > 0)
    .sort((a, b) => b.discount - a.discount)
}

export function PromotionsProvider({ children }) {
  const { isOnline } = useNetwork()
  const { user } = useAuth()
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const list = isOnline ? await promotionsRepo.getAll() : []
      setPromotions(list)
    } catch (err) {
      console.error('❌ Error cargando promociones:', err)
    } finally {
      setLoading(false)
    }
  }, [isOnline])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!isOnline) return
    const t = setTimeout(load, 2000)
    return () => clearTimeout(t)
  }, [isOnline, load])

  const createPromotion = useCallback(async (promotion) => {
    const created = await promotionsRepo.create({
      promotion,
      createdBy: { id: user?.id, name: user?.name, role: user?.role },
    })
    setPromotions((list) => [created, ...list])
    return created
  }, [user])

  const updatePromotion = useCallback(async (id, promotion) => {
    const updated = await promotionsRepo.update(id, {
      promotion,
      updatedBy: { id: user?.id, name: user?.name, role: user?.role },
    })
    setPromotions((list) => list.map((p) => (p.id === id ? updated : p)))
    return updated
  }, [user])

  const togglePromotion = useCallback(async (id, active) => {
    const updated = await promotionsRepo.toggleActive(id, active)
    setPromotions((list) => list.map((p) => (p.id === id ? updated : p)))
    return updated
  }, [])

  const deletePromotion = useCallback(async (id) => {
    await promotionsRepo.delete(id)
    setPromotions((list) => list.filter((p) => p.id !== id))
  }, [])

  const activePromotions = useMemo(
    () => promotions.filter((p) => p.active),
    [promotions],
  )

  const value = {
    promotions,
    activePromotions,
    loading,
    createPromotion,
    updatePromotion,
    togglePromotion,
    deletePromotion,
    refresh: load,
  }

  return (
    <PromotionsContext.Provider value={value}>
      {children}
    </PromotionsContext.Provider>
  )
}

export function usePromotions() {
  const ctx = useContext(PromotionsContext)
  if (!ctx) throw new Error('usePromotions debe usarse dentro de <PromotionsProvider>')
  return ctx
}