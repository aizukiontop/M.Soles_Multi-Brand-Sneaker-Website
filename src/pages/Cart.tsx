import { Link, useNavigate } from 'react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { Heart, ShoppingBag, Trash2, ArrowLeft, Banknote, Wallet, Tag, Info } from 'lucide-react'
import { PageHeader, Empty, Qty, ProductCard } from '../ui'
import { getProduct, peso, u, brandSlug, PRODUCTS } from '../data'
import { useStore, type CartItem } from '../store'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/RequireAuth'
import { placeOrder } from '../services/orders'
import { getProfile, listAddresses } from '../services/account'
import { errorText } from '../utils/errors'

// Shipping rule shown to customers; the server applies the same rule when the order is created.
export const FREE_SHIPPING_THRESHOLD = 5000
export const SHIPPING_FEE = 250
const PROMO_RATE = 1
const PROMO_CODE = 'MARIONPOGI10'

// ---------------------------------------------------------------------------
// Shared order totals hook — used by both Cart and Checkout (preview only; the server recalculates)
// ---------------------------------------------------------------------------
// The applied flag is kept in sessionStorage so it survives moving from Cart to Checkout
// (each page calls this hook, and component state alone would reset on navigation).
const PROMO_STORAGE_KEY = 'nocturn.promoApplied'
function readPromoApplied() {
  try { return sessionStorage.getItem(PROMO_STORAGE_KEY) === PROMO_CODE } catch { return false }
}

export function useTotals() {
  const { subtotal } = useStore()
  const [promo, setPromo] = useState('')
  const [applied, setAppliedState] = useState(readPromoApplied)

  const setApplied = (value: boolean) => {
    setAppliedState(value)
    try {
      if (value) sessionStorage.setItem(PROMO_STORAGE_KEY, PROMO_CODE)
      else sessionStorage.removeItem(PROMO_STORAGE_KEY)
    } catch { /* storage unavailable; the in-memory state still applies */ }
  }

  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const discount = applied ? Math.round(subtotal * PROMO_RATE) : 0
  const total = subtotal + shipping - discount

  return { subtotal, shipping, discount, total, promo, setPromo, applied, setApplied }
}

const SummaryRow = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className={`flex justify-between text-sm ${accent ? 'text-accent2' : ''}`}>
    <span className={`min-w-0 break-words ${accent ? '' : 'text-mute'}`}>{label}</span>
    <span className="shrink-0 font-medium">{value}</span>
  </div>
)

function OrderSummary({ totals, children }: { totals: ReturnType<typeof useTotals>; children?: React.ReactNode }) {
  const { subtotal, shipping, discount, total, promo, setPromo, applied, setApplied } = totals

  return (
    <aside className="bg-panel border border-line p-6 h-fit lg:sticky lg:top-24">
      <h2 className="font-display font-bold uppercase mb-6">Order summary</h2>

      <div className="space-y-3">
        <SummaryRow label="Subtotal" value={peso(subtotal)} />
        <SummaryRow label="Shipping" value={shipping ? peso(shipping) : 'Free'} />
        {discount > 0 && <SummaryRow accent label={`Discount (${PROMO_CODE})`} value={`-${peso(discount)}`} />}
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setApplied(promo.trim().toUpperCase() === PROMO_CODE) }}
        className="flex gap-2 mt-5"
      >
        <div className="relative flex-1">
          <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-mute" />
          <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Promo code"
            aria-label="Promo code" className="field !h-10 !pl-9 text-xs" />
        </div>
        <button className="btn-ghost btn-sm">Apply</button>
      </form>
      {!applied && <p className="text-xs text-mute mt-2">Have a voucher? Enter the code <span className="font-semibold text-white">{PROMO_CODE}</span> to get 100% off.</p>}
      {applied && <p className="text-xs text-green-400 mt-2">100% discount applied at checkout</p>}

      <div className="flex justify-between items-baseline border-t border-line mt-6 pt-5">
        <span className="font-semibold">Total</span>
        <span className="font-display font-bold text-2xl">{peso(total)}</span>
      </div>

      {subtotal < FREE_SHIPPING_THRESHOLD && subtotal > 0 && (
        <p className="text-xs text-mute mt-3">Add {peso(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping.</p>
      )}
      {children}
    </aside>
  )
}

