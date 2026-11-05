export const u = (id: string, w = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

export const STORE = 'NOCTURN'
export type Brand = { slug: string; name: string; intro: string; img: string; font: string }
export const BRANDS: Brand[] = [
  { slug: 'nike', name: 'Nike', intro: 'Performance engineering and cultural icons, from Air Max heritage to the latest running tech.', img: '1542291026-7eec264c27ff', font: 'italic font-black' },
  { slug: 'adidas', name: 'Adidas', intro: 'Three stripes of terrace-born style and boost-cushioned performance, curated by our footwear team.', img: '1571008887538-b36bb32f4571', font: 'font-extrabold lowercase' },
  { slug: 'jordan', name: 'Jordan', intro: 'The court legacy that became a global culture. Retros, mids and highs, all authenticated.', img: '1552346154-21d32810aba3', font: 'font-black' },
  { slug: 'new-balance', name: 'New Balance', intro: 'Dad-shoe comfort meets modern design. Made for long days, long runs and everything between.', img: '1491553895911-0055eca6402d', font: 'font-black' },
  { slug: 'puma', name: 'Puma', intro: 'Fast-forward silhouettes from the pitch, the track and the street.', img: '1600185365483-26d7a4cc7519', font: 'font-extrabold uppercase' },
  { slug: 'converse', name: 'Converse', intro: 'Canvas classics and chunky platforms that have outlasted every trend.', img: '1623788975845-7d3e0adbae7c', font: 'italic font-extrabold' },
  { slug: 'vans', name: 'Vans', intro: 'Skate-rooted, off-the-wall style in low profiles and bold colorways.', img: '1560769629-975ec94e6a86', font: 'font-black uppercase' },
  { slug: 'asics', name: 'ASICS', intro: 'Japanese running science with GEL cushioning, now a streetwear favorite.', img: '1597892657493-6847b9640bac', font: 'font-black uppercase tracking-widest' },
  { slug: 'reebok', name: 'Reebok', intro: 'Fitness heritage and 90s nostalgia in clean, confident silhouettes.', img: '1606107557195-0e29a4b5b4aa', font: 'font-extrabold' },
  { slug: 'under-armour', name: 'Under Armour', intro: 'Training-focused footwear built to be pushed hard.', img: '1595909336425-5bf541155dec', font: 'font-black uppercase' },
]
export const CATEGORIES = ['Men', 'Women', 'Kids', 'Running', 'Basketball', 'Lifestyle', 'Training']
export const COLORS: Record<string, string> = { Black: '#111', White: '#f3f3f3', Red: '#e03131', Blue: '#2f6fed', Green: '#2f9e44', Gray: '#8d8d95', Orange: '#ff5a1f', Pink: '#ec4899', Beige: '#d9c3a0' }
export const SIZES = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12]

