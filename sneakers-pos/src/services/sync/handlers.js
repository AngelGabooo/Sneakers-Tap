// src/services/sync/handlers.js
import { supabase } from '../../lib/supabase'
import { OP } from './operationTypes'
import { mapLocalIdToServerId } from '../../lib/idGenerator'

/**
 * Handlers por tipo de operación.
 *
 * Cada handler recibe el `payload` de la operación y retorna:
 *   - { ok: true, serverId } → la operación se sincronizó
 *   - { ok: false, error }   → la operación falló, se reintenta
 */
export const handlers = {

  // ---------------------------------------------------------------
  // PRODUCTOS
  // ---------------------------------------------------------------
  [OP.CREATE_PRODUCT]: async (payload) => {
    const { product, variants } = payload

    const productPayload = {
      sku: product.sku || null,
      barcode: product.barcode || null,
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      brand: product.brand || '',
      sale_price: Number(product.salePrice) || 0,
      cost_price: Number(product.costPrice) || 0,
      min_stock: Number(product.minStock) || 3,
      initial_stock: Number(product.initialStock) || 0,
      images: product.images || [],
      attributes: product.attributes || {},
      status: product.status || 'active',
    }

    if (product.id && !product.id.startsWith('local_')) {
      productPayload.id = product.id
    }

    const { data: createdProduct, error: productError } = await supabase
      .from('products')
      .insert(productPayload)
      .select()
      .single()

    if (productError) return { ok: false, error: productError.message }

    if (product.id?.startsWith('local_')) {
      await mapLocalIdToServerId(product.id, createdProduct.id)
    }

    // ⭐ FIX: Remapear cada variante local → UUID real
    if (Array.isArray(variants) && variants.length > 0) {
      // Filtrar variantes que ya tienen UUID real (no necesitan remapeo)
      const variantsToCreate = variants.filter((v) => !v.id || v.id.startsWith('local_'))

      if (variantsToCreate.length > 0) {
        const variantsPayload = variantsToCreate.map((v) => ({
          product_id: createdProduct.id,
          size: v.size || null,
          color: v.color || null,
          label: v.label || null,
          sku: v.sku || null,
          barcode: v.barcode || null,
          stock: Number(v.stock) || 0,
        }))

        const { data: createdVariants, error: variantsError } = await supabase
          .from('product_variants')
          .insert(variantsPayload)
          .select()   // ⭐ CRÍTICO: devolver las filas creadas

        if (variantsError) {
          console.warn('⚠️ Producto creado pero variantes fallaron:', variantsError)
        } else if (Array.isArray(createdVariants)) {
          // ⭐ Guardar mapping de cada variante: local_var_xxx → UUID
          for (let i = 0; i < createdVariants.length; i++) {
            const localId = variantsToCreate[i]?.id
            const serverId = createdVariants[i]?.id
            if (localId?.startsWith('local_') && serverId) {
              await mapLocalIdToServerId(localId, serverId)
              console.log(`🔗 Variante mapeada: ${localId} → ${serverId}`)
            }
          }
        }
      }

      // ⭐ Variantes que YA tienen UUID real: no hacer nada, ya están creadas
    }

    return { ok: true, serverId: createdProduct.id }
  },

  [OP.UPDATE_PRODUCT]: async (payload) => {
    const { id, patch, variants } = payload

    const productPayload = {}
    if (patch.name !== undefined)         productPayload.name = patch.name
    if (patch.sku !== undefined)          productPayload.sku = patch.sku
    if (patch.barcode !== undefined)      productPayload.barcode = patch.barcode
    if (patch.description !== undefined)  productPayload.description = patch.description
    if (patch.category !== undefined)     productPayload.category = patch.category
    if (patch.brand !== undefined)        productPayload.brand = patch.brand
    if (patch.salePrice !== undefined)    productPayload.sale_price = Number(patch.salePrice) || 0
    if (patch.costPrice !== undefined)    productPayload.cost_price = Number(patch.costPrice) || 0
    if (patch.minStock !== undefined)     productPayload.min_stock = Number(patch.minStock) || 3
    if (patch.initialStock !== undefined) productPayload.initial_stock = Number(patch.initialStock) || 0
    if (patch.images !== undefined)       productPayload.images = patch.images
    if (patch.attributes !== undefined)   productPayload.attributes = patch.attributes
    if (patch.status !== undefined)       productPayload.status = patch.status

    if (Object.keys(productPayload).length > 0) {
      const { error } = await supabase
        .from('products')
        .update(productPayload)
        .eq('id', id)

      if (error) return { ok: false, error: error.message }
    }

    // ⭐ FIX: Remapear variantes al actualizar
    if (Array.isArray(variants)) {
      // ⚠️ OJO: borrar TODAS las variantes y recrearlas rompe el mapping.
      //        Mejor: actualizar las que existen, insertar las nuevas, borrar las eliminadas.
      
      // Obtener las variantes actuales en Supabase
      const { data: existingVariants } = await supabase
        .from('product_variants')
        .select('id')
        .eq('product_id', id)

      const existingIds = new Set((existingVariants || []).map((v) => v.id))

      // Separar en 3 grupos
      const toUpdate = []
      const toInsert = []
      const incomingIds = new Set()

      for (const v of variants) {
        if (v.id && !v.id.startsWith('local_') && existingIds.has(v.id)) {
          toUpdate.push(v)
          incomingIds.add(v.id)
        } else {
          toInsert.push(v)
        }
      }

      // ⚠️ Las que están en existingIds pero NO en incomingIds → borrar
      const toDelete = [...existingIds].filter((id) => !incomingIds.has(id))

      // 1. Borrar las que ya no están
      if (toDelete.length > 0) {
        await supabase.from('product_variants').delete().in('id', toDelete)
      }

      // 2. Actualizar las existentes
      for (const v of toUpdate) {
        await supabase
          .from('product_variants')
          .update({
            size: v.size || null,
            color: v.color || null,
            label: v.label || null,
            sku: v.sku || null,
            barcode: v.barcode || null,
            stock: Number(v.stock) || 0,
          })
          .eq('id', v.id)
      }

      // 3. Insertar las nuevas + guardar mapping
      if (toInsert.length > 0) {
        const insertPayload = toInsert.map((v) => ({
          product_id: id,
          size: v.size || null,
          color: v.color || null,
          label: v.label || null,
          sku: v.sku || null,
          barcode: v.barcode || null,
          stock: Number(v.stock) || 0,
        }))

        const { data: createdVariants, error: insertErr } = await supabase
          .from('product_variants')
          .insert(insertPayload)
          .select()

        if (insertErr) {
          console.warn('⚠️ Variantes nuevas fallaron:', insertErr)
        } else if (Array.isArray(createdVariants)) {
          // Guardar mapping local → UUID
          for (let i = 0; i < createdVariants.length; i++) {
            const localId = toInsert[i]?.id
            const serverId = createdVariants[i]?.id
            if (localId?.startsWith('local_') && serverId) {
              await mapLocalIdToServerId(localId, serverId)
              console.log(`🔗 Variante nueva mapeada: ${localId} → ${serverId}`)
            }
          }
        }
      }
    }

    return { ok: true }
  },

  [OP.UPDATE_PRODUCT]: async (payload) => {
    const { id, patch, variants } = payload

    const productPayload = {}
    if (patch.name !== undefined)         productPayload.name = patch.name
    if (patch.sku !== undefined)          productPayload.sku = patch.sku
    if (patch.barcode !== undefined)      productPayload.barcode = patch.barcode
    if (patch.description !== undefined)  productPayload.description = patch.description
    if (patch.category !== undefined)     productPayload.category = patch.category
    if (patch.brand !== undefined)        productPayload.brand = patch.brand
    if (patch.salePrice !== undefined)    productPayload.sale_price = Number(patch.salePrice) || 0
    if (patch.costPrice !== undefined)    productPayload.cost_price = Number(patch.costPrice) || 0
    if (patch.minStock !== undefined)     productPayload.min_stock = Number(patch.minStock) || 3
    if (patch.initialStock !== undefined) productPayload.initial_stock = Number(patch.initialStock) || 0
    if (patch.images !== undefined)       productPayload.images = patch.images
    if (patch.attributes !== undefined)   productPayload.attributes = patch.attributes
    if (patch.status !== undefined)       productPayload.status = patch.status

    if (Object.keys(productPayload).length > 0) {
      const { error } = await supabase
        .from('products')
        .update(productPayload)
        .eq('id', id)

      if (error) return { ok: false, error: error.message }
    }

    if (Array.isArray(variants)) {
      await supabase.from('product_variants').delete().eq('product_id', id)

      if (variants.length > 0) {
        const variantsPayload = variants.map((v) => ({
          product_id: id,
          size: v.size || null,
          color: v.color || null,
          label: v.label || null,
          sku: v.sku || null,
          barcode: v.barcode || null,
          stock: Number(v.stock) || 0,
        }))

        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(variantsPayload)

        if (variantsError) {
          console.warn('⚠️ Variantes fallaron:', variantsError)
        }
      }
    }

    return { ok: true }
  },

  [OP.DELETE_PRODUCT]: async (payload) => {
    const { id } = payload

    if (id?.startsWith('local_')) {
      console.log(`ℹ️  DELETE_PRODUCT: ID local sin sync, ignorando en Supabase (${id})`)
      return { ok: true }
    }

    const { resolveServerId } = await import('../../lib/idGenerator')
    const serverId = await resolveServerId(id)

    if (serverId?.startsWith('local_')) {
      console.log(`ℹ️  DELETE_PRODUCT: ID resuelto sigue siendo local, ignorando (${serverId})`)
      return { ok: true }
    }

    const { error } = await supabase.from('products').delete().eq('id', serverId)
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  },

  // ---------------------------------------------------------------
  // INVENTARIO
  // ---------------------------------------------------------------
  [OP.ADJUST_STOCK]: async (payload) => {
    const { variantId, newStock, productId, type, quantity, reason, movementId } = payload

    if (variantId) {
      const { error } = await supabase
        .from('product_variants')
        .update({ stock: Number(newStock) || 0 })
        .eq('id', variantId)

      if (error) return { ok: false, error: error.message }
    }

    if (productId && type) {
      await supabase.from('inventory_movements').insert({
        id: movementId?.startsWith('local_') ? undefined : movementId,
        product_id: productId,
        variant_id: variantId || null,
        type,
        quantity: Number(quantity) || 0,
        new_stock: Number(newStock) || 0,
        reason: reason || null,
      })
    }

    return { ok: true }
  },

  // ---------------------------------------------------------------
  // VENTAS
  // ---------------------------------------------------------------
    [OP.CREATE_SALE]: async (payload) => {
    const { sale, items } = payload

    const salePayload = {
      folio: sale.folio,
      cashier: sale.cashier,
      cashier_role: sale.cashierRole,
      seller_id: sale.sellerId || null,
      customer_id: sale.customerId || null,
      customer_name: sale.customerName || null,
      customer_type: sale.customerType || 'regular',
      wholesale_snapshot: sale.wholesaleSnapshot || {},
      totals: sale.totals || {},
      payment: sale.payment || {},
      change: Number(sale.change) || 0,
      total: Number(sale.total) || 0,
      branch: sale.branch || null,
      cash_id: sale.cashId || null,
      cash_session_id: sale.cashSessionId || null,
      status: sale.status || 'completed',
      notes: sale.notes || null,
      created_at: sale.createdAt || new Date().toISOString(),
    }

    if (sale.id && !sale.id.startsWith('local_')) {
      salePayload.id = sale.id
    }

    const { data: saleData, error: saleError } = await supabase
      .from('sales')
      .insert(salePayload)
      .select()
      .single()

    if (saleError) return { ok: false, error: saleError.message }

    if (sale.id?.startsWith('local_')) {
      await mapLocalIdToServerId(sale.id, saleData.id)
    }

    // Insertar items y descontar stock
    if (items?.length) {
    const itemsToInsert = items.map((it) => ({
        sale_id: saleData.id,
        product_id: it.productId || null,
        product_name: it.productName || null,
        variant_id: it.variantId || null,
        variant_label: it.variantLabel || null,
        sku: it.sku || null,
        image_url: it.imageUrl || null,   // ⭐ NUEVO
        price: Number(it.price) || 0,
        base_price: Number(it.basePrice) || 0,
        cost_price: Number(it.costPrice) || 0,   // ⭐ NUEVO (si ya lo agregaste antes)
        quantity: Number(it.quantity) || 1,
      }))

      const { error: itemsError } = await supabase
        .from('sale_items')
        .insert(itemsToInsert)

      if (itemsError) {
        console.warn('⚠️ Venta creada pero items fallaron:', itemsError)
      }

      // ⭐ DESCONTAR STOCK EN SUPABASE
      for (const it of items) {
        if (!it.variantId) continue

        try {
          // 1. Obtener stock actual
          const { data: variantData, error: variantErr } = await supabase
            .from('product_variants')
            .select('id, stock, product_id')
            .eq('id', it.variantId)
            .single()

          if (variantErr || !variantData) {
            console.warn(`⚠️ Variante no encontrada: ${it.variantId}`)
            continue
          }

          const previousStock = Number(variantData.stock) || 0
          const newStock = Math.max(0, previousStock - (Number(it.quantity) || 1))

          // 2. Actualizar stock
          const { error: updateErr } = await supabase
            .from('product_variants')
            .update({ stock: newStock })
            .eq('id', it.variantId)

          if (updateErr) {
            console.warn(`⚠️ Error actualizando stock de ${it.variantId}:`, updateErr)
            continue
          }

          console.log(`📦 Stock remoto actualizado: ${it.sku} ${previousStock} → ${newStock}`)

          // 3. Registrar movimiento
          await supabase.from('inventory_movements').insert({
            product_id: it.productId || variantData.product_id,
            variant_id: it.variantId,
            type: 'sale',
            quantity: -Number(it.quantity),
            previous_stock: previousStock,
            new_stock: newStock,
            reason: `Venta ${sale.folio}`,
            sale_id: saleData.id,
            created_by: sale.sellerId || null,
            created_at: sale.createdAt || new Date().toISOString(),
          })
        } catch (err) {
          console.error(`❌ Error descontando stock de ${it.sku}:`, err)
        }
      }
    }

    return { ok: true, serverId: saleData.id }
  },

  [OP.UPDATE_SALE]: async (payload) => {
    const { id, patch } = payload

    const { resolveServerId } = await import('../../lib/idGenerator')
    const serverId = await resolveServerId(id)

    if (serverId?.startsWith('local_')) {
      console.log(`ℹ️  UPDATE_SALE: ID local sin sync (${serverId})`)
      return { ok: true }
    }

    const { error } = await supabase.from('sales').update(patch).eq('id', serverId)
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  },

  [OP.CANCEL_SALE]: async (payload) => {
    const { id, reason, notes, cancelledBy } = payload

    const { resolveServerId } = await import('../../lib/idGenerator')
    const serverId = await resolveServerId(id)

    if (serverId?.startsWith('local_')) {
      console.log(`ℹ️  CANCEL_SALE: ID local sin sync (${serverId})`)
      return { ok: true }
    }

    const { error } = await supabase
      .from('sales')
      .update({
        status: 'cancelled',
        cancel_reason: reason,
        cancel_notes: notes,
        cancelled_at: new Date().toISOString(),
        cancelled_by: cancelledBy,
      })
      .eq('id', serverId)

    if (error) return { ok: false, error: error.message }
    return { ok: true }
  },

  // ---------------------------------------------------------------
  // CAJA
  // ---------------------------------------------------------------
  [OP.OPEN_CASH]: async (payload) => {
    const { session, movements } = payload

    const sessionPayload = {
      cash_id: session.cashId,
      cash_label: session.cashLabel,
      branch: session.branch,
      responsible_id: session.responsibleId || null,
      responsible_name: session.responsibleName,
      opened_by: session.openedBy,
      initial_fund: Number(session.initialFund) || 0,
      breakdown: session.breakdown || {},
      note: session.note || null,
      status: 'open',
      opened_at: session.openedAt || new Date().toISOString(),
    }

    if (session.id && !session.id.startsWith('local_') && !session.id.startsWith('CAJ-')) {
      sessionPayload.id = session.id
    }

    const { data, error } = await supabase
      .from('cash_sessions')
      .insert(sessionPayload)
      .select()
      .single()

    if (error) return { ok: false, error: error.message }

    if (session.id?.startsWith('local_')) {
      await mapLocalIdToServerId(session.id, data.id)
    }

    if (movements?.length) {
      const movementsPayload = movements.map((m) => ({
        session_id: data.id,
        type: m.type === 'opening' ? 'in' : m.type,
        label: m.label || null,
        amount: Number(m.amount) || 0,
        notes: m.notes || null,
        created_by: m.createdBy || null,
        created_at: m.at || new Date().toISOString(),
      }))

      const { error: movementsError } = await supabase
        .from('cash_movements')
        .insert(movementsPayload)

      if (movementsError) {
        console.warn('⚠️ Caja abierta pero movimientos fallaron:', movementsError)
      }
    }

    return { ok: true, serverId: data.id }
  },

  [OP.CLOSE_CASH]: async (payload) => {
    const { id, patch } = payload

    const { resolveServerId } = await import('../../lib/idGenerator')
    const serverId = await resolveServerId(id)

    if (serverId?.startsWith('local_')) {
      console.log(`ℹ️  CLOSE_CASH: sesión con ID local sin sync, ignorando (${serverId})`)
      return { ok: true }
    }

    const updatePayload = {
      status: 'closed',
      closed_at: new Date().toISOString(),
    }

    if (patch.closedBy !== undefined)      updatePayload.closed_by = patch.closedBy
    if (patch.closingFund !== undefined)   updatePayload.closing_fund = Number(patch.closingFund) || 0
    if (patch.expectedCash !== undefined)  updatePayload.expected_cash = Number(patch.expectedCash) || 0
    if (patch.difference !== undefined)    updatePayload.difference = Number(patch.difference) || 0
    if (patch.reason !== undefined)        updatePayload.reason = patch.reason
    if (patch.authorizedBy !== undefined)  updatePayload.authorized_by = patch.authorizedBy
    if (patch.authorizedAt !== undefined)  updatePayload.authorized_at = patch.authorizedAt
    if (patch.notes !== undefined)         updatePayload.close_notes = patch.notes

    const { error } = await supabase
      .from('cash_sessions')
      .update(updatePayload)
      .eq('id', serverId)

    if (error) return { ok: false, error: error.message }
    return { ok: true }
  },

  [OP.ADD_CASH_MOVE]: async (payload) => {
    const { movement } = payload

    // Resolver el session_id
    const { resolveServerId } = await import('../../lib/idGenerator')
    const sessionId = await resolveServerId(movement.sessionId)

    if (sessionId?.startsWith('local_')) {
      console.log(`ℹ️  ADD_CASH_MOVE: sesión con ID local sin sync (${sessionId})`)
      return { ok: true }
    }

    const { data, error } = await supabase
      .from('cash_movements')
      .insert({
        session_id: sessionId,
        type: movement.type,
        label: movement.label,
        amount: Number(movement.amount) || 0,
        notes: movement.notes || null,
        created_by: movement.createdBy || null,
        created_at: movement.createdAt || movement.at || new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return { ok: false, error: error.message }

    if (movement.id?.startsWith('local_')) {
      await mapLocalIdToServerId(movement.id, data.id)
    }
    return { ok: true, serverId: data.id }
  },

  // ---------------------------------------------------------------
  // CLIENTES / MAYORISTAS
  // ---------------------------------------------------------------
  [OP.CREATE_CUSTOMER]: async (payload) => {
    const { customer } = payload

    // ⭐ Fix 1: excluir el id local antes de insertar.
    //    Supabase genera su propio UUID; enviar 'local_may_...' rompe el INSERT.
    const insertPayload = { ...customer }
    if (insertPayload.id?.startsWith('local_')) {
      delete insertPayload.id
    }
    // Quitar campos que Supabase maneja solo (evita conflictos de timestamp)
    delete insertPayload.created_at
    delete insertPayload.updated_at
    // Quitar `syncStatus` si por accidente viene del repo
    delete insertPayload.syncStatus

    const { data, error } = await supabase
      .from('wholesale_customers')
      .insert(insertPayload)
      .select()
      .single()

    if (error) return { ok: false, error: error.message }

    // ⭐ Mapear el id local → UUID real de Supabase
    if (customer.id?.startsWith('local_')) {
      await mapLocalIdToServerId(customer.id, data.id)
    }
    return { ok: true, serverId: data.id }
  },

  [OP.UPDATE_CUSTOMER]: async (payload) => {
    const { id, patch } = payload

    const { resolveServerId } = await import('../../lib/idGenerator')
    const serverId = await resolveServerId(id)

    if (serverId?.startsWith('local_')) {
      // ⭐ Fix 2: NO marcar como OK. Devolver error para reintentar.
      //    Escenario: el CREATE aún no se ha sincronizado y ya llegó el UPDATE.
      //    Si marcamos OK aquí, perdemos la edición silenciosamente.
      //    Devolviendo error, el syncQueue lo reintenta con backoff y
      //    eventualmente el CREATE habrá terminado y el mapping existirá.
      console.warn(
        `⚠️ UPDATE_CUSTOMER: cliente ${id} sin serverId aún. Reintentando…`,
      )
      return {
        ok: false,
        error: `UPDATE_CUSTOMER: el cliente ${id} aún no tiene ID de servidor. Reintentando…`,
      }
    }

    // ⭐ Limpiar campos que no deben actualizarse desde acá
    const cleanPatch = { ...patch }
    delete cleanPatch.id
    delete cleanPatch.created_at
    delete cleanPatch.syncStatus

    const { error } = await supabase
      .from('wholesale_customers')
      .update(cleanPatch)
      .eq('id', serverId)

    if (error) return { ok: false, error: error.message }
    return { ok: true }
  },

  // ---------------------------------------------------------------
  // CRÉDITOS
  // ---------------------------------------------------------------
  [OP.CREATE_CREDIT]: async (payload) => {
    const { credit, receivedBy } = payload

    const { data, error } = await supabase
      .from('customer_credits')
      .insert({
        customer_id: credit.customerId,
        customer_name: credit.customerName,
        amount: Number(credit.amount) || 0,
        used: 0,
        paid_amount: 0,
        balance: Number(credit.amount) || 0,
        due_date: credit.dueDate,
        status: 'active',
        notes: credit.notes || null,
        created_by: receivedBy?.id || null,
      })
      .select()
      .single()

    if (error) return { ok: false, error: error.message }

    if (credit.id?.startsWith('local_')) {
      await mapLocalIdToServerId(credit.id, data.id)
    }

    return { ok: true, serverId: data.id }
  },

  [OP.UPDATE_CREDIT]: async (payload) => {
    const { id, patch } = payload

    const { resolveServerId } = await import('../../lib/idGenerator')
    const serverId = await resolveServerId(id)

    if (serverId?.startsWith('local_')) {
      return {
        ok: false,
        error: `UPDATE_CREDIT: crédito ${id} aún sin serverId. Reintentando…`,
      }
    }

    const updatePayload = { updated_at: new Date().toISOString() }
    if (patch.status !== undefined) updatePayload.status = patch.status
    if (patch.notes !== undefined) updatePayload.notes = patch.notes
    if (patch.balance !== undefined) updatePayload.balance = Number(patch.balance)
    if (patch.used !== undefined) updatePayload.used = Number(patch.used)
    if (patch.paidAmount !== undefined) updatePayload.paid_amount = Number(patch.paidAmount)
    if (patch.closedAt !== undefined) updatePayload.closed_at = patch.closedAt
    if (patch.closedBy !== undefined) updatePayload.closed_by = patch.closedBy

    const { error } = await supabase
      .from('customer_credits')
      .update(updatePayload)
      .eq('id', serverId)

    if (error) return { ok: false, error: error.message }
    return { ok: true }
  },

  [OP.CREATE_CREDIT_CHARGE]: async (payload) => {
    const { charge } = payload

    const { resolveServerId } = await import('../../lib/idGenerator')
    const creditId = await resolveServerId(charge.creditId)

    if (creditId?.startsWith('local_')) {
      return {
        ok: false,
        error: `CREATE_CREDIT_CHARGE: crédito ${charge.creditId} aún sin serverId. Reintentando…`,
      }
    }

    const { data: credit, error: fetchErr } = await supabase
      .from('customer_credits')
      .select('amount, used, paid_amount')
      .eq('id', creditId)
      .single()

    if (fetchErr) return { ok: false, error: fetchErr.message }

    const newUsed = Number(credit.used) + Number(charge.amount)
    const newAvailable = Number(credit.amount) - (newUsed - Number(credit.paid_amount))

    const { error: updErr } = await supabase
      .from('customer_credits')
      .update({
        used: newUsed,
        balance: newAvailable,
        updated_at: new Date().toISOString(),
      })
      .eq('id', creditId)

    if (updErr) return { ok: false, error: updErr.message }
    return { ok: true }
  },

  [OP.CREATE_CREDIT_PAYMENT]: async (payload) => {
    const { payment, receivedBy } = payload

    const { resolveServerId } = await import('../../lib/idGenerator')
    const creditId = await resolveServerId(payment.creditId)

    if (creditId?.startsWith('local_')) {
      return {
        ok: false,
        error: `CREATE_CREDIT_PAYMENT: crédito ${payment.creditId} aún sin serverId. Reintentando…`,
      }
    }

    // 1. Insertar pago
    const { data: paymentData, error: payErr } = await supabase
      .from('credit_payments')
      .insert({
        credit_id: creditId,
        customer_id: payment.customerId,
        amount: Number(payment.amount) || 0,
        method: payment.method || 'cash',
        received_by: receivedBy?.id || null,
        received_by_name: receivedBy?.name || 'Usuario',
        cash_session_id: payment.cashSessionId || null,
        notes: payment.notes || null,
      })
      .select()
      .single()

    if (payErr) return { ok: false, error: payErr.message }

    // 2. Leer crédito para recalcular
    const { data: credit, error: fetchErr } = await supabase
      .from('customer_credits')
      .select('amount, used, paid_amount')
      .eq('id', creditId)
      .single()

    if (fetchErr) return { ok: false, error: fetchErr.message }

    const newPaid = Number(credit.paid_amount) + Number(payment.amount)
    const newOutstanding = Number(credit.used) - newPaid
    const newAvailable = Number(credit.amount) - newOutstanding
    const isFullyPaid = newOutstanding <= 0.01

    // 3. Actualizar crédito
    const creditUpdate = {
      paid_amount: newPaid,
      balance: newAvailable,
      updated_at: new Date().toISOString(),
    }
    if (isFullyPaid) {
      creditUpdate.status = 'paid'
      creditUpdate.closed_at = new Date().toISOString()
      creditUpdate.closed_by = receivedBy?.id || null
    }

    const { error: updErr } = await supabase
      .from('customer_credits')
      .update(creditUpdate)
      .eq('id', creditId)

    if (updErr) return { ok: false, error: updErr.message }

    if (payment.id?.startsWith('local_')) {
      await mapLocalIdToServerId(payment.id, paymentData.id)
    }

    return { ok: true, serverId: paymentData.id }
  },


  // ---------------------------------------------------------------
  // USUARIOS / PERFILES
  // ---------------------------------------------------------------
  [OP.UPDATE_PROFILE]: async (payload) => {
    const { id, patch } = payload

    // Los profiles usan auth.uid() que ya es UUID real
    const { error } = await supabase.from('profiles').update(patch).eq('id', id)
    if (error) return { ok: false, error: error.message }
    return { ok: true }
  },

// ---------------------------------------------------------------
// AUDITORÍA
// ---------------------------------------------------------------
[OP.CREATE_AUDIT_LOG]: async (payload) => {
  const { event } = payload

  // ⭐ Empaquetar TODO lo extra dentro de metadata
  const enrichedMetadata = {
    ...(event.metadata || {}),
    module: event.module || 'system',
    entityName: event.entityName || event.entityId || null,
    level: event.level || 'info',
    result: event.result || 'success',
    branch: event.branch || 'Tienda principal',
    reason: event.reason || null,
    origin: event.origin || null,
  }

  const auditPayload = {
    user_id: event.userId || null,
    user_name: event.userName || null,
    user_role: event.userRole || null,
    action: event.action,
    entity: event.entity || null,
    entity_id: event.entityId || null,
    description: event.description || null,
    metadata: enrichedMetadata,
    ip: event.ip || null,
    device: event.device || null,
    created_at: event.createdAt || new Date().toISOString(),
  }

  // ✅ NO forzamos el ID: dejamos que Supabase genere su UUID.
  //    Como la auditoría es un log histórico, no necesita remapeo.

  const { data, error } = await supabase
    .from('audit_log')
    .insert(auditPayload)
    .select()
    .single()

  if (error) return { ok: false, error: error.message }

  // Guardamos el serverId en el payload para que el syncEngine
  // pueda actualizar el registro local (ver BLOQUE A2)
  return { ok: true, serverId: data.id }
},

  // ---------------------------------------------------------------
  // CONFIGURACIÓN (SETTINGS)
  // ---------------------------------------------------------------
  [OP.UPDATE_SETTINGS]: async (payload) => {
    const { settings } = payload

    const dataPayload = {
      store: settings.store || {},
      ticket: settings.ticket || {},
      sales: settings.sales || {},
      taxes: settings.taxes || {},
      preferences: settings.preferences || {},
      branches: settings.branches || [],
    }

    // ¿Existe la fila?
    const { data: existing, error: findError } = await supabase
      .from('settings')
      .select('id')
      .limit(1)
      .maybeSingle()

    if (findError) return { ok: false, error: findError.message }

    if (existing?.id) {
      // Actualizar
      const { error } = await supabase
        .from('settings')
        .update(dataPayload)
        .eq('id', existing.id)

      if (error) return { ok: false, error: error.message }
    } else {
      // Crear
      const { error } = await supabase
        .from('settings')
        .insert(dataPayload)

      if (error) return { ok: false, error: error.message }
    }

    return { ok: true }
  },
}

/**
 * Ejecuta un handler según el tipo de operación.
 */
export async function runHandler(operation) {
  const handler = handlers[operation.type]
  if (!handler) {
    return { ok: false, error: `Handler no encontrado: ${operation.type}` }
  }
  try {
    return await handler(operation.payload)
  } catch (err) {
    return { ok: false, error: err.message || 'Error desconocido' }
  }
}