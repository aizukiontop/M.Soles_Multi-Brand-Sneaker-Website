import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { getProduct } from './data'
import { useAuth } from './context/AuthContext'
import { getServerCart, addServerCartItem, updateServerCartItem, removeServerCartItem, mergeGuestCart, type ServerCartItem } from './services/cart'
import { getServerWishlist, addServerWishlist, removeServerWishlist, mergeGuestWishlist } from './services/wishlist'
import { errorText } from './utils/errors'

// rowId is only set for items stored on the server (signed-in users).
export type CartItem = { id: string; size: number; color: string; qty: number; rowId?: number }
type Ctx = {
  cart: CartItem[]; wish: string[]; recent: string[]; toast: string | null
  cartLoading: boolean
  addToCart: (id: string, size?: number, color?: string, qty?: number) => Promise<void>
  setQty: (i: number, q: number) => Promise<void>
  removeItem: (i: number) => Promise<void>
  clearCart: () => Promise<void>
  toggleWish: (id: string) => Promise<void>
  addRecent: (id: string) => void
  reloadCart: () => Promise<void>
  showToast: (message: string) => void
  count: number; subtotal: number
}

const C = createContext<Ctx>(null!)
const load = <T,>(k: string, d: T): T => { try { return JSON.parse(localStorage.getItem(k) || '') as T } catch { return d } }
const MAX_QTY = 10

const toCartItem = (r: ServerCartItem): CartItem => ({ id: r.id, size: r.size, color: r.color, qty: r.qty, rowId: r.rowId })

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const signedIn = Boolean(user)

  // Guest state lives in the browser; signed-in state is loaded from Netlify Database.
  const [guestCart, setGuestCart] = useState<CartItem[]>(() => load('nx-cart', []))
  const [guestWish, setGuestWish] = useState<string[]>(() => load('nx-wish', []))
  const [serverCart, setServerCart] = useState<CartItem[]>([])
  const [serverWish, setServerWish] = useState<string[]>([])
  const [cartLoading, setCartLoading] = useState(false)
  const [recent, setRecent] = useState<string[]>(() => load('nx-recent', []))
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => localStorage.setItem('nx-cart', JSON.stringify(guestCart)), [guestCart])
  useEffect(() => localStorage.setItem('nx-wish', JSON.stringify(guestWish)), [guestWish])
  useEffect(() => localStorage.setItem('nx-recent', JSON.stringify(recent)), [recent])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2600); return () => clearTimeout(t) }, [toast])

  const showToast = useCallback((message: string) => setToast(message), [])

  const reloadCart = useCallback(async () => {
    const [items, wishIds] = await Promise.all([getServerCart(), getServerWishlist()])
    setServerCart(items.map(toCartItem))
    setServerWish(wishIds)
  }, [])

  // On sign-in: move guest cart/wishlist into the account, then load the account's saved state.
  useEffect(() => {
    if (authLoading) return
    if (!signedIn) { setServerCart([]); setServerWish([]); return }
    let active = true
    ;(async () => {
      setCartLoading(true)
      try {
        const localCart = load<CartItem[]>('nx-cart', [])
        const localWish = load<string[]>('nx-wish', [])
        if (localCart.length) {
          await mergeGuestCart(localCart.map(({ id, size, color, qty }) => ({ id, size, color, qty })))
        }
        if (localWish.length) await mergeGuestWishlist(localWish)
        if (localCart.length || localWish.length) {
          localStorage.removeItem('nx-cart')
          localStorage.removeItem('nx-wish')
          setGuestCart([])
          setGuestWish([])
        }
        const [items, wishIds] = await Promise.all([getServerCart(), getServerWishlist()])
        if (!active) return
        setServerCart(items.map(toCartItem))
        setServerWish(wishIds)
      } catch (err) {
        if (active) showToast(errorText(err))
      } finally {
        if (active) setCartLoading(false)
      }
    })()
    return () => { active = false }
  }, [signedIn, authLoading, showToast])

  const cart = signedIn ? serverCart : guestCart
  const wish = signedIn ? serverWish : guestWish

  const addToCart: Ctx['addToCart'] = async (id, size = 9, color, qty = 1) => {
    const p = getProduct(id); if (!p) return
    const col = color || p.colors[0]
    if (signedIn) {
      try {
        const items = await addServerCartItem(id, size, col, qty)
        setServerCart(items.map(toCartItem))
        showToast(`${p.brand} ${p.name} added to cart`)
      } catch (err) {
        showToast(errorText(err))
      }
      return
    }
    setGuestCart((c) => {
      const i = c.findIndex((x) => x.id === id && x.size === size && x.color === col)
      if (i >= 0) return c.map((x, j) => (j === i ? { ...x, qty: Math.min(MAX_QTY, x.qty + qty) } : x))
      return [...c, { id, size, color: col, qty: Math.min(MAX_QTY, qty) }]
    })
    showToast(`${p.brand} ${p.name} added to cart`)
  }

  const setQty: Ctx['setQty'] = async (i, q) => {
    const next = Math.max(1, Math.min(MAX_QTY, q))
    const item = cart[i]
    if (!item) return
    if (signedIn && item.rowId !== undefined) {
      try {
        setServerCart((await updateServerCartItem(item.rowId, next)).map(toCartItem))
      } catch (err) { showToast(errorText(err)) }
      return
    }
    setGuestCart((c) => c.map((x, j) => (j === i ? { ...x, qty: next } : x)))
  }

  const removeItem: Ctx['removeItem'] = async (i) => {
    const item = cart[i]
    if (!item) return
    if (signedIn && item.rowId !== undefined) {
      try {
        setServerCart((await removeServerCartItem(item.rowId)).map(toCartItem))
      } catch (err) { showToast(errorText(err)) }
      return
    }
    setGuestCart((c) => c.filter((_, j) => j !== i))
  }

  const clearCart: Ctx['clearCart'] = async () => {
    if (signedIn) { await reloadCart(); return }
    setGuestCart([])
  }

  const toggleWish: Ctx['toggleWish'] = async (id) => {
    const has = wish.includes(id)
    if (signedIn) {
      try {
        const ids = has ? await removeServerWishlist(id) : await addServerWishlist(id)
        setServerWish(ids)
        showToast(has ? 'Removed from wishlist' : 'Saved to wishlist')
      } catch (err) { showToast(errorText(err)) }
      return
    }
    setGuestWish(has ? guestWish.filter((w) => w !== id) : [...guestWish, id])
    showToast(has ? 'Removed from wishlist' : 'Saved to wishlist')
  }

  const value: Ctx = {
    cart, wish, recent, toast, cartLoading, addToCart, toggleWish, showToast, reloadCart,
    setQty, removeItem, clearCart,
    addRecent: (id) => setRecent((r) => [id, ...r.filter((x) => x !== id)].slice(0, 8)),
    count: cart.reduce((a, b) => a + b.qty, 0),
    subtotal: cart.reduce((a, b) => a + (getProduct(b.id)?.price ?? 0) * b.qty, 0),
  }
  return <C.Provider value={value}>{children}</C.Provider>
}
export const useStore = () => useContext(C)
