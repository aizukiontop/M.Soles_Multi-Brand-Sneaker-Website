import { Link, useParams } from 'react-router'
import { useEffect, useRef, useState } from 'react'
import {
  Heart, ShoppingBag, Truck, RotateCcw, ShieldCheck,
  ZoomIn, ChevronDown, SearchX,
} from 'lucide-react'
import { PRODUCTS, SIZES, getProduct, peso, u, brandSlug } from '../data'
import { Breadcrumb, Empty, ProductCard, Qty, Stars, Swatch } from '../ui'
import { useStore } from '../store'
import { defaultColor, galleryFor } from '../colorway'


export default function Product() {
  const { id } = useParams()
  const product = getProduct(id)

  const { addToCart, toggleWish, wish, addRecent, recent } = useStore()

  // Local UI state
  const [imageIndex, setImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState<number | null>(null)
  const [selectedColor, setSelectedColor] = useState('')
  const [qty, setQty] = useState(1)
  const [sizeError, setSizeError] = useState(false)
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null)
  const [openAccordion, setOpenAccordion] = useState<string | null>('Specifications')

  const imageRef = useRef<HTMLDivElement>(null)

  // Reset state whenever the route param changes (navigating to a different product)
  useEffect(() => {
    if (product) {
      setImageIndex(0)
      setSelectedSize(null)
      setSelectedColor(defaultColor(product.colors, product.imageColors ?? []))
      setQty(1)
      setSizeError(false)
      addRecent(product.id)
    }
  }, [id])

  // 404 state
  if (!product) {
    return (
      <div className="container-x py-32">
        <Empty
          icon={<SearchX size={28} />}
          title="Sneaker not found"
          text="This pair may have sold out."
          to="/shop"
          cta="Back to shop"
        />
      </div>
    )
  }

  const isWishlisted = wish.includes(product.id)

  // Gallery for the selected colour (indexes into product.imgs)
  const gallery = galleryFor(product.imgs, product.imageColors ?? [], selectedColor)
  const currentIndex = gallery.length ? gallery[Math.min(imageIndex, gallery.length - 1)] : undefined

  const soldOut = product.stock === 0

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError(true)
      return
    }
    addToCart(product.id, selectedSize, selectedColor, qty)
  }

  // Image zoom on hover
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = imageRef.current!.getBoundingClientRect()
    setZoom({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  // Related: same brand or overlapping category, excluding current product
  const relatedProducts = PRODUCTS.filter(
    (p) => p.id !== product.id && (p.brand === product.brand || p.cats.some((c) => product.cats.includes(c)))
  ).slice(0, 4)

  // Recently viewed (excluding current product)
  const recentlyViewed = recent
    .filter((rid) => rid !== product.id)
    .map(getProduct)
    .filter((p): p is NonNullable<ReturnType<typeof getProduct>> => !!p)
    .slice(0, 4)

  // Product spec rows
  const specs = [
    ['Brand',    product.brand],
    ['Category', product.cats.join(', ')],
    ['Upper',    'Engineered mesh with synthetic overlays'],
    ['Midsole',  'Responsive foam cushioning'],
    ['Outsole',  'Durable rubber, multi-surface traction'],
    ['Closure',  'Lace-up'],
    ['Style code', `NX-${product.order}${product.brand.slice(0, 2).toUpperCase()}-0${product.reviews % 9}`],
  ]

  // Accordion sections
  const accordions: [string, React.ReactNode][] = [
    [
      'Specifications',
      <dl className="grid sm:grid-cols-2 gap-x-10">
        {specs.map(([key, value]) => (
          <div key={key} className="flex justify-between gap-4 py-3 border-b border-line text-sm">
            <dt className="text-mute">{key}</dt>
            <dd className="text-right">{value}</dd>
          </div>
        ))}
      </dl>,
    ],
    [
      'Shipping & Returns',
      <ul className="text-sm text-mute space-y-2 leading-relaxed">
        <li>Free standard shipping on orders over ₱5,000, 2–4 business days nationwide.</li>
        <li>Express delivery available at checkout for metro areas.</li>
        <li>Free returns within 30 days on unworn pairs in original packaging.</li>
        <li>Cash on Delivery available on all orders.</li>
      </ul>,
    ],
  ]

  return (
    <div className="container-x pt-8">
      <Breadcrumb
        items={[
          { label: 'Shop', to: '/shop' },
          { label: product.brand, to: `/brands/${brandSlug(product.brand)}` },
          { label: product.name },
        ]}
      />

      {/* Main product section */}
      <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-16">
        {/* Image gallery */}
        <div className="grid md:grid-cols-[80px_1fr] gap-4 md:grid-flow-col md:items-start">
          {/* Thumbnails */}
          <div className="flex md:flex-col gap-3 md:order-1 order-2">
            {gallery.map((imgIndex, i) => (
              <button
                key={imgIndex}
                onClick={() => setImageIndex(i)}
                className={`size-20 border overflow-hidden transition ${
                  imageIndex === i ? 'border-accent' : 'border-line opacity-60 hover:opacity-100'
                }`}
              >
                <img src={u(product.imgs[imgIndex], 200)} alt={`Angle ${i + 1}`} className="size-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main image with zoom */}
          <div
            ref={imageRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setZoom(null)}
            className="relative aspect-square bg-panel2 border border-line overflow-hidden cursor-zoom-in order-1 md:order-2"
          >
            {currentIndex !== undefined ? (
              <img
                src={u(product.imgs[currentIndex], 1400)}
                alt={`${product.name} in ${selectedColor}`}
                className="size-full object-cover transition-transform duration-200"
                style={
                  zoom
                    ? { transform: 'scale(2.2)', transformOrigin: `${zoom.x}% ${zoom.y}%` }
                    : undefined
                }
              />
            ) : (
              <div className="size-full grid place-items-center px-6 text-center text-sm text-mute">
                Photo coming soon for {selectedColor}
              </div>
            )}
            {currentIndex !== undefined && (
              <span className="absolute bottom-4 right-4 bg-black/60 backdrop-blur text-xs px-3 py-2 flex items-center gap-2 pointer-events-none">
                <ZoomIn size={14} /> Hover to zoom
              </span>
            )}
          </div>
        </div>

        {/* Product info + controls */}
        <div>
          <Link to={`/brands/${brandSlug(product.brand)}`} className="eyebrow hover:underline">
            {product.brand}
          </Link>
          <h1 className="h-display text-3xl md:text-5xl mt-3">{product.name}</h1>

          <div className="flex items-center gap-3 mt-4 text-sm">
            <Stars v={product.rating} size={16} />
            <span>{product.rating}</span>
            <a href="#reviews" className="text-mute underline">
              {product.reviews.toLocaleString()} reviews
            </a>
          </div>

          <div className="flex items-baseline gap-3 mt-6">
            <span className="text-3xl font-bold">{peso(product.price)}</span>
            {product.was && (
              <>
                <span className="text-mute line-through">{peso(product.was)}</span>
                <span className="bg-accent text-xs font-bold px-2 py-1">
                  -{Math.round((1 - product.price / product.was) * 100)}%
                </span>
              </>
            )}
          </div>

          <p className="text-mute mt-6 leading-relaxed">{product.desc}</p>

          {/* Color picker */}
          <div className="mt-8">
            <p className="label">
              Color · <span className="text-white normal-case tracking-normal">{selectedColor}</span>
            </p>
            <div className="flex gap-4">
              {product.colors.map((color) => (
                <Swatch
                  key={color}
                  c={color}
                  size={30}
                  active={selectedColor === color}
                  onClick={() => { setSelectedColor(color); setImageIndex(0) }}
                />
              ))}
            </div>
          </div>

          {/* Size picker */}
          <div className="mt-8">
            <div className="flex justify-between">
              <p className="label">
                Size (US){' '}
                {sizeError && (
                  <span className="text-red-400 normal-case tracking-normal ml-2">
                    Please select a size
                  </span>
                )}
              </p>
              <button className="text-xs underline text-mute">Size guide</button>
            </div>

            <div className={`grid grid-cols-4 sm:grid-cols-6 gap-2 ${sizeError ? 'animate-pulse' : ''}`}>
              {SIZES.map((size) => {
                const isUnavailable = !(product.sizes ?? SIZES).includes(size)
                return (
                  <button
                    key={size}
                    disabled={isUnavailable}
                    onClick={() => { setSelectedSize(size); setSizeError(false) }}
                    className={`h-12 text-sm font-semibold border transition ${
                      isUnavailable
                        ? 'border-line text-white/20 line-through cursor-not-allowed'
                        : selectedSize === size
                        ? 'bg-white text-black border-white'
                        : 'border-line hover:border-white'
                    }`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Add to cart row */}
          <div className="flex gap-3 mt-8">
            <Qty v={qty} set={(n) => setQty(Math.max(1, Math.min(10, n)))} />
            <button onClick={handleAddToCart} disabled={soldOut} className="btn-primary flex-1 !h-11">
              <ShoppingBag size={16} /> {soldOut ? 'Sold out' : 'Add to Cart'}
            </button>
            <button
              onClick={() => toggleWish(product.id)}
              aria-label="Add to wishlist"
              className={`size-11 border border-line grid place-items-center hover:border-accent transition ${
                isWishlisted ? 'text-accent2 border-accent' : ''
              }`}
            >
              <Heart size={18} className={isWishlisted ? 'fill-accent' : ''} />
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 mt-8 text-xs text-mute">
            {[
              [Truck,       'Free shipping ₱5k+'],
              [RotateCcw,   '30-day returns'    ],
              [ShieldCheck, '100% authentic'    ],
            ].map(([Icon, text]: any) => (
              <div key={text} className="border border-line p-3 flex flex-col items-center gap-2 text-center">
                <Icon size={18} className="text-accent2" />
                {text}
              </div>
            ))}
          </div>

          {/* Accordion sections */}
          <div className="mt-8 border-t border-line">
            {accordions.map(([title, content]) => (
              <div key={title} className="border-b border-line">
                <button
                  onClick={() => setOpenAccordion(openAccordion === title ? null : title)}
                  className="w-full flex justify-between py-4 text-sm font-bold uppercase tracking-widest"
                >
                  {title}
                  <ChevronDown
                    size={16}
                    className={`transition ${openAccordion === title ? 'rotate-180' : ''}`}
                  />
                </button>
                {openAccordion === title && (
                  <div className="pb-5 anim-slideup">{content}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews section */}
      <section id="reviews" className="mt-24 grid md:grid-cols-[280px_1fr] gap-10">
        <div>
          <h2 className="h-display text-2xl">Reviews</h2>
          <p className="font-display text-6xl font-bold mt-4">{product.rating}</p>
          <Stars v={product.rating} size={18} />
          <p className="text-mute text-sm mt-2">Based on {product.reviews.toLocaleString()} reviews</p>

          {/* Rating distribution bars */}
          {[5, 4, 3, 2, 1].map((star, i) => (
            <div key={star} className="flex items-center gap-2 text-xs mt-2">
              <span className="w-3">{star}</span>
              <div className="flex-1 h-1.5 bg-line">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${[72, 18, 6, 3, 1][i]}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Sample review list */}
        <div className="space-y-px bg-line border border-line">
          {[
            ['Marcus R.',  5, 'True to size and super comfortable',  'Wore these straight out the box for a 10-hour day. No break-in at all. Build quality is excellent.'     ],
            ['Isabel C.',  5, 'Exactly like the photos',             'Colorway looks even better in person. Fast shipping and the packaging was spotless.'                     ],
            ['Dante L.',   4, 'Great, runs slightly narrow',         'Love the cushioning. If you have wider feet go up half a size.'                                          ],
          ].map(([name, rating, title, body]) => (
            <article key={name as string} className="bg-ink p-6">
              <div className="flex justify-between">
                <Stars v={rating as number} />
                <span className="text-xs text-mute">Verified buyer · {name}</span>
              </div>
              <h3 className="font-semibold mt-3">{title}</h3>
              <p className="text-sm text-mute mt-2 leading-relaxed">{body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Related products */}
      <section className="mt-24">
        <h2 className="h-display text-2xl md:text-4xl mb-8">
          Related <span className="text-accent2">products</span>
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {/* Recently viewed */}
      {recentlyViewed.length > 0 && (
        <section className="mt-24">
          <h2 className="h-display text-2xl md:text-4xl mb-8">
            Recently <span className="text-accent2">viewed</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
            {recentlyViewed.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
