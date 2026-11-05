import { useEffect, useState, type FormEvent } from 'react'
import { Plus, Pencil, Trash2, Upload, X } from 'lucide-react'
import { PageHeader, Modal } from '../ui'
import { CATEGORIES, COLORS, SIZES, peso, u, setCatalog, type Product } from '../data'
import { RequireAuth, Spinner } from '../components/RequireAuth'
import { adminListProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, adminListOrders, adminUpdateOrder, uploadProductImage, type ProductInput } from '../services/admin'
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, type Order } from '../services/orders'
import { errorText } from '../utils/errors'

// Server routes under /api/admin enforce the admin role; this page is only a convenience UI.
export default function Admin() {
  return (
    <RequireAuth admin>
      <AdminDashboard />
    </RequireAuth>
  )
}

function AdminDashboard() {
  const [tab, setTab] = useState<'products' | 'orders'>('products')
  return (
    <>
      <PageHeader crumbs={[{ label: 'Admin' }]} title="Admin dashboard" text="Manage the catalog and demo orders. Every change is checked on the server." />
      <div className="container-x py-10">
        <div className="flex gap-2 mb-8">
          {(['products', 'orders'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`h-10 px-5 text-xs font-bold uppercase tracking-widest border ${tab === t ? 'bg-white text-black border-white' : 'border-line text-mute hover:text-white'}`}>
              {t}
            </button>
          ))}
        </div>
        {tab === 'products' ? <ProductManager /> : <OrderManager />}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
const blankProduct: ProductInput = {
  name: '', brand: '', categories: [], description: '', price: 0, wasPrice: null, images: [],
  availableSizes: [], availableColors: [], stockQuantity: 0, isNew: false, isBest: false, isTrending: false, sortOrder: 0,
}

function ProductManager() {
  const [items, setItems] = useState<Product[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [editing, setEditing] = useState<Product | 'new' | null>(null)

  const load = () => adminListProducts().then((list) => { setItems(list); setCatalog(list) }).catch((e) => setError(errorText(e)))
  useEffect(() => { load() }, [])

  const remove = async (p: Product) => {
    if (!window.confirm(`Delete ${p.brand} ${p.name}? Past orders keep their history.`)) return
    try { await adminDeleteProduct(p.id); setNotice('Product deleted.'); await load() }
    catch (e) { setError(errorText(e)) }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 gap-4">
        <p className="text-sm text-mute">{items ? `${items.length} products` : ''}</p>
        <button onClick={() => setEditing('new')} className="btn-primary btn-sm"><Plus size={14} /> New product</button>
      </div>
      {error && <p role="alert" className="mb-4 text-sm text-red-300 border border-red-500/40 bg-red-500/10 px-4 py-3">{error}</p>}
      {notice && <p role="status" className="mb-4 text-sm text-green-300 border border-green-500/40 bg-green-500/10 px-4 py-3">{notice}</p>}

      {!items ? <Spinner label="Loading products…" /> : items.length === 0 ? (
        <p className="text-mute border border-dashed border-line p-10 text-center">No products yet. Add the first pair.</p>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full text-sm">
            <thead className="bg-panel2 text-left text-xs uppercase tracking-widest text-mute">
              <tr>
                <th className="p-3">Product</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Sizes</th><th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="p-3 flex items-center gap-3">
                    <img src={u(p.img, 120)} alt="" className="size-12 object-cover" />
                    <div><p className="text-[11px] uppercase tracking-widest text-accent2">{p.brand}</p><p className="font-semibold">{p.name}</p></div>
                  </td>
                  <td className="p-3">{peso(p.price)}{p.was && <span className="block text-xs text-mute line-through">{peso(p.was)}</span>}</td>
                  <td className={`p-3 font-semibold ${(p.stock ?? 0) < 5 ? 'text-red-400' : ''}`}>{p.stock ?? 0}</td>
                  <td className="p-3 text-mute text-xs">{(p.sizes ?? []).length} sizes · {p.colors.join(', ')}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditing(p)} aria-label={`Edit ${p.name}`} className="size-9 grid place-items-center hover:text-accent2"><Pencil size={15} /></button>
                      <button onClick={() => remove(p)} aria-label={`Delete ${p.name}`} className="size-9 grid place-items-center hover:text-red-400"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)}>
        {editing !== null && (
          <ProductForm
            key={editing === 'new' ? 'new' : editing.id}
            product={editing === 'new' ? null : editing}
            onSaved={async (msg) => { setEditing(null); setNotice(msg); await load() }}
          />
        )}
      </Modal>
    </div>
  )
}

function toInput(p: Product | null): ProductInput {
  if (!p) return blankProduct
  return {
    name: p.name, brand: p.brand, categories: p.cats, description: p.desc, price: p.price, wasPrice: p.was ?? null,
    images: p.imgs, availableSizes: p.sizes ?? [], availableColors: p.colors, stockQuantity: p.stock ?? 0,
    isNew: !!p.isNew, isBest: !!p.best, isTrending: !!p.trending, sortOrder: p.order,
  }
}

function ProductForm({ product, onSaved }: { product: Product | null; onSaved: (msg: string) => void }) {
  const [form, setForm] = useState<ProductInput>(() => toInput(product))
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])

  const addImage = async (file: File) => {
    setError(null); setUploading(true)
    try {
      const url = await uploadProductImage(file)
      setForm((f) => ({ ...f, images: [...f.images, url] }))
    } catch (e) { setError(errorText(e)) } finally { setUploading(false) }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(null); setBusy(true)
    try {
      if (product) await adminUpdateProduct(product.id, form)
      else await adminCreateProduct(form)
      onSaved(product ? 'Product updated.' : 'Product created.')
    } catch (err) { setError(errorText(err)) } finally { setBusy(false) }
  }

  const num = (k: 'price' | 'stockQuantity' | 'sortOrder') => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value === '' ? 0 : Number(e.target.value) }))

  return (
    <form onSubmit={submit} className="max-h-[80vh] overflow-y-auto pr-1 space-y-5">
      <h3 className="h-display text-xl">{product ? 'Edit product' : 'New product'}</h3>
      {error && <p role="alert" className="text-sm text-red-300 border border-red-500/40 bg-red-500/10 px-3 py-2">{error}</p>}

      <div className="grid sm:grid-cols-2 gap-4">
        <div><label className="label" htmlFor="p-brand">Brand</label><input id="p-brand" className="field" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required /></div>
        <div><label className="label" htmlFor="p-name">Name</label><input id="p-name" className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
        <div><label className="label" htmlFor="p-price">Price (₱)</label><input id="p-price" type="number" min={1} className="field" value={form.price || ''} onChange={num('price')} required /></div>
        <div><label className="label" htmlFor="p-was">Original price (optional)</label><input id="p-was" type="number" className="field" value={form.wasPrice ?? ''} onChange={(e) => setForm({ ...form, wasPrice: e.target.value === '' ? null : Number(e.target.value) })} /></div>
        <div><label className="label" htmlFor="p-stock">Stock quantity</label><input id="p-stock" type="number" min={0} className="field" value={form.stockQuantity} onChange={num('stockQuantity')} /></div>
        <div><label className="label" htmlFor="p-order">Sort order</label><input id="p-order" type="number" className="field" value={form.sortOrder} onChange={num('sortOrder')} /></div>
      </div>

      <div>
        <label className="label" htmlFor="p-desc">Description</label>
        <textarea id="p-desc" rows={3} className="field !h-auto py-3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>

      <fieldset>
        <legend className="label">Categories</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button type="button" key={c} onClick={() => setForm({ ...form, categories: toggle(form.categories, c) })}
              className={`text-xs px-3 py-1.5 border ${form.categories.includes(c) ? 'bg-white text-black border-white' : 'border-line text-mute'}`}>{c}</button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Sizes (US)</legend>
        <div className="grid grid-cols-6 gap-2">
          {SIZES.map((s) => (
            <button type="button" key={s} onClick={() => setForm({ ...form, availableSizes: toggle(form.availableSizes, s) })}
              className={`h-9 text-xs font-semibold border ${form.availableSizes.includes(s) ? 'bg-white text-black border-white' : 'border-line text-mute'}`}>{s}</button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Colours</legend>
        <div className="flex flex-wrap gap-2">
          {Object.keys(COLORS).map((c) => (
            <button type="button" key={c} onClick={() => setForm({ ...form, availableColors: toggle(form.availableColors, c) })}
              className={`text-xs px-3 py-1.5 border ${form.availableColors.includes(c) ? 'bg-white text-black border-white' : 'border-line text-mute'}`}>{c}</button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label">Images</legend>
        <div className="flex flex-wrap gap-3 mb-3">
          {form.images.map((img, i) => (
            <div key={`${img}-${i}`} className="relative size-20 border border-line">
              <img src={u(img, 200)} alt="" className="size-full object-cover" />
              <button type="button" aria-label="Remove image" onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })}
                className="absolute -top-2 -right-2 size-5 bg-black border border-line grid place-items-center"><X size={11} /></button>
            </div>
          ))}
        </div>
        <label className="btn-ghost btn-sm cursor-pointer">
          <Upload size={14} /> {uploading ? 'Uploading…' : 'Upload image'}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={uploading}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) addImage(f); e.target.value = '' }} />
        </label>
        <div className="flex gap-2 mt-3">
          <input aria-label="Image URL or Unsplash id" className="field !h-10 text-xs" placeholder="Or paste an https image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <button type="button" className="btn-ghost btn-sm" onClick={() => { if (imageUrl.trim()) { setForm({ ...form, images: [...form.images, imageUrl.trim()] }); setImageUrl('') } }}>Add</button>
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} /> New</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.isBest} onChange={(e) => setForm({ ...form, isBest: e.target.checked })} /> Best seller</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.isTrending} onChange={(e) => setForm({ ...form, isTrending: e.target.checked })} /> Trending</label>
      </div>

      <button disabled={busy || uploading} className="btn-primary w-full">{busy ? 'Saving…' : product ? 'Save changes' : 'Create product'}</button>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
