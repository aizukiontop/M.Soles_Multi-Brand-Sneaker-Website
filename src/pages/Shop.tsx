import { Link, useParams, useSearchParams } from 'react-router'
import { useEffect, useState } from 'react'
import { SlidersHorizontal, X, ChevronDown, ArrowUpRight, SearchX } from 'lucide-react'
import { BRANDS, CATEGORIES, COLORS, PRODUCTS, SIZES, IMG, u, type Product } from '../data'
import { Breadcrumb, Empty, PageHeader, ProductCard, Swatch } from '../ui'
import { Spinner } from '../components/RequireAuth'
import { fetchProducts } from '../services/catalog'
import { errorText } from '../utils/errors'
import { Newsletter } from './Home'

// ---------------------------------------------------------------------------
// Sorting options
// ---------------------------------------------------------------------------
const SORT_OPTIONS = [
  ['featured',   'Featured'          ],
  ['newest',     'Newest'            ],
  ['price-asc',  'Price: Low to High'],
  ['price-desc', 'Price: High to Low'],
  ['rating',     'Best Rated'        ],
]

// Toggle an item in an array (add if absent, remove if present)
function toggle<T>(array: T[], value: T): T[] {
  return array.includes(value) ? array.filter((x) => x !== value) : [...array, value]
}

// ---------------------------------------------------------------------------
// Collapsible filter group
// ---------------------------------------------------------------------------
function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="border-b border-line py-5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center text-xs font-bold uppercase tracking-[.2em]"
      >
        {title}
        <ChevronDown size={14} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </div>
  )
}

// Checkbox-style filter option
function FilterCheck({
  checked,
  label,
  count,
  onClick,
}: {
  checked: boolean
  label: string
  count?: number
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 py-1.5 text-sm group">
      <span
        className={`size-4 border grid place-items-center transition ${
          checked ? 'bg-accent border-accent' : 'border-white/30 group-hover:border-white'
        }`}
      >
        {checked && (
          <svg viewBox="0 0 12 12" className="size-3 text-white">
            <path d="M2 6l3 3 5-6" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
        )}
      </span>
      <span className={checked ? 'text-white' : 'text-mute group-hover:text-white'}>{label}</span>
      {count !== undefined && <span className="ml-auto text-xs text-white/30">{count}</span>}
    </button>
  )
}

