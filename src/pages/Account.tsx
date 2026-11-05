import { Link, NavLink, Outlet, useNavigate, useParams } from 'react-router'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { User, Package, Settings as SettingsIcon, LogOut, Heart, MapPin, ArrowLeft, Check, ShieldCheck, Pencil, Trash2, Camera } from 'lucide-react'
import { peso, u } from '../data'
import { useStore } from '../store'
import { useAuth } from '../context/AuthContext'
import { RequireAuth, Spinner } from '../components/RequireAuth'
import { getProfile, uploadAvatar, removeAvatar, updateProfile, type Profile, listAddresses, createAddress, updateAddress, deleteAddress, type Address, type AddressInput } from '../services/account'
import { listOrders, getOrder, PAYMENT_LABELS, PAYMENT_STATUS_LABELS, ORDER_STATUS_LABELS, type Order } from '../services/orders'
import { errorText } from '../utils/errors'
import { authErrorMessage } from '../services/auth'

const STEPS = ['placed', 'packed', 'shipped', 'delivered'] as const

const StatusBadge = ({ status }: { status: string }) => (
  <span className={`text-[11px] font-bold tracking-widest px-2.5 py-1 ${
    status === 'delivered' ? 'bg-green-500/15 text-green-400'
    : status === 'cancelled' ? 'bg-red-500/15 text-red-400'
    : 'bg-accent/15 text-accent2'}`}>
    {(ORDER_STATUS_LABELS[status] ?? status).toUpperCase()}
  </span>
)

const dateFmt = (iso: string) => new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: '2-digit' })

// ---------------------------------------------------------------------------
// Account layout (protected)
// ---------------------------------------------------------------------------
export function AccountLayout() {
  return <RequireAuth><AccountShell /></RequireAuth>
}

const AVATAR_TYPES = 'image/jpeg,image/png,image/webp'

