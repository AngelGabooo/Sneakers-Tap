// src/services/stockAlertsService.js
import { supabase } from '../lib/supabase'
import { notifyAdmins } from '../utils/notifyAdmins'

const MIN_HOURS_BETWEEN_ALERTS = 24

/**
 * Revisa el stock de una variante y dispara notificación si es necesario.
 * Evita spam: no repite la misma alerta en menos de 24h.
 */
export async function checkVariantStock({
  variantId,
  productId,
  productName,
  variantLabel,
  sku,
  stock,
  minStock = 3,
  branch = null,
}) {
  const s = Number(stock) || 0
  const min = Number(minStock) || 3

  // ¿Está en alerta?
  let alertType = null
  if (s === 0) alertType = 'out'
  else if (s <= min) alertType = 'low'
  else return null  // stock OK, no hacemos nada

  // ¿Ya alertamos recientemente?
  try {
    const since = new Date(Date.now() - MIN_HOURS_BETWEEN_ALERTS * 60 * 60 * 1000).toISOString()

    const { data: recent } = await supabase
      .from('stock_alerts_log')
      .select('id, alert_type')
      .eq('variant_id', variantId)
      .eq('alert_type', alertType)
      .gte('created_at', since)
      .limit(1)
      .maybeSingle()

    if (recent) {
      console.log(`ℹ️ Ya se alertó ${variantId} (${alertType}) en últimas ${MIN_HOURS_BETWEEN_ALERTS}h`)
      return null
    }
  } catch (err) {
    console.warn('⚠️ Error verificando alerts previas:', err.message)
    // Continuar — mejor duplicar que no avisar
  }

  // Crear notificación
  try {
    const title = alertType === 'out'
      ? `🚨 Producto agotado · ${productName}`
      : `⚠️ Stock bajo · ${productName}`

    const description = alertType === 'out'
      ? `"${productName}${variantLabel ? ` · ${variantLabel}` : ''}" se quedó sin stock (SKU: ${sku || '—'})`
      : `"${productName}${variantLabel ? ` · ${variantLabel}` : ''}" tiene solo ${s} ${s === 1 ? 'unidad' : 'unidades'} (SKU: ${sku || '—'})`

    await notifyAdmins({
      type: 'inventory',
      title,
      description,
      priority: alertType === 'out' ? 'critical' : 'important',
      actorName: 'Sistema',
      actorRole: 'Sistema',
      entityId: variantId,
      meta: {
        variantId,
        productId,
        productName,
        variantLabel,
        sku,
        stock: s,
        minStock: min,
        alertType,
        branch,
      },
    })

    // Registrar en el log para anti-spam
    await supabase.from('stock_alerts_log').insert({
      variant_id: variantId,
      product_id: productId,
      alert_type: alertType,
      stock_at_alert: s,
    })

    console.log(`📢 Alerta de stock creada: ${productName} (${s})`)
  } catch (err) {
    console.error('❌ Error creando alerta de stock:', err.message)
  }

  return alertType
}

/**
 * Revisa TODOS los productos y dispara alertas para los que estén en umbral.
 * Útil al abrir la app o desde un botón "revisar inventario".
 */
export async function checkAllStock(products = [], options = {}) {
  const results = { checked: 0, alerted: 0 }

  for (const p of products) {
    const min = Number(p.minStock) || 3
    const variants = p.variants || []

    if (variants.length === 0) {
      // Producto sin variantes
      const stock = Number(p.initialStock) || 0
      const alertType = await checkVariantStock({
        variantId: `root_${p.id}`,
        productId: p.id,
        productName: p.name,
        variantLabel: null,
        sku: p.sku,
        stock,
        minStock: min,
        branch: options.branch,
      })
      results.checked++
      if (alertType) results.alerted++
      continue
    }

    // Con variantes
    for (const v of variants) {
      const stock = Number(v.stock) || 0
      const alertType = await checkVariantStock({
        variantId: v.id,
        productId: p.id,
        productName: p.name,
        variantLabel: v.label,
        sku: v.sku,
        stock,
        minStock: min,
        branch: options.branch,
      })
      results.checked++
      if (alertType) results.alerted++
    }
  }

  console.log(`✅ Revisión de stock: ${results.checked} variantes, ${results.alerted} alertas`)
  return results
}