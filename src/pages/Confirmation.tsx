import { Link, useParams } from 'react-router'
import { useEffect, useState } from 'react'
import { Check, SearchX } from 'lucide-react'
import { peso, u } from '../data'
import { getOrder, PAYMENT_LABELS, PAYMENT_STATUS_LABELS, type Order } from '../services/orders'
import { PageHeader, Empty } from '../ui'
import { Spinner } from '../components/RequireAuth'
import { errorText } from '../utils/errors'

// Shown after a successful placeOrder. Loads the order from the server, so totals are the stored values.
export default function OrderConfirmation() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getOrder(Number(id)).then(setOrder).catch((e) => setError(errorText(e)))
  }, [id])

  if (error) {
    return (
      <div className="container-x py-24">
        <Empty icon={<SearchX size={28} />} title="Order not found" text={error} to="/account/orders" cta="View order history" />
      </div>
    )
  }
  if (!order) return <Spinner label="Loading your order…" />

  return (
    <>
      <PageHeader crumbs={[{ label: 'Checkout' }, { label: 'Confirmation' }]} title="Order confirmed" />
      <div className="container-x py-12 grid lg:grid-cols-[1fr_380px] gap-10">
        <div>
          <div className="flex items-center gap-4">
            <div className="size-14 bg-accent grid place-items-center rounded-full"><Check size={28} /></div>
            <div>
              <p className="text-mute text-sm">Thanks for shopping M.Soles. Your order number is</p>
              <p className="font-display font-bold text-2xl" data-testid="order-number">{order.orderNumber}</p>
            </div>
          </div>
          <p className="text-mute mt-6 text-sm">
            Payment: <span className="text-white">{PAYMENT_LABELS[order.paymentMethod]}</span> · {PAYMENT_STATUS_LABELS[order.paymentStatus]}
          </p>
          <p className="text-mute text-sm mt-1">Status: <span className="text-white capitalize">{order.orderStatus}</span></p>
          <p className="text-xs text-mute mt-6 border border-line p-4">
            Demonstration only: this order is simulated. No real payment was taken and nothing will be shipped.
          </p>

          <div className="border-t border-line mt-8">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 py-4 border-b border-line items-center">
                <img src={u(item.productImage, 160)} alt="" className="size-16 object-cover" />
                <div className="flex-1 text-sm">
                  <p className="font-semibold">{item.productName}</p>
                  <p className="text-mute text-xs">{item.brand} · US {item.selectedSize} · {item.selectedColor} · Qty {item.quantity}</p>
                </div>
                <span className="font-medium">{peso(item.subtotal)}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="bg-panel border border-line p-6 h-fit space-y-3 text-sm">
          <h2 className="font-display font-bold uppercase mb-4">Summary</h2>
          <div className="flex justify-between text-mute"><span>Subtotal</span><span>{peso(order.subtotal)}</span></div>
          <div className="flex justify-between text-mute"><span>Shipping</span><span>{order.shippingFee ? peso(order.shippingFee) : 'Free'}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-accent2"><span>Discount</span><span>-{peso(order.discount)}</span></div>}
          <div className="flex justify-between font-bold text-lg border-t border-line pt-3"><span>Total</span><span>{peso(order.total)}</span></div>
          <div className="pt-4 text-mute">
            <p className="label">Shipping to</p>
            <p className="text-white">{order.shippingAddress.recipientName}</p>
            <p>{order.shippingAddress.addressLine}, {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.postalCode}</p>
          </div>
          <div className="flex gap-3 pt-4">
            <Link to={`/account/orders/${order.id}`} className="btn-ghost flex-1">View order</Link>
            <Link to="/shop" className="btn-primary flex-1">Keep shopping</Link>
          </div>
        </aside>
      </div>
    </>
  )
}
