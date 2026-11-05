import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm'
import { db } from '../../../db/index.js'
import { cartItems, orderItems, orders, products } from '../../../db/schema.js'
import { HttpError, json, readJson, str } from './http.js'
import { requireAdmin, requireUser } from './auth.js'
import { MAX_QTY } from './commerce.js'

// Pricing rules. The browser only sends intent (which cart, payment method, address);
// every amount below is computed from products.price in the database.
export const FREE_SHIPPING_THRESHOLD = 5000
export const SHIPPING_FEE = 250
export const PROMO_CODES: Record<string, number> = { MARIONPOGI10: 1 }
const PAYMENT_METHODS = ['cod', 'simulated_online'] as const
const PHONE_RE = /^\+?[0-9][0-9\s-]{6,18}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const ORDER_STATUSES = ['placed', 'packed', 'shipped', 'delivered', 'cancelled'] as const
const PAYMENT_STATUSES = ['unpaid', 'paid_simulated', 'refunded_simulated'] as const

function generateOrderNumber() {
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const code = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')
  return `NX-${code}`
}

function parseCheckout(body: Record<string, unknown>) {
  const errors: string[] = []
  const customerName = str(body.fullName, 100)
  const customerEmail = str(body.email, 150).toLowerCase()
  const customerPhone = str(body.phone, 25)
  const address = (body.address ?? {}) as Record<string, unknown>
  const shipping = {
    recipientName: customerName,
    phone: customerPhone,
    addressLine: str(address.addressLine, 200),
    city: str(address.city, 80),
    province: str(address.province, 80),
    postalCode: str(address.postalCode, 10),
  }
  const paymentMethod = str(body.paymentMethod, 30)
  const promoCode = str(body.promoCode, 30).toUpperCase()

  if (customerName.length < 2) errors.push('Full name is required.')
  if (!EMAIL_RE.test(customerEmail)) errors.push('Enter a valid email address.')
  if (!PHONE_RE.test(customerPhone)) errors.push('Enter a valid phone number.')
  if (shipping.addressLine.length < 5) errors.push('Shipping address is required.')
  if (!shipping.city) errors.push('City is required.')
  if (!shipping.province) errors.push('Province is required.')
  if (!/^[A-Za-z0-9 -]{3,10}$/.test(shipping.postalCode)) errors.push('Enter a valid postal code.')
  if (!(PAYMENT_METHODS as readonly string[]).includes(paymentMethod)) errors.push('Select a payment method.')
  if (errors.length) throw new HttpError(422, errors.join(' '))

  return {
    customerName, customerEmail, customerPhone, shipping,
    paymentMethod: paymentMethod as (typeof PAYMENT_METHODS)[number],
    promoCode,
  }
}

