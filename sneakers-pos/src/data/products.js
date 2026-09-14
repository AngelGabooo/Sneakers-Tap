/**
 * Contrato de datos del módulo Productos.
 * Actualmente todo vacío / sin datos.
 * Cuando conectes el backend, reemplaza estos valores con la respuesta de tu API.
 */

export const productsMock = {
  stats: {
    total:      { value: null },
    active:     { value: null },
    lowStock:   { value: null },
    outOfStock: { value: null },
  },
  filters: {
    categories: [],     // [{ id, name }]
    brands:     [],     // [{ id, name }]
    statuses:   [],     // [{ id, name }]
  },
  items: [],            // [{ id, name, sku, imageUrl, category, brand, variants, price, stock, status }]
  pagination: {
    page: 1,
    perPage: 20,
    total: 0,
  },
}