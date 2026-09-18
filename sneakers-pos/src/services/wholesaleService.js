// src/services/wholesaleService.js
import { supabase } from '../lib/supabase'

/**
 * Servicio de clientes mayoristas — conecta con `wholesale_customers`.
 */
export const wholesaleService = {
  async getAll() {
    const { data, error } = await supabase
      .from('wholesale_customers')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error
    return data || []
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('wholesale_customers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(payload) {
    // Mapeo camelCase → snake_case
    const insertPayload = {
      code: payload.code || null,
      name: payload.name,
      legal_name: payload.legalName || null,
      rfc: payload.rfc || null,
      client_type: payload.clientType || 'person',

      contact_name: payload.contactName || null,
      phone: payload.phone || null,
      phone_secondary: payload.phoneSecondary || null,
      email: payload.email || null,
      website: payload.website || null,

      tax_regime: payload.taxRegime || null,
      cfdi_use: payload.cfdiUse || null,
      billing_email: payload.billingEmail || null,

      street: payload.street || null,
      ext_number: payload.extNumber || null,
      int_number: payload.intNumber || null,
      neighborhood: payload.neighborhood || null,
      zip: payload.zip || null,
      city: payload.city || null,
      state: payload.state || null,
      country: payload.country || null,

      condition: payload.condition || 'basic',
      price_list: payload.priceList || 'public',
      default_discount: Number(payload.defaultDiscount) || 0,
      max_discount: Number(payload.maxDiscount) || 0,
      // ⭐ NUEVO: escalones normalizados
      discount_tiers: normalizeTiers(payload.discountTiers),
      min_purchase_amount: Number(payload.minPurchaseAmount) || 0,
      min_purchase_units: Number(payload.minPurchaseUnits) || 0,

      credit_enabled: !!payload.creditEnabled,
      credit_limit: Number(payload.creditLimit) || 0,
      credit_used: Number(payload.creditUsed) || 0,
      credit_days: Number(payload.creditDays) || 0,

      payment_condition: payload.paymentCondition || 'immediate',
      payment_methods: payload.paymentMethods || [],

      responsable: payload.responsable || null,
      branch: payload.branch || null,

      status: payload.status || 'active',
      overdue: !!payload.overdue,

      internal_notes: payload.internalNotes || null,
    }

    const { data, error } = await supabase
      .from('wholesale_customers')
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      console.error('❌ wholesaleService.create error:', error)
      throw error
    }

    console.log('✅ Mayorista creado:', data.name)
    return data
  },

  async update(id, patch) {
    // Mapeo camelCase → snake_case (solo campos presentes)
    const updatePayload = {}
    const map = {
      code: 'code',
      name: 'name',
      legalName: 'legal_name',
      rfc: 'rfc',
      clientType: 'client_type',
      contactName: 'contact_name',
      phone: 'phone',
      phoneSecondary: 'phone_secondary',
      email: 'email',
      website: 'website',
      taxRegime: 'tax_regime',
      cfdiUse: 'cfdi_use',
      billingEmail: 'billing_email',
      street: 'street',
      extNumber: 'ext_number',
      intNumber: 'int_number',
      neighborhood: 'neighborhood',
      zip: 'zip',
      city: 'city',
      state: 'state',
      country: 'country',
      condition: 'condition',
      priceList: 'price_list',
      defaultDiscount: 'default_discount',
      maxDiscount: 'max_discount',
      // ⭐ NUEVO
      discountTiers: 'discount_tiers',
      minPurchaseAmount: 'min_purchase_amount',
      minPurchaseUnits: 'min_purchase_units',
      creditEnabled: 'credit_enabled',
      creditLimit: 'credit_limit',
      creditUsed: 'credit_used',
      creditDays: 'credit_days',
      paymentCondition: 'payment_condition',
      paymentMethods: 'payment_methods',
      responsable: 'responsable',
      branch: 'branch',
      status: 'status',
      overdue: 'overdue',
      internalNotes: 'internal_notes',
    }

    Object.entries(map).forEach(([camel, snake]) => {
      if (patch[camel] !== undefined) {
        // ⭐ Normalizar discountTiers antes de guardar
        if (camel === 'discountTiers') {
          updatePayload[snake] = normalizeTiers(patch[camel])
        } else {
          updatePayload[snake] = patch[camel]
        }
      }
    })

    const { data, error } = await supabase
      .from('wholesale_customers')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('wholesale_customers')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  async nextCode() {
    const { data, error } = await supabase
      .from('wholesale_customers')
      .select('code')
      .not('code', 'is', null)
      .order('code', { ascending: false })
      .limit(1)

    if (error) throw error
    const last = data?.[0]?.code || 'MAY-00000'
    const num = parseInt(last.replace('MAY-', ''), 10) || 0
    return `MAY-${String(num + 1).padStart(5, '0')}`
  },
}

/**
 * ⭐ Normaliza los tiers antes de guardarlos en Supabase.
 *
 * Reglas:
 *   - Solo acepta arrays.
 *   - Cada tier debe tener `minQty > 0` y `discount >= 0`.
 *   - Ordena por minQty ascendente.
 *   - Deduplica por minQty (se queda con el último si hay repetidos).
 *   - Devuelve array vacío si no hay tiers válidos.
 */
function normalizeTiers(input) {
  if (!Array.isArray(input)) return []

  const clean = input
    .map((t) => ({
      minQty: Number(t?.minQty) || 0,
      discount: Number(t?.discount) || 0,
    }))
    .filter((t) => t.minQty > 0 && t.discount >= 0)

  // Ordenar por minQty asc
  clean.sort((a, b) => a.minQty - b.minQty)

  // Deduplicar por minQty (queda el último que aparece)
  const byQty = new Map()
  for (const t of clean) {
    byQty.set(t.minQty, t)
  }

  return Array.from(byQty.values())
}