// Shared link styling: active item gets a dark red fill and a red left border (bottom border on mobile).
const navLinkClass = (accent = false) => ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 px-4 py-3 text-sm font-medium whitespace-nowrap border-l-2 border-b-2 md:border-b-0 transition-colors duration-200 ${
    isActive ? 'border-accent bg-accent/20 text-white'
    : accent ? 'border-transparent text-accent2 hover:text-white hover:bg-white/5'
    : 'border-transparent text-mute hover:text-white hover:bg-white/5'}`

function AccountShell() {
  const nav = useNavigate()
  const { user, isAdmin, signOut } = useAuth()
  const fileInput = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)

  useEffect(() => {
    getProfile().then(setProfile).catch(() => setProfile(null))
  }, [])

  const fullName = profile?.fullName || user?.name || ''
  const email = profile?.email || user?.email || ''
  const displayName = fullName || email || 'Member'
  const initial = (displayName.trim().charAt(0) || 'M').toUpperCase()
  const avatarUrl = profile?.avatarUrl ?? null

  const onPickAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setAvatarBusy(true)
    setAvatarError(null)
    try {
      const r = await uploadAvatar(file)
      setProfile((p) => (p ? { ...p, avatarUrl: r.avatarUrl } : p))
    } catch (err) {
      setAvatarError(errorText(err))
    } finally {
      setAvatarBusy(false)
    }
  }

  const onRemoveAvatar = async () => {
    setAvatarBusy(true)
    setAvatarError(null)
    try {
      await removeAvatar()
      setProfile((p) => (p ? { ...p, avatarUrl: null } : p))
    } catch (err) {
      setAvatarError(errorText(err))
    } finally {
      setAvatarBusy(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    nav('/')
  }

  return (
    <div className="container-x py-12 grid md:grid-cols-[240px_1fr] gap-10">
      <aside className="min-w-0 md:sticky md:top-24 md:self-start">
        <div className="flex items-start gap-4 pb-6 mb-6 border-b border-line">
          <div className="relative size-16 shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="size-16 rounded-full object-cover border border-line" />
            ) : (
              <div aria-hidden="true" className="size-16 rounded-full bg-accent/15 border border-line grid place-items-center font-display font-bold text-2xl text-accent2">
                {initial}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={avatarBusy}
              aria-label="Upload profile photo"
              title="Upload profile photo"
              className="absolute -bottom-1 -right-1 size-7 rounded-full bg-panel border border-line grid place-items-center text-mute hover:text-white hover:border-accent transition-colors duration-200 disabled:opacity-50"
            >
              <Camera size={14} />
            </button>
            <input ref={fileInput} type="file" accept={AVATAR_TYPES} className="hidden" onChange={onPickAvatar} />
          </div>

          <div className="min-w-0 flex-1 pt-1">
            <p className="font-semibold leading-snug break-words" title={displayName}>{displayName}</p>
            <p className="text-xs text-mute mt-1 truncate" title={email}>{email}</p>
            {avatarUrl && (
              <button
                type="button"
                onClick={onRemoveAvatar}
                disabled={avatarBusy}
                className="text-xs text-mute hover:text-red-400 mt-2 transition-colors duration-200 disabled:opacity-50"
              >
                Remove photo
              </button>
            )}
          </div>
        </div>
        {avatarError && <p role="alert" className="text-xs text-red-400 mb-4">{avatarError}</p>}

        <nav className="flex md:flex-col overflow-x-auto md:overflow-visible border-y md:border md:border-line">
          <NavLink to="/account" end className={navLinkClass()}><User size={16} className="shrink-0" /> Overview</NavLink>
          <NavLink to="/account/orders" className={navLinkClass()}><Package size={16} className="shrink-0" /> Orders</NavLink>
          <NavLink to="/account/settings" className={navLinkClass()}><SettingsIcon size={16} className="shrink-0" /> Settings</NavLink>
          <NavLink to="/wishlist" className={navLinkClass()}><Heart size={16} className="shrink-0" /> Wishlist</NavLink>
          {isAdmin && <NavLink to="/admin" className={navLinkClass(true)}><ShieldCheck size={16} className="shrink-0" /> Admin</NavLink>}
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium whitespace-nowrap text-mute border-l-2 border-b-2 md:border-b-0 border-transparent hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200 md:mt-3 md:border-t md:border-t-line"
          >
            <LogOut size={16} className="shrink-0" /> Log out
          </button>
        </nav>
      </aside>

      <div className="min-w-0"><Outlet /></div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------
export function Overview() {
  const { wish } = useStore()
  const auth = useAuth()
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [addressCount, setAddressCount] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([listOrders(), listAddresses()])
      .then(([o, a]) => { setOrders(o); setAddressCount(a.length) })
      .catch((e) => setError(errorText(e)))
  }, [])

  const firstName = (auth.user?.name || auth.user?.email || '').split(' ')[0]
  return (
    <div>
      <h1 className="h-display text-3xl md:text-4xl">
        Welcome back, <span className="text-accent2">{firstName || 'there'}</span>
      </h1>

      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        {[
          [Package, orders?.length ?? '–', 'Orders', '/account/orders'],
          [Heart, wish.length, 'Wishlist', '/wishlist'],
          [MapPin, addressCount ?? '–', 'Addresses', '/account/settings'],
        ].map(([Icon, count, label, to]: any) => (
          <Link key={label} to={to} className="bg-panel border border-line p-6 hover:border-accent transition">
            <Icon className="text-accent2" size={20} />
            <p className="font-display font-bold text-3xl mt-4">{count}</p>
            <p className="text-sm text-mute">{label}</p>
          </Link>
        ))}
      </div>

      <div className="flex justify-between items-center mt-12 mb-4">
        <h2 className="font-display font-bold uppercase">Recent orders</h2>
        <Link to="/account/orders" className="text-sm text-accent2">View all</Link>
      </div>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      {!orders && !error && <Spinner label="Loading orders…" />}
      {orders && <OrderList orders={orders.slice(0, 2)} empty="No orders yet." />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Order list
// ---------------------------------------------------------------------------
function OrderList({ orders, empty }: { orders: Order[]; empty: string }) {
  if (orders.length === 0) {
    return (
      <div className="border border-dashed border-line py-16 text-center">
        <p className="text-mute">{empty}</p>
        <Link to="/shop" className="btn-primary mt-6">Shop sneakers</Link>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link key={order.id} to={`/account/orders/${order.id}`}
          className="flex flex-wrap items-center gap-4 bg-panel border border-line p-4 hover:border-white/40 transition">
          <div className="flex -space-x-3">
            {order.items.slice(0, 3).map((item) => (
              <img key={item.id} src={u(item.productImage, 120)} alt="" className="size-14 object-cover border-2 border-panel" />
            ))}
          </div>
          <div className="flex-1 min-w-[160px]">
            <p className="font-semibold">{order.orderNumber}</p>
            <p className="text-xs text-mute">
              {dateFmt(order.createdAt)} · {order.items.reduce((a, i) => a + i.quantity, 0)} items · {PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus}
            </p>
          </div>
          <StatusBadge status={order.orderStatus} />
          <span className="font-bold w-24 text-right">{peso(order.total)}</span>
        </Link>
      ))}
    </div>
  )
}

export function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { listOrders().then(setOrders).catch((e) => setError(errorText(e))) }, [])
  return (
    <div>
      <h1 className="h-display text-3xl md:text-4xl mb-8">Order history</h1>
      {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
      {!orders && !error && <Spinner label="Loading orders…" />}
      {orders && <OrderList orders={orders} empty="You haven't placed any orders yet." />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Order details
// ---------------------------------------------------------------------------
export function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    getOrder(Number(id)).then(setOrder).catch((e) => setError(errorText(e)))
  }, [id])

  if (error) return <div><BackLink /><p role="alert" className="text-red-400">{error}</p></div>
  if (!order) return <Spinner label="Loading order…" />

  const cancelled = order.orderStatus === 'cancelled'
  const currentStep = cancelled ? -1 : STEPS.indexOf(order.orderStatus as (typeof STEPS)[number])
  const addr = order.shippingAddress

  return (
    <div>
      <BackLink />
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="h-display text-3xl md:text-4xl">{order.orderNumber}</h1>
        <StatusBadge status={order.orderStatus} />
      </div>
      <p className="text-mute text-sm mt-2">
        Placed {dateFmt(order.createdAt)} · {PAYMENT_LABELS[order.paymentMethod]} · {PAYMENT_STATUS_LABELS[order.paymentStatus]}
      </p>
      <p className="text-xs text-mute mt-3">Demo order: M.Soles is a portfolio project. No real purchase or delivery takes place.</p>

      {!cancelled && (
        <div className="grid grid-cols-4 mt-10">
          {STEPS.map((step, i) => (
            <div key={step} className="relative text-center">
              {i < 3 && <div className={`absolute top-4 left-1/2 w-full h-0.5 ${i < currentStep ? 'bg-accent' : 'bg-line'}`} />}
              <div className={`relative mx-auto size-8 rounded-full grid place-items-center ${i <= currentStep ? 'bg-accent' : 'bg-panel2 border border-line'}`}>
                {i <= currentStep && <Check size={14} />}
              </div>
              <p className={`text-xs mt-3 capitalize ${i <= currentStep ? 'text-white' : 'text-mute'}`}>{step}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 border-t border-line">
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-4 py-5 border-b border-line items-center">
            <img src={u(item.productImage, 200)} alt="" className="size-20 object-cover" />
            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-widest text-accent2">{item.brand}</p>
              {item.productId ? (
                <Link to={`/product/${item.productId}`} className="font-semibold hover:text-accent2">{item.productName}</Link>
              ) : (
                <p className="font-semibold">{item.productName}</p>
              )}
              <p className="text-xs text-mute mt-1">Qty {item.quantity} · US {item.selectedSize} · {item.selectedColor}</p>
            </div>
            <span className="font-bold">{peso(item.subtotal)}</span>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-8">
        <div className="bg-panel border border-line p-5 text-sm">
          <p className="label">Shipping to</p>
          {addr.recipientName}<br />
          {addr.addressLine}<br />
          {addr.city}, {addr.province} {addr.postalCode}<br />
          {addr.phone}
        </div>
        <div className="bg-panel border border-line p-5 text-sm space-y-2">
          <Row label="Subtotal" value={peso(order.subtotal)} />
          <Row label="Shipping" value={order.shippingFee ? peso(order.shippingFee) : 'Free'} />
          {order.discount > 0 && <Row label="Discount" value={`-${peso(order.discount)}`} />}
          <div className="flex justify-between font-bold text-lg pt-2 border-t border-line">
            <span>Total</span><span>{peso(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-mute"><span>{label}</span><span>{value}</span></div>
)
const BackLink = () => (
  <Link to="/account/orders" className="text-sm text-mute hover:text-white inline-flex items-center gap-2 mb-6">
    <ArrowLeft size={14} /> All orders
  </Link>
)

// ---------------------------------------------------------------------------
// Settings: profile, phone, addresses, password
// ---------------------------------------------------------------------------
const emptyAddress: AddressInput = {
  recipientName: '', phone: '', addressLine: '', city: '', province: '', postalCode: '', isDefault: false,
}

export function Settings() {
  const { user, setNewPassword } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [addrList, setAddrList] = useState<Address[]>([])
  const [editing, setEditing] = useState<Address | 'new' | null>(null)
  const [draft, setDraft] = useState<AddressInput>(emptyAddress)
  const [errors, setErrors] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [busy, setBusy] = useState(false)

  const refreshAddresses = () => listAddresses().then(setAddrList)

  useEffect(() => {
    getProfile().then((p) => { setProfile(p); setFullName(p.fullName); setPhone(p.phone) }).catch((e) => setErrors(errorText(e)))
    refreshAddresses().catch((e) => setErrors(errorText(e)))
  }, [])

  const flash = (msg: string) => { setSaved(msg); setTimeout(() => setSaved(null), 3000) }

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault(); setErrors(null); setBusy(true)
    try {
      const p = await updateProfile({ fullName, phone })
      setProfile(p)
      flash('Profile updated.')
    } catch (err) { setErrors(errorText(err)) } finally { setBusy(false) }
  }

  const openAddress = (a: Address | 'new') => {
    setErrors(null)
    setEditing(a)
    setDraft(a === 'new' ? { ...emptyAddress, recipientName: fullName, phone } : { ...a })
  }

  const saveAddress = async (e: FormEvent) => {
    e.preventDefault(); setErrors(null); setBusy(true)
    try {
      if (editing === 'new') await createAddress(draft)
      else if (editing) await updateAddress(editing.id, draft)
      await refreshAddresses()
      setEditing(null)
      flash('Address saved.')
    } catch (err) { setErrors(errorText(err)) } finally { setBusy(false) }
  }

  const removeAddress = async (a: Address) => {
    if (!window.confirm('Delete this address?')) return
    try { await deleteAddress(a.id); await refreshAddresses(); flash('Address deleted.') }
    catch (err) { setErrors(errorText(err)) }
  }

  const changePassword = async (e: FormEvent) => {
    e.preventDefault(); setErrors(null)
    if (newPw.length < 6) return setErrors('Password must be at least 6 characters.')
    if (newPw !== confirmPw) return setErrors('Passwords do not match.')
    setBusy(true)
    try {
      await setNewPassword(newPw)
      setNewPw(''); setConfirmPw('')
      flash('Password updated.')
    } catch (err) { setErrors(authErrorMessage(err)) } finally { setBusy(false) }
  }

  const Field = ({ label, ...inputProps }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label className="label">{label}</label>
      <input className="field" {...inputProps} />
    </div>
  )

  if (!profile && !errors) return <Spinner label="Loading your profile…" />

  return (
    <div>
      <h1 className="h-display text-3xl md:text-4xl mb-8">Profile settings</h1>
      {errors && <p role="alert" className="mb-6 border border-red-500/40 bg-red-500/10 text-red-300 text-sm px-4 py-3">{errors}</p>}
      {saved && <p role="status" className="mb-6 border border-green-500/40 bg-green-500/10 text-green-300 text-sm px-4 py-3">{saved}</p>}

      <form onSubmit={saveProfile} className="space-y-10 max-w-2xl">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required />
          <Field label="Email" type="email" value={user?.email ?? ''} disabled readOnly />
          <Field label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+63 917 555 0142" autoComplete="tel" />
        </div>
        <button disabled={busy} className="btn-primary">Save profile</button>
      </form>

      <div className="max-w-2xl mt-12">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-display font-bold uppercase">Shipping addresses</h2>
          {editing === null && <button onClick={() => openAddress('new')} className="btn-ghost btn-sm">Add address</button>}
        </div>

        {editing !== null && (
          <form onSubmit={saveAddress} className="grid sm:grid-cols-2 gap-4 bg-panel border border-line p-5 mb-6">
            <Field label="Recipient name" value={draft.recipientName} onChange={(e) => setDraft({ ...draft, recipientName: e.target.value })} required />
            <Field label="Phone" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} required />
            <div className="sm:col-span-2"><Field label="Address" value={draft.addressLine} onChange={(e) => setDraft({ ...draft, addressLine: e.target.value })} required /></div>
            <Field label="City" value={draft.city} onChange={(e) => setDraft({ ...draft, city: e.target.value })} required />
            <Field label="Province" value={draft.province} onChange={(e) => setDraft({ ...draft, province: e.target.value })} required />
            <Field label="Postal code" value={draft.postalCode} onChange={(e) => setDraft({ ...draft, postalCode: e.target.value })} required />
            <label className="flex items-center gap-2 text-sm self-end h-12">
              <input type="checkbox" checked={draft.isDefault} onChange={(e) => setDraft({ ...draft, isDefault: e.target.checked })} /> Default address
            </label>
            <div className="sm:col-span-2 flex gap-3">
              <button disabled={busy} className="btn-primary">Save address</button>
              <button type="button" onClick={() => setEditing(null)} className="btn-ghost">Cancel</button>
            </div>
          </form>
        )}

        {addrList.length === 0 && editing === null && (
          <p className="text-sm text-mute border border-dashed border-line p-6">No saved addresses yet.</p>
        )}
        <div className="space-y-3">
          {addrList.map((a) => (
            <div key={a.id} className="bg-panel border border-line p-4 flex justify-between gap-4 text-sm">
              <div>
                <p className="font-semibold">{a.recipientName} {a.isDefault && <span className="text-xs text-accent2 ml-2">DEFAULT</span>}</p>
                <p className="text-mute">{a.addressLine}, {a.city}, {a.province} {a.postalCode}</p>
                <p className="text-mute">{a.phone}</p>
              </div>
              <div className="flex gap-2 items-start">
                <button onClick={() => openAddress(a)} aria-label="Edit address" className="size-9 grid place-items-center hover:text-accent2"><Pencil size={15} /></button>
                <button onClick={() => removeAddress(a)} aria-label="Delete address" className="size-9 grid place-items-center hover:text-red-400"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={changePassword} className="max-w-2xl mt-12">
        <h2 className="font-display font-bold uppercase mb-4">Change password</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="New password" type="password" autoComplete="new-password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
          <Field label="Confirm" type="password" autoComplete="new-password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
        </div>
        <button disabled={busy} className="btn-ghost mt-4">Update password</button>
      </form>
    </div>
  )
}

