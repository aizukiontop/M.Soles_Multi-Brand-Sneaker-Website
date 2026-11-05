import { createBrowserRouter } from 'react-router'
import Layout from './Layout'
import Home from './pages/Home'
import Shop, { BrandPage, Brands, Collections } from './pages/Shop'
import Product from './pages/Product'
import About from './pages/About'
import { Cart, Wishlist, Checkout } from './pages/Cart'
import { AccountLayout, Overview, Orders, OrderDetails, Settings, AuthPage } from './pages/Account'

export const router = createBrowserRouter([
  {
    path: '/', Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'shop', Component: Shop },
      { path: 'brands', Component: Brands },
      { path: 'brands/:slug', Component: BrandPage },
      { path: 'collections', Component: Collections },
      { path: 'product/:id', Component: Product },
      { path: 'about', Component: About },
      { path: 'wishlist', Component: Wishlist },
      { path: 'cart', Component: Cart },
      { path: 'checkout', Component: Checkout },
      { path: 'login', element: <AuthPage mode="login" /> },
      { path: 'register', element: <AuthPage mode="register" /> },
      { path: 'forgot-password', element: <AuthPage mode="forgot" /> },
      { path: 'account', Component: AccountLayout, children: [
        { index: true, Component: Overview }, { path: 'orders', Component: Orders }, { path: 'orders/:id', Component: OrderDetails }, { path: 'settings', Component: Settings },
      ] },
      { path: '*', element: <div className="container-x py-40 text-center"><h1 className="h-display text-6xl">404</h1><p className="text-mute mt-4">Lost your footing.</p></div> },
    ],
  },
])
