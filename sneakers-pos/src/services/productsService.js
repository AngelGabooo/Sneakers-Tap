// src/services/productsService.js
import { supabase } from '../lib/supabase'

/**
 * Servicio de productos, variantes y movimientos de inventario.
 * Todas las funciones hablan con Supabase.
 */
export const productsService = {
  // =================================================================
  // PRODUCTOS
  // =================================================================

  /**
   * Obtiene todos los productos con sus variantes.
   */
  async getAll() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        variants:product_variants (*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Obtiene un producto por ID con sus variantes.
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        variants:product_variants (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Obtiene un producto por SKU o barcode.
   */
  async getByCode(code) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        variants:product_variants (*)
      `)
      .or(`sku.eq.${code},barcode.eq.${code}`)
      .maybeSingle()

    if (error) throw error
    return data
  },

  /**
   * Crea un producto (con sus variantes opcionales).
   *
   * @param {object} payload
   * @param {object} payload.product   — datos del producto
   * @param {array}  payload.variants  — array de variantes
   */
  async create({ product, variants = [] }) {
    // 1. Insertar producto
    const { data: createdProduct, error: productError } = await supabase
      .from('products')
      .insert({
        sku: product.sku,
        barcode: product.barcode,
        name: product.name,
        description: product.description,
        category: product.category,
        brand: product.brand,
        sale_price: Number(product.salePrice) || 0,
        cost_price: Number(product.costPrice) || 0,
        min_stock: Number(product.minStock) || 3,
        initial_stock: Number(product.initialStock) || 0,
        images: product.images || [],
        attributes: product.attributes || {},
        status: product.status || 'active',
      })
      .select()
      .single()

    if (productError) throw productError

    // 2. Insertar variantes (si hay)
    let createdVariants = []
    if (variants.length > 0) {
      const variantsPayload = variants.map((v) => ({
        product_id: createdProduct.id,
        size: v.size || null,
        color: v.color || null,
        label: v.label || null,
        sku: v.sku || null,
        barcode: v.barcode || null,
        stock: Number(v.stock) || 0,
      }))

      const { data: variantsData, error: variantsError } = await supabase
        .from('product_variants')
        .insert(variantsPayload)
        .select()

      if (variantsError) {
        console.error('⚠️ Producto creado pero variantes fallaron:', variantsError)
      } else {
        createdVariants = variantsData || []
      }
    }

    return { ...createdProduct, variants: createdVariants }
  },

  /**
   * Actualiza un producto y sus variantes.
   * Reemplaza las variantes por completo (delete + insert).
   */
  async update(id, { product, variants }) {
    // 1. Actualizar producto
    const { data: updatedProduct, error: productError } = await supabase
      .from('products')
      .update({
        sku: product.sku,
        barcode: product.barcode,
        name: product.name,
        description: product.description,
        category: product.category,
        brand: product.brand,
        sale_price: Number(product.salePrice) || 0,
        cost_price: Number(product.costPrice) || 0,
        min_stock: Number(product.minStock) || 3,
        initial_stock: Number(product.initialStock) || 0,
        images: product.images || [],
        attributes: product.attributes || {},
        status: product.status || 'active',
      })
      .eq('id', id)
      .select()
      .single()

    if (productError) throw productError

    // 2. Actualizar variantes (solo si vienen)
    if (Array.isArray(variants)) {
      // Borrar las que ya no están
      const keepIds = variants.map((v) => v.id).filter(Boolean)

      if (keepIds.length > 0) {
        await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', id)
          .not('id', 'in', `(${keepIds.join(',')})`)
      } else {
        await supabase.from('product_variants').delete().eq('product_id', id)
      }

      // Actualizar existentes + insertar nuevas
      for (const v of variants) {
        const variantPayload = {
          product_id: id,
          size: v.size || null,
          color: v.color || null,
          label: v.label || null,
          sku: v.sku || null,
          barcode: v.barcode || null,
          stock: Number(v.stock) || 0,
        }

        if (v.id && !v.id.startsWith('local_')) {
          await supabase
            .from('product_variants')
            .update(variantPayload)
            .eq('id', v.id)
        } else {
          await supabase.from('product_variants').insert(variantPayload)
        }
      }
    }

    // 3. Devolver producto actualizado con variantes
    return await this.getById(id)
  },

  /**
   * Elimina un producto (y sus variantes por CASCADE).
   */
  async delete(id) {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
    return true
  },

  /**
   * Cambia el status de un producto (active/inactive).
   */
  async toggleStatus(id, status) {
    const { error } = await supabase
      .from('products')
      .update({ status })
      .eq('id', id)

    if (error) throw error
    return true
  },

  // =================================================================
  // VARIANTES (operaciones directas)
  // =================================================================

  /**
   * Actualiza el stock de una variante.
   */
  async updateVariantStock(variantId, newStock) {
    const { error } = await supabase
      .from('product_variants')
      .update({ stock: Number(newStock) || 0 })
      .eq('id', variantId)

    if (error) throw error
    return true
  },

  // =================================================================
  // MOVIMIENTOS DE INVENTARIO
  // =================================================================

  /**
   * Registra un movimiento de inventario.
   */
  async createMovement(movement) {
    const { data, error } = await supabase
      .from('inventory_movements')
      .insert({
        product_id: movement.productId,
        variant_id: movement.variantId || null,
        type: movement.type,
        quantity: Number(movement.quantity) || 0,
        previous_stock: Number(movement.previousStock) || null,
        new_stock: Number(movement.newStock) || null,
        reason: movement.reason || null,
        notes: movement.notes || null,
        sale_id: movement.saleId || null,
        created_by: movement.createdBy || null,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Obtiene movimientos con filtros.
   */
  async getMovements(filters = {}) {
    let query = supabase
      .from('inventory_movements')
      .select(`
        *,
        product:products (id, name, sku),
        variant:product_variants (id, size, color, label),
        user:profiles (id, full_name)
      `)
      .order('created_at', { ascending: false })

    if (filters.productId) {
      query = query.eq('product_id', filters.productId)
    }
    if (filters.type) {
      query = query.eq('type', filters.type)
    }
    if (filters.from) {
      query = query.gte('created_at', filters.from)
    }
    if (filters.to) {
      query = query.lte('created_at', filters.to)
    }
    if (filters.limit) {
      query = query.limit(filters.limit)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },
}