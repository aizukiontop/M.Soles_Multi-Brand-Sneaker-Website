import { and, eq, sql } from 'drizzle-orm'
import { db } from '../../../db/index.js'
import { cartItems, products, wishlistItems } from '../../../db/schema.js'
import { HttpError, int, json, readJson, str, clamp } from './http.js'
import { requireUser } from './auth.js'

export const MAX_QTY = 10

// ---------------------------------------------------------------------------
// Cart (persisted per Identity user)
// ---------------------------------------------------------------------------

export async function getCartRows(userId: string) {
  const rows = await db
    .select({
      rowId: cartItems.id, productId: cartItems.productId, size: cartItems.selectedSize,
      color: cartItems.selectedColor, qty: cartItems.quantity,
    })
    .from(cartItems)
    .where(eq(cartItems.userId, userId))
    .orderBy(cartItems.id)
  return rows.map((r) => ({ rowId: r.rowId, id: r.productId, size: r.size, color: r.color, qty: r.qty }))
}

// Validates a variant against trusted product data before it is stored.
async function addVariant(userId: string, input: { productId: string; size: number; color: string; qty: number }) {
  const [product] = await db.select().from(products).where(eq(products.id, input.productId)).limit(1)
  if (!product) throw new HttpError(404, 'Sneaker not found.')
  if (!product.availableSizes.includes(input.size)) throw new HttpError(422, `Size US ${input.size} is not offered for this sneaker.`)
  if (!product.availableColors.includes(input.color)) throw new HttpError(422, `${input.color} is not offered for this sneaker.`)
  const qty = clamp(input.qty, 1, MAX_QTY)
  await db.insert(cartItems)
    .values({ userId, productId: input.productId, selectedSize: input.size, selectedColor: input.color, quantity: qty })
    .onConflictDoUpdate({
      target: [cartItems.userId, cartItems.productId, cartItems.selectedSize, cartItems.selectedColor],
      set: { quantity: sql`least(${cartItems.quantity} + excluded.quantity, ${MAX_QTY})` },
    })
}

function parseVariant(b: Record<string, unknown>) {
  return {
    productId: str(b.productId ?? b.id, 100),
    size: Number(b.size),
    color: str(b.color, 30),
    qty: int(b.qty ?? b.quantity, 1),
  }
}

export async function cartGet() {
  const user = await requireUser()
  return json({ items: await getCartRows(user.id) })
}

export async function cartAdd(req: Request) {
  const user = await requireUser()
  await addVariant(user.id, parseVariant(await readJson(req)))
  return json({ items: await getCartRows(user.id) })
}

export async function cartUpdate(rowId: number, req: Request) {
  const user = await requireUser()
  const body = await readJson(req)
  const qty = clamp(int(body.qty ?? body.quantity, 1), 1, MAX_QTY)
  const [row] = await db.update(cartItems).set({ quantity: qty })
    .where(and(eq(cartItems.id, rowId), eq(cartItems.userId, user.id))).returning({ id: cartItems.id })
  if (!row) throw new HttpError(404, 'Cart item not found.')
  return json({ items: await getCartRows(user.id) })
}

export async function cartRemove(rowId: number) {
  const user = await requireUser()
  await db.delete(cartItems).where(and(eq(cartItems.id, rowId), eq(cartItems.userId, user.id)))
  return json({ items: await getCartRows(user.id) })
}

// Merges a guest cart (kept in the browser) into the signed-in user's cart. Invalid lines are skipped.
export async function cartMerge(req: Request) {
  const user = await requireUser()
  const body = await readJson<{ items?: unknown }>(req)
  const items = Array.isArray(body.items) ? body.items.slice(0, 50) : []
  for (const raw of items) {
    if (!raw || typeof raw !== 'object') continue
    try {
      await addVariant(user.id, parseVariant(raw as Record<string, unknown>))
    } catch (err) {
      if (!(err instanceof HttpError)) throw err
    }
  }
  return json({ items: await getCartRows(user.id) })
}

// ---------------------------------------------------------------------------
// Wishlist
// ---------------------------------------------------------------------------

export async function wishlistGet() {
  const user = await requireUser()
  const rows = await db.select({ productId: wishlistItems.productId }).from(wishlistItems)
    .where(eq(wishlistItems.userId, user.id)).orderBy(wishlistItems.id)
  return json({ productIds: rows.map((r) => r.productId) })
}

async function wishAdd(userId: string, productId: string) {
  const [product] = await db.select({ id: products.id }).from(products).where(eq(products.id, productId)).limit(1)
  if (!product) throw new HttpError(404, 'Sneaker not found.')
  await db.insert(wishlistItems).values({ userId, productId }).onConflictDoNothing()
}

export async function wishlistAdd(req: Request) {
  const user = await requireUser()
  const body = await readJson(req)
  await wishAdd(user.id, str(body.productId, 100))
  return wishlistGet()
}

export async function wishlistRemove(productId: string) {
  const user = await requireUser()
  await db.delete(wishlistItems).where(and(eq(wishlistItems.userId, user.id), eq(wishlistItems.productId, productId)))
  return wishlistGet()
}

export async function wishlistMerge(req: Request) {
  const user = await requireUser()
  const body = await readJson<{ productIds?: unknown }>(req)
  const ids = Array.isArray(body.productIds) ? body.productIds.map((i) => str(i, 100)).filter(Boolean).slice(0, 100) : []
  for (const id of ids) {
    try {
      await wishAdd(user.id, id)
    } catch (err) {
      if (!(err instanceof HttpError)) throw err
    }
  }
  return wishlistGet()
}