export type Product = {
  id: string; brand: string; name: string; price: number; was?: number; cats: string[]
  colors: string[]; rating: number; reviews: number; img: string; imgs: string[]
  isNew?: boolean; best?: boolean; trending?: boolean; order: number; desc: string
}
const P = (order: number, brand: string, name: string, price: number, cats: string[], colors: string[], rating: number, reviews: number, imgs: string[], f: Partial<Product> = {}): Product => ({
  id: `${brand}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'), order, brand, name, price, cats, colors, rating, reviews,
  img: imgs[0], imgs, desc: 'Engineered for all-day wear with a responsive midsole, breathable upper and a grippy outsole. A staple that moves from the gym to the street without missing a beat.', ...f,
})
const I = {
  redNike: '1542291026-7eec264c27ff', greenNike: '1606107557195-0e29a4b5b4aa', blueAd: '1571008887538-b36bb32f4571', whOr: '1560769629-975ec94e6a86',
  whOrFloat: '1600185365926-3a2ce3cdb9eb', grayNike: '1491553895911-0055eca6402d', whRed: '1600185365483-26d7a4cc7519', j1: '1552346154-21d32810aba3',
  j1bw: '1611510338559-2f463335092c', j1rwb: '1618677831708-0e7fda3148b4', j1b: '1628413993904-94ecb60f1239', bball: '1595909336425-5bf541155dec',
  bballRed: '1605523741177-cd660595c2cf', af1: '1623788975845-7d3e0adbae7c', asics: '1597892657493-6847b9640bac', redWhite: '1656944227421-416b1d2186c9',
  pair: '1691864471843-583ff340e014', pair2: '1658043521335-998c9fae1a03', pair3: '1691864471833-f9833d882247', lot: '1565814636199-ae8133055c1c',
}
export const PRODUCTS: Product[] = [
  P(20, 'Nike', 'Air Zoom Pulse', 8995, ['Men', 'Running'], ['Red', 'Black'], 4.8, 1204, [I.redNike, I.lot, I.pair], { isNew: true, trending: true, was: 10995 }),
  P(19, 'Adidas', 'Ultraboost Light', 11990, ['Men', 'Running'], ['Blue', 'White'], 4.7, 986, [I.blueAd, I.pair2, I.pair3], { best: true }),
  P(18, 'Jordan', 'Air Jordan 1 High OG', 12995, ['Men', 'Basketball', 'Lifestyle'], ['Red', 'Black', 'White'], 4.9, 3120, [I.j1, I.j1bw, I.j1b], { best: true, trending: true }),
  P(17, 'New Balance', '9060 Cloud Grey', 10490, ['Men', 'Women', 'Lifestyle'], ['Gray', 'Beige'], 4.8, 742, [I.grayNike, I.pair, I.lot], { isNew: true, trending: true }),
  P(16, 'Puma', 'Velocity Nitro 3', 7990, ['Women', 'Running'], ['White', 'Red'], 4.5, 311, [I.whRed, I.redWhite, I.pair2], { isNew: true, was: 9490 }),
  P(15, 'Converse', 'Chuck 70 Low', 4990, ['Women', 'Men', 'Lifestyle'], ['White', 'Black'], 4.6, 2210, [I.af1, I.pair3, I.pair2], { best: true }),
  P(14, 'Vans', 'Old Skool Pro', 4290, ['Men', 'Kids', 'Lifestyle'], ['White', 'Orange'], 4.7, 1840, [I.whOr, I.whOrFloat, I.pair], { best: true }),
  P(13, 'ASICS', 'Gel-Kayano 14', 11090, ['Men', 'Women', 'Running'], ['Gray', 'White'], 4.9, 655, [I.asics, I.grayNike, I.pair2], { trending: true }),
  P(12, 'Nike', 'Court Vision Mid', 6495, ['Men', 'Basketball'], ['White', 'Red'], 4.4, 530, [I.bballRed, I.bball, I.j1rwb], { was: 7995 }),
  P(11, 'Reebok', 'Nano X4 Trainer', 7290, ['Men', 'Women', 'Training'], ['Green', 'Black'], 4.6, 402, [I.greenNike, I.lot, I.pair3], { isNew: true }),
  P(10, 'Under Armour', 'Curry Flow 11', 9890, ['Men', 'Basketball', 'Training'], ['Black', 'White'], 4.7, 281, [I.bball, I.bballRed, I.j1b], { trending: true }),
  P(9, 'Jordan', 'Air Jordan 1 Mid SE', 9995, ['Women', 'Basketball', 'Lifestyle'], ['Red', 'Blue', 'White'], 4.8, 1560, [I.j1rwb, I.j1, I.j1bw], { best: true }),
  P(8, 'Adidas', 'Samba OG', 5990, ['Women', 'Men', 'Lifestyle'], ['White', 'Green'], 4.8, 2650, [I.pair2, I.af1, I.pair3], { best: true, trending: true }),
  P(7, 'Nike', 'Pegasus Trail 5', 8295, ['Men', 'Running', 'Training'], ['Orange', 'White'], 4.6, 477, [I.whOrFloat, I.whOr, I.pair], { isNew: true }),
  P(6, 'New Balance', '574 Core Kids', 3990, ['Kids', 'Lifestyle'], ['Gray', 'Blue'], 4.5, 198, [I.pair3, I.grayNike, I.lot]),
  P(5, 'Puma', 'Suede Classic XXI', 5290, ['Men', 'Women', 'Lifestyle'], ['Red', 'Black'], 4.4, 612, [I.redWhite, I.redNike, I.pair2], { was: 6490 }),
  P(4, 'Converse', 'All Star Kids Hi', 2990, ['Kids', 'Lifestyle'], ['Pink', 'White'], 4.6, 322, [I.pair, I.af1, I.pair3]),
  P(3, 'Vans', 'Knu Skool', 4790, ['Men', 'Women', 'Lifestyle'], ['Black', 'White'], 4.3, 267, [I.lot, I.pair2, I.whOr], { isNew: true }),
  P(2, 'ASICS', 'Novablast 4', 8490, ['Men', 'Women', 'Running'], ['Blue', 'Green'], 4.7, 534, [I.asics, I.blueAd, I.greenNike], { trending: true }),
  P(1, 'Reebok', 'Club C 85 Vintage', 4990, ['Men', 'Women', 'Lifestyle'], ['White', 'Green'], 4.5, 744, [I.pair3, I.af1, I.pair], { was: 5990 }),
]
export const getProduct = (id?: string) => PRODUCTS.find((p) => p.id === id)
export const peso = (n: number) => '₱' + n.toLocaleString('en-PH')
export const brandSlug = (name: string) => BRANDS.find((b) => b.name === name)?.slug ?? ''
export const IMG = {
  hero: I.whOrFloat, promo: I.j1, men: '1586231912972-d0970f9ce787', women: '1604520164966-8ca929961ebe', kids: I.whOr,
  running: '1759674861540-afed9f86f94a', basketball: '1619735497594-d286fd8d2d39', lifestyle: '1672920800748-a5fb6dfd0c2b', training: I.asics,
  store: '1678266622924-c7c38ddc25e1', wall: '1768225286074-9039931bb9d3', about: '1633464129147-777bdcc97c1d',
  t1: '1635650804483-2a77a8c9e728', t2: '1586231912972-d0970f9ce787', t3: '1604520164966-8ca929961ebe', t4: '1762743412345-a31d94cd5a88',
}
