import { Link } from 'react-router'
import { useEffect, useState } from 'react'
import { ArrowRight, ArrowLeft, ArrowUpRight, ChevronLeft, ChevronRight, Lock, RotateCcw, Send, ShieldCheck, Star, Truck } from 'lucide-react'
import { BRANDS, PRODUCTS, IMG, u } from '../data'
import { ProductCard, SectionHead, Stars, Modal } from '../ui'

// Keywords rendered in the strong red accent inside promotional headings.
const HIGHLIGHT_WORDS = /\b(NEW|STEAL|EXCLUSIVES|DROPS|SALE)\b/

// Splits text on highlight keywords; odd indexes from split() are the matched keywords.
export function Highlight({ text }: { text: string }) {
  return (
    <>
      {text.split(HIGHLIGHT_WORDS).map((part, i) =>
        i % 2 === 1 ? <span key={i} className="text-accent2">{part}</span> : part,
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Hero carousel — black slides with prev/next and dots; red is used for keywords only
// ---------------------------------------------------------------------------
const SLIDES = [
  { kicker: 'Sale · Limited time', lines: ['SECURE', 'THE STEAL'], sub: 'Markdowns on selected pairs across ten brands.', cta: 'Shop Sale', to: '/shop?sale=1', img: IMG.hero },
  { kicker: 'New in', lines: ['STEP INTO', 'SOMETHING NEW'], sub: 'The latest arrivals, freshly added to the store.', cta: 'Shop New Arrivals', to: '/shop?sort=newest', img: IMG.promo },
  { kicker: 'Every brand', lines: ['YOUR NEXT PAIR', 'STARTS HERE'], sub: 'Nike, Jordan, Adidas, New Balance, ASICS and more.', cta: 'Shop All', to: '/shop', img: IMG.running },
  { kicker: 'Fresh heat', lines: ['FRESH HEAT.', 'NEW DROPS.'], sub: 'Curated picks, organised by collection.', cta: 'View Collections', to: '/collections', img: IMG.lifestyle },
]

function Hero() {
  const [index, setIndex] = useState(0)
  const count = SLIDES.length

  // Auto-advance; any manual change resets the timer because the effect depends on index.
  useEffect(() => {
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), 7000)
    return () => clearTimeout(t)
  }, [index, count])

  const go = (delta: number) => setIndex((i) => (i + delta + count) % count)

  return (
    <section aria-roledescription="carousel" aria-label="Featured promotions" className="relative bg-black overflow-hidden h-[480px] sm:h-[540px] lg:h-[600px]">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.to}
          aria-hidden={i !== index}
          className={`absolute inset-0 transition-opacity duration-700 ${i === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
        >
          <div className="absolute inset-0 bg-panel" />
          <img src={u(slide.img, 1600)} alt="" className="absolute inset-0 size-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent" />

          {i === index && (
            <div className="container-x relative h-full flex flex-col justify-center pb-16 anim-slideup">
              <p className="eyebrow !text-white mb-5">{slide.kicker}</p>
              <h1 className="h-display text-5xl sm:text-6xl lg:text-7xl max-w-3xl">
                {slide.lines.map((line) => <span key={line} className="block"><Highlight text={line} /></span>)}
              </h1>
              <p className="text-white/80 mt-6 max-w-md text-base">{slide.sub}</p>
              <div className="mt-8">
                <Link to={slide.to} className="btn-primary">
                  {slide.cta} <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => go(-1)}
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 size-11 md:size-12 grid place-items-center bg-black/60 border border-white/20 hover:bg-accent hover:border-accent transition"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => go(1)}
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 size-11 md:size-12 grid place-items-center bg-black/60 border border-white/20 hover:bg-accent hover:border-accent transition"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-6 inset-x-0 z-20 flex justify-center gap-3" role="tablist" aria-label="Choose slide">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.to}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`size-2.5 rounded-full transition ${i === index ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`}
          />
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Promotional category cards — four large image tiles
// ---------------------------------------------------------------------------
const PROMOS = [
  { title: 'EXCLUSIVES', text: 'Highlighted sneaker selections.', cta: 'SHOP NOW', to: '/collections', img: IMG.basketball },
  { title: 'BEST SELECTION', text: 'Popular and top-rated picks.', cta: 'SHOP NOW', to: '/shop?sort=rating', img: IMG.running },
  { title: 'FRESH DROPS', text: 'Newly added to the store.', cta: 'SHOP NOW', to: '/shop?sort=newest', img: IMG.lifestyle },
  { title: 'DROPPING SOON', text: 'Upcoming releases, all in one place.', cta: 'VIEW ALL', to: '/shop', img: IMG.promo },
]

function PromoCards() {
  return (
    <section className="container-x pt-10 md:pt-14">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {PROMOS.map((promo) => (
          <Link key={promo.title} to={promo.to} className="group relative aspect-[3/4] overflow-hidden bg-panel">
            <img
              src={u(promo.img, 800)}
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10" />
            <h3 className="absolute top-5 inset-x-4 text-center h-display text-xl sm:text-2xl md:text-3xl"><Highlight text={promo.title} /></h3>
            <div className="absolute bottom-0 inset-x-0 p-4 md:p-6">
              <p className="text-xs md:text-sm text-mute mb-4">{promo.text}</p>
              <span className="inline-flex items-center justify-center h-10 px-4 bg-accent text-white text-xs font-bold tracking-widest group-hover:bg-accent2 transition-colors">
                {promo.cta}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Shopping benefits strip — presentation labels for the portfolio demo
// ---------------------------------------------------------------------------
const BENEFITS: [typeof ShieldCheck, string, string][] = [
  [ShieldCheck, '100% Authentic', 'Guaranteed authentic sneakers'],
  [Truck, 'Fast Shipping', 'Nationwide delivery'],
  [RotateCcw, 'Easy Returns', '7-day return policy'],
  [Lock, 'Secure Payments', 'Safe and encrypted checkout'],
]

function Benefits() {
  return (
    <section className="container-x pt-10 md:pt-14">
      <div className="grid grid-cols-2 lg:grid-cols-4 border border-line divide-x divide-y lg:divide-y-0 divide-line">
        {BENEFITS.map(([Icon, title, text]) => (
          <div key={title} className="flex items-center gap-4 p-5 md:p-6">
            <Icon size={26} className="text-accent2 shrink-0" />
            <div>
              <p className="font-display font-bold uppercase text-sm md:text-base">{title}</p>
              <p className="text-xs md:text-sm text-mute mt-1">{text}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-mute mt-4 text-center">
        Portfolio demonstration: checkout and payments are simulated. No real orders, shipments or returns take place.
      </p>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Brand ticker
// ---------------------------------------------------------------------------
function Ticker() {
  return (
    <div className="border-y border-line py-5 overflow-hidden bg-panel mt-10 md:mt-14">
      <div className="flex w-max anim-marquee">
        {[...BRANDS, ...BRANDS, ...BRANDS].map((brand, i) => (
          <span key={i} className={`mx-10 text-xl uppercase text-white/40 ${brand.font}`}>
            {brand.name}
            <span className="ml-20 text-accent2">✦</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shop by Brand grid
// ---------------------------------------------------------------------------
function ShopByBrand() {
  return (
    <section className="container-x pt-24">
      <SectionHead
        eyebrow="Shop by brand"
        title={<>Pick your <span className="text-accent2">side</span></>}
        action={
          <Link to="/brands" className="hidden md:flex items-center gap-2 text-sm font-semibold hover:text-accent2">
            All brands <ArrowRight size={16} />
          </Link>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line border border-line">
        {BRANDS.slice(0, 8).map((brand) => (
          <Link
            key={brand.slug}
            to={`/brands/${brand.slug}`}
            className="group relative bg-ink h-36 md:h-44 grid place-items-center overflow-hidden"
          >
            <img
              src={u(brand.img, 500)}
              alt=""
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-40 scale-110 group-hover:scale-100 transition-all duration-700"
            />
            <span
              className={`relative text-2xl md:text-3xl uppercase text-white/80 group-hover:text-white transition ${brand.font}`}
            >
              {brand.name}
            </span>
            <ArrowUpRight
              className="absolute top-4 right-4 text-accent2 opacity-0 group-hover:opacity-100 transition"
              size={18}
            />
            <span className="absolute bottom-3 left-4 text-[10px] tracking-widest text-mute group-hover:text-white">
              {PRODUCTS.filter((p) => p.brand === brand.name).length} STYLES
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Popular products — tabbed (New Arrivals / Best Sellers / Trending)
// ---------------------------------------------------------------------------
function Popular() {
  type TabKey = 'New Arrivals' | 'Best Sellers' | 'Trending'

  const tabs: Record<TabKey, typeof PRODUCTS> = {
    'New Arrivals': PRODUCTS.filter((p) => p.isNew),
    'Best Sellers': PRODUCTS.filter((p) => p.best),
    'Trending':     PRODUCTS.filter((p) => p.trending),
  }

  const [activeTab, setActiveTab] = useState<TabKey>('New Arrivals')

  return (
    <section className="container-x pt-28">
      <SectionHead
        eyebrow="Popular products"
        title={<>Popular <span className="text-accent2">Products</span></>}
        action={
          <div className="hidden sm:flex border border-line">
            {(Object.keys(tabs) as TabKey[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 h-11 text-xs font-semibold tracking-wider uppercase transition ${
                  activeTab === tab ? 'bg-accent text-white' : 'text-mute hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        }
      />

      {/* Mobile tab selector */}
      <div className="sm:hidden flex gap-2 mb-6 overflow-x-auto">
        {(Object.keys(tabs) as TabKey[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 h-10 shrink-0 text-xs font-semibold uppercase ${
              activeTab === tab ? 'bg-accent' : 'border border-line text-mute'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div key={activeTab} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 anim-slideup">
        {tabs[activeTab].slice(0, 4).map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>

      <div className="text-center mt-10">
        <Link to="/shop" className="btn-ghost">
          View all sneakers
        </Link>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Campaign banner — featured product spotlight
// ---------------------------------------------------------------------------
function Campaign() {
  return (
    <section className="container-x pt-28">
      <div className="relative overflow-hidden bg-panel border border-line min-h-[520px] grid md:grid-cols-2">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_50%,rgba(139,0,0,.25),transparent_55%)]" />
        <p className="absolute -left-4 bottom-0 font-display font-black text-[28vw] md:text-[17rem] leading-none outline-text select-none">
          AJ1
        </p>

        <div className="relative p-8 md:p-16 flex flex-col justify-center z-10">
          <p className="eyebrow mb-4">The Campaign</p>
          <h2 className="h-display text-4xl md:text-6xl">
            Born on court.<br />
            <span className="text-accent2">Built for streets.</span>
          </h2>
          <p className="text-mute mt-6 max-w-md">
            The Air Jordan 1 High OG returns in the colorways that started it all. Limited
            sizing, authenticated in-house, shipping now.
          </p>
          <div className="mt-8">
            <Link to="/product/jordan-air-jordan-1-high-og" className="btn-primary">
              Shop Collection <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="relative min-h-[360px]">
          <img
            src={u(IMG.promo, 1200)}
            alt="Air Jordan 1"
            loading="lazy"
            className="absolute inset-0 size-full object-cover [mask-image:linear-gradient(to_right,transparent,black_35%)] max-md:[mask-image:linear-gradient(to_bottom,transparent,black_30%)]"
          />
          <span className="absolute top-8 right-8 bg-white text-black font-display font-black text-xs px-3 py-2 rotate-6">
            FROM ₱9,995
          </span>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Shop by Category grid
// ---------------------------------------------------------------------------
function Categories() {
  const categories: [string, string, string][] = [
    ['Men',        IMG.men,        'md:col-span-2 md:row-span-2'],
    ['Women',      IMG.women,      'md:row-span-2'],
    ['Kids',       IMG.kids,       ''],
    ['Running',    IMG.running,    ''],
    ['Basketball', IMG.basketball, ''],
    ['Lifestyle',  IMG.lifestyle,  ''],
    ['Training',   IMG.training,   ''],
  ]

  return (
    <section className="container-x pt-28">
      <SectionHead
        eyebrow="Shop by category"
        title={<>Find your <span className="text-accent2">game</span></>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[220px] md:auto-rows-[260px] gap-3">
        {categories.map(([name, img, span]) => (
          <Link
            key={name}
            to={`/shop?category=${name}`}
            className={`group relative overflow-hidden ${span}`}
          >
            <img
              src={u(img, 900)}
              alt={name}
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent group-hover:from-black/90 transition-colors duration-500" />
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
              <span className="h-display text-2xl md:text-3xl">{name}</span>
              <span className="size-9 bg-white text-black grid place-items-center translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                <ArrowUpRight size={16} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Featured Collections — hover-to-preview list
// ---------------------------------------------------------------------------
function FeaturedCollections() {
  const collections = [
    ['01', 'Latest Releases',       'Fresh out the box this week',         '/shop?sort=newest',           '1656944227421-416b1d2186c9'],
    ['02', 'Streetwear Essentials', 'Low-profile icons for daily rotation', '/shop?category=Lifestyle',    '1672920800748-a5fb6dfd0c2b'],
    ['03', 'Running Performance',   'Cushion, rebound and mileage',         '/shop?category=Running',      '1590333748338-d629e4564ad9'],
    ['04', 'Basketball Sneakers',   'Court-ready from Jordan to Curry',     '/shop?category=Basketball',   '1557848979-f13d18a41bb2'  ],
    ['05', 'Everyday Comfort',      'Soft landings from 9 to 9',            '/shop?category=Women',        '1633464129147-777bdcc97c1d'],
  ]

  const [hovered, setHovered] = useState(0)

  return (
    <section className="container-x pt-28">
      <SectionHead
        eyebrow="Curated for you"
        title={<>Featured <span className="text-accent2">Collections</span></>}
      />

      <div className="grid lg:grid-cols-5 gap-10">
        {/* Collection list */}
        <div className="lg:col-span-3 border-t border-line">
          {collections.map(([num, title, desc, to], i) => (
            <Link
              key={num}
              to={to}
              onMouseEnter={() => setHovered(i)}
              className="group flex items-center gap-6 py-6 border-b border-line"
            >
              <span className="font-display text-sm text-accent2 w-8">{num}</span>
              <div className="flex-1">
                <h3
                  className={`font-display font-bold uppercase text-xl md:text-3xl transition-transform group-hover:translate-x-3 ${
                    hovered === i ? 'text-white' : 'text-white/50'
                  }`}
                >
                  {title}
                </h3>
                <p className="text-sm text-mute mt-1 group-hover:translate-x-3 transition-transform">
                  {desc}
                </p>
              </div>
              <ArrowUpRight className="text-mute group-hover:text-accent2 transition" />
            </Link>
          ))}
        </div>

        {/* Preview image (desktop) */}
        <div className="lg:col-span-2 relative aspect-[4/5] overflow-hidden max-lg:hidden">
          {collections.map(([, title, , , img], i) => (
            <img
              key={title}
              src={u(img, 900)}
              alt={title}
              loading="lazy"
              className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ${
                hovered === i ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
          <div className="absolute inset-0 border border-white/10" />
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Customer testimonials carousel
// ---------------------------------------------------------------------------
const REVIEWS = [
  ['Marcus Reyes',    IMG.t2, 5, 'Picked up the Jordan 1s and the box arrived in two days. Authentic, packed perfectly, and the size guide was spot on.',                              'Jordan 1 High OG'],
  ['Isabel Cruz',     IMG.t3, 5, 'Finally a store where I can compare Nike, ASICS and New Balance side by side. Returns were painless when I needed a half size up.',                   'Gel-Kayano 14'   ],
  ['Dante Lim',       IMG.t4, 4, 'Great selection of streetwear pairs and prices that actually beat the mall. The Samba OG is my daily now.',                                           'Adidas Samba OG' ],
  ['Hannah Bautista', IMG.t1, 5, 'Customer support helped me pick running shoes for my first half marathon. Pegasus Trail is a dream.',                                                 'Pegasus Trail 5' ],
]

function Testimonials() {
  const [startIndex, setStartIndex] = useState(0)

  // Show 3 reviews at a time, cycling with the carousel
  const visibleReviews = [0, 1, 2].map((offset) => REVIEWS[(startIndex + offset) % REVIEWS.length])

  const arrowClass = 'size-11 border border-line grid place-items-center hover:bg-accent hover:border-accent transition'

  return (
    <section className="container-x pt-28">
      <SectionHead
        eyebrow="Customer love"
        title={<>What our <span className="text-accent2">customers say</span></>}
        action={
          <div className="flex gap-2">
            <button
              aria-label="Previous review"
              className={arrowClass}
              onClick={() => setStartIndex((startIndex + REVIEWS.length - 1) % REVIEWS.length)}
            >
              <ArrowLeft size={16} />
            </button>
            <button
              aria-label="Next review"
              className={arrowClass}
              onClick={() => setStartIndex((startIndex + 1) % REVIEWS.length)}
            >
              <ArrowRight size={16} />
            </button>
          </div>
        }
      />

      <div className="grid md:grid-cols-3 gap-5">
        {visibleReviews.map(([name, img, rating, text, shoe]) => (
          <figure
            key={`${startIndex}-${name}`}
            className="bg-panel border border-line p-7 flex flex-col anim-slideup"
          >
            <Stars v={rating as number} size={15} />
            <blockquote className="mt-5 text-white/85 leading-relaxed flex-1">
              "{text}"
            </blockquote>
            <figcaption className="flex items-center gap-3 mt-8 pt-6 border-t border-line">
              <img
                src={u(img as string, 120)}
                alt={name as string}
                className="size-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-sm">{name}</p>
                <p className="text-xs text-mute">Bought: {shoe}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Newsletter sign-up — exported so Collections page can reuse it
// ---------------------------------------------------------------------------
export function Newsletter() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  return (
    <section className="container-x pt-28">
      <div className="relative overflow-hidden bg-panel border border-line p-8 md:p-16 grid md:grid-cols-2 gap-10 items-center">
        {/* Background letter */}
        <p className="absolute -right-6 -top-10 font-display font-black text-[14rem] leading-none text-white/5 select-none">

          M
        </p>

        <div className="relative">
          <h2 className="h-display text-3xl md:text-5xl">Never miss a drop.</h2>
          <p className="mt-4 text-white/85 max-w-md">
            Join the M.Soles list for early access to releases and members-only pricing.
          </p>
        </div>

        <form
          onSubmit={(e) => { e.preventDefault(); setSubscribed(true); setEmail('') }}
          className="relative flex flex-col sm:flex-row gap-2"
        >
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 h-14 px-5 bg-black/30 border border-white/30 placeholder:text-white/60 outline-none focus:bg-black/50 text-white"
          />
          <button className="h-14 px-8 bg-black text-white font-semibold text-sm hover:bg-white hover:text-black transition inline-flex items-center justify-center gap-2">
            Subscribe <Send size={15} />
          </button>
        </form>
      </div>

      <Modal open={subscribed} onClose={() => setSubscribed(false)}>
        <Star className="text-accent2 fill-accent mb-4" />
        <h3 className="h-display text-2xl">You're in the vault</h3>
        <p className="text-mute mt-3 mb-6">Thanks for signing up. This is a portfolio demo, so no email is sent.</p>
        <button onClick={() => setSubscribed(false)} className="btn-primary w-full">
          Start shopping
        </button>
      </Modal>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Home page — composes all sections
// ---------------------------------------------------------------------------
export default function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <PromoCards />
      <Benefits />
      <ShopByBrand />
      <Popular />
      <Campaign />
      <Categories />
      <FeaturedCollections />
      <Testimonials />
      <Newsletter />
    </>
  )
}
