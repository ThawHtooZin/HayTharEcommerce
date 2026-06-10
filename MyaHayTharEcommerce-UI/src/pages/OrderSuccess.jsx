import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { formatPrice } from '../lib/products'

export default function OrderSuccess() {
  const { user, guest, currency, reduceMotion, isGuest, displayName } = useApp()
  const { state } = useLocation()
  const order = state?.order
  const M = reduceMotion ? 'div' : motion.div

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-plum/60">No order info found.</p>
        <Link to={guest || user ? '/account' : '/shop'} className="mt-4 inline-block text-sm font-semibold text-pink hover:underline">
          {guest || user ? 'View my orders' : 'Back to shop'}
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <M
        {...(!reduceMotion && {
          initial: { scale: 0 },
          animate: { scale: 1 },
          transition: { type: 'spring', stiffness: 200 },
        })}
        className="text-6xl"
      >
        🎉
      </M>
      <h1 className="mt-4 font-display text-3xl font-bold text-plum">Thank you!</h1>
      <p className="mt-2 text-plum/60">
        Thanks {order.first_name || displayName}! Your cute stuff is on its way.
      </p>

      <div className="mt-8 rounded-3xl bg-white p-6 text-left shadow-sm">
        <div className="flex items-center gap-2 font-display font-semibold text-plum">
          <Package size={18} className="text-pink" />
          {order.order_number}
        </div>
        <p className="mt-2 text-sm text-plum/60">
          Total: <span className="font-semibold text-plum">{formatPrice(order.total, currency)}</span>
        </p>
        {(isGuest || state?.isGuest) && !user && (
          <div className="mt-4 rounded-2xl bg-blush/50 p-4 text-sm text-plum/70">
            <p className="font-semibold text-plum">Guest account created ✨</p>
            <p className="mt-1 text-xs">
              Saved to this browser — no password needed. View your orders anytime in My Account.
            </p>
            <Link to="/account" className="mt-3 inline-block text-sm font-semibold text-pink hover:underline">
              Go to my orders →
            </Link>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link to="/account" className="rounded-full bg-pink px-6 py-3 text-sm font-semibold text-white hover:bg-pink-dark">
          View my orders
        </Link>
        <Link to="/shop" className="rounded-full border border-blush px-6 py-3 text-sm font-semibold text-plum hover:border-pink hover:text-pink">
          Keep shopping
        </Link>
      </div>
    </div>
  )
}
