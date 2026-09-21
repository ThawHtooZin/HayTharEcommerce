import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { getCategories, getProducts } from '../lib/api'
import { productImage } from '../lib/products'
import { useApp } from '../context/AppContext'
import ProductCard from '../components/site/ProductCard'

const tickerItems = [
  'NEW DROPS WEEKLY',
  'PAY LATER AVAILABLE',
]

const categoryImages = [
  '711679854_3184118295309079_8124434516892269944_n.jpg',
  '656818639_3120320465022196_640616499552871353_n.jpg',
  '709548208_3184118171975758_5914335189501750563_n.jpg',
  '714768482_3188520641535511_4848520770944250742_n.jpg',
  '711309684_3183879248666317_4425993837115985520_n.jpg',
]

export default function Home() {
  const { reduceMotion } = useApp()
  const [bestsellers, setBestsellers] = useState([])
  const [featured, setFeatured] = useState([])
  const [categories, setCategories] = useState([])

  useEffect(() => {
    getProducts({ bestsellers: true }).then((data) => setBestsellers(data.slice(0, 4))).catch(() => {})
    getProducts({ featured: true }).then((data) => setFeatured(data.slice(0, 4))).catch(() => {})
    getCategories().then(setCategories).catch(() => {})
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
              Curated for cuteness lovers.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex items-center gap-2 rounded-full bg-pink px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105 hover:bg-pink-dark">
                Shop the drop <ArrowRight size={16} />
              </Link>
              <Link to="/shop?category=blind-boxes" className="rounded-full border border-plum/20 bg-white px-6 py-3 text-sm font-semibold text-plum transition-colors hover:border-pink hover:text-pink">
                Try a blind box
              </Link>
            </div>
          </M>

          <M {...(!reduceMotion && { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.6, delay: 0.2 } })} className="relative">
            <img src={heroImage} alt="Cute plushies" className="w-full rounded-3xl shadow-xl" />
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

      {/* Shop by category */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold text-plum">Shop by category</h2>
            <p className="mt-1 text-plum/60">Browse the collection by product type.</p>
          </div>
          <Link to="/shop" className="hidden text-sm font-semibold text-pink hover:underline sm:block">
            View all →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.slice(0, categoryImages.length).map((category, i) => (
            <Link
              key={category.slug}
              to={`/shop?category=${category.slug}`}
              className="group relative overflow-hidden rounded-3xl"
            >
              <img
                src={productImage(categoryImages[i])}
                alt={category.name}
                className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-plum/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="font-display text-xl font-bold">{category.name}</h3>
                <p className="text-sm text-white/80">{category.description}</p>
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

    </div>
  )
}