const ORDER_STATUSES = ['placed', 'packed', 'shipped', 'delivered', 'cancelled']
const PAYMENT_STATUSES = ['unpaid', 'paid_simulated', 'refunded_simulated']

function OrderManager() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const load = () => adminListOrders().then(setOrders).catch((e) => setError(errorText(e)))
  useEffect(() => { load() }, [])

  const update = async (id: number, data: { orderStatus?: string; paymentStatus?: string }) => {
    setError(null)
    try { await adminUpdateOrder(id, data); setNotice('Order updated.'); await load() }
    catch (e) { setError(errorText(e)) }
  }

  if (error && !orders) return <p role="alert" className="text-sm text-red-300">{error}</p>
  if (!orders) return <Spinner label="Loading orders…" />
  if (orders.length === 0) return <p className="text-mute border border-dashed border-line p-10 text-center">No orders yet.</p>

  return (
    <div className="space-y-4">
      {error && <p role="alert" className="text-sm text-red-300 border border-red-500/40 bg-red-500/10 px-4 py-3">{error}</p>}
      {notice && <p role="status" className="text-sm text-green-300 border border-green-500/40 bg-green-500/10 px-4 py-3">{notice}</p>}
      <p className="text-xs text-mute">{orders.length} orders (demo: no real fulfilment)</p>
      {orders.map((o) => (
        <div key={o.id} className="bg-panel border border-line p-5 grid lg:grid-cols-[1fr_auto] gap-4">
          <div className="text-sm space-y-1">
            <p className="font-display font-bold">{o.orderNumber} <span className="text-mute font-sans font-normal text-xs ml-2">{new Date(o.createdAt).toLocaleString('en-PH')}</span></p>
            <p className="text-mute">{o.customerName} · {o.customerEmail} · {o.customerPhone}</p>
            <p className="text-mute">{o.shippingAddress.addressLine}, {o.shippingAddress.city}, {o.shippingAddress.province} {o.shippingAddress.postalCode}</p>
            <p className="text-mute">{o.items.map((i) => `${i.productName} (US ${i.selectedSize}, ${i.selectedColor}) ×${i.quantity}`).join(' · ')}</p>
            <p className="font-semibold">Total {peso(o.total)}</p>
          </div>
          <div className="flex flex-col gap-3 min-w-56">
            <label className="text-xs text-mute">Order status
              <select className="field !h-10 mt-1" value={o.orderStatus} onChange={(e) => update(o.id, { orderStatus: e.target.value })}>
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>)}
              </select>
            </label>
            <label className="text-xs text-mute">Payment status (simulated)
              <select className="field !h-10 mt-1" value={o.paymentStatus} onChange={(e) => update(o.id, { paymentStatus: e.target.value })}>
                {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</option>)}
              </select>
            </label>
          </div>
        </div>
      ))}
    </div>
  )
}
