import { Link } from 'react-router-dom'
import { ArrowRight, Minus, Plus, Trash2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { calcCartTotals, formatPrice, productImage } from '../lib/products'

export default function Cart() {
  const { cart, removeFromCart, updateCartQuantity, currency } = useApp()
  const totals = calcCartTotals(cart, currency)
  const progress = Math.min(100, ((totals.threshold - totals.freeShippingRemaining) / totals.threshold) * 100)

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center lg:px-8">
        <h1 className="font-display text-3xl font-bold text-plum">Your cart</h1>
        <p className="mt-4 text-plum/60">Your cart is empty — time to shop some cute stuff!</p>
        <Link to="/shop" className="mt-6 inline-block rounded-full bg-pink px-6 py-3 text-sm font-semibold text-white hover:bg-pink-dark">
          Browse the shop
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-plum">Your cart</h1>

      {totals.freeShippingRemaining > 0 && (
        <div className="mt-6 rounded-2xl bg-blush/50 p-4">
          <p className="text-sm text-plum/70">
            You're <strong>{formatPrice(totals.freeShippingRemaining, currency)}</strong> away from <strong>free worldwide shipping</strong> 🚚
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-pink transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cart.map(({ product, quantity }) => (
            <div key={product.id} className="flex gap-4 rounded-2xl border border-blush/60 bg-white p-4">
              <img
                src={productImage(product.image)}
                alt={product.name}
                className="h-24 w-24 rounded-xl object-cover"
              />
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-plum">{product.name}</h3>
                    <p className="text-xs text-plum/50">{product.category?.name || 'Product'}</p>
                  </div>
                  <button onClick={() => removeFromCart(product.id)} className="text-plum/40 hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-blush">
                    <button onClick={() => updateCartQuantity(product.id, quantity - 1)} className="px-2.5 py-1" disabled={quantity <= 1}>
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
                    <button onClick={() => updateCartQuantity(product.id, quantity + 1)} className="px-2.5 py-1">
                      <Plus size={14} />
                    </button>
                  </div>
                  <span className="font-semibold text-plum">{formatPrice(product.price * quantity, currency)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-plum">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-plum/70">
              <span>Subtotal</span>
              <span>{formatPrice(totals.subtotal, currency)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Volume discount (10%)</span>
                <span>-{formatPrice(totals.discount, currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-plum/70">
              <span>Shipping</span>
              <span>{totals.shipping === 0 ? 'Free' : formatPrice(totals.shipping, currency)}</span>
            </div>
            <div className="flex justify-between border-t border-blush pt-2 text-lg font-bold text-plum">
              <span>Total</span>
              <span>{formatPrice(totals.total, currency)}</span>
            </div>
          </div>
          <Link
            to="/checkout"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-pink py-3 text-sm font-semibold text-white hover:bg-pink-dark"
          >
            Checkout <ArrowRight size={16} />
          </Link>
          <p className="mt-2 text-center text-xs text-plum/50">
            Guest checkout available — create an account after you order
          </p>
          <Link to="/shop" className="mt-3 block text-center text-sm text-plum/60 hover:text-pink">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
