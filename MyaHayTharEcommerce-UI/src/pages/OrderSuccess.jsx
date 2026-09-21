import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Package, Upload } from 'lucide-react'
import { uploadPaymentSlip } from '../lib/api'
import { isManualPayment, PAYMENT_STATUS_LABELS, paymentStatusColor } from '../lib/payments'
import { useApp } from '../context/AppContext'
import { formatPrice } from '../lib/products'

export default function OrderSuccess() {
  const { user, guest, currency, reduceMotion, isGuest, displayName, showToast } = useApp()
  const { state } = useLocation()
  const [order, setOrder] = useState(state?.order)
  const [slipFile, setSlipFile] = useState(null)
  const [uploading, setUploading] = useState(false)
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

  const manual = isManualPayment(order.payment_method)
  const canReupload = manual && ['awaiting_slip', 'rejected'].includes(order.payment_status)

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!slipFile) return
    setUploading(true)
    try {
      const updated = await uploadPaymentSlip({
        order_number: order.order_number,
        email: order.email,
        payment_slip: slipFile,
      })
      setOrder(updated)
      setSlipFile(null)
      showToast('Payment slip uploaded — we’ll review it soon!')
    } catch (err) {
      const msg = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat()[0]
        : 'Upload failed'
      showToast(msg, 'error')
    } finally {
      setUploading(false)
    }
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
        {manual && order.payment_status === 'slip_submitted' ? '⏳' : '🎉'}
      </M>
      <h1 className="mt-4 font-display text-3xl font-bold text-plum">
        {manual && order.payment_status !== 'confirmed' ? 'Order received!' : 'Thank you!'}
      </h1>
      <p className="mt-2 text-plum/60">
        Thanks {order.first_name || displayName}!{' '}
        {manual && order.payment_status === 'slip_submitted'
          ? 'We’re reviewing your payment slip.'
          : 'Your cute stuff is on its way.'}
      </p>

      <div className="mt-8 rounded-3xl bg-white p-6 text-left shadow-sm">
        <div className="flex items-center gap-2 font-display font-semibold text-plum">
          <Package size={18} className="text-pink" />
          {order.order_number}
        </div>
        <p className="mt-2 text-sm text-plum/60">
          Total: <span className="font-semibold text-plum">{formatPrice(order.total, currency)}</span>
        </p>
        {manual && (
          <div className="mt-3 flex items-center gap-2">
            <Clock size={14} className="text-plum/50" />
            <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${paymentStatusColor(order.payment_status)}`}>
              {PAYMENT_STATUS_LABELS[order.payment_status] || order.payment_status}
            </span>
          </div>
        )}
        {order.payment_status === 'rejected' && order.payment_rejection_reason && (
          <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-700">{order.payment_rejection_reason}</p>
        )}
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
        {canReupload && (
          <form onSubmit={handleUpload} className="mt-4 rounded-2xl border border-blush bg-blush/20 p-4">
            <p className="text-sm font-semibold text-plum">Upload payment slip</p>
            <label className="mt-3 flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-pink/40 bg-white px-4 py-5 text-center">
              <Upload size={20} className="text-pink" />
              <span className="mt-2 text-xs text-plum">{slipFile ? slipFile.name : 'Choose screenshot'}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={(e) => setSlipFile(e.target.files?.[0] || null)} />
            </label>
            <button type="submit" disabled={!slipFile || uploading} className="mt-3 w-full rounded-full bg-pink py-2 text-sm font-semibold text-white disabled:opacity-50">
              {uploading ? 'Uploading...' : 'Submit slip'}
            </button>
          </form>
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
