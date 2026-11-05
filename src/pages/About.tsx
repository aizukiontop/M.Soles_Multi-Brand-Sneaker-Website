import { Link } from 'react-router'
import { ArrowRight, Layers, Search, ShoppingBag } from 'lucide-react'
import { IMG, u } from '../data'

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[420px] overflow-hidden bg-black">
        <img src={u(IMG.store, 1800)} alt="" className="absolute inset-0 size-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink to-transparent" />
        <div className="container-x relative h-full flex flex-col justify-end pb-14">
          <p className="eyebrow mb-4">About us</p>
          <h1 className="h-display text-5xl md:text-7xl max-w-3xl">
            Every brand. <span className="text-accent2">One store.</span>
          </h1>
        </div>
      </section>

      {/* Our story */}
      <section className="container-x py-20 md:py-28 grid md:grid-cols-2 gap-10 md:gap-20">
        <h2 className="h-display text-3xl md:text-5xl">Our story</h2>
        <div className="text-mute space-y-5 leading-relaxed">
          <p>
            M<span className="text-accent2">.</span>Soles is a multi-brand sneaker shopping platform designed to bring popular
            sneaker brands together in one convenient online shopping experience.
          </p>
          <p>
            Instead of opening ten different stores to compare Nike, Adidas, Jordan, New Balance, Puma,
            Converse, Vans, ASICS, Reebok and Under Armour, shoppers can browse, search, filter and save
            their favourite pairs in one place.
          </p>
        </div>
      </section>

      {/* Meet the creator */}
      <section className="border-y border-line bg-panel">
        <div className="container-x py-20 md:py-28 grid md:grid-cols-12 gap-10 md:gap-14 items-center">
          <div className="md:col-span-5">
            <img
              src="/creator-portrait.png"
              alt="Marion Anthony S. Dingal, creator of M.Soles"
              className="aspect-[4/5] w-full object-cover border border-line bg-ink"
            />
          </div>
          <div className="md:col-span-7">
            <p className="eyebrow mb-4">Meet the creator</p>
            <h2 className="h-display text-4xl md:text-6xl">Marion Anthony S. Dingal</h2>
            <p className="font-semibold text-white mt-4">Creator and Developer of M.Soles</p>
            <div className="text-mute space-y-5 leading-relaxed mt-8 max-w-xl">
              <p>
                M<span className="text-accent2">.</span>Soles is more than just a name. It was inspired by my own name,
                Marion, giving the brand a personal identity and connecting the project to the person behind its creation.
              </p>
              <p>
                As a Computer Science student, I designed and developed M<span className="text-accent2">.</span>Soles from
                the ground up, including its user interface, frontend, and e-commerce functionality.
              </p>
              <p>
                My goal with this project is to show how a sneaker store can feel bold, clear, and easy to use, from
                browsing the catalog to managing a wishlist, cart, and order history.
              </p>
              <p>
                M<span className="text-accent2">.</span>Soles represents my personal take on sneaker retail, combining my
                name, creativity, and passion for building digital experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="container-x py-20 md:py-28 grid md:grid-cols-2 gap-10 md:gap-20">
        <h2 className="h-display text-3xl md:text-5xl">Our vision</h2>
        <div className="text-mute space-y-5 leading-relaxed">
          <p>
            To make sneaker shopping convenient, modern and user-friendly: one destination where
            every brand is easy to find, easy to compare and easy to buy.
          </p>
          <p>
            M<span className="text-accent2">.</span>Soles is a portfolio project. Checkout and payments are simulated, and
            no real orders are placed.
          </p>
        </div>
      </section>

      {/* What you can do */}
      <section className="container-x pb-8">
        <div className="grid md:grid-cols-3 gap-px bg-line border border-line">
          {[
            [Layers, 'Ten brands', 'Browse popular sneaker brands side by side on one storefront.'],
            [Search, 'Find it fast', 'Search by keyword, then narrow results by brand, size, colour, price and category.'],
            [ShoppingBag, 'Shop your way', 'Save favourites to a wishlist and keep a cart that follows your account.'],
          ].map(([Icon, title, text]: any) => (
            <div key={title} className="bg-ink p-8">
              <Icon className="text-accent2 mb-6" size={26} />
              <h3 className="font-display font-bold uppercase">{title}</h3>
              <p className="text-sm text-mute mt-3 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="container-x py-20">
        <div className="relative overflow-hidden bg-panel border border-line p-10 md:p-20 text-center">
          <h2 className="h-display text-3xl md:text-6xl text-white">Explore our collection</h2>
          <Link to="/shop" className="btn-primary mt-8">
            Shop all sneakers <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  )
}
