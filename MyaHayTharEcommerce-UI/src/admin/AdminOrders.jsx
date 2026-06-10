import { useEffect, useState } from 'react'
import { adminOrders, adminRefundOrder, adminUpdateOrder } from '../lib/api'
import { formatPrice } from '../lib/products'

const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('')

  const load = () => adminOrders(filter ? { status: filter } : {}).then((r) => setOrders(r.data || r))

  useEffect(() => { load() }, [filter])

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

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-800">Orders</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="">All statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="mt-6 space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-800">{o.order_number}</p>
                <p className="text-xs text-slate-500">{o.email} · {o.is_guest ? 'Guest' : 'Registered'}</p>
              </div>
              <p className="font-semibold">{formatPrice(o.total)}</p>
              <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-sm capitalize">
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
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
