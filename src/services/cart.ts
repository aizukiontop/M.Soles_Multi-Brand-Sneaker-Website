import { api } from './api'

export type ServerCartItem = { rowId: number; id: string; size: number; color: string; qty: number }

export const getServerCart = () => api<{ items: ServerCartItem[] }>('/cart').then((r) => r.items)
export const addServerCartItem = (productId: string, size: number, color: string, qty: number) =>
  api<{ items: ServerCartItem[] }>('/cart', { method: 'POST', json: { productId, size, color, qty } }).then((r) => r.items)
export const updateServerCartItem = (rowId: number, qty: number) =>
  api<{ items: ServerCartItem[] }>(`/cart/${rowId}`, { method: 'PATCH', json: { qty } }).then((r) => r.items)
export const removeServerCartItem = (rowId: number) =>
  api<{ items: ServerCartItem[] }>(`/cart/${rowId}`, { method: 'DELETE' }).then((r) => r.items)
export const mergeGuestCart = (items: { id: string; size: number; color: string; qty: number }[]) =>
  api<{ items: ServerCartItem[] }>('/cart/merge', { method: 'POST', json: { items } }).then((r) => r.items)
