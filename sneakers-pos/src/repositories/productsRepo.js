// src/repositories/productsRepo.js
import { dbPromise, STORES } from '../lib/db'
import { productsService } from '../services/productsService'
import { syncQueue } from '../services/sync/syncQueue'
import { OP, PRIORITY } from '../services/sync/operationTypes'
import { generateLocalId } from '../lib/idGenerator'

/**
 * Repositorio offline-first de productos.
 *
 * Estrategia:
 *   - LECTURA: IndexedDB primero (rápido), Supabase en background
 *   - ESCRITURA: IndexedDB + cola de sync (funciona sin internet)
 */

// =====================================================================
// HELPERS INTERNOS
// =====================================================================

async function saveProductToLocal(product) {
  const db = await dbPromise

  // Guardar producto
  await db.put(STORES.PRODUCTS, product)

  // Guardar variantes por separado
  if (Array.isArray(product.variants)) {
    const existingVariants = await db.getAllFromIndex(
      STORES.PRODUCT_VARIANTS,
      'product_id',
      product.id,
    )
    for (const v of existingVariants) {
      await db.delete(STORES.PRODUCT_VARIANTS, v.id)
    }

    for (const variant of product.variants) {
      await db.put(STORES.PRODUCT_VARIANTS, {
        ...variant,
        product_id: product.id,
      })
    }
  }

  return product
}

async function hydrateProduct(product) {
  if (!product) return null
  const db = await dbPromise
  const variants = await db.getAllFromIndex(
    STORES.PRODUCT_VARIANTS,
    'product_id',
    product.id,
  )
  return { ...product, variants }
}

function mapFromSupabase(row) {
  if (!row) return null
  return {
    id: row.id,
    sku: row.sku || '',
    barcode: row.barcode || '',
    name: row.name || '',
    description: row.description || '',
    category: row.category || '',
    brand: row.brand || '',
    salePrice: Number(row.sale_price) || 0,
    costPrice: Number(row.cost_price) || 0,
    minStock: Number(row.min_stock) || 3,
    initialStock: Number(row.initial_stock) || 0,
    images: row.images || [],
    attributes: row.attributes || {},
    status: row.status || 'active',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    syncStatus: 'synced',
    variants: (row.variants || []).map((v) => ({
      id: v.id,
      productId: v.product_id,
      size: v.size,
      color: v.color,
      label: v.label,
      sku: v.sku,
      barcode: v.barcode,
      stock: Number(v.stock) || 0,
    })),
  }
}

// =====================================================================
// API PÚBLICA
// =====================================================================

export const productsRepo = {
  async getAllLocal() {
    const db = await dbPromise
    const products = await db.getAll(STORES.PRODUCTS)
    const hydrated = await Promise.all(products.map(hydrateProduct))
    return hydrated.filter(Boolean)
  },

  async getByIdLocal(id) {
    const db = await dbPromise
    const product = await db.get(STORES.PRODUCTS, id)
    return hydrateProduct(product)
  },

  async getByCodeLocal(code) {
    if (!code) return null
    const db = await dbPromise
    const all = await db.getAll(STORES.PRODUCTS)
    const found = all.find((p) => p.sku === code || p.barcode === code)
    return hydrateProduct(found)
  },

  async syncFromSupabase() {
    try {
      console.log('🔄 Sincronizando productos desde Supabase...')
      const remoteProducts = await productsService.getAll()
      const mapped = remoteProducts.map(mapFromSupabase)

      const db = await dbPromise
      for (const product of mapped) {
        await saveProductToLocal(product)
      }

      console.log(`✅ ${mapped.length} productos sincronizados`)
      return mapped
    } catch (err) {
      console.error('❌ Error sincronizando productos:', err)
      throw err
    }
  },

  async create(product, variants = []) {
    const isOnline = navigator.onLine
    const id = isOnline && crypto?.randomUUID
      ? crypto.randomUUID()
      : generateLocalId('prod')

    const localProduct = {
      id,
      sku: product.sku || '',
      barcode: product.barcode || '',
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      brand: product.brand || '',
      salePrice: Number(product.salePrice) || 0,
      costPrice: Number(product.costPrice) || 0,
      minStock: Number(product.minStock) || 3,
      initialStock: Number(product.initialStock) || 0,
      images: product.images || [],
      attributes: product.attributes || {},
      status: product.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
      variants: variants.map((v) => ({
        id: generateLocalId('var'),
        productId: id,
        size: v.size || null,
        color: v.color || null,
        label: v.label || null,
        sku: v.sku || null,
        barcode: v.barcode || null,
        stock: Number(v.stock) || 0,
      })),
    }

    await saveProductToLocal(localProduct)

    // Encolar pasando el objeto completo (sin variantes, ya van aparte)
    await syncQueue.add({
      type: OP.CREATE_PRODUCT,
      entity: 'products',
      payload: {
        product: { ...localProduct, variants: undefined },
        variants: localProduct.variants,
      },
      priority: PRIORITY.HIGH,
    })

    console.log(`📦 Producto creado localmente: ${localProduct.name} (${id})`)
    return localProduct
  },

  async update(id, product, variants) {
    const existing = await this.getByIdLocal(id)
    if (!existing) throw new Error(`Producto no encontrado: ${id}`)

    const updated = {
      ...existing,
      ...product,
      id,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
      variants: variants || existing.variants,
    }

    await saveProductToLocal(updated)

    // Encolar el objeto completo (el handler mapea)
    await syncQueue.add({
      type: OP.UPDATE_PRODUCT,
      entity: 'products',
      payload: {
        id,
        patch: updated,     // 👈 el handler se encarga del mapeo
        variants: updated.variants,
      },
      priority: PRIORITY.NORMAL,
    })

    console.log(`📝 Producto actualizado: ${updated.name}`)
    return updated
  },

  async delete(id) {
    const db = await dbPromise

    await db.delete(STORES.PRODUCTS, id)

    const variants = await db.getAllFromIndex(
      STORES.PRODUCT_VARIANTS,
      'product_id',
      id,
    )
    for (const v of variants) {
      await db.delete(STORES.PRODUCT_VARIANTS, v.id)
    }

    await syncQueue.add({
      type: OP.DELETE_PRODUCT,
      entity: 'products',
      payload: { id },
      priority: PRIORITY.NORMAL,
    })

    console.log(`🗑️  Producto eliminado: ${id}`)
    return true
  },

  async toggleStatus(id, status) {
    const existing = await this.getByIdLocal(id)
    if (!existing) throw new Error(`Producto no encontrado: ${id}`)

    const updated = {
      ...existing,
      status,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    }

    const db = await dbPromise
    await db.put(STORES.PRODUCTS, updated)

    await syncQueue.add({
      type: OP.UPDATE_PRODUCT,
      entity: 'products',
      payload: {
        id,
        patch: { status },
      },
      priority: PRIORITY.NORMAL,
    })

    return updated
  },

  async updateVariantStock(variantId, newStock) {
    const db = await dbPromise
    const variant = await db.get(STORES.PRODUCT_VARIANTS, variantId)
    if (!variant) throw new Error(`Variante no encontrada: ${variantId}`)

    const updated = {
      ...variant,
      stock: Number(newStock) || 0,
    }
    await db.put(STORES.PRODUCT_VARIANTS, updated)

    await syncQueue.add({
      type: OP.ADJUST_STOCK,
      entity: 'product_variants',
      payload: {
        variantId,
        newStock: updated.stock,
      },
      priority: PRIORITY.NORMAL,
    })

    return updated
  },
}