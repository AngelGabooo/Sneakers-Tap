// src/services/promotionsService.js
import { supabase } from '../lib/supabase'

const mapRow = (row) => ({
  ...row,
  productIds: (row.products || []).map((x) => x.product_id),
  products: undefined,
})

export const promotionsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('promotions')
      .select(`*, products:promotion_products (product_id)`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapRow)
  },

  async getActive() {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('promotions')
      .select(`*, products:promotion_products (product_id)`)
      .eq('active', true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []).map(mapRow)
  },

  async create({ promotion }) {
    const payload = {
      name: promotion.name,
      description: promotion.description || null,
      type: promotion.type || 'nxm',
      buy_qty: Number(promotion.buyQty) || Number(promotion.bundleQty) || 2,
      pay_qty: Number(promotion.payQty) || 1,
      bundle_qty: Number(promotion.bundleQty) || null,
      bundle_price: Number(promotion.bundlePrice) || null,
      applies_to: promotion.appliesTo || 'products',
      category_filter: promotion.categoryFilter || null,
      brand_filter: promotion.brandFilter || null,
      starts_at: promotion.startsAt || null,
      ends_at: promotion.endsAt || null,
      active: promotion.active !== false,
      created_by: promotion.createdBy || null,
    }

    const { data: created, error } = await supabase
      .from('promotions')
      .insert(payload)
      .select()
      .single()

    if (error) throw error

    if (promotion.productIds?.length > 0) {
      const productsPayload = promotion.productIds.map((pid) => ({
        promotion_id: created.id,
        product_id: pid,
      }))
      const { error: prodErr } = await supabase
        .from('promotion_products')
        .insert(productsPayload)
      if (prodErr) console.warn('⚠️ Productos no insertados:', prodErr)
    }

    return { ...created, productIds: promotion.productIds || [] }
  },

  async update(id, { promotion }) {
    const payload = {
      name: promotion.name,
      description: promotion.description || null,
      type: promotion.type || 'nxm',
      buy_qty: Number(promotion.buyQty) || Number(promotion.bundleQty) || 2,
      pay_qty: Number(promotion.payQty) || 1,
      bundle_qty: Number(promotion.bundleQty) || null,
      bundle_price: Number(promotion.bundlePrice) || null,
      applies_to: promotion.appliesTo || 'products',
      category_filter: promotion.categoryFilter || null,
      brand_filter: promotion.brandFilter || null,
      starts_at: promotion.startsAt || null,
      ends_at: promotion.endsAt || null,
      active: promotion.active !== false,
      updated_at: new Date().toISOString(),
    }

    const { data: updated, error } = await supabase
      .from('promotions')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    await supabase.from('promotion_products').delete().eq('promotion_id', id)
    if (promotion.productIds?.length > 0) {
      const productsPayload = promotion.productIds.map((pid) => ({
        promotion_id: id,
        product_id: pid,
      }))
      await supabase.from('promotion_products').insert(productsPayload)
    }

    return { ...updated, productIds: promotion.productIds || [] }
  },

  async toggleActive(id, active) {
    const { data, error } = await supabase
      .from('promotions')
      .update({ active, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase.from('promotions').delete().eq('id', id)
    if (error) throw error
    return true
  },
}