// ---------------------------------------------------------------------------
// Product catalog with filters — reused by Shop and BrandPage
// ---------------------------------------------------------------------------
export function Catalog({ lockBrand }: { lockBrand?: string }) {
  const [searchParams, setSearchParams] = useSearchParams()

  // Filter state
  const [brands,  setBrands]  = useState<string[]>([])
  const [cats,    setCats]    = useState<string[]>(() =>
    searchParams.get('category') ? [searchParams.get('category')!] : []
  )
  const [sizes,   setSizes]   = useState<number[]>([])
  const [colors,  setColors]  = useState<string[]>([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sort,    setSort]    = useState(searchParams.get('sort') || 'featured')
  const [limit,   setLimit]   = useState(12)
  const [filterPanelOpen, setFilterPanelOpen] = useState(false)

  const searchQuery = (searchParams.get('q') || '').toLowerCase()
  const onSale = searchParams.get('sale') === '1'

  // ---------------------------------------------------------------------------
  // Server-side filtered + sorted product list (GET /api/products)
  // ---------------------------------------------------------------------------
  const [results, setResults] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setLoadError(null)
    fetchProducts({
      brand: lockBrand ? [lockBrand] : brands,
      category: cats,
      size: sizes,
      color: colors,
      minPrice,
      maxPrice,
      q: searchQuery,
      sort,
      sale: onSale ? '1' : '',
      limit,
    })
      .then((r) => { if (active) { setResults(r.items); setTotal(r.total) } })
      .catch((e) => { if (active) setLoadError(errorText(e)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [brands, cats, sizes, colors, minPrice, maxPrice, sort, searchQuery, onSale, lockBrand, limit, reloadKey])
  const filteredProducts = results

  // Count how many filters are active
  const activeFilterCount =
    brands.length + cats.length + sizes.length + colors.length + (minPrice || maxPrice ? 1 : 0)

  const clearAllFilters = () => {
    setBrands([])
    setCats([])
    setSizes([])
    setColors([])
    setMinPrice('')
    setMaxPrice('')
    if (searchQuery) setSearchParams({})
  }

  // ---------------------------------------------------------------------------
  // Filter panel (shared between sidebar and mobile drawer)
  // ---------------------------------------------------------------------------
  const filterPanel = (
    <>
      {/* Brand filter — hidden when already on a brand page */}
      {!lockBrand && (
        <FilterGroup title="Brand">
          {BRANDS.slice(0, 8).map((brand) => (
            <FilterCheck
              key={brand.slug}
              checked={brands.includes(brand.name)}
              label={brand.name}
              count={PRODUCTS.filter((p) => p.brand === brand.name).length}
              onClick={() => setBrands(toggle(brands, brand.name))}
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Category">
        {CATEGORIES.map((cat) => (
          <FilterCheck
            key={cat}
            checked={cats.includes(cat)}
            label={cat}
            onClick={() => setCats(toggle(cats, cat))}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Size (US)">
        <div className="grid grid-cols-4 gap-2">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => setSizes(toggle(sizes, size))}
              className={`h-10 text-xs font-semibold border transition ${
                sizes.includes(size)
                  ? 'bg-white text-black border-white'
                  : 'border-line text-mute hover:border-white hover:text-white'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Color">
        <div className="flex flex-wrap gap-3">
          {Object.keys(COLORS).map((color) => (
            <Swatch
              key={color}
              c={color}
              size={26}
              active={colors.includes(color)}
              onClick={() => setColors(toggle(colors, color))}
            />
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price range (₱)">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="field !h-10"
          />
          <span className="text-mute">–</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="field !h-10"
          />
        </div>
        {/* Quick price presets */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            ['Under 5k', '',     '5000' ],
            ['5k–10k',   '5000', '10000'],
            ['10k+',     '10000', ''    ],
          ].map(([label, min, max]) => (
            <button
              key={label}
              onClick={() => { setMinPrice(min); setMaxPrice(max) }}
              className="text-xs px-2.5 py-1.5 border border-line text-mute hover:border-accent hover:text-white"
            >
              {label}
            </button>
          ))}
        </div>
      </FilterGroup>
    </>
  )

  return (
    <div className="container-x py-10 grid lg:grid-cols-[250px_1fr] gap-10">
      {/* Desktop sidebar filters */}
      <aside className="max-lg:hidden">
        <div className="flex justify-between items-center pb-4 border-b border-line">
          <h2 className="font-display font-bold uppercase">Filters</h2>
          {activeFilterCount > 0 && (
            <button onClick={clearAllFilters} className="text-xs text-accent2 hover:underline">
              Clear all ({activeFilterCount})
            </button>
          )}
        </div>
        {filterPanel}
      </aside>

      {/* Mobile filter drawer */}
      {filterPanelOpen && (
        <div className="fixed inset-0 z-[75] lg:hidden flex">
          <div className="absolute inset-0 bg-black/80" onClick={() => setFilterPanelOpen(false)} />
          <div className="relative ml-auto w-[88%] max-w-sm bg-ink h-full flex flex-col anim-slideup">
            <div className="flex justify-between items-center p-5 border-b border-line">
              <h2 className="font-display font-bold uppercase">Filters</h2>
              <button onClick={() => setFilterPanelOpen(false)} aria-label="Close filters">
                <X />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5">{filterPanel}</div>
            <div className="p-4 border-t border-line flex gap-3">
              <button onClick={clearAllFilters} className="btn-ghost flex-1">Clear</button>
              <button onClick={() => setFilterPanelOpen(false)} className="btn-primary flex-1">
                Show {total}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product grid */}
      <div>
        {/* Toolbar: mobile filter button + sort */}
        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-line">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterPanelOpen(true)}
              className="lg:hidden btn-ghost btn-sm"
            >
              <SlidersHorizontal size={14} />
              Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
            </button>
            <p className="text-sm text-mute max-sm:hidden">
              {loading ? 'Loading…' : `${total} results`}
              {searchQuery && (
                <> for "<span className="text-white">{searchQuery}</span>"</>
              )}
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <span className="text-mute max-sm:hidden">Sort by</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-panel2 border border-line h-10 px-3 text-sm outline-none focus:border-accent"
            >
              {SORT_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Active filter tags */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {[...brands, ...cats, ...colors, ...sizes.map((s) => `US ${s}`)].map((tag) => (
              <span key={tag} className="text-xs bg-panel2 border border-line px-3 py-1.5">
                {tag}
              </span>
            ))}
            <button onClick={clearAllFilters} className="text-xs text-accent2 px-2">
              Reset
            </button>
          </div>
        )}

        {loadError ? (
          <p role="alert" className="text-sm text-red-400 border border-red-500/40 bg-red-500/10 px-4 py-3">{loadError}</p>
        ) : loading && filteredProducts.length === 0 ? (
          <Spinner label="Loading sneakers…" />
        ) : filteredProducts.length === 0 ? (
          <Empty
            icon={<SearchX size={28} />}
            title="No sneakers found"
            text="Try removing a few filters or searching for something else."
            to="/shop"
            cta="Reset filters"
          />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
              {filteredProducts.slice(0, limit).map((p) => (
                <ProductCard key={p.id} p={p} />
              ))}
            </div>

            {/* Pagination / load more */}
            <div className="text-center mt-12">
              <p className="text-xs text-mute mb-4">
                Showing {Math.min(limit, total)} of {total}
              </p>
              {/* Progress bar */}
              <div className="h-1 w-48 bg-line mx-auto mb-6">
                <div
                  className="h-full bg-accent"
                  style={{ width: `${total ? Math.min(100, (limit / total) * 100) : 0}%` }}
                />
              </div>
              {limit < total && (
                <button onClick={() => setLimit(limit + 8)} className="btn-ghost">
                  Load more
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shop page — all products
// ---------------------------------------------------------------------------
export default function Shop() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Shop' }]}
        title="Explore All Sneakers"
        text="Authentic pairs from ten of the world's best footwear brands. Filter by what matters and find your next rotation."
      />
      <Catalog />
    </>
  )
}

// ---------------------------------------------------------------------------
// Brand page — filtered to a single brand
// ---------------------------------------------------------------------------
export function BrandPage() {
  const { slug } = useParams()
  const brand = BRANDS.find((b) => b.slug === slug)

  if (!brand) {
    return (
      <div className="container-x py-32">
        <Empty
          icon={<SearchX size={28} />}
          title="Brand not found"
          text="We don't carry that brand yet."
          to="/brands"
          cta="Browse brands"
        />
      </div>
    )
  }

  const productCount = PRODUCTS.filter((p) => p.brand === brand.name).length

  return (
    <>
      {/* Brand hero */}
      <section className="relative h-[360px] md:h-[440px] overflow-hidden border-b border-line">
        <img
          src={u(brand.img, 1600)}
          alt={`${brand.name} sneakers`}
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/20" />

        <div className="container-x relative h-full flex flex-col justify-end pb-12">
          <Breadcrumb items={[{ label: 'Brands', to: '/brands' }, { label: brand.name }]} />
          <h1 className="h-display text-5xl md:text-8xl">{brand.name}</h1>
          <p className="text-white/75 mt-4 max-w-xl">{brand.intro}</p>
          <p className="text-xs tracking-widest text-accent2 mt-4 font-semibold">
            {productCount} STYLES AT M.SOLES · MULTI-BRAND DEMO STORE
          </p>
        </div>
      </section>

      {productCount === 0 ? (
        <div className="container-x py-20">
          <Empty
            icon={<SearchX size={28} />}
            title="Coming soon"
            text={`${brand.name} styles are landing shortly.`}
            to="/shop"
            cta="Shop all sneakers"
          />
        </div>
      ) : (
        <Catalog lockBrand={brand.name} />
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Brands directory — grid of all brands
// ---------------------------------------------------------------------------
export function Brands() {
  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Brands' }]}
        title="Shop by Brand"
        text="Ten brands, one store. Pick a label to see the full M.Soles selection."
      />

      <div className="container-x py-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {BRANDS.map((brand) => (
          <Link
            key={brand.slug}
            to={`/brands/${brand.slug}`}
            className="group relative aspect-[4/3] overflow-hidden border border-line"
          >
            <img
              src={u(brand.img, 800)}
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-x-6 bottom-6 flex items-end justify-between">
              <div>
                <h3 className={`text-3xl uppercase ${brand.font}`}>{brand.name}</h3>
                <p className="text-xs text-mute mt-1">
                  {PRODUCTS.filter((p) => p.brand === brand.name).length} styles
                </p>
              </div>
              <ArrowUpRight className="text-accent2" />
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Collections page — curated editorial listings
// ---------------------------------------------------------------------------
export function Collections() {
  const collections = [
    ['Latest Releases',       'Fresh out the box this week.',          '/shop?sort=newest',         '1656944227421-416b1d2186c9'],
    ['Streetwear Essentials', 'Low-profile icons for daily rotation.', '/shop?category=Lifestyle',  IMG.lifestyle               ],
    ['Running Performance',   'Cushion, rebound and mileage.',         '/shop?category=Running',    '1590333748338-d629e4564ad9'],
    ['Basketball Sneakers',   'Court-ready from Jordan to Curry.',     '/shop?category=Basketball', '1557848979-f13d18a41bb2'  ],
    ['Everyday Comfort',      'Soft landings all day long.',           '/shop?category=Women',      '1633464129147-777bdcc97c1d'],
  ]

  return (
    <>
      <PageHeader
        crumbs={[{ label: 'Collections' }]}
        title="Collections"
        text="Hand-picked edits from our buying team."
      />

      <div className="container-x py-12 space-y-5">
        {collections.map(([title, desc, to, img], i) => (
          <Link
            key={title}
            to={to}
            className="group relative block h-64 md:h-80 overflow-hidden border border-line"
          >
            <img
              src={u(img, 1400)}
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
            <div className="relative h-full p-8 md:p-12 flex flex-col justify-end">
              <p className="eyebrow mb-2">0{i + 1}</p>
              <h2 className="h-display text-3xl md:text-5xl">{title}</h2>
              <p className="text-mute mt-2">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <Newsletter />
    </>
  )
}
