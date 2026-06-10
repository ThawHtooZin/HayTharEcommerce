import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ProductCard from '../components/site/ProductCard'

export default function Wishlist() {
  const { wishlist } = useApp()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-plum">Your wishlist 💖</h1>
      <p className="mt-1 text-plum/60">Saved for that just-right moment.</p>

      {wishlist.length === 0 ? (
        <div className="mt-12 rounded-3xl border-2 border-dashed border-blush py-16 text-center">
          <p className="text-plum/50">Nothing saved yet.</p>
          <Link to="/shop" className="mt-4 inline-block rounded-full bg-pink px-6 py-3 text-sm font-semibold text-white hover:bg-pink-dark">
            Browse the shop
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {wishlist.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
