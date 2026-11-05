import { sql } from 'drizzle-orm'
import {
  pgTable, text, integer, real, boolean, timestamp, serial, jsonb,
  uniqueIndex, index, check,
} from 'drizzle-orm/pg-core'

// Identity user ids are stored as text keys. Netlify Identity owns credentials;
// this database only stores application data keyed by the Identity user id.

export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(), // Netlify Identity user id
  fullName: text('full_name'),
  email: text('email').notNull(),
  phone: text('phone'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const products = pgTable('products', {
  id: text('id').primaryKey(), // URL slug, e.g. "nike-air-zoom-pulse"
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  categories: text('categories').array().notNull().default(sql`'{}'`),
  description: text('description').notNull().default(''),
  price: integer('price').notNull(), // whole pesos; the only trusted price source
  wasPrice: integer('was_price'),
  images: text('images').array().notNull().default(sql`'{}'`), // unsplash photo ids or /api/images/<key>
  imageColors: text('image_colors').array().notNull().default(sql`'{}'`), // colour shown by each image, parallel to images ('' = unknown)
  availableSizes: real('available_sizes').array().notNull().default(sql`'{}'`),
  availableColors: text('available_colors').array().notNull().default(sql`'{}'`),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  rating: real('rating').notNull().default(0),
  reviews: integer('reviews').notNull().default(0),
  isNew: boolean('is_new').notNull().default(false),
  isBest: boolean('is_best').notNull().default(false),
  isTrending: boolean('is_trending').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  check('products_price_positive', sql`${t.price} > 0`),
  check('products_stock_nonnegative', sql`${t.stockQuantity} >= 0`),
  index('products_brand_idx').on(t.brand),
  index('products_price_idx').on(t.price),
])

export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  selectedSize: real('selected_size').notNull(),
  selectedColor: text('selected_color').notNull(),
  quantity: integer('quantity').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('cart_items_unique_variant').on(t.userId, t.productId, t.selectedSize, t.selectedColor),
  index('cart_items_user_idx').on(t.userId),
  check('cart_items_quantity_range', sql`${t.quantity} between 1 and 10`),
])

export const wishlistItems = pgTable('wishlist_items', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex('wishlist_items_unique').on(t.userId, t.productId),
  index('wishlist_items_user_idx').on(t.userId),
])

export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  recipientName: text('recipient_name').notNull(),
  phone: text('phone').notNull(),
  addressLine: text('address_line').notNull(),
  city: text('city').notNull(),
  province: text('province').notNull(),
  postalCode: text('postal_code').notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('addresses_user_idx').on(t.userId),
])

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  userId: text('user_id').notNull().references(() => profiles.id, { onDelete: 'restrict' }),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').notNull(),
  subtotal: integer('subtotal').notNull(),
  shippingFee: integer('shipping_fee').notNull(),
  discount: integer('discount').notNull().default(0),
  promoCode: text('promo_code'), // voucher applied at checkout, null when none
  total: integer('total').notNull(),
  paymentMethod: text('payment_method').notNull(), // 'cod' | 'simulated_online'
  paymentStatus: text('payment_status').notNull(), // 'unpaid' | 'paid_simulated' | 'refunded_simulated'
  orderStatus: text('order_status').notNull(), // 'placed' | 'packed' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: jsonb('shipping_address').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index('orders_user_idx').on(t.userId, t.createdAt),
  check('orders_total_nonnegative', sql`${t.total} >= 0`),
  check('orders_payment_method_valid', sql`${t.paymentMethod} in ('cod','simulated_online')`),
  check('orders_payment_status_valid', sql`${t.paymentStatus} in ('unpaid','paid_simulated','refunded_simulated')`),
  check('orders_status_valid', sql`${t.orderStatus} in ('placed','packed','shipped','delivered','cancelled')`),
])

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  // Nullable so an admin can delete a product without losing order history.
  productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
  productName: text('product_name').notNull(),
  brand: text('brand').notNull(),
  productImage: text('product_image').notNull(),
  selectedSize: real('selected_size').notNull(),
  selectedColor: text('selected_color').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: integer('unit_price').notNull(),
  subtotal: integer('subtotal').notNull(),
}, (t) => [
  index('order_items_order_idx').on(t.orderId),
  check('order_items_quantity_positive', sql`${t.quantity} > 0`),
])
