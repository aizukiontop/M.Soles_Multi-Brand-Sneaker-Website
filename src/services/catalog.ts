import { api } from './api'
import { setCatalog, type Product } from '../data'

export type ProductFilters = {
  brand?: string[]; category?: string[]; size?: number[]; color?: string[]
  minPrice?: string; maxPrice?: string; q?: string; sort?: string; sale?: string; limit?: number
}

// Calls GET /api/products with server-side brand/category/size/colour/price/search/sort filters.
export async function fetchProducts(f: ProductFilters = {}): Promise<{ items: Product[]; total: number }> {
  const p = new URLSearchParams()
  if (f.brand?.length) p.set('brand', f.brand.join(','))
  if (f.category?.length) p.set('category', f.category.join(','))
  if (f.size?.length) p.set('size', f.size.join(','))
  if (f.color?.length) p.set('color', f.color.join(','))
  if (f.minPrice) p.set('minPrice', f.minPrice)
  if (f.maxPrice) p.set('maxPrice', f.maxPrice)
  if (f.q) p.set('q', f.q)
  if (f.sort) p.set('sort', f.sort)
  if (f.sale) p.set('sale', f.sale)
  if (f.limit) p.set('limit', String(f.limit))
  return api(`/products?${p.toString()}`)
}

// Loads the full catalog into the shared product list used across the storefront.
export async function loadCatalog() {
  const { items } = await fetchProducts({ limit: 200 })
  setCatalog(items)
  return items
}
