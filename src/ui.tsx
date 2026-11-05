import { Link } from 'react-router'
import { Heart, Star, ShoppingBag, Minus, Plus, X, ChevronRight } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { COLORS, peso, u, brandSlug, type Product } from './data'
import { useStore } from './store'
import { defaultColor, galleryFor } from './colorway'

export const Stars = ({ v, size = 13 }: { v: number; size?: number }) => (
  <span className="inline-flex gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={size} className={i <= Math.round(v) ? 'fill-accent text-accent2' : 'text-white/20'} />
    ))}
  </span>
)

export const Swatch = ({ c, active, onClick, size = 12 }: { c: string; active?: boolean; onClick?: () => void; size?: number }) => (
  <button type="button" title={c} onClick={onClick} style={{ background: COLORS[c], width: size, height: size }}
    className={`rounded-full border ${active ? 'ring-2 ring-accent ring-offset-2 ring-offset-ink border-transparent' : 'border-white/30'} ${onClick ? '' : 'pointer-events-none'}`} />
)

// Listing image: the first photo of the default colour, so the card matches the product page.
// Undefined when no photo shows that colour; another colourway's photo is never used.
const cardImage = (p: Product) => {
  const imageColors = p.imageColors ?? []
  const [first] = galleryFor(p.imgs, imageColors, defaultColor(p.colors, imageColors))
  return first !== undefined ? p.imgs[first] : undefined
}

export function ProductCard({ p }: { p: Product }) {
  const { wish, toggleWish, addToCart } = useStore()
  const liked = wish.includes(p.id)
  const off = p.was ? Math.round((1 - p.price / p.was) * 100) : 0
  return (
    <div className="group bg-panel border border-line hover:border-white/30 transition-colors flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-panel2">
        <Link to={`/product/${p.id}`}>
          {cardImage(p) ? (
            <img src={u(cardImage(p)!, 700)} alt={`${p.brand} ${p.name}`} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          ) : (
            <div className="size-full grid place-items-center px-6 text-center text-xs text-mute">Photo coming soon for this colour</div>
          )}
        </Link>
        <div className="absolute top-3 left-3 flex gap-1.5">
          {p.isNew && <span className="bg-white text-black text-[10px] font-bold px-2 py-1 tracking-widest">NEW</span>}
          {off > 0 && <span className="bg-accent text-white text-[10px] font-bold px-2 py-1 tracking-widest">-{off}%</span>}
        </div>
        <button aria-label="Wishlist" onClick={() => toggleWish(p.id)}
          className={`absolute top-3 right-3 size-9 grid place-items-center backdrop-blur bg-black/50 hover:bg-black transition ${liked ? 'text-accent2' : 'text-white'}`}>
          <Heart size={16} className={liked ? 'fill-accent anim-pop' : ''} />
        </button>
        <button onClick={() => addToCart(p.id)}
          className="absolute inset-x-0 bottom-0 h-11 bg-accent text-white text-xs font-bold tracking-widest flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 max-md:hidden transition-transform duration-300">
          <ShoppingBag size={14} /> QUICK ADD
        </button>
      </div>
      <div className="p-4 flex flex-col gap-1.5 flex-1">
        <Link to={`/brands/${brandSlug(p.brand)}`} className="text-[11px] font-semibold uppercase tracking-widest text-accent2 hover:underline">{p.brand}</Link>
        <Link to={`/product/${p.id}`} className="font-semibold leading-snug hover:text-accent2 transition-colors">{p.name}</Link>
        <div className="flex items-center gap-2 text-xs text-mute">
          <Stars v={p.rating} size={12} /> {p.rating} ({p.reviews.toLocaleString()})
        </div>
        <div className="flex items-center justify-between mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="font-bold">{peso(p.price)}</span>
            {p.was && <span className="text-xs text-mute line-through">{peso(p.was)}</span>}
          </div>
          <div className="flex gap-1.5">{p.colors.map((c) => <Swatch key={c} c={c} />)}</div>
        </div>
        <button onClick={() => addToCart(p.id)} className="btn-ghost btn-sm mt-3 md:hidden">Add to Cart</button>
      </div>
    </div>
  )
}

