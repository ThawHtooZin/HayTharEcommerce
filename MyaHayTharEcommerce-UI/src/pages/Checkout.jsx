import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { placeOrder } from '../lib/api'
import { useApp } from '../context/AppContext'
import { calcCartTotals, formatPrice, getFreeShippingThreshold, productImage } from '../lib/products'

export default function Checkout() {
  const { cart, clearCart, currency, showToast, user, setGuestSession } = useApp()
  const navigate = useNavigate()
  const totals = calcCartTotals(cart, currency)
  const threshold = getFreeShippingThreshold(currency)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: user?.email || '',
    first_name: user?.name?.split(' ')[0] || '',
    last_name: user?.name?.split(' ').slice(1).join(' ') || '',
    address: '',
    city: '',
    postal_code: '',
    country: 'United States',
    card_number: '',
    card_expiry: '',
    card_cvc: '',
    discount_code: '',
  })

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center lg:px-8">
        <h1 className="font-display text-3xl font-bold text-plum">Checkout</h1>
        <p className="mt-4 text-plum/60">Your cart is empty.</p>
        <Link to="/shop" className="mt-6 inline-block rounded-full bg-pink px-6 py-3 text-sm font-semibold text-white">
          Go shopping
        </Link>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        currency,
        items: cart.map(({ product, quantity }) => ({
          product_id: product.id,
          quantity,
        })),
      }
      if (user) delete payload.email

      const order = await placeOrder(payload)
      clearCart()
      if (!user && order.guest_token) {
        setGuestSession(order.guest_token, order.guest_account)
      }
      navigate('/order-success', {
        state: { order, isGuest: !user },
        replace: true,
      })
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.items?.[0]
      showToast(msg || 'Something went wrong. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-plum">Checkout</h1>
      <p className="mt-1 text-sm text-plum/60">
        {user
          ? <>Signed in as <span className="font-semibold text-plum">{user.email}</span></>
          : 'Guest checkout — no account needed. Create one after you order!'}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section>
            <h2 className="font-display font-semibold text-plum">Contact</h2>
            {user ? (
              <input type="email" value={user.email} disabled className="mt-2 w-full rounded-2xl border border-blush bg-blush/30 px-4 py-3 text-sm text-plum/70" />
            ) : (
              <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} required className="mt-2 w-full rounded-2xl border border-blush bg-white px-4 py-3 text-sm outline-none focus:border-pink" />
            )}
          </section>

          <section>
            <h2 className="font-display font-semibold text-plum">Shipping address</h2>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <input type="text" placeholder="First name" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} required className="rounded-2xl border border-blush bg-white px-4 py-3 text-sm outline-none focus:border-pink" />
              <input type="text" placeholder="Last name" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} required className="rounded-2xl border border-blush bg-white px-4 py-3 text-sm outline-none focus:border-pink" />
            </div>
            <input type="text" placeholder="Address" value={form.address} onChange={(e) => update('address', e.target.value)} required className="mt-3 w-full rounded-2xl border border-blush bg-white px-4 py-3 text-sm outline-none focus:border-pink" />
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <input type="text" placeholder="City" value={form.city} onChange={(e) => update('city', e.target.value)} required className="rounded-2xl border border-blush bg-white px-4 py-3 text-sm outline-none focus:border-pink" />
              <input type="text" placeholder="ZIP / Postal" value={form.postal_code} onChange={(e) => update('postal_code', e.target.value)} required className="rounded-2xl border border-blush bg-white px-4 py-3 text-sm outline-none focus:border-pink" />
              <input type="text" placeholder="Country" value={form.country} onChange={(e) => update('country', e.target.value)} required className="rounded-2xl border border-blush bg-white px-4 py-3 text-sm outline-none focus:border-pink" />
            </div>
          </section>

          <section>
            <h2 className="font-display font-semibold text-plum">Payment</h2>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              <input type="text" placeholder="Card number" value={form.card_number} onChange={(e) => update('card_number', e.target.value)} className="sm:col-span-1 rounded-2xl border border-blush bg-white px-4 py-3 text-sm outline-none focus:border-pink" />
              <input type="text" placeholder="MM/YY" value={form.card_expiry} onChange={(e) => update('card_expiry', e.target.value)} className="rounded-2xl border border-blush bg-white px-4 py-3 text-sm outline-none focus:border-pink" />
              <input type="text" placeholder="CVC" value={form.card_cvc} onChange={(e) => update('card_cvc', e.target.value)} className="rounded-2xl border border-blush bg-white px-4 py-3 text-sm outline-none focus:border-pink" />
            </div>
            <p className="mt-2 flex items-center gap-1 text-xs text-plum/50">
              <Lock size={12} /> Demo checkout — no real payment is processed.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-plum">Discount code</h2>
            <input
              type="text"
              placeholder="Try SWEET (20% off) or CUTE10"
              value={form.discount_code}
              onChange={(e) => update('discount_code', e.target.value)}
              className="mt-2 w-full rounded-2xl border border-blush bg-white px-4 py-3 text-sm outline-none focus:border-pink"
            />
          </section>
        </div>

        <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-plum">Your order</h2>
          <p className="mt-1 text-xs text-plum/50">Free shipping over {formatPrice(threshold, currency)}</p>
          <div className="mt-4 space-y-3">
            {cart.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center gap-3">
                <img src={productImage(product.image)} alt={product.name} className="h-12 w-12 rounded-lg object-cover" />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-plum">{product.name}</p>
                  <p className="text-plum/50">Qty {quantity}</p>
                </div>
                <span className="text-sm font-semibold">{formatPrice(product.price * quantity, currency)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-blush pt-4 text-sm">
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
            <div className="flex justify-between text-lg font-bold text-plum">
              <span>Total</span>
              <span>{formatPrice(totals.total, currency)}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-full bg-pink py-3 text-sm font-semibold text-white hover:bg-pink-dark disabled:opacity-50"
          >
            {loading ? 'Placing order...' : 'Place order'}
          </button>
        </div>
      </form>
    </div>
  )
}
