import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { getCategories, getProducts } from '../lib/api'
import { AESTHETICS, formatPrice, getFreeShippingThreshold, PRICE_FILTERS } from '../lib/products'
import { useApp } from '../context/AppContext'
import ProductCard from '../components/site/ProductCard'

export default function Shop() {
  const { currency } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [mobileFilters, setMobileFilters] = useState(false)

  const category = searchParams.get('category') || ''
  const aesthetic = searchParams.get('aesthetic') || ''
  const search = searchParams.get('search') || ''
  const maxPrice = searchParams.get('max_price') || ''
  const sort = searchParams.get('sort') || 'featured'
  const inStock = searchParams.get('in_stock') === 'true'

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = {}
    if (category) params.category = category
    if (aesthetic) params.aesthetic = aesthetic
    if (search) params.search = search
    if (maxPrice) params.max_price = maxPrice
    if (inStock) params.in_stock = true
    if (sort === 'bestsellers') params.bestsellers = true
    else if (sort !== 'featured') params.sort = sort

    getProducts(params)
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [category, aesthetic, search, maxPrice, sort, inStock])

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-plum">Category</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateFilter('category', '')}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!category ? 'bg-pink text-white' : 'bg-white text-plum/70 hover:bg-blush'}`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => updateFilter('category', cat.slug)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${category === cat.slug ? 'bg-pink text-white' : 'bg-white text-plum/70 hover:bg-blush'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-plum">Aesthetic</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateFilter('aesthetic', '')}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!aesthetic ? 'bg-pink text-white' : 'bg-white text-plum/70 hover:bg-blush'}`}
          >
            All
          </button>
          {AESTHETICS.map((a) => (
            <button
              key={a.slug}
              onClick={() => updateFilter('aesthetic', a.slug)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${aesthetic === a.slug ? 'bg-pink text-white' : 'bg-white text-plum/70 hover:bg-blush'}`}
            >
              {a.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-plum">Price</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateFilter('max_price', '')}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${!maxPrice ? 'bg-pink text-white' : 'bg-white text-plum/70 hover:bg-blush'}`}
          >
            Any
          </button>
          {PRICE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => updateFilter('max_price', String(f.value))}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${maxPrice === String(f.value) ? 'bg-pink text-white' : 'bg-white text-plum/70 hover:bg-blush'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-plum/70">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => updateFilter('in_stock', e.target.checked ? 'true' : '')}
          className="rounded border-blush text-pink focus:ring-pink"
        />
        In stock only
      </label>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="flex gap-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-28 rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 font-display font-semibold text-plum">
              <SlidersHorizontal size={16} /> Filters
            </div>
            <FilterPanel />
          </div>
        </aside>

        <div className="flex-1">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-plum">
                {search ? `Results for "${search}"` : 'All products'}
              </h1>
              <p className="mt-1 text-sm text-plum/60">
                {products.length} items · Free shipping over {formatPrice(getFreeShippingThreshold(currency), currency)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileFilters(!mobileFilters)}
                className="flex items-center gap-2 rounded-full border border-blush bg-white px-4 py-2 text-sm font-medium lg:hidden"
              >
                <SlidersHorizontal size={14} /> Filters
              </button>
              <select
                value={sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="rounded-full border border-blush bg-white px-4 py-2 text-sm font-medium text-plum"
              >
                <option value="featured">Featured</option>
                <option value="bestsellers">Bestsellers</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {mobileFilters && (
            <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm lg:hidden">
              <FilterPanel />
            </div>
          )}

          {loading ? (
            <div className="mt-12 text-center text-plum/50">Loading cute stuff...</div>
          ) : products.length === 0 ? (
            <div className="mt-12 rounded-3xl border-2 border-dashed border-blush py-16 text-center text-plum/50">
              No products found. Try different filters!
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
