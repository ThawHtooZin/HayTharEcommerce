import { useEffect, useState } from 'react'
import { adminDashboard } from '../lib/api'
import { formatPrice } from '../lib/products'

export default function AdminDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    adminDashboard().then(setData)
  }, [])

  if (!data) return <p className="text-slate-500">Loading dashboard...</p>

  const { kpis, alerts, recent_orders, top_products } = data

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-800">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Revenue', value: formatPrice(kpis.total_revenue) },
          { label: 'Active Orders', value: kpis.active_orders },
          { label: 'Avg Order Value', value: formatPrice(kpis.average_order_value) },
          { label: 'Customers', value: kpis.total_customers },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="font-semibold text-slate-800">Recent orders</h2>
          <div className="mt-3 space-y-2">
            {recent_orders.map((o) => (
              <div key={o.id} className="flex justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                <span className="font-medium">{o.order_number}</span>
                <span className="text-slate-500">{o.email}</span>
                <span className="font-semibold">{formatPrice(o.total)}</span>
                <span className="capitalize text-pink">{o.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-800">Alerts</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>📦 {alerts.pending_orders} orders processing</li>
              <li>⚠️ {alerts.low_stock_count} products low stock</li>
              <li>👋 {alerts.new_registrations} new signups (7d)</li>
            </ul>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-800">Top sellers</h2>
            <ul className="mt-3 space-y-1 text-sm text-slate-600">
              {top_products.map((p) => (
                <li key={p.name} className="flex justify-between">
                  <span>{p.name}</span>
                  <span className="font-medium">{p.sold} sold</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
