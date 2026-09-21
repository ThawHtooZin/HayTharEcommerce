import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Upload } from 'lucide-react'
import { getPaymentMethods, placeOrder } from '../lib/api'
import { isManualPayment } from '../lib/payments'
import { useApp } from '../context/AppContext'
import { calcCartTotals, formatPrice, productImage } from '../lib/products'

export default function Checkout() {
  const { cart, clearCart, currency, showToast, user, setGuestSession } = useApp()
  const navigate = useNavigate()
  const totals = calcCartTotals(cart, currency)
  const [loading, setLoading] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState([])
  const [paymentSlip, setPaymentSlip] = useState(null)
  const [form, setForm] = useState({
    email: user?.email || '',
    first_name: user?.name?.split(' ')[0] || '',
    last_name: user?.name?.split(' ').slice(1).join(' ') || '',
    address: '',
    payment_method: 'kpay',
    card_number: '',
    card_expiry: '',
    card_cvc: '',
    discount_code: '',
  })

  useEffect(() => {
    getPaymentMethods().then(setPaymentMethods).catch(() => {})
  }, [])

  const selectedMethod = useMemo(
    () => paymentMethods.find((m) => m.id === form.payment_method),
    [paymentMethods, form.payment_method],
  )

  const manualPayment = isManualPayment(form.payment_method)
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
    if (manualPayment && !paymentSlip) {
      showToast('Please upload your payment screenshot', 'error')
      return
    }
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
      delete payload.card_number
      delete payload.card_expiry
      delete payload.card_cvc

      const order = await placeOrder(payload, manualPayment ? paymentSlip : null)
      clearCart()
      if (!user && order.guest_token) {
        setGuestSession(order.guest_token, order.guest_account)
      }
      navigate('/order-success', {
        state: { order, isGuest: !user },
        replace: true,
      })
    } catch (err) {
      const errors = err.response?.data?.errors
      const msg = errors
        ? Object.values(errors).flat()[0]
        : err.response?.data?.message || 'Something went wrong. Please try again.'
      showToast(msg, 'error')
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
            <textarea
              placeholder="Full address — street, township, city, etc."
              value={form.address}
              onChange={(e) => update('address', e.target.value)}
              required
              rows={3}
              className="mt-3 w-full resize-none rounded-2xl border border-blush bg-white px-4 py-3 text-sm outline-none focus:border-pink"
            />
          </section>

          <section>
            <h2 className="font-display font-semibold text-plum">Payment method</h2>
            <select
              value={form.payment_method}
              onChange={(e) => {
                update('payment_method', e.target.value)
                setPaymentSlip(null)
              }}
              className="mt-2 w-full rounded-2xl border border-blush bg-white px-4 py-3 text-sm outline-none focus:border-pink"
            >
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>{method.label}</option>
              ))}
            </select>

            {manualPayment && selectedMethod && (
              <div className="mt-4 rounded-2xl border border-blush bg-blush/30 p-4 text-sm text-plum/80">
                <p className="font-semibold text-plum">{selectedMethod.label} instructions</p>
                <p className="mt-2">{selectedMethod.instructions}</p>
                <div className="mt-3 space-y-1 rounded-xl bg-white/80 p-3">
                  <p><span className="font-medium">Account name:</span> {selectedMethod.account_name}</p>
                  <p><span className="font-medium">Account / number:</span> {selectedMethod.account_number}</p>
                  {selectedMethod.bank_name && (
                    <p><span className="font-medium">Bank:</span> {selectedMethod.bank_name}</p>
                  )}
                  <p className="pt-1 font-semibold text-pink">
                    Amount to pay: {formatPrice(totals.total, currency)}
                  </p>
                </div>
                <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-pink/40 bg-white px-4 py-6 text-center hover:border-pink">
                  <Upload size={24} className="text-pink" />
                  <span className="mt-2 font-medium text-plum">
                    {paymentSlip ? paymentSlip.name : 'Upload payment screenshot'}
                  </span>
                  <span className="mt-1 text-xs text-plum/50">JPG, PNG, or PDF · max 5MB</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={(e) => setPaymentSlip(e.target.files?.[0] || null)}
                  />
                </label>
                <p className="mt-2 text-xs text-plum/50">
                  Pay first, then upload your transfer slip. We&apos;ll confirm your order after review.
                </p>
              </div>
            )}

            {!manualPayment && (
              <>
                <div className="mt-2 grid gap-3 sm:grid-cols-3">
                  <input type="text" placeholder="Card number" value={form.card_number} onChange={(e) => update('card_number', e.target.value)} className="sm:col-span-1 rounded-2xl border border-blush bg-white px-4 py-3 text-sm outline-none focus:border-pink" />
                  <input type="text" placeholder="MM/YY" value={form.card_expiry} onChange={(e) => update('card_expiry', e.target.value)} className="rounded-2xl border border-blush bg-white px-4 py-3 text-sm outline-none focus:border-pink" />
                  <input type="text" placeholder="CVC" value={form.card_cvc} onChange={(e) => update('card_cvc', e.target.value)} className="rounded-2xl border border-blush bg-white px-4 py-3 text-sm outline-none focus:border-pink" />
                </div>
                <p className="mt-2 flex items-center gap-1 text-xs text-plum/50">
                  <Lock size={12} /> Demo card checkout — no real payment is processed.
                </p>
              </>
            )}
          </section>

          <section>
            <h2 className="font-display font-semibold text-plum">Discount code</h2>
            <input
              type="text"
              placeholder="Enter discount code"
              value={form.discount_code}
              onChange={(e) => update('discount_code', e.target.value)}
              className="mt-2 w-full rounded-2xl border border-blush bg-white px-4 py-3 text-sm outline-none focus:border-pink"
            />
          </section>
        </div>

        <div className="h-fit rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-plum">Your order</h2>
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
            {loading ? 'Placing order...' : manualPayment ? 'Place order & submit slip' : 'Place order'}
          </button>
        </div>
      </form>
    </div>
  )
}
