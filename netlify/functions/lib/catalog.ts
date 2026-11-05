import { and, asc, desc, eq, gte, ilike, inArray, lte, or, sql } from 'drizzle-orm'
import { db } from '../../../db/index.js'
import { products } from '../../../db/schema.js'
import { HttpError, int, json, readJson, str, clamp, num } from './http.js'
import { requireAdmin } from './auth.js'

// Shape consumed by the storefront (matches the Product type in src/data.ts).
export type ProductDTO = {
  id: string; name: string; brand: string; cats: string[]; colors: string[]; sizes: number[]
  price: number; was?: number; rating: number; reviews: number; img: string; imgs: string[]; imageColors: string[]
  isNew?: boolean; best?: boolean; trending?: boolean; order: number; desc: string; stock: number
}

type Row = typeof products.$inferSelect

export function toDTO(r: Row): ProductDTO {
  return {
    id: r.id, name: r.name, brand: r.brand, cats: r.categories, colors: r.availableColors,
    sizes: r.availableSizes, price: r.price, was: r.wasPrice ?? undefined, rating: r.rating,
    reviews: r.reviews, img: r.images[0] ?? '', imgs: r.images, imageColors: r.imageColors, isNew: r.isNew || undefined,
    best: r.isBest || undefined, trending: r.isTrending || undefined, order: r.sortOrder,
    desc: r.description, stock: r.stockQuantity,
  }
}