export async function createOrder(req: Request) {
  const user = await requireUser()
  const input = parseCheckout(await readJson(req))

  const order = await db.transaction(async (tx) => {
    // Read the cart on the server so the client cannot inject lines, quantities or prices.
    const lines = await tx
      .select({
        cartId: cartItems.id, productId: cartItems.productId, size: cartItems.selectedSize,
        color: cartItems.selectedColor, qty: cartItems.quantity,
        name: products.name, brand: products.brand, price: products.price,
        image: products.images, stock: products.stockQuantity,
        sizes: products.availableSizes, colors: products.availableColors,
      })
      .from(cartItems)
      .innerJoin(products, eq(products.id, cartItems.productId))
      .where(eq(cartItems.userId, user.id))

    if (lines.length === 0) throw new HttpError(400, 'Your cart is empty.')

    for (const line of lines) {
      if (line.qty < 1 || line.qty > MAX_QTY) throw new HttpError(422, `Invalid quantity for ${line.name}.`)
      if (!line.sizes.includes(line.size) || !line.colors.includes(line.color)) {
        throw new HttpError(422, `${line.brand} ${line.name} is no longer available in that size or colour.`)
      }
      if (line.stock < line.qty) {
        throw new HttpError(409, `Only ${line.stock} left of ${line.brand} ${line.name}.`)
      }
    }

    const subtotal = lines.reduce((sum, l) => sum + l.price * l.qty, 0)
    const shippingFee = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
    const rate = PROMO_CODES[input.promoCode] ?? 0
    const discount = Math.round(subtotal * rate)
    const total = subtotal + shippingFee - discount

    // Decrement stock atomically; the WHERE clause prevents overselling under concurrent orders.
    for (const line of lines) {
      const [updated] = await tx.update(products)
        .set({ stockQuantity: sql`${products.stockQuantity} - ${line.qty}` })
        .where(and(eq(products.id, line.productId), gte(products.stockQuantity, line.qty)))
        .returning({ id: products.id })
      if (!updated) throw new HttpError(409, `${line.brand} ${line.name} just sold out.`)
    }

    const [created] = await tx.insert(orders).values({
      orderNumber: generateOrderNumber(),
      userId: user.id,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      subtotal,
      shippingFee,
      discount,
      promoCode: rate > 0 ? input.promoCode : null,
      total,
      paymentMethod: input.paymentMethod,
      paymentStatus: input.paymentMethod === 'cod' ? 'unpaid' : 'paid_simulated',
      orderStatus: 'placed',
      shippingAddress: input.shipping,
    }).returning()

    await tx.insert(orderItems).values(lines.map((l) => ({
      orderId: created.id,
      productId: l.productId,
      productName: l.name,
      brand: l.brand,
      productImage: l.image[0] ?? '',
      selectedSize: l.size,
      selectedColor: l.color,
      quantity: l.qty,
      unitPrice: l.price,
      subtotal: l.price * l.qty,
    })))

    await tx.delete(cartItems).where(eq(cartItems.userId, user.id))
    return created
  })

  return json({ order: await getOrderWithItems(order.id, user.id) }, 201)
}

async function getOrderWithItems(orderId: number, userId: string | null) {
  const [order] = await db.select().from(orders)
    .where(userId ? and(eq(orders.id, orderId), eq(orders.userId, userId)) : eq(orders.id, orderId)).limit(1)
  if (!order) throw new HttpError(404, 'Order not found.')
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)).orderBy(orderItems.id)
  return { ...order, items }
}

export async function listMyOrders() {
  const user = await requireUser()
  const rows = await db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.createdAt))
  const items = rows.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, rows.map((r) => r.id)))
    : []
  return json({ items: rows.map((o) => ({ ...o, items: items.filter((i) => i.orderId === o.id) })) })
}

export async function getMyOrder(id: number) {
  const user = await requireUser()
  return json({ order: await getOrderWithItems(id, user.id) })
}

export async function adminListOrders() {
  await requireAdmin()
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(500)
  const items = rows.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, rows.map((r) => r.id)))
    : []
  return json({ items: rows.map((o) => ({ ...o, items: items.filter((i) => i.orderId === o.id) })) })
}

export async function adminUpdateOrder(id: number, req: Request) {
  await requireAdmin()
  const body = await readJson(req)
  const orderStatus = str(body.orderStatus, 20)
  const paymentStatus = str(body.paymentStatus, 30)
  const set: Record<string, string> = {}
  if (orderStatus) {
    if (!(ORDER_STATUSES as readonly string[]).includes(orderStatus)) throw new HttpError(422, 'Invalid order status.')
    set.orderStatus = orderStatus
  }
  if (paymentStatus) {
    if (!(PAYMENT_STATUSES as readonly string[]).includes(paymentStatus)) throw new HttpError(422, 'Invalid payment status.')
    set.paymentStatus = paymentStatus
  }
  if (Object.keys(set).length === 0) throw new HttpError(422, 'Nothing to update.')
  const [row] = await db.update(orders).set(set).where(eq(orders.id, id)).returning({ id: orders.id })
  if (!row) throw new HttpError(404, 'Order not found.')
  return json({ order: await getOrderWithItems(id, null) })
}
