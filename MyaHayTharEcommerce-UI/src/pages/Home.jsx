import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Globe, Package, Sparkles, Star, Truck } from 'lucide-react'
import { getProducts } from '../lib/api'
import { AESTHETICS, productImage } from '../lib/products'
import { useApp } from '../context/AppContext'
import ProductCard from '../components/site/ProductCard'
import Newsletter from '../components/site/Newsletter'

const tickerItems = [
  'FREE SHIPPING OVER $49.99',
  'EXTRA 10% OFF 2+ ITEMS',
  'NEW DROPS WEEKLY',
  '50K+ HAPPY FANS',
  'BLIND BOX RESTOCK',
  'PAY LATER AVAILABLE',
]

const aestheticImages = [
  '711679854_3184118295309079_8124434516892269944_n.jpg',
  '656818639_3120320465022196_640616499552871353_n.jpg',
  '709548208_3184118171975758_5914335189501750563_n.jpg',
  '714768482_3188520641535511_4848520770944250742_n.jpg',
]

export default function Home() {
  const { reduceMotion } = useApp()
  const [bestsellers, setBestsellers] = useState([])
  const [featured, setFeatured] = useState([])
  const [blindBoxes, setBlindBoxes] = useState([])

  useEffect(() => {
    getProducts({ bestsellers: true }).then(setBestsellers)
    getProducts({ featured: true }).then((data) => setFeatured(data.slice(0, 4)))
    getProducts({ blind_box: true }).then((data) => setBlindBoxes(data.slice(0, 1)))
  }, [])

  const heroImage = productImage('711679854_3184118295309079_8124434516892269944_n.jpg')
  const M = reduceMotion ? 'div' : motion.div

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blush via-cream to-lavender/30">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-16 lg:grid-cols-2 lg:px-8 lg:py-24">
          <M {...(!reduceMotion && { initial: { opacity: 0, x: -30 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.6 } })}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-4 py-1.5 text-xs font-semibold text-pink">
              <Sparkles size={14} /> New drop · Strawberry season
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-plum sm:text-5xl lg:text-6xl">
              Stay cute, stay{' '}
              <span className="text-pink italic">obsessed.</span>
            </h1>
            <p className="mt-4 max-w-lg text-plum/70 leading-relaxed">
              The softest plushies, dreamiest streetwear and Y2K accessories you'll actually wear.
              Curated for cuteness lovers, shipped worldwide.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-pink px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105 hover:bg-pink-dark">
                Shop the drop <ArrowRight size={16} />
              </Link>
              <Link to="/shop?category=blind-boxes" className="rounded-full border border-plum/20 bg-white px-6 py-3 text-sm font-semibold text-plum transition-colors hover:border-pink hover:text-pink">
                Try a blind box
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-xs text-plum/60">
              <span className="flex items-center gap-1.5"><Truck size={14} className="text-pink" /> Free ship over $49.99</span>
              <span className="flex items-center gap-1.5"><Package size={14} className="text-pink" /> 10% off 2+ items</span>
              <span className="flex items-center gap-1.5"><Star size={14} className="text-pink" /> 50k+ happy fans</span>
            </div>
          </M>

          <M {...(!reduceMotion && { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.6, delay: 0.2 } })} className="relative">
            <img src={heroImage} alt="Cute plushies" className="w-full rounded-3xl shadow-xl" />
            <div className="absolute -bottom-4 left-4 rounded-2xl bg-white px-4 py-2 shadow-lg">
              <span className="flex items-center gap-1 text-sm font-semibold text-plum">
                <Star size={14} className="fill-pink text-pink" /> 4.9/5 from 12k reviews
              </span>
            </div>
          </M>
        </div>
      </section>

      {/* Ticker */}
      <div className="overflow-hidden bg-pink py-3 text-white">
        <div className="animate-marquee flex whitespace-nowrap">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="mx-6 text-xs font-bold tracking-widest">
              {item} ✦
            </span>
          ))}
        </div>
      </div>

      {/* Shop by aesthetic */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-plum">Shop by aesthetic</h2>
            <p className="mt-1 text-plum/60">Find your vibe — wear it loud.</p>
          </div>
          <Link to="/shop" className="hidden text-sm font-semibold text-pink hover:underline sm:block">
            View all →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AESTHETICS.map((aesthetic, i) => (
            <Link
              key={aesthetic.slug}
              to={`/shop?aesthetic=${aesthetic.slug}`}
              className="group relative overflow-hidden rounded-3xl"
            >
              <img
                src={productImage(aestheticImages[i])}
                alt={aesthetic.name}
                className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-plum/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-display text-xl font-bold">{aesthetic.name}</h3>
                <p className="text-sm text-white/80">{aesthetic.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Best sellers */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl font-bold text-plum">Best sellers 💖</h2>
          <Link to="/shop?sort=bestsellers" className="text-sm font-semibold text-pink hover:underline">
            Shop all →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {bestsellers.slice(0, 4).map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* Blind box CTA */}
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-pink-200 via-blush to-sky-200">
          <div className="grid items-center gap-8 p-8 lg:grid-cols-2 lg:p-12">
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-plum">
                🎁 Mystery drops
              </span>
              <h2 className="mt-4 font-display text-3xl font-bold text-plum lg:text-4xl">
                Open it. Love it. Or trade it.
              </h2>
              <p className="mt-3 text-plum/70">
                Our blind boxes pack 8 possible variants and 1 secret rare. Restocked every Friday.
              </p>
              <Link to="/shop?category=blind-boxes" className="mt-6 inline-block rounded-full bg-pink px-6 py-3 text-sm font-semibold text-white hover:bg-pink-dark">
                Try your luck
              </Link>
            </div>
            {blindBoxes[0] && (
              <img
                src={productImage(blindBoxes[0].image)}
                alt="Blind box"
                className="mx-auto max-h-72 rounded-2xl object-cover shadow-lg"
              />
            )}
          </div>
        </div>
      </section>

      {/* Just dropped */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl font-bold text-plum">Just dropped</h2>
          <Link to="/shop?sort=featured" className="text-sm font-semibold text-pink hover:underline">
            See more →
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <Newsletter />
      </section>
    </div>
  )
}
