import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown, ArrowRight } from 'lucide-react'
import { BRANDS, PRODUCTS, peso, u } from './data'
import { useStore } from './store'
import { useAuth } from './context/AuthContext'
import { Logo } from './ui'

// Primary navigation. Every entry points at a real route or a working shop filter.
const NAV: [string, string][] = [
  ['/shop?sort=newest', 'New Arrivals'],
  ['/collections', 'Exclusives'],
  ['/shop?category=Men', 'Men'],
  ['/shop?category=Women', 'Women'],
  ['/shop?category=Kids', 'Kids'],
  ['/brands', 'Brands'],
  ['/shop?sale=1', 'Sale'],
]

function isActive(to: string, pathname: string, search: string) {
  if (to.includes('?')) return `${pathname}${search}` === to
  if (to === '/brands') return pathname.startsWith('/brands')
  return pathname === to
}

// Keyword search that routes to the shop with a ?q= filter.
function SearchForm({ className = '', onDone }: { className?: string; onDone?: () => void }) {
  const [q, setQ] = useState('')
  const nav = useNavigate()
  const submit = (e: FormEvent) => {
    e.preventDefault()
    nav(`/shop?q=${encodeURIComponent(q.trim())}`)
    setQ('')
    onDone?.()
  }
  return (
    <form role="search" onSubmit={submit} className={`flex ${className}`}>
      <label className="sr-only" htmlFor="site-search">Search products</label>
      <input
        id="site-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search brands, models, categories…"
        className="flex-1 min-w-0 h-11 bg-panel border border-line border-r-0 px-4 text-sm text-white placeholder:text-mute outline-none focus:border-accent"
      />
      <button type="submit" aria-label="Search" className="h-11 w-12 bg-accent text-white grid place-items-center hover:bg-accent2 transition-colors">
        <Search size={18} />
      </button>
    </form>
  )
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('')
  const nav = useNavigate()
  const res = useMemo(() => q.trim() ? PRODUCTS.filter((p) => `${p.brand} ${p.name} ${p.cats.join(' ')}`.toLowerCase().includes(q.toLowerCase())).slice(0, 5) : [], [q])
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [onClose])
  return (
    <div className="fixed inset-0 z-[70] bg-black/95 backdrop-blur-md anim-pop" onClick={onClose}>
      <div className="container-x max-w-3xl pt-24" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={(e) => { e.preventDefault(); nav(`/shop?q=${encodeURIComponent(q)}`); onClose() }} className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-accent2" size={20} />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brands, models, categories..." className="w-full h-16 bg-panel border border-line pl-14 pr-14 text-lg outline-none focus:border-accent" />
          <button type="button" onClick={onClose} aria-label="Close search" className="absolute right-5 top-1/2 -translate-y-1/2 text-mute hover:text-white"><X /></button>
        </form>
        <div className="mt-2 bg-panel border border-line">
          {q && res.length === 0 && <p className="p-6 text-mute">No sneakers match "{q}".</p>}
          {res.map((p) => (
            <Link key={p.id} to={`/product/${p.id}`} onClick={onClose} className="flex items-center gap-4 p-3 hover:bg-white/5 border-b border-line last:border-0">
              <img src={u(p.img, 120)} alt="" className="size-14 object-cover" />
              <div className="flex-1"><p className="text-[11px] uppercase tracking-widest text-accent2">{p.brand}</p><p className="font-medium">{p.name}</p></div>
              <span className="font-semibold">{peso(p.price)}</span>
            </Link>
          ))}
          {!q && <div className="p-5 flex flex-wrap gap-2 items-center"><span className="text-xs text-mute mr-2">TRENDING</span>{['Jordan', 'Samba', 'Running', 'Kayano'].map((t) => <button key={t} onClick={() => setQ(t)} className="px-3 py-1.5 border border-line text-sm hover:border-accent">{t}</button>)}</div>}
        </div>
      </div>
    </div>
  )
}

