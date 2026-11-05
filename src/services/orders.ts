import { api } from './api'

export type OrderItem = {
  id: number; productId: string | null; productName: string; brand: string; productImage: string
  selectedSize: number; selectedColor: string; quantity: number; unitPrice: number; subtotal: number
}
export type Order = {
  id: number; orderNumber: string; customerName: string; customerEmail: string; customerPhone: string
  subtotal: number; shippingFee: number; discount: number; promoCode: string | null; total: number
  paymentMethod: 'cod' | 'simulated_online'; paymentStatus: string; orderStatus: string
  shippingAddress: { recipientName: string; phone: string; addressLine: string; city: string; province: string; postalCode: string }
  createdAt: string; items: OrderItem[]
}

export type CheckoutInput = {
  fullName: string; email: string; phone: string
  address: { addressLine: string; city: string; province: string; postalCode: string }
  paymentMethod: 'cod' | 'simulated_online'; promoCode?: string
}

export const placeOrder = (data: CheckoutInput) =>
  api<{ order: Order }>('/orders', { method: 'POST', json: data }).then((r) => r.order)
export const listOrders = () => api<{ items: Order[] }>('/orders').then((r) => r.items)
export const getOrder = (id: number) => api<{ order: Order }>(`/orders/${id}`).then((r) => r.order)

export const PAYMENT_LABELS: Record<string, string> = {
  cod: 'Cash on Delivery (Demo)',
  simulated_online: 'Simulated Online Payment',
}
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  unpaid: 'Unpaid (pay on delivery)',
  paid_simulated: 'Paid (simulated)',
  refunded_simulated: 'Refunded (simulated)',
}
export const ORDER_STATUS_LABELS: Record<string, string> = {
  placed: 'Placed', packed: 'Packed', shipped: 'Shipped', delivered: 'Delivered', cancelled: 'Cancelled',
}
