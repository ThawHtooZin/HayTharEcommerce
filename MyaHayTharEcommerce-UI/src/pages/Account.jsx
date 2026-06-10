import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Lock, MapPin, Package, Settings, Sparkles } from 'lucide-react'
import { getGuestOrders, getOrders, upgradeGuest } from '../lib/api'
import { formatPrice } from '../lib/products'
import { useApp } from '../context/AppContext'

const statusColors = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-sky-100 text-sky-700',
  confirmed: 'bg-sky-100 text-sky-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  refunded: 'bg-slate-100 text-slate-600',
}

function UpgradeForm({ onSuccess, email }) {
  const { showToast } = useApp()
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailExists, setEmailExists] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== passwordConfirm) {
      showToast('Passwords do not match', 'error')
      return
    }
    setLoading(true)
    setEmailExists(false)
    try {
      const data = await upgradeGuest({ password, password_confirmation: passwordConfirm })
      onSuccess(data)
      showToast('Welcome to the cuteness club! Full account unlocked 💖')
    } catch (err) {
      const data = err.response?.data
      const msg = data?.errors
        ? Object.values(data.errors).flat()[0]
        : data?.message || 'Upgrade failed — please try again'
      setEmailExists(!!data?.errors?.email)
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <input type="password" placeholder="Choose a password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="w-full rounded-2xl border border-blush bg-white px-4 py-3 text-sm outline-none focus:border-pink" />
      <input type="password" placeholder="Confirm password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} required className="w-full rounded-2xl border border-blush bg-white px-4 py-3 text-sm outline-none focus:border-pink" />
      <button type="submit" disabled={loading} className="w-full rounded-full bg-pink py-3 text-sm font-semibold text-white hover:bg-pink-dark disabled:opacity-50">
        {loading ? 'Upgrading...' : 'Upgrade to full account'}
      </button>
      {emailExists && (
        <p className="text-center text-sm text-plum/60">
          Already upgraded?{' '}
          <Link to={`/auth?email=${encodeURIComponent(email || '')}`} className="font-semibold text-pink hover:underline">
            Sign in instead
          </Link>
        </p>
      )}
    </form>
  )
}

export default function Account() {
  const {
    user, guest, isGuest, logout, logoutGuest, currency, reduceMotion, setReduceMotion,
    wishlist, setUserFromAuth, loadSession,
  } = useApp()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [tab, setTab] = useState('orders')

  useEffect(() => {
    if (user) {
      getOrders().then(setOrders).catch(() => {})
    } else if (guest) {
      getGuestOrders().then(setOrders).catch(() => {})
    }
  }, [user, guest])

  if (!user && !guest) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center lg:px-8">
        <h1 className="font-display text-3xl font-bold text-plum">My account</h1>
        <p className="mt-4 text-plum/60">
          Checkout as a guest and we'll create a password-free account saved to your browser.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/shop" className="rounded-full bg-pink px-6 py-3 text-sm font-semibold text-white">
            Start shopping
          </Link>
          <Link to="/auth" className="rounded-full border border-blush px-6 py-3 text-sm font-semibold text-plum hover:border-pink">
            Sign in with password
          </Link>
        </div>
        <Link to="/track-order" className="mt-4 inline-block text-xs text-pink hover:underline">
          Lost your guest session? Track by email + order number
        </Link>
      </div>
    )
  }

  const handleLogout = async () => {
    if (user) await logout()
    else logoutGuest()
    navigate('/')
  }

  const memberTabs = [
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const guestTabs = [
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'upgrade', label: 'Go full member', icon: Sparkles },
  ]

  const tabs = isGuest ? guestTabs : memberTabs
  const name = user?.name?.split(' ')[0] || guest?.name?.split(' ')[0] || 'cutie'

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-display text-3xl font-bold text-plum">Hi, {name} 👋</h1>
        {isGuest && (
          <span className="rounded-full bg-blush px-3 py-0.5 text-xs font-semibold text-pink">Guest</span>
        )}
      </div>
      <p className="mt-1 text-plum/60">
        {isGuest
          ? 'Your orders are saved on this device — no password needed.'
          : 'Manage your orders, wishlist and details.'}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-4">
        <aside className="rounded-2xl bg-white p-4 shadow-sm">
          <nav className="space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  tab === id ? 'bg-blush text-pink' : 'text-plum/70 hover:bg-blush/50'
                }`}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </nav>
          {isGuest && (
            <div className="mt-4 rounded-xl bg-blush/40 p-3 text-xs text-plum/60">
              <Lock size={12} className="mb-1 inline text-pink" />
              {' '}Guests can't edit profile, addresses, or synced wishlists.
            </div>
          )}
          <button onClick={handleLogout} className="mt-4 w-full px-4 py-2 text-left text-sm text-plum/50 hover:text-pink">
            {isGuest ? 'Clear guest session' : 'Sign out'}
          </button>
        </aside>

        <div className="lg:col-span-3">
          {tab === 'orders' && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold text-plum">Your orders</h2>
              {orders.length === 0 ? (
                <p className="mt-4 text-sm text-plum/50">No orders yet. Time to shop!</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {orders.map((order) => (
                    <div key={order.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blush/60 p-4">
                      <div>
                        <p className="font-semibold text-sm">{order.order_number}</p>
                        <p className="text-xs text-plum/50">{new Date(order.created_at).toLocaleDateString()}</p>
                        {order.tracking_number && (
                          <p className="text-xs text-pink">Tracking: {order.tracking_number}</p>
                        )}
                      </div>
                      <span className="font-semibold text-sm">{formatPrice(order.total, currency)}</span>
                      <span className={`rounded-full px-3 py-0.5 text-xs font-semibold capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'upgrade' && isGuest && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold text-plum">Upgrade to full account</h2>
              <p className="mt-2 text-sm text-plum/60">
                Add a password to unlock profile editing, saved addresses, synced wishlists, and access from any device.
              </p>
              <p className="mt-1 text-xs text-plum/40">Email: {guest.email}</p>
              <UpgradeForm email={guest.email} onSuccess={(data) => { setUserFromAuth(data); loadSession() }} />
            </div>
          )}

          {tab === 'wishlist' && user && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold text-plum">Wishlist ({wishlist.length})</h2>
              {wishlist.length === 0 ? (
                <p className="mt-4 text-sm text-plum/50">Nothing saved yet.</p>
              ) : (
                <ul className="mt-4 space-y-2">
                  {wishlist.map((p) => (
                    <li key={p.id}>
                      <Link to={`/product/${p.slug}`} className="text-sm text-plum hover:text-pink">{p.name}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === 'addresses' && user && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold text-plum">Default shipping address</h2>
              <p className="mt-4 text-sm text-plum/70">
                {user.name}<br />
                123 Sakura Lane<br />
                Brooklyn, NY 11201<br />
                United States
              </p>
              <button className="mt-4 text-sm font-semibold text-pink hover:underline">Edit address</button>
            </div>
          )}

          {tab === 'settings' && user && (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="font-display text-lg font-semibold text-plum">Settings</h2>
              <p className="mt-2 text-sm text-plum/60">
                Use the ♿ button (bottom-right) for accessibility options.
              </p>
              <label className="mt-4 flex items-center gap-3 text-sm text-plum/70">
                <input type="checkbox" checked={reduceMotion} onChange={(e) => setReduceMotion(e.target.checked)} className="rounded border-blush text-pink focus:ring-pink" />
                Stop animations
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
