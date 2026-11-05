import type { Config, Context } from '@netlify/functions'
import { verifyRequestOrigin, AuthError } from '@netlify/identity'
import { HttpError, json } from './lib/http.js'
import { listProducts, getProductById, adminListProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct } from './lib/catalog.js'
import { getMe, updateMe, listAddresses, createAddress, updateAddress, deleteAddress } from './lib/account.js'
import { cartGet, cartAdd, cartUpdate, cartRemove, cartMerge, wishlistGet, wishlistAdd, wishlistRemove, wishlistMerge } from './lib/commerce.js'
import { createOrder, listMyOrders, getMyOrder, adminListOrders, adminUpdateOrder } from './lib/orders.js'
import { uploadImage, serveImage } from './lib/images.js'
import { uploadAvatar, removeAvatar, serveAvatar } from './lib/avatars.js'

// Single entry point for every /api/* route. Each handler performs its own
// server-side authorization (requireUser / requireAdmin); the frontend is never trusted.
async function route(req: Request, parts: string[]): Promise<Response> {
  const method = req.method
  const url = new URL(req.url)
  const [head, a, b] = parts
  const id = Number(a)
  const is = (...p: string[]) => p.every((seg, i) => parts[i] === seg) && parts.length === p.length

  if (head === 'products' && parts.length === 1 && method === 'GET') return listProducts(url)
  if (head === 'products' && parts.length === 2 && method === 'GET') return json({ item: await getProductById(a) })

  if (is('me') && method === 'GET') return getMe(req)
  if (is('me') && method === 'PUT') return updateMe(req)
  if (is('me', 'avatar') && method === 'POST') return uploadAvatar(req)
  if (is('me', 'avatar') && method === 'DELETE') return removeAvatar()

  if (is('addresses') && method === 'GET') return listAddresses()
  if (is('addresses') && method === 'POST') return createAddress(req)
  if (head === 'addresses' && parts.length === 2 && method === 'PUT') return updateAddress(id, req)
  if (head === 'addresses' && parts.length === 2 && method === 'DELETE') return deleteAddress(id)

  if (is('cart') && method === 'GET') return cartGet()
  if (is('cart') && method === 'POST') return cartAdd(req)
  if (is('cart', 'merge') && method === 'POST') return cartMerge(req)
  if (head === 'cart' && parts.length === 2 && method === 'PATCH') return cartUpdate(id, req)
  if (head === 'cart' && parts.length === 2 && method === 'DELETE') return cartRemove(id)

  if (is('wishlist') && method === 'GET') return wishlistGet()
  if (is('wishlist') && method === 'POST') return wishlistAdd(req)
  if (is('wishlist', 'merge') && method === 'POST') return wishlistMerge(req)
  if (head === 'wishlist' && parts.length === 2 && method === 'DELETE') return wishlistRemove(decodeURIComponent(a))

  if (is('orders') && method === 'POST') return createOrder(req)
  if (is('orders') && method === 'GET') return listMyOrders()
  if (head === 'orders' && parts.length === 2 && method === 'GET') return getMyOrder(id)

  if (is('admin', 'products') && method === 'GET') return adminListProducts()
  if (is('admin', 'products') && method === 'POST') return adminCreateProduct(req)
  if (head === 'admin' && a === 'products' && parts.length === 3 && method === 'PUT') return adminUpdateProduct(decodeURIComponent(b), req)
  if (head === 'admin' && a === 'products' && parts.length === 3 && method === 'DELETE') return adminDeleteProduct(decodeURIComponent(b))
  if (is('admin', 'orders') && method === 'GET') return adminListOrders()
  if (head === 'admin' && a === 'orders' && parts.length === 3 && method === 'PATCH') return adminUpdateOrder(Number(b), req)
  if (is('admin', 'upload') && method === 'POST') return uploadImage(req)

  if (head === 'images' && parts.length === 2 && method === 'GET') return serveImage(a)
  if (head === 'avatars' && parts.length === 2 && method === 'GET') return serveAvatar(a)

  throw new HttpError(404, 'Not found.')
}

export default async (req: Request, _context: Context) => {
  try {
    if (req.method !== 'GET') {
      // Cookie-based sessions: refuse cross-origin state-changing requests.
      try {
        verifyRequestOrigin(req)
      } catch (err) {
        if (err instanceof AuthError) throw new HttpError(403, 'Cross-origin request refused.')
        throw err
      }
    }
    const path = new URL(req.url).pathname.replace(/^\/api\/?/, '').replace(/\/$/, '')
    return await route(req, path ? path.split('/') : [])
  } catch (err) {
    if (err instanceof HttpError) return json({ error: err.message }, err.status)
    console.error('API error:', err)
    return json({ error: 'Something went wrong. Please try again.' }, 500)
  }
}

export const config: Config = {
  path: '/api/*',
}
