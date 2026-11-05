import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'
import { useEffect, useMemo, useState } from 'react'
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown, Camera, AtSign, Globe, Play, Check, ArrowRight } from 'lucide-react'
import { BRANDS, PRODUCTS, peso, u } from './data'
import { useStore } from './store'
import { Logo } from './ui'

const links = [['/', 'Home'], ['/shop', 'Shop'], ['/brands', 'Brands'], ['/collections', 'Collections'], ['/about', 'About Us']]

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('')
  const nav = useNavigate()
  const res = useMemo(() => q.trim() ? PRODUCTS.filter((p) => `${p.brand} ${p.name} ${p.cats.join(' ')}`.toLowerCase().includes(q.toLowerCase())).slice(0, 5) : [], [q])
  useEffect(() => { const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [onClose])
  return (
    <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md anim-pop" onClick={onClose}>
      <div className="container-x max-w-3xl pt-24" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={(e) => { e.preventDefault(); nav(`/shop?q=${encodeURIComponent(q)}`); onClose() }} className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-accent" size={20} />
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brands, models, categories..." className="w-full h-16 bg-panel border border-line pl-14 pr-14 text-lg outline-none focus:border-accent" />
          <button type="button" onClick={onClose} aria-label="Close search" className="absolute right-5 top-1/2 -translate-y-1/2 text-mute hover:text-white"><X /></button>
        </form>
        <div className="mt-2 bg-panel border border-line">
          {q && res.length === 0 && <p className="p-6 text-mute">No sneakers match "{q}".</p>}
          {res.map((p) => (
            <Link key={p.id} to={`/product/${p.id}`} onClick={onClose} className="flex items-center gap-4 p-3 hover:bg-white/5 border-b border-line last:border-0">
              <img src={u(p.img, 120)} alt="" className="size-14 object-cover" />
              <div className="flex-1"><p className="text-[11px] uppercase tracking-widest text-accent">{p.brand}</p><p className="font-medium">{p.name}</p></div>
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
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(false)
  const [drop, setDrop] = useState(false)
  const loc = useLocation()
  useEffect(() => { setOpen(false); setDrop(false); window.scrollTo(0, 0) }, [loc.pathname])
  const icon = 'relative size-10 grid place-items-center hover:text-accent transition-colors'
  const badge = 'absolute top-0.5 right-0 min-w-4 h-4 px-1 bg-accent text-[10px] font-bold grid place-items-center rounded-full'
  return (
    <>
      <div className="bg-accent text-white text-center text-xs font-semibold tracking-wider py-2 px-4">FREE SHIPPING ON ORDERS OVER ₱5,000 &nbsp;·&nbsp; UP TO 30% OFF SUMMER DROPS</div>
      <header className="sticky top-0 z-50 bg-ink/85 backdrop-blur-xl border-b border-line">
        <div className="container-x h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <button className="lg:hidden -ml-2 size-10 grid place-items-center" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
            <Logo />
          </div>
          <nav className="hidden lg:flex items-center gap-9 text-sm font-medium">
            {links.map(([to, label]) => label === 'Brands' ? (
              <div key={to} className="relative" onMouseEnter={() => setDrop(true)} onMouseLeave={() => setDrop(false)}>
                <NavLink to={to} className={({ isActive }) => `flex items-center gap-1 py-5 hover:text-accent ${isActive ? 'text-accent' : ''}`}>{label}<ChevronDown size={14} className={`transition ${drop ? 'rotate-180' : ''}`} /></NavLink>
                {drop && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-80 bg-panel border border-line p-3 grid grid-cols-2 gap-1 anim-pop">
                    {BRANDS.map((b) => <Link key={b.slug} to={`/brands/${b.slug}`} className="px-3 py-2 text-sm text-mute hover:text-white hover:bg-white/5">{b.name}</Link>)}
                  </div>
                )}
              </div>
            ) : (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `relative py-5 hover:text-accent transition-colors ${isActive ? 'text-accent after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent' : ''}`}>{label}</NavLink>
            ))}
          </nav>
          <div className="flex items-center">
            <button aria-label="Search" onClick={() => setSearch(true)} className={icon}><Search size={19} /></button>
            <Link to="/account" aria-label="Account" className={`${icon} max-sm:hidden`}><User size={19} /></Link>
            <Link to="/wishlist" aria-label="Wishlist" className={icon}><Heart size={19} />{wish.length > 0 && <span className={badge}>{wish.length}</span>}</Link>
            <Link to="/cart" aria-label="Cart" className={icon}><ShoppingBag size={19} />{count > 0 && <span className={badge}>{count}</span>}</Link>
          </div>
        </div>
        {open && (
          <div className="lg:hidden border-t border-line bg-ink anim-slideup">
            <nav className="container-x py-4 flex flex-col">
              {[...links, ['/account', 'My Account'], ['/login', 'Login']].map(([to, label]) => <Link key={to} to={to} className="py-4 text-lg font-display font-bold uppercase border-b border-line flex justify-between">{label}<ArrowRight size={18} className="text-accent" /></Link>)}
            </nav>
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
      <ul className="space-y-3 text-sm text-mute">{items.map(([l, to]) => <li key={l}><Link to={to} className="hover:text-accent transition-colors">{l}</Link></li>)}</ul>
    </div>
  )
  return (
    <footer className="border-t border-line bg-black mt-24">
      <div className="container-x py-16 grid gap-12 md:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2 max-w-sm">
          <Logo />
          <p className="text-sm text-mute mt-5 leading-relaxed">Nocturn is a multi-brand sneaker retailer. Authentic pairs from the world's best footwear brands, curated for runners, hoopers and everyone who lives in their kicks.</p>
          <div className="flex gap-3 mt-6">{[Camera, AtSign, Globe, Play].map((I, i) => <a key={i} href="#" aria-label="Social" className="size-10 border border-line grid place-items-center hover:bg-accent hover:border-accent transition"><I size={16} /></a>)}</div>
        </div>
        {col('Shop', [['New Arrivals', '/shop?sort=newest'], ['Men', '/shop?category=Men'], ['Women', '/shop?category=Women'], ['Kids', '/shop?category=Kids'], ['Sale', '/shop?sort=price-asc']])}
        {col('Brands', BRANDS.slice(0, 6).map((b) => [b.name, `/brands/${b.slug}`] as [string, string]))}
        {col('Support', [['Order History', '/account/orders'], ['Track Order', '/account/orders'], ['Shipping & Returns', '/about'], ['Contact Us', '/about'], ['Size Guide', '/about']])}
        {col('Company', [['About Us', '/about'], ['Collections', '/collections'], ['Careers', '/about'], ['Authenticity', '/about']])}
      </div>
      <div className="border-t border-line">
        <div className="container-x py-6 flex flex-col md:flex-row justify-between gap-3 text-xs text-mute">
          <p>© 2025 Nocturn Sneaker Co. All rights reserved. Brand names are trademarks of their respective owners.</p>
          <p className="flex gap-5"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Cookies</a></p>
        </div>
      </div>
    </footer>
  )
}

function Toast() {
  const { toast } = useStore()
  if (!toast) return null
  return <div key={toast} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] bg-white text-black px-5 py-3 text-sm font-semibold flex items-center gap-2 shadow-2xl anim-slideup"><span className="size-5 bg-accent text-white grid place-items-center rounded-full"><Check size={12} /></span>{toast}</div>
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
