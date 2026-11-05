import { api } from './api'

export const getServerWishlist = () => api<{ productIds: string[] }>('/wishlist').then((r) => r.productIds)
export const addServerWishlist = (productId: string) =>
  api<{ productIds: string[] }>('/wishlist', { method: 'POST', json: { productId } }).then((r) => r.productIds)
export const removeServerWishlist = (productId: string) =>
  api<{ productIds: string[] }>(`/wishlist/${encodeURIComponent(productId)}`, { method: 'DELETE' }).then((r) => r.productIds)
export const mergeGuestWishlist = (productIds: string[]) =>
  api<{ productIds: string[] }>('/wishlist/merge', { method: 'POST', json: { productIds } }).then((r) => r.productIds)