const csv = (v: string | null, max = 50) =>
  (v ?? '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, max)

// GET /api/products?brand=Nike,Adidas&category=Men&q=pulse&size=9,10&color=Red&minPrice=&maxPrice=&sort=&limit=
export async function listProducts(url: URL) {
  const p = url.searchParams
  const conditions = []

  const brands = csv(p.get('brand'))
  if (brands.length) conditions.push(inArray(products.brand, brands))

  const cats = csv(p.get('category'))
  if (cats.length) {
    conditions.push(sql`${products.categories} && ARRAY[${sql.join(cats.map((c) => sql`${c}`), sql`, `)}]::text[]`)
  }

  const colors = csv(p.get('color'))
  if (colors.length) {
    conditions.push(sql`${products.availableColors} && ARRAY[${sql.join(colors.map((c) => sql`${c}`), sql`, `)}]::text[]`)
  }

  const sizes = csv(p.get('size')).map(Number).filter((n) => Number.isFinite(n))
  if (sizes.length) {
    conditions.push(sql`${products.availableSizes} && ARRAY[${sql.join(sizes.map((s) => sql`${s}`), sql`, `)}]::real[]`)
  }

  const minPrice = num(p.get('minPrice'))
  if (Number.isFinite(minPrice) && p.get('minPrice')) conditions.push(gte(products.price, Math.trunc(minPrice)))
  const maxPrice = num(p.get('maxPrice'))
  if (Number.isFinite(maxPrice) && p.get('maxPrice')) conditions.push(lte(products.price, Math.trunc(maxPrice)))

  // sale=1 limits results to sneakers that carry an original (was) price.
  if (p.get('sale') === '1') conditions.push(sql`${products.wasPrice} is not null`)

  const q = str(p.get('q'), 80)
  if (q) {
    const pattern = `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`
    conditions.push(or(
      ilike(products.name, pattern),
      ilike(products.brand, pattern),
      sql`array_to_string(${products.categories}, ' ') ILIKE ${pattern}`,
    )!)
  }

  const sortMap = {
    featured: [desc(products.isBest), desc(products.sortOrder)],
    newest: [desc(products.sortOrder)],
    'price-asc': [asc(products.price)],
    'price-desc': [desc(products.price)],
    rating: [desc(products.rating), desc(products.reviews)],
  } as const
  const sortKey = (str(p.get('sort'), 20) || 'featured') as keyof typeof sortMap
  const orderBy = sortMap[sortKey] ?? sortMap.featured

  const limit = clamp(int(p.get('limit'), 200), 1, 200)
  const where = conditions.length ? and(...conditions) : undefined

  const rows = await db.select().from(products).where(where).orderBy(...orderBy).limit(limit)
  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(products)
    .where(where)
  return json({ items: rows.map(toDTO), total })
}

export async function getProductById(id: string) {
  const [row] = await db.select().from(products).where(eq(products.id, id)).limit(1)
  if (!row) throw new HttpError(404, 'Sneaker not found.')
  return toDTO(row)
}

// ---------------------------------------------------------------------------
// Admin product management
// ---------------------------------------------------------------------------

function parseProductInput(body: Record<string, unknown>, creating: boolean) {
  const errors: string[] = []
  const name = str(body.name, 120)
  const brand = str(body.brand, 60)
  if (!name) errors.push('Name is required.')
  if (!brand) errors.push('Brand is required.')

  const price = Math.trunc(num(body.price))
  if (!Number.isFinite(price) || price <= 0 || price > 1_000_000) errors.push('Price must be a positive whole number of pesos.')

  let wasPrice: number | null = null
  if (body.wasPrice !== undefined && body.wasPrice !== null && body.wasPrice !== '') {
    wasPrice = Math.trunc(num(body.wasPrice))
    if (!Number.isFinite(wasPrice) || wasPrice <= price) errors.push('Original price must be higher than the current price.')
  }

  const stock = Math.trunc(num(body.stockQuantity ?? 0))
  if (!Number.isFinite(stock) || stock < 0 || stock > 100_000) errors.push('Stock must be zero or more.')

  const sizes = Array.isArray(body.availableSizes) ? body.availableSizes.map(Number) : []
  if (sizes.length === 0 || sizes.some((s) => !Number.isFinite(s) || s < 3 || s > 16)) {
    errors.push('Select at least one valid size.')
  }

  const colors = Array.isArray(body.availableColors) ? body.availableColors.map((c) => str(c, 30)).filter(Boolean) : []
  if (colors.length === 0) errors.push('Select at least one color.')

  const categories = Array.isArray(body.categories) ? body.categories.map((c) => str(c, 30)).filter(Boolean) : []
  const images = Array.isArray(body.images) ? body.images.map((i) => str(i, 300)).filter(Boolean).slice(0, 8) : []
  if (images.length === 0) errors.push('Add at least one image.')

  if (errors.length) throw new HttpError(422, errors.join(' '))

  const slugBase = `${brand}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return {
    id: creating ? slugBase : undefined,
    name, brand,
    categories,
    description: str(body.description, 2000),
    price,
    wasPrice,
    images,
    availableSizes: [...new Set(sizes)].sort((a, b) => a - b),
    availableColors: [...new Set(colors)],
    stockQuantity: stock,
    isNew: body.isNew === true,
    isBest: body.isBest === true,
    isTrending: body.isTrending === true,
    sortOrder: int(body.sortOrder, 0),
    rating: clamp(num(body.rating ?? 0) || 0, 0, 5),
    reviews: clamp(int(body.reviews, 0), 0, 1_000_000),
  }
}

export async function adminListProducts() {
  await requireAdmin()
  const rows = await db.select().from(products).orderBy(desc(products.sortOrder))
  return json({ items: rows.map(toDTO) })
}

export async function adminCreateProduct(req: Request) {
  await requireAdmin()
  const body = await readJson(req)
  const input = parseProductInput(body, true)
  const id = input.id!
  const [exists] = await db.select({ id: products.id }).from(products).where(eq(products.id, id)).limit(1)
  if (exists) throw new HttpError(409, 'A product with this brand and name already exists.')
  const [row] = await db.insert(products).values({ ...input, id }).returning()
  return json({ item: toDTO(row) }, 201)
}

export async function adminUpdateProduct(id: string, req: Request) {
  await requireAdmin()
  const body = await readJson(req)
  const input = parseProductInput(body, false)
  const { id: _ignored, ...values } = input
  const [row] = await db.update(products).set(values).where(eq(products.id, id)).returning()
  if (!row) throw new HttpError(404, 'Product not found.')
  return json({ item: toDTO(row) })
}

export async function adminDeleteProduct(id: string) {
  await requireAdmin()
  const [row] = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id })
  if (!row) throw new HttpError(404, 'Product not found.')
  return json({ ok: true })
}
