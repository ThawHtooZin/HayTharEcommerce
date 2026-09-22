import { useEffect, useState } from 'react'
import { adminConfirmPayment, adminOrder, adminOrders, adminRejectPayment, adminUpdateOrder, resolveStorageUrl } from '../lib/api'
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
  const [activeTab, setActiveTab] = useState('actions')

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
    await adminUpdateOrder(id, { tracking_number: tracking })
    load()
  }

  const confirmPayment = async (id) => {
    await adminConfirmPayment(id)
    setSelectedOrder((order) => order?.id === id ? { ...order, payment_status: 'confirmed', status: 'processing' } : order)
    load()
  }

  const rejectPayment = async (id) => {
    const reason = prompt('Rejection reason (optional):')
    if (reason === null) return
    await adminRejectPayment(id, { reason: reason || undefined })
    setSelectedOrder((order) => order?.id === id ? { ...order, payment_status: 'rejected', status: 'pending', payment_rejection_reason: reason || 'Payment could not be verified. Please upload a clear screenshot.' } : order)
    load()
  }

  const nextStatus = { pending: 'processing', processing: 'shipped', shipped: 'delivered' }
  const statusButtonLabel = { processing: 'Move to Processing', shipped: 'Mark as Shipped', delivered: 'Mark as Delivered' }

  const changeStatus = async (order, status) => {
    await updateStatus(order.id, status)
    setSelectedOrder({ ...order, status })
  }

  const openDetails = async (id) => {
    setDetailLoading(true)
    setActiveTab('actions')
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
        <AdminModal title="Order Management" onClose={() => setSelectedOrder(null)} wide>
          {/* PINNED HEADER */}
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{selectedOrder.order_number}</h2>
              <p className="text-sm text-slate-500">Placed {new Date(selectedOrder.created_at).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-slate-800">{formatPrice(selectedOrder.total)}</p>
              <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${paymentStatusColor(selectedOrder.payment_status)}`}>
                {PAYMENT_STATUS_LABELS[selectedOrder.payment_status] || selectedOrder.payment_status || 'Not required'}
              </span>
            </div>
          </div>

          {/* TAB NAVIGATION */}
          <div className="mt-4 flex gap-6 border-b border-slate-200">
            <button 
              className={`pb-2 text-sm font-semibold transition-colors ${activeTab === 'actions' ? 'border-b-2 border-pink text-pink' : 'text-slate-500 hover:text-slate-800'}`} 
              onClick={() => setActiveTab('actions')}
            >
              Action Center
            </button>
            <button 
              className={`pb-2 text-sm font-semibold transition-colors ${activeTab === 'details' ? 'border-b-2 border-pink text-pink' : 'text-slate-500 hover:text-slate-800'}`} 
              onClick={() => setActiveTab('details')}
            >
              Customer & Items
            </button>
          </div>

          {/* TAB CONTENT */}
          <div className="mt-5">
            {activeTab === 'actions' ? (
              <div className="space-y-5">
                {/* Actionable: Payment Verification */}
                {selectedOrder.payment_status && selectedOrder.payment_status !== 'not_required' && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="mb-3 font-semibold text-slate-800">Payment Verification</h3>
                    {selectedOrder.payment_slip_url && (() => {
                      const slipUrl = resolveStorageUrl(selectedOrder.payment_slip_url)
                      return slipUrl.endsWith('.pdf') ? (
                        <a href={slipUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-pink hover:underline">View payment slip PDF</a>
                      ) : (
                        <a href={slipUrl} target="_blank" rel="noreferrer">
                          <img src={slipUrl} alt="Payment slip" className="max-h-48 rounded-lg border border-slate-200 object-contain shadow-sm" />
                        </a>
                      )
                    })()}
                    
                    {selectedOrder.payment_status === 'slip_submitted' && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button type="button" onClick={() => confirmPayment(selectedOrder.id)} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 shadow-sm">Confirm payment</button>
                        <button type="button" onClick={() => rejectPayment(selectedOrder.id)} className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100">Reject payment</button>
                      </div>
                    )}
                  </div>
                )}

                {/* Actionable: Order Progression & Tracking */}
                <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 p-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-sm text-slate-600">
                      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-400">Update Tracking</span>
                      <input defaultValue={selectedOrder.tracking_number || ''} onBlur={(event) => event.target.value && addTracking(selectedOrder.id, event.target.value)} placeholder="Enter tracking number" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm" />
                    </label>
                  </div>
                  
                  <div className="flex gap-2">
                    {nextStatus[selectedOrder.status] && (
                      <button type="button" onClick={() => changeStatus(selectedOrder, nextStatus[selectedOrder.status])} className="rounded-lg bg-pink px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-pink-dark">
                        {statusButtonLabel[nextStatus[selectedOrder.status]]}
                      </button>
                    )}
                    {!['cancelled', 'refunded', 'delivered'].includes(selectedOrder.status) && (
                      <button type="button" onClick={() => changeStatus(selectedOrder, 'cancelled')} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                        Cancel
                      </button>
                    )}
                    {selectedOrder.status !== 'refunded' && (
                      <button type="button" onClick={() => changeStatus(selectedOrder, 'refunded')} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                        Refund
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Static: Items List */}
                <div>
                  <h3 className="mb-3 font-semibold text-slate-800">Purchased Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                        <span className="text-slate-700 font-medium">{item.product?.name || 'Product'}</span>
                        <span className="text-slate-500">Qty {item.quantity}</span>
                        <span className="font-semibold">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Static: Customer & Fulfillment */}
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-3 font-semibold text-slate-800">Customer Details</h3>
                    <dl className="space-y-2 text-sm text-slate-600">
                      <div className="flex justify-between"><dt className="text-slate-400">Email</dt><dd className="font-medium">{selectedOrder.email}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-400">Account</dt><dd>{selectedOrder.is_guest ? 'Guest Checkout' : 'Registered User'}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-400">Method</dt><dd className="capitalize">{selectedOrder.payment_method?.replace('_', ' ') || 'Unknown'}</dd></div>
                    </dl>
                  </div>
                  
                  <div>
                    <h3 className="mb-3 font-semibold text-slate-800">Fulfillment</h3>
                    <dl className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm space-y-2">
                      <div className="flex justify-between gap-3"><dt className="text-slate-500">Name</dt><dd className="font-medium text-slate-800">{selectedOrder.first_name} {selectedOrder.last_name}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-slate-500">Address</dt><dd className="text-right">{selectedOrder.address}, {selectedOrder.city}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-slate-500">Tracking</dt><dd className="font-mono">{selectedOrder.tracking_number || 'Not assigned'}</dd></div>
                      <div className="flex justify-between gap-3"><dt className="text-slate-500">Status</dt><dd className="capitalize font-semibold text-slate-800">{selectedOrder.status}</dd></div>
                    </dl>
                  </div>
                </div>
              </div>
            )}
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
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm capitalize text-slate-600">{o.status}</span>
              <button type="button" onClick={() => openDetails(o.id)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-pink hover:text-pink">View detail</button>
            </div>

            {o.payment_status && o.payment_status !== 'not_required' && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${paymentStatusColor(o.payment_status)}`}>
                  {PAYMENT_STATUS_LABELS[o.payment_status] || o.payment_status}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}