function Navbar() {
  const { count, wish } = useStore()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(false)
  const [drop, setDrop] = useState(false)
  const loc = useLocation()
  useEffect(() => { setOpen(false); setDrop(false); window.scrollTo(0, 0) }, [loc.pathname, loc.search])

  const icon = 'relative size-10 grid place-items-center hover:text-accent2 transition-colors'
  const badge = 'absolute top-0.5 right-0 min-w-4 h-4 px-1 bg-accent text-white text-[10px] font-bold grid place-items-center rounded-full'

  return (
    <>
      <div className="bg-accent text-white text-center text-[11px] sm:text-xs font-bold tracking-[.18em] uppercase py-2 px-4">
        Free shipping on orders over ₱5,000 &nbsp;·&nbsp; Simulated demo store, no real orders
      </div>

      <header className="sticky top-0 z-50 bg-ink/95 backdrop-blur-xl border-b border-line">
        {/* Top row: logo, search, account / wishlist / cart */}
        <div className="container-x h-16 md:h-20 flex items-center gap-3 md:gap-8">
          <button className="lg:hidden -ml-2 size-10 grid place-items-center shrink-0" aria-label="Menu" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
          <Logo />
          <SearchForm className="hidden md:flex flex-1 max-w-2xl mx-auto" />
          <div className="ml-auto md:ml-0 flex items-center shrink-0">
            <button aria-label="Search" onClick={() => setSearch(true)} className={`${icon} md:hidden`}><Search size={19} /></button>
            <Link to={user ? '/account' : '/login'} aria-label="Account" className={icon}><User size={19} /></Link>
            <Link to="/wishlist" aria-label="Wishlist" className={icon}>
              <Heart size={19} />{wish.length > 0 && <span className={badge}>{wish.length}</span>}
            </Link>
            <Link to="/cart" aria-label="Cart" className={icon}>
              <ShoppingBag size={19} />{count > 0 && <span className={badge}>{count}</span>}
            </Link>
          </div>
        </div>

        {/* Desktop category navigation */}
        <nav aria-label="Primary" className="hidden lg:flex border-t border-line h-12 items-center justify-center gap-10 text-sm font-bold uppercase tracking-wide">
          {NAV.map(([to, label]) => {
            const active = isActive(to, loc.pathname, loc.search)
            const isSale = label === 'Sale'
            const cls = `relative h-full flex items-center gap-1 transition-colors hover:text-accent2 ${isSale ? 'text-accent2' : ''} ${active ? 'text-accent2 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent' : ''}`
            if (label !== 'Brands') return <Link key={to} to={to} className={cls}>{label}</Link>
            return (
              <div key={to} className="relative h-full flex items-center" onMouseEnter={() => setDrop(true)} onMouseLeave={() => setDrop(false)}>
                <Link to={to} className={cls}>{label}<ChevronDown size={14} className={`transition ${drop ? 'rotate-180' : ''}`} /></Link>
                {drop && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-80 bg-panel border border-line p-3 grid grid-cols-2 gap-1 anim-pop">
                    {BRANDS.map((b) => <Link key={b.slug} to={`/brands/${b.slug}`} className="px-3 py-2 text-sm normal-case font-medium text-mute hover:text-white hover:bg-white/5">{b.name}</Link>)}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Mobile navigation */}
        {open && (
          <div className="lg:hidden border-t border-line bg-ink anim-slideup max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="container-x py-3">
              <SearchForm className="md:hidden mb-3" onDone={() => setOpen(false)} />
              <nav aria-label="Mobile" className="flex flex-col">
                {NAV.map(([to, label]) => (
                  <Link key={to} to={to} className={`py-4 text-base font-display font-bold uppercase border-b border-line flex justify-between items-center ${label === 'Sale' ? 'text-accent2' : ''} ${isActive(to, loc.pathname, loc.search) ? 'text-accent2' : ''}`}>
                    {label}<ArrowRight size={18} className="text-accent2" />
                  </Link>
                ))}
                <Link to={user ? '/account' : '/login'} className="py-4 text-base font-display font-bold uppercase border-b border-line flex justify-between items-center">
                  {user ? 'My Account' : 'Log in / Register'}<ArrowRight size={18} className="text-accent2" />
                </Link>
              </nav>
            </div>
          </div>
        )}
      </header>
      {search && <SearchOverlay onClose={() => setSearch(false)} />}
    </>
  )
}

function Footer() {
  const col = (title: string, items: [string, string][]) => (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-[.2em] mb-5">{title}</h4>
      <ul className="space-y-3 text-sm text-mute">
        {items.map(([l, to]) => <li key={l}><Link to={to} className="hover:text-accent2 transition-colors">{l}</Link></li>)}
      </ul>
    </div>
  )
  return (
    <footer className="mt-24 bg-panel/60 backdrop-blur-sm border-t-4 border-accent">
      <div className="container-x py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
        <div className="sm:col-span-2 lg:col-span-2 max-w-sm">
          <Logo />
          <p className="text-sm text-mute mt-5 leading-relaxed">
            M.Soles is a multi-brand sneaker shopping platform that brings popular sneaker brands together in one convenient online store.
          </p>
          <p className="text-xs text-mute mt-5 border border-line bg-ink/60 p-3 leading-relaxed">
            Portfolio demonstration. Checkout and payments are simulated, and no real orders are placed.
          </p>
        </div>
        {col('Shop', [['New Arrivals', '/shop?sort=newest'], ['Men', '/shop?category=Men'], ['Women', '/shop?category=Women'], ['Kids', '/shop?category=Kids'], ['Sale', '/shop?sale=1']])}
        {col('Brands', BRANDS.slice(0, 6).map((b) => [b.name, `/brands/${b.slug}`] as [string, string]))}
        <div>
          {col('Account', [['Log in', '/login'], ['Create account', '/register'], ['Order history', '/account/orders'], ['Wishlist', '/wishlist'], ['Cart', '/cart']])}
        </div>
      </div>
      <div className="container-x pb-14">
        <div className="grid gap-6 sm:grid-cols-3 border-t border-line pt-8">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[.2em] mb-3">Company</h4>
            <ul className="space-y-3 text-sm text-mute">
              <li><Link to="/about" className="hover:text-accent2 transition-colors">About Us</Link></li>
              <li><Link to="/collections" className="hover:text-accent2 transition-colors">Collections</Link></li>
              <li><Link to="/shop" className="hover:text-accent2 transition-colors">Explore the shop</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[.2em] mb-3">Email</h4>
            <a href="mailto:mariondingal50@gmail.com" className="text-sm text-mute hover:text-accent2 transition-colors break-all">mariondingal50@gmail.com</a>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[.2em] mb-3">Phone</h4>
            <a href="tel:+639274793893" className="text-sm text-mute hover:text-accent2 transition-colors">+63 927 479 3893</a>
          </div>
        </div>
      </div>
      <div className="border-t border-line bg-ink/80">
        <div className="container-x py-6 flex flex-col md:flex-row justify-between gap-3 text-xs text-mute">
          <p>© 2026 M.Soles. Created by Marion Anthony S. Dingal.</p>
          <p>Brand names are trademarks of their respective owners.</p>
        </div>
      </div>
    </footer>
  )
}

function Toast() {
  const { toast } = useStore()
  if (!toast) return null
  return <div key={toast} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] bg-white text-black px-5 py-3 text-sm font-semibold flex items-center gap-2 shadow-2xl anim-slideup">{toast}</div>
}

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <Footer />
      <Toast />
    </div>
  )
}