// ---------------------------------------------------------------------------
// Cart page
// ---------------------------------------------------------------------------
export function Cart() {
  const { cart, setQty, removeItem, cartLoading } = useStore()
  const { user } = useAuth()
  const totals = useTotals()
  const nav = useNavigate()

  return (
    <>
      <PageHeader crumbs={[{ label: 'Cart' }]} title="Your Cart" />

      <div className="container-x py-12">
        {cartLoading ? (
          <Spinner label="Loading your cart…" />
        ) : cart.length === 0 ? (
          <Empty icon={<ShoppingBag size={28} />} title="Your cart is empty" text="Add a pair and it'll show up here." to="/shop" cta="Continue shopping" />
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-10">
            <div className="border-t border-line">
              {cart.map((item: CartItem, index) => {
                const product = getProduct(item.id)
                if (!product) return null
                return (
                  <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4 md:gap-6 py-6 border-b border-line anim-slideup">
                    <Link to={`/product/${product.id}`} className="shrink-0">
                      <img src={u(product.img, 300)} alt={product.name} className="size-24 md:size-32 object-cover bg-panel2" />
                    </Link>

                    <div className="flex-1 flex flex-col sm:flex-row sm:justify-between gap-3">
                      <div>
                        <Link to={`/brands/${brandSlug(product.brand)}`} className="text-[11px] uppercase tracking-widest text-accent2">{product.brand}</Link>
                        <Link to={`/product/${product.id}`} className="block font-semibold mt-1 hover:text-accent2">{product.name}</Link>
                        <p className="text-sm text-mute mt-2">Size US {item.size} · {item.color}</p>
                        <button onClick={() => removeItem(index)} className="mt-3 text-xs text-mute hover:text-red-400 flex items-center gap-1.5">
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3">
                        <span className="font-bold">{peso(product.price * item.qty)}</span>
                        <Qty v={item.qty} set={(n) => setQty(index, n)} />
                      </div>
                    </div>
                  </div>
                )
              })}

              <Link to="/shop" className="inline-flex items-center gap-2 text-sm mt-8 text-mute hover:text-white">
                <ArrowLeft size={15} /> Continue shopping
              </Link>
            </div>

            <OrderSummary totals={totals}>
              <button onClick={() => nav('/checkout')} className="btn-primary w-full mt-6">
                {user ? 'Proceed to Checkout' : 'Sign in to checkout'}
              </button>
            </OrderSummary>
          </div>
        )}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Wishlist page
// ---------------------------------------------------------------------------
export function Wishlist() {
  const { wish, toggleWish, addToCart } = useStore()
  const savedProducts = wish.map(getProduct).filter((p): p is NonNullable<ReturnType<typeof getProduct>> => !!p)
  const nav = useNavigate()

  // Moves a saved pair into the cart: uses size 9 when offered, otherwise asks the visitor to pick a size.
  const moveToCart = async (productId: string) => {
    const product = getProduct(productId)
    if (!product) return
    if (product.sizes && !product.sizes.includes(9)) return nav(`/product/${productId}`)
    await addToCart(productId, 9, product.colors[0], 1)
    await toggleWish(productId)
  }

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Wishlist' }]}
        title="Your Wishlist"
        text={`${savedProducts.length} saved ${savedProducts.length === 1 ? 'pair' : 'pairs'}`}
      />

      <div className="container-x py-12">
        {savedProducts.length === 0 ? (
          <>
            <Empty icon={<Heart size={28} />} title="Nothing saved yet" text="Tap the heart on any sneaker to keep it here for later." to="/shop" cta="Discover sneakers" />
            <h3 className="h-display text-2xl mt-20 mb-6">You might like</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {PRODUCTS.filter((p) => p.trending).slice(0, 4).map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {savedProducts.map((product) => (
              <div key={product.id} className="bg-panel border border-line flex flex-col group">
                <div className="relative aspect-square overflow-hidden">
                  <Link to={`/product/${product.id}`}>
                    <img src={u(product.img, 600)} alt={product.name} className="size-full object-cover group-hover:scale-105 transition duration-700" />
                  </Link>
                  <button onClick={() => toggleWish(product.id)} aria-label="Remove from wishlist"
                    className="absolute top-3 right-3 size-9 bg-black/60 backdrop-blur grid place-items-center hover:bg-red-500 transition">
                    <Trash2 size={15} />
                  </button>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <p className="text-[11px] uppercase tracking-widest text-accent2">{product.brand}</p>
                  <Link to={`/product/${product.id}`} className="font-semibold mt-1">{product.name}</Link>
                  <p className="font-bold mt-2">{peso(product.price)}</p>
                  <button onClick={() => moveToCart(product.id)} className="btn-primary btn-sm mt-4 w-full">
                    <ShoppingBag size={14} /> Move to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Checkout — simulated payments only
// ---------------------------------------------------------------------------
const PAYMENT_METHODS = [
  ['cod', 'Cash on Delivery (Demo)', 'Simulated. No payment is collected.', Banknote],
  ['simulated_online', 'Simulated Online Payment', 'Simulated. No real card or wallet is charged.', Wallet],
] as const

type Form = { fullName: string; email: string; phone: string; addressLine: string; city: string; province: string; postalCode: string }

export function Checkout() {
  const { cart, clearCart, cartLoading } = useStore()
  const { user, loading: authLoading } = useAuth()
  const totals = useTotals()
  const nav = useNavigate()

  const [payment, setPayment] = useState<'cod' | 'simulated_online'>('cod')
  const [form, setForm] = useState<Form>({ fullName: '', email: '', phone: '', addressLine: '', city: '', province: '', postalCode: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof Form | 'payment', string>>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Prefill from the saved profile and default address (signed-in users only).
  useEffect(() => {
    if (!user) return
    let active = true
    Promise.all([getProfile(), listAddresses()]).then(([p, addrs]) => {
      if (!active) return
      const def = addrs.find((a) => a.isDefault) ?? addrs[0]
      setForm((f) => ({
        ...f,
        fullName: f.fullName || p.fullName || '',
        email: f.email || p.email || user.email || '',
        phone: f.phone || def?.phone || p.phone || '',
        addressLine: f.addressLine || def?.addressLine || '',
        city: f.city || def?.city || '',
        province: f.province || def?.province || '',
        postalCode: f.postalCode || def?.postalCode || '',
      }))
    }).catch(() => { /* prefill is optional */ })
    return () => { active = false }
  }, [user])

  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const validate = (): Partial<Record<keyof Form, string>> => {
    const e: Partial<Record<keyof Form, string>> = {}
    if (form.fullName.trim().length < 2) e.fullName = 'Enter your full name.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = 'Enter a valid email address.'
    if (!/^\+?[0-9][0-9\s-]{6,18}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number.'
    if (form.addressLine.trim().length < 5) e.addressLine = 'Enter your street address.'
    if (!form.city.trim()) e.city = 'Enter your city.'
    if (!form.province.trim()) e.province = 'Enter your province.'
    if (!/^[A-Za-z0-9 -]{3,10}$/.test(form.postalCode.trim())) e.postalCode = 'Enter a valid postal code.'
    return e
  }

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    const problems = validate()
    setErrors(problems)
    if (Object.keys(problems).length) return
    setSubmitting(true)
    try {
      const order = await placeOrder({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: { addressLine: form.addressLine.trim(), city: form.city.trim(), province: form.province.trim(), postalCode: form.postalCode.trim() },
        paymentMethod: payment,
        promoCode: totals.applied ? PROMO_CODE : '',
      })
      await clearCart()
      nav(`/order-confirmation/${order.id}`, { replace: true })
    } catch (err) {
      setSubmitError(errorText(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || (user && cartLoading)) return <Spinner label="Loading checkout…" />

  if (!user) {
    return (
      <>
        <PageHeader crumbs={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} title="Checkout" />
        <div className="container-x py-24">
          <Empty icon={<Info size={28} />} title="Sign in to check out" text="Your cart is saved to your account, and orders are linked to your profile." to="/login?next=%2Fcheckout" cta="Sign in" />
        </div>
      </>
    )
  }

  if (cart.length === 0) {
    return (
      <div className="container-x py-24">
        <Empty icon={<ShoppingBag size={28} />} title="Nothing to check out" text="Your cart is empty." to="/shop" cta="Shop sneakers" />
      </div>
    )
  }

  const Field = ({ k, label, ...inputProps }: { k: keyof Form; label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label className="label" htmlFor={`co-${k}`}>{label}</label>
      <input id={`co-${k}`} className="field" value={form[k]} onChange={set(k)} aria-invalid={!!errors[k]} {...inputProps} />
      {errors[k] && <p className="text-xs text-red-400 mt-1.5">{errors[k]}</p>}
    </div>
  )

  return (
    <>
      <PageHeader crumbs={[{ label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} title="Checkout" />

      <form onSubmit={handlePlaceOrder} noValidate className="container-x py-12 grid lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-12">
          <div role="note" className="border border-accent/40 bg-accent/10 text-sm px-4 py-3">
            <strong className="text-accent2">Portfolio demonstration.</strong> M.Soles is a portfolio project. Orders are not real purchases, and nothing will be charged or delivered.
          </div>

          {submitError && <p role="alert" className="border border-red-500/40 bg-red-500/10 text-red-300 text-sm px-4 py-3">{submitError}</p>}

          <section>
            <h2 className="font-display font-bold uppercase mb-6 flex items-center gap-3">
              <span className="size-7 bg-accent grid place-items-center text-xs font-bold">1</span> Customer information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><Field k="fullName" label="Full name" placeholder="Juan Dela Cruz" autoComplete="name" /></div>
              <Field k="email" label="Email" type="email" placeholder="you@email.com" autoComplete="email" />
              <Field k="phone" label="Contact number" type="tel" placeholder="+63 9XX XXX XXXX" autoComplete="tel" />
            </div>
          </section>

          <section>
            <h2 className="font-display font-bold uppercase mb-6 flex items-center gap-3">
              <span className="size-7 bg-accent grid place-items-center text-xs font-bold">2</span> Shipping information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2"><Field k="addressLine" label="Complete address" placeholder="House no., street, barangay" autoComplete="street-address" /></div>
              <Field k="city" label="City" autoComplete="address-level2" />
              <Field k="province" label="Province" autoComplete="address-level1" />
              <Field k="postalCode" label="Postal code" autoComplete="postal-code" />
            </div>
          </section>

          <section>
            <h2 className="font-display font-bold uppercase mb-6 flex items-center gap-3">
              <span className="size-7 bg-accent grid place-items-center text-xs font-bold">3</span> Payment method
            </h2>
            <p className="text-xs text-mute mb-4">Both options are simulated for this demonstration. No card details are collected.</p>
            <div className="space-y-3">
              {PAYMENT_METHODS.map(([id, name, description, Icon]) => (
                <button type="button" key={id} onClick={() => setPayment(id)} aria-pressed={payment === id}
                  className={`w-full flex items-center gap-4 p-4 border text-left transition ${payment === id ? 'border-accent bg-accent/10' : 'border-line hover:border-white/40'}`}>
                  <Icon className={payment === id ? 'text-accent2' : 'text-mute'} />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{name}</p>
                    <p className="text-xs text-mute">{description}</p>
                  </div>
                  <span className={`size-5 rounded-full border-2 grid place-items-center ${payment === id ? 'border-accent' : 'border-white/30'}`}>
                    {payment === id && <span className="size-2.5 rounded-full bg-accent" />}
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <OrderSummary totals={totals}>
          <div className="mt-6 space-y-3 border-t border-line pt-5 max-h-60 overflow-y-auto">
            {cart.map((item) => {
              const product = getProduct(item.id)
              if (!product) return null
              return (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3 items-center">
                  <img src={u(product.img, 120)} alt="" className="size-14 object-cover" />
                  <div className="flex-1 text-xs">
                    <p className="font-semibold text-sm">{product.name}</p>
                    <p className="text-mute">{product.brand} · US {item.size} · Qty {item.qty}</p>
                  </div>
                  <span className="text-sm font-medium">{peso(product.price * item.qty)}</span>
                </div>
              )
            })}
          </div>

          <p className="text-xs text-mute mt-4">Final prices are recalculated by the server when you place the order.</p>
          <button disabled={submitting} className="btn-primary w-full mt-4 !h-14">
            {submitting ? 'Placing order…' : `Place Order · ${peso(totals.total)}`}
          </button>
        </OrderSummary>
      </form>
    </>
  )
}

