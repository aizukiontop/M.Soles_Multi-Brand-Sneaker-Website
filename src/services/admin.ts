import { api } from './api'
import type { Product } from '../data'
import type { Order } from './orders'

export type ProductInput = {
  name: string; brand: string; categories: string[]; description: string; price: number; wasPrice: number | null
  images: string[]; availableSizes: number[]; availableColors: string[]; stockQuantity: number
  isNew: boolean; isBest: boolean; isTrending: boolean; sortOrder: number
}

export const adminListProducts = () => api<{ items: Product[] }>('/admin/products').then((r) => r.items)
export const adminCreateProduct = (data: ProductInput) => api<{ item: Product }>('/admin/products', { method: 'POST', json: data })
export const adminUpdateProduct = (id: string, data: ProductInput) =>
  api<{ item: Product }>(`/admin/products/${encodeURIComponent(id)}`, { method: 'PUT', json: data })
export const adminDeleteProduct = (id: string) => api(`/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' })

export const adminListOrders = () => api<{ items: Order[] }>('/admin/orders').then((r) => r.items)
export const adminUpdateOrder = (id: number, data: { orderStatus?: string; paymentStatus?: string }) =>
  api<{ order: Order }>(`/admin/orders/${id}`, { method: 'PATCH', json: data }).then((r) => r.order)

export async function uploadProductImage(file: File): Promise<string> {
  const data = await api<{ url: string }>('/admin/upload', {
    method: 'POST', body: file, headers: { 'content-type': file.type },
  })
  return data.url
}
