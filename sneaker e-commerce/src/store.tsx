import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getProduct } from './data'

export type CartItem = { id: string; size: number; color: string; qty: number }
type Ctx = {
  cart: CartItem[]; wish: string[]; recent: string[]; toast: string | null
  addToCart: (id: string, size?: number, color?: string, qty?: number) => void
  setQty: (i: number, q: number) => void; removeItem: (i: number) => void; clearCart: () => void
  toggleWish: (id: string) => void; addRecent: (id: string) => void
  count: number; subtotal: number
}
const C = createContext<Ctx>(null!)
const load = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) || '') as T } catch { return d } }

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => load('nx-cart', [{ id: 'jordan-air-jordan-1-high-og', size: 9, color: 'Red', qty: 1 }, { id: 'adidas-samba-og', size: 8, color: 'White', qty: 1 }]))
  const [wish, setWish] = useState<string[]>(() => load('nx-wish', ['nike-air-zoom-pulse', 'asics-gel-kayano-14']))
  const [recent, setRecent] = useState<string[]>(() => load('nx-recent', []))
  const [toast, setToast] = useState<string | null>(null)
  useEffect(() => localStorage.setItem('nx-cart', JSON.stringify(cart)), [cart])
  useEffect(() => localStorage.setItem('nx-wish', JSON.stringify(wish)), [wish])
  useEffect(() => localStorage.setItem('nx-recent', JSON.stringify(recent)), [recent])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2400); return () => clearTimeout(t) }, [toast])

  const addToCart: Ctx['addToCart'] = (id, size = 9, color, qty = 1) => {
    const p = getProduct(id); if (!p) return
    const col = color || p.colors[0]
    setCart((c) => {
      const i = c.findIndex((x) => x.id === id && x.size === size && x.color === col)
      if (i >= 0) return c.map((x, j) => (j === i ? { ...x, qty: x.qty + qty } : x))
      return [...c, { id, size, color: col, qty }]
    })
    setToast(`${p.brand} ${p.name} added to cart`)
  }
  const toggleWish = (id: string) => {
    const has = wish.includes(id)
    setWish(has ? wish.filter((w) => w !== id) : [...wish, id])
    setToast(has ? 'Removed from wishlist' : 'Saved to wishlist')
  }
  const value: Ctx = {
    cart, wish, recent, toast, addToCart, toggleWish,
    setQty: (i, q) => setCart((c) => c.map((x, j) => (j === i ? { ...x, qty: Math.max(1, Math.min(10, q)) } : x))),
    removeItem: (i) => setCart((c) => c.filter((_, j) => j !== i)),
    clearCart: () => setCart([]),
    addRecent: (id) => setRecent((r) => [id, ...r.filter((x) => x !== id)].slice(0, 8)),
    count: cart.reduce((a, b) => a + b.qty, 0),
    subtotal: cart.reduce((a, b) => a + (getProduct(b.id)?.price ?? 0) * b.qty, 0),
  }
  return <C.Provider value={value}>{children}</C.Provider>
}
export const useStore = () => useContext(C)
