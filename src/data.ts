// Image helper: bare strings are Unsplash photo ids (sample catalog); "/api/images/..." and
// absolute URLs are uploaded product images served by Netlify Blobs.
export const u = (id: string, w = 800) =>
  id.startsWith('/') || id.startsWith('http')
    ? id
    : `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

export const STORE = 'M.Soles'
export type Brand = { slug: string; name: string; intro: string; img: string; font: string }
export const BRANDS: Brand[] = [
  { slug: 'nike', name: 'Nike', intro: 'Performance engineering and cultural icons, from Air Max heritage to the latest running tech.', img: 'https://nmp.about.nike.com/about/prod/daf54e8a-b8c6-4a99-bc0c-3816f058a615/nike-air-zoom-pulse-2-91660.jpg?m=eyJlZGl0cyI6eyJqcGVnIjp7InF1YWxpdHkiOjEwMH0sIndlYnAiOnsicXVhbGl0eSI6MTAwfSwiZXh0cmFjdCI6eyJsZWZ0IjowLCJ0b3AiOjAsIndpZHRoIjoxNjAwLCJoZWlnaHQiOjEwNjd9LCJyZXNpemUiOnsid2lkdGgiOjkwMH19fQ%3D%3D&s=badd2127641462dc39d0365b5108771d06cd40e6344fde7f16c8d801bf062a4c', font: 'italic font-black' },
  { slug: 'adidas', name: 'Adidas', intro: 'Three stripes of terrace-born style and boost-cushioned performance, curated by our footwear team.', img: 'https://www.leagueoutfitters.com/cdn/shop/files/177395886.webp?crop=center&height=1200&v=1771631186&width=1200', font: 'font-extrabold lowercase' },
  { slug: 'jordan', name: 'Jordan', intro: 'The court legacy that became a global culture. Retros, mids and highs, all authenticated.', img: 'https://static.nike.com/a/images/t_default/u_126ab356-44d8-4a06-89b4-fcdcc8df0245,c_scale,fl_relative,w_1.0,h_1.0,fl_layer_apply/1f55b158-4613-48c6-8b80-2ef19b7bf2de/AIR+JORDAN+1+HIGH+OG.png', font: 'font-black' },
  { slug: 'new-balance', name: 'New Balance', intro: 'Dad-shoe comfort meets modern design. Made for long days, long runs and everything between.', img: 'https://www.topsandbottomsusa.com/cdn/shop/files/new-balance-9060-rain-cloud-shoes-u9060gry_2.webp?v=1739813180&width=2048', font: 'font-black' },
  { slug: 'puma', name: 'Puma', intro: 'Fast-forward silhouettes from the pitch, the track and the street.', img: 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_2000,h_2000/global/377749/14/sv01/fnd/PNA/fmt/png/Velocity-NITRO™-3-Women\'s-Running-Shoes', font: 'font-extrabold uppercase' },
  { slug: 'converse', name: 'Converse', intro: 'Canvas classics and chunky platforms that have outlasted every trend.', img: 'https://images.journeys.com/images/products/1_587708_FS.JPG', font: 'italic font-extrabold' },
  { slug: 'vans', name: 'Vans', intro: 'Skate-rooted, off-the-wall style in low profiles and bold colorways.', img: 'https://cdn.skatepro.com/product/520/vans-old-skool-pro-skate-shoes-n4.webp', font: 'font-black uppercase' },
  { slug: 'asics', name: 'ASICS', intro: 'Japanese running science with GEL cushioning, now a streetwear favorite.', img: 'https://classic.cdn.media.amplience.net/i/hibbett/003P7_9170_right1/ASICS%20GEL-KAYANO%2014%20%22White/Black%22%20Unisex%20Shoe-9170', font: 'font-black uppercase tracking-widest' },
  { slug: 'reebok', name: 'Reebok', intro: 'Fitness heritage and 90s nostalgia in clean, confident silhouettes.', img: 'https://www.reebok.com/cdn/shop/files/100000317_SLC_eCom_s.jpg?v=1781189947&width=1024', font: 'font-extrabold' },
  { slug: 'under-armour', name: 'Under Armour', intro: 'Training-focused footwear built to be pushed hard.', img: 'https://www.kicksown.com/cdn/shop/files/20250306181550.jpg?v=1741256197&width=2048', font: 'font-black uppercase' },
]
export const CATEGORIES = ['Men', 'Women', 'Kids', 'Running', 'Basketball', 'Lifestyle', 'Training']
export const COLORS: Record<string, string> = { Black: '#111', White: '#f3f3f3', Red: '#e03131', Blue: '#2f6fed', Green: '#2f9e44', Gray: '#8d8d95', Orange: '#ff5a1f', Pink: '#ec4899', Beige: '#d9c3a0' }
export const SIZES = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12]

export type Product = {
  id: string; brand: string; name: string; price: number; was?: number; cats: string[]
  colors: string[]; sizes?: number[]; stock?: number; rating: number; reviews: number; img: string; imgs: string[]; imageColors?: string[]
  isNew?: boolean; best?: boolean; trending?: boolean; order: number; desc: string
}

// The catalog is loaded from the database (see services/products.ts) before the app renders.
// The array is updated in place so existing imports keep working.
export const PRODUCTS: Product[] = []
export function setCatalog(list: Product[]) {
  PRODUCTS.splice(0, PRODUCTS.length, ...list)
}

export const getProduct = (id?: string) => PRODUCTS.find((p) => p.id === id)
export const peso = (n: number) => '₱' + n.toLocaleString('en-PH')
export const brandSlug = (name: string) => BRANDS.find((b) => b.name === name)?.slug ?? ''
export const IMG = {
  hero: '1600185365926-3a2ce3cdb9eb', promo: '1552346154-21d32810aba3', men: '1586231912972-d0970f9ce787', women: '1604520164966-8ca929961ebe', kids: '1560769629-975ec94e6a86',
  running: '1759674861540-afed9f86f94a', basketball: '1619735497594-d286fd8d2d39', lifestyle: '1672920800748-a5fb6dfd0c2b', training: '1597892657493-6847b9640bac',
  store: '1678266622924-c7c38ddc25e1', wall: '1768225286074-9039931bb9d3', about: '1633464129147-777bdcc97c1d',
  t1: '1635650804483-2a77a8c9e728', t2: '1586231912972-d0970f9ce787', t3: '1604520164966-8ca929961ebe', t4: '1762743412345-a31d94cd5a88',
}
