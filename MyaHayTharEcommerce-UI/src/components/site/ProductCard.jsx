import { Link } from 'react-router-dom'
import { Heart, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { useApp } from '../../context/AppContext'
import { formatPrice, productImage } from '../../lib/products'

const badgeColors = {
  BEST: 'bg-pink text-white',
  NEW: 'bg-cyan-400 text-white',
  SALE: 'bg-red-400 text-white',
}

const bgColors = ['bg-pink-100', 'bg-purple-100', 'bg-emerald-100', 'bg-orange-100', 'bg-sky-100']

export default function ProductCard({ product, index = 0, showAddToCart = true }) {
  const { addToCart, toggleWishlist, isInWishlist, currency, reduceMotion } = useApp()
  const inWishlist = isInWishlist(product.id)
  const bg = bgColors[index % bgColors.length]

  const Wrapper = reduceMotion ? 'div' : motion.div

  return (
    <Wrapper
      {...(!reduceMotion && {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { delay: index * 0.05 },
        whileHover: { y: -4 },
      })}
      className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <Link to={`/product/${product.slug}`} className="relative block">
        <div className={`aspect-square overflow-hidden ${bg}`}>
          <img
            src={productImage(product.image)}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        {product.badge && (
          <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badgeColors[product.badge] || 'bg-pink text-white'}`}>
            {product.badge}
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product) }}
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-colors hover:bg-blush ${inWishlist ? 'text-pink' : 'text-plum/50'}`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1 text-xs text-plum/60">
          <Star size={12} className="fill-pink text-pink" />
          <span>{product.rating}</span>
          <span>({product.review_count})</span>
        </div>
        <Link to={`/product/${product.slug}`} className="mt-1 font-display font-semibold text-plum hover:text-pink">
          {product.name}
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <span className="font-semibold text-plum">{formatPrice(product.price, currency)}</span>
          {product.compare_at_price && (
            <span className="text-sm text-plum/40 line-through">
              {formatPrice(product.compare_at_price, currency)}
            </span>
          )}
        </div>
        {showAddToCart && (
          <button
            onClick={() => addToCart(product)}
            className="mt-auto pt-3 w-full rounded-full bg-plum py-2.5 text-sm font-semibold text-white transition-colors hover:bg-plum/90"
          >
            Add to cart
          </button>
        )}
      </div>
    </Wrapper>
  )
}