export const SectionHead = ({ eyebrow, title, action }: { eyebrow?: string; title: ReactNode; action?: ReactNode }) => (
  <div className="flex items-end justify-between gap-6 mb-10">
    <div>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="h-display text-3xl md:text-5xl">{title}</h2>
    </div>
    {action}
  </div>
)

export const Breadcrumb = ({ items }: { items: { label: string; to?: string }[] }) => (
  <nav className="flex items-center gap-2 text-xs text-mute mb-6 flex-wrap">
    <Link to="/" className="hover:text-white">Home</Link>
    {items.map((it) => (
      <span key={it.label} className="flex items-center gap-2">
        <ChevronRight size={12} />
        {it.to ? <Link to={it.to} className="hover:text-white">{it.label}</Link> : <span className="text-white">{it.label}</span>}
      </span>
    ))}
  </nav>
)

export const PageHeader = ({ crumbs, title, text }: { crumbs: { label: string; to?: string }[]; title: string; text?: string }) => (
  <div className="relative border-b border-line overflow-hidden">
    <div className="absolute -top-40 right-0 w-[600px] h-[400px] bg-accent/20 blur-[140px] rounded-full pointer-events-none" />
    <div className="container-x relative py-12 md:py-16">
      <Breadcrumb items={crumbs} />
      <h1 className="h-display text-4xl md:text-6xl">{title}</h1>
      {text && <p className="text-mute mt-4 max-w-xl">{text}</p>}
    </div>
  </div>
)

export const Qty = ({ v, set }: { v: number; set: (n: number) => void }) => (
  <div className="inline-flex items-center border border-line h-11">
    <button aria-label="Decrease" onClick={() => set(v - 1)} className="w-10 h-full grid place-items-center hover:bg-white/10"><Minus size={14} /></button>
    <span className="w-8 text-center text-sm font-semibold tabular-nums">{v}</span>
    <button aria-label="Increase" onClick={() => set(v + 1)} className="w-10 h-full grid place-items-center hover:bg-white/10"><Plus size={14} /></button>
  </div>
)

export const Modal = ({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) => {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative bg-panel border border-line max-w-md w-full p-8 anim-pop" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-mute hover:text-white"><X size={18} /></button>
        {children}
      </div>
    </div>
  )
}

export const Empty = ({ icon, title, text, to, cta }: { icon: ReactNode; title: string; text: string; to: string; cta: string }) => (
  <div className="border border-dashed border-line py-24 px-6 text-center">
    <div className="size-16 mx-auto grid place-items-center bg-accent/15 text-accent2 mb-6">{icon}</div>
    <h3 className="h-display text-2xl">{title}</h3>
    <p className="text-mute mt-3 mb-8 max-w-sm mx-auto">{text}</p>
    <Link to={to} className="btn-primary">{cta}</Link>
  </div>
)

// M.Soles identity: a red block carrying a bold "M" mark plus the wordmark.
// The mark is red with a white glyph, so it reads on both black and white backgrounds.
export const Logo = ({ className = '' }: { className?: string }) => (
  <Link to="/" aria-label="M.Soles home" className={`inline-flex items-center gap-2.5 shrink-0 ${className}`}>
    <span className="size-9 bg-accent text-white grid place-items-center [clip-path:polygon(0_0,100%_0,100%_72%,72%_100%,0_100%)]">
      <svg viewBox="0 0 32 32" className="size-6" aria-hidden="true">
        <path d="M4 25V7h5l7 10.5L23 7h5v18h-4.2V15.4L17.5 25h-3L8.2 15.4V25z" fill="currentColor" />
      </svg>
    </span>
    <span className="font-display font-black uppercase tracking-tight text-xl leading-none">
      M<span className="text-accent2">.</span>SOLES
    </span>
  </Link>
)
