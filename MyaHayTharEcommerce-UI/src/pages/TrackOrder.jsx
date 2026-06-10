import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Search, Truck } from 'lucide-react'
import { claimAccount, trackOrder } from '../lib/api'
import { getGuestOrders } from '../lib/guestOrders'
import { formatPrice, productImage } from '../lib/products'
import { useApp } from '../context/AppContext'

const statusLabels = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
}

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-sky-100 text-sky-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-slate-100 text-slate-600',
}

export default function TrackOrder() {
  const { currency, showToast, user } = useApp()
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState([])
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    setRecent(getGuestOrders())
  }, [])

  const lookup = async (num, em) => {
    setLoading(true)
    setOrder(null)
    try {
      const result = await trackOrder(num, em)
      setOrder(result)
    } catch (err) {
      const msg = err.response?.data?.errors?.order_number?.[0] || 'Order not found'
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    lookup(orderNumber.trim(), email.trim())
  }

  const trackRecent = (entry) => {
    setOrderNumber(entry.order_number)
    setEmail(entry.email)
    lookup(entry.order_number, entry.email)
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 lg:px-8">
      <div className="text-center">
        <Package className="mx-auto text-pink" size={32} />
        <h1 className="mt-3 font-display text-3xl font-bold text-plum">Track your order</h1>
        <p className="mt-2 text-sm text-plum/60">
          Guest order? Enter your email and order number to check status.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-3 rounded-3xl bg-white p-6 shadow-sm">
        <input
          type="text"
          placeholder="Order number (e.g. HT-ABC12345)"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          required
          className="w-full rounded-2xl border border-blush bg-cream px-4 py-3 text-sm uppercase outline-none focus:border-pink"
        />
        <input
          type="email"
          placeholder="Email used at checkout"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-2xl border border-blush bg-cream px-4 py-3 text-sm outline-none focus:border-pink"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-pink py-3 text-sm font-semibold text-white hover:bg-pink-dark disabled:opacity-50"
        >
          <Search size={16} />
          {loading ? 'Looking up...' : 'Track order'}
        </button>
      </form>

      {recent.length > 0 && !order && (
        <div className="mt-6 rounded-2xl bg-blush/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-plum/50">Orders on this device</p>
          <div className="mt-2 space-y-2">
            {recent.map((entry) => (
              <button
                key={entry.order_number}
                type="button"
                onClick={() => trackRecent(entry)}
                className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-left text-sm hover:bg-blush/30"
              >
                <span className="font-semibold text-plum">{entry.order_number}</span>
                <span className="text-plum/50">{formatPrice(entry.total, currency)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {order && (
        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-plum">{order.order_number}</h2>
            <span className={`rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${statusColors[order.status] || 'bg-gray-100'}`}>
              {statusLabels[order.status] || order.status}
            </span>
          </div>
          <p className="mt-1 text-xs text-plum/50">
            Placed {new Date(order.created_at).toLocaleDateString()} · {order.email}
          </p>

          {order.tracking_number && (
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-blush/50 px-4 py-3 text-sm">
              <Truck size={16} className="text-pink" />
              <span>Tracking: <strong>{order.tracking_number}</strong></span>
            </div>
          )}

          <div className="mt-4 space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img
                  src={productImage(item.product.image)}
                  alt={item.product.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-plum">{item.product.name}</p>
                  <p className="text-plum/50">Qty {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity, currency)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-blush pt-4 text-sm">
            <div className="flex justify-between font-bold text-plum">
              <span>Total</span>
              <span>{formatPrice(order.total, currency)}</span>
            </div>
          </div>

          {order.is_guest && !user && (
            <div className="mt-6 rounded-2xl bg-blush/50 p-4 text-left">
              <h3 className="font-display text-sm font-semibold text-plum">Save to your account</h3>
              <p className="mt-1 text-xs text-plum/60">Pick a password to link this order permanently.</p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (password !== passwordConfirm) {
                    showToast('Passwords do not match', 'error')
                    return
                  }
                  setClaiming(true)
                  try {
                    const data = await claimAccount({
                      order_number: order.order_number,
                      email: order.email,
                      password,
                      password_confirmation: passwordConfirm,
                    })
                    localStorage.setItem('haythar_token', data.token)
                    showToast('Account created! Order linked 💖')
                    window.location.href = '/account'
                  } catch (err) {
                    const msg = err.response?.data?.errors
                      ? Object.values(err.response.data.errors).flat()[0]
                      : 'Could not create account'
                    showToast(msg, 'error')
                  } finally {
                    setClaiming(false)
                  }
                }}
                className="mt-3 space-y-2"
              >
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="w-full rounded-xl border border-blush bg-white px-3 py-2 text-sm outline-none focus:border-pink" />
                <input type="password" placeholder="Confirm password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required className="w-full rounded-xl border border-blush bg-white px-3 py-2 text-sm outline-none focus:border-pink" />
                <button type="submit" disabled={claiming} className="w-full rounded-full bg-pink py-2 text-sm font-semibold text-white disabled:opacity-50">
                  {claiming ? 'Creating...' : 'Create account'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
