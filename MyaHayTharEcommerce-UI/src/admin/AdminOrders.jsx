import { useEffect, useState } from 'react'
import { adminConfirmPayment, adminOrder, adminOrders, adminRefundOrder, adminRejectPayment, adminUpdateOrder, resolveStorageUrl } from '../lib/api'
import { PAYMENT_STATUS_LABELS, paymentStatusColor } from '../lib/payments'
import { formatPrice } from '../lib/products'
import AdminModal from './AdminModal'

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const load = () => adminOrders({
    ...(filter ? { status: filter } : {}),
    ...(paymentFilter ? { payment_status: paymentFilter } : {}),
  }).then((r) => setOrders(r.data || r))

  useEffect(() => { load() }, [filter, paymentFilter])

  const updateStatus = async (id, status) => {
    await adminUpdateOrder(id, { status })
    load()
  }

  const addTracking = async (id, tracking) => {
    await adminUpdateOrder(id, { tracking_number: tracking, status: 'shipped' })
    load()
  }

  const refund = async (id) => {
    if (!confirm('Process full refund and restore inventory?')) return
    await adminRefundOrder(id, { type: 'full' })
    load()
  }

  const confirmPayment = async (id) => {
    await adminConfirmPayment(id)
    load()
  }

  const rejectPayment = async (id) => {
    const reason = prompt('Rejection reason (optional):')
    if (reason === null) return
    await adminRejectPayment(id, { reason: reason || undefined })
    load()
  }

  const openDetails = async (id) => {
    setDetailLoading(true)
    try { setSelectedOrder(await adminOrder(id)) } finally { setDetailLoading(false) }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-slate-800">Orders</h1>
        <div className="flex flex-wrap gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">All statuses</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="">All payments</option>
            <option value="slip_submitted">Pending slip review</option>
            <option value="awaiting_slip">Awaiting slip</option>
            <option value="confirmed">Payment confirmed</option>
            <option value="rejected">Payment rejected</option>
          </select>
        </div>
      </div>

      {selectedOrder && (
        <AdminModal title="Order detail" onClose={() => setSelectedOrder(null)} wide>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Order detail</p>
              <h2 className="mt-1 text-xl font-bold text-slate-800">{selectedOrder.order_number}</h2>
              <p className="text-sm text-slate-500">Placed {new Date(selectedOrder.created_at).toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Customer', selectedOrder.email],
              ['Customer type', selectedOrder.is_guest ? 'Guest checkout' : 'Registered customer'],
              ['Payment', `${selectedOrder.payment_method || 'Unknown'} · ${PAYMENT_STATUS_LABELS[selectedOrder.payment_status] || selectedOrder.payment_status || 'Not required'}`],
              ['Total', formatPrice(selectedOrder.total)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 p-4">
            <label className="text-sm text-slate-600">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Order status</span>
              <select value={selectedOrder.status} onChange={async (event) => { await updateStatus(selectedOrder.id, event.target.value); setSelectedOrder({ ...selectedOrder, status: event.target.value }) }} className="rounded-lg border border-slate-200 px-3 py-2 text-sm capitalize">
                {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            <label className="text-sm text-slate-600">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Tracking number</span>
              <input defaultValue={selectedOrder.tracking_number || ''} onBlur={(event) => event.target.value && addTracking(selectedOrder.id, event.target.value)} placeholder="Enter tracking number" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </label>
            {selectedOrder.status !== 'refunded' && <button type="button" onClick={() => refund(selectedOrder.id)} className="rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100">Refund order</button>}
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div>
              <h3 className="font-semibold text-slate-800">Items</h3>
              <div className="mt-2 space-y-2">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 px-3 py-2 text-sm">
                    <span className="text-slate-700">{item.product?.name || 'Product'}</span>
                    <span className="text-slate-500">Qty {item.quantity}</span>
                    <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Fulfillment</h3>
              <dl className="mt-2 space-y-2 rounded-lg border border-slate-100 p-3 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-slate-500">Name</dt><dd>{selectedOrder.first_name} {selectedOrder.last_name}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">Address</dt><dd className="text-right">{selectedOrder.address}, {selectedOrder.city}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">Tracking</dt><dd>{selectedOrder.tracking_number || 'Not assigned'}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-slate-500">Status</dt><dd className="capitalize">{selectedOrder.status}</dd></div>
              </dl>
            </div>
          </div>
        </AdminModal>
      )}
      {detailLoading && <p className="mt-4 text-sm text-slate-500">Loading order detail...</p>}

      <div className="mt-6 space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-800">{o.order_number}</p>
                <p className="text-xs text-slate-500">{o.email} · {o.is_guest ? 'Guest' : 'Registered'}</p>
                {o.payment_method && o.payment_method !== 'card' && (
                  <p className="mt-1 text-xs capitalize text-slate-600">Paid via {o.payment_method.replace('_', ' ')}</p>
                )}
              </div>
              <p className="font-semibold">{formatPrice(o.total)}</p>
              <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-sm capitalize">
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <button type="button" onClick={() => openDetails(o.id)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-pink hover:text-pink">View detail</button>
            </div>

            {o.payment_status && o.payment_status !== 'not_required' && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${paymentStatusColor(o.payment_status)}`}>
                  {PAYMENT_STATUS_LABELS[o.payment_status] || o.payment_status}
                </span>
                {o.payment_status === 'slip_submitted' && (
                  <>
                    <button onClick={() => confirmPayment(o.id)} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700">
                      Confirm payment
                    </button>
                    <button onClick={() => rejectPayment(o.id)} className="rounded-lg bg-amber-100 px-3 py-1.5 text-sm text-amber-800 hover:bg-amber-200">
                      Reject
                    </button>
                  </>
                )}
              </div>
            )}

            {o.payment_slip_url && (() => {
              const slipUrl = resolveStorageUrl(o.payment_slip_url)
              return (
              <div className="mt-3">
                <p className="mb-2 text-xs font-medium text-slate-500">Payment slip</p>
                {slipUrl.endsWith('.pdf') ? (
                  <a href={slipUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-pink hover:underline">
                    View PDF receipt
                  </a>
                ) : (
                  <a href={slipUrl} target="_blank" rel="noreferrer">
                    <img src={slipUrl} alt="Payment slip" className="max-h-48 rounded-lg border border-slate-200 object-contain" />
                  </a>
                )}
              </div>
              )
            })()}

            {o.payment_rejection_reason && (
              <p className="mt-2 text-xs text-red-600">{o.payment_rejection_reason}</p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Tracking number"
                defaultValue={o.tracking_number || ''}
                onBlur={(e) => e.target.value && addTracking(o.id, e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
              />
              {o.status !== 'refunded' && (
                <button onClick={() => refund(o.id)} className="rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100">
                  Refund
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
