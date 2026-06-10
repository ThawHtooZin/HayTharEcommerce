import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Heart, Minus, Plus, Star } from 'lucide-react'
import { getProduct } from '../lib/api'
import { formatPrice, productImage } from '../lib/products'
import { useApp } from '../context/AppContext'

export default function ProductDetail() {
  const { slug } = useParams()
  const { addToCart, toggleWishlist, isInWishlist, currency } = useApp()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getProduct(slug).then(setProduct).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="py-24 text-center text-plum/50">Loading...</div>
  if (!product) return <div className="py-24 text-center text-plum/50">Product not found</div>

  const inWishlist = isInWishlist(product.id)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl bg-pink-50">
          <img src={productImage(product.image)} alt={product.name} className="w-full object-cover" />
          {product.badge && (
            <span className="absolute left-4 top-4 rounded-full bg-pink px-3 py-1 text-xs font-bold text-white">
              {product.badge}
            </span>
          )}
        </div>

        <div>
          <p className="text-sm text-plum/50">{product.category?.name}</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-plum">{product.name}</h1>

          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm">
              <Star size={14} className="fill-pink text-pink" />
              <span className="font-semibold">{product.rating}</span>
              <span className="text-plum/50">({product.review_count} reviews)</span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-2xl font-bold text-plum">{formatPrice(product.price, currency)}</span>
            {product.compare_at_price && (
              <span className="text-lg text-plum/40 line-through">
                {formatPrice(product.compare_at_price, currency)}
              </span>
            )}
          </div>

          <p className="mt-4 leading-relaxed text-plum/70">{product.description}</p>

          {product.is_blind_box && (
            <div className="mt-4 rounded-2xl bg-gradient-to-r from-pink-100 to-sky-100 p-4 text-sm text-plum/80">
              🎁 Blind box — 8 possible variants, 1 secret rare. The specific variant is randomized!
            </div>
          )}

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center rounded-full border border-blush bg-white">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-plum hover:text-pink">
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 text-plum hover:text-pink">
                <Plus size={16} />
              </button>
            </div>
            <button
              onClick={() => addToCart(product, quantity)}
              className="flex-1 rounded-full bg-plum py-3 text-sm font-semibold text-white hover:bg-plum/90"
            >
              Add to cart
            </button>
            <button
              onClick={() => toggleWishlist(product)}
              className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${inWishlist ? 'border-pink bg-pink/10 text-pink' : 'border-blush text-plum/50 hover:border-pink'}`}
            >
              <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-4 text-xs text-plum/60">
            <span>🚚 Free shipping over $49.99</span>
            <span>💖 10% off when you buy 2+</span>
            <span>✨ {product.in_stock ? 'In stock' : 'Out of stock'}</span>
          </div>

          {product.reviews?.length > 0 && (
            <div className="mt-10">
              <h3 className="font-display text-lg font-semibold text-plum">Reviews</h3>
              <div className="mt-4 space-y-4">
                {product.reviews.map((review) => (
                  <div key={review.id} className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{review.author_name}</span>
                      <span className="flex items-center gap-0.5 text-xs text-pink">
                        <Star size={10} className="fill-pink" /> {review.rating}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-plum/70">{review.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
