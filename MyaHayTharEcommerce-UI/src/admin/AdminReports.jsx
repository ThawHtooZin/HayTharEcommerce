import { useEffect, useState } from 'react'
import { adminProductReport, adminSalesReport } from '../lib/api'
import { formatPrice } from '../lib/products'

export default function AdminReports() {
  const [period, setPeriod] = useState('monthly')
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])

  useEffect(() => {
    adminSalesReport(period).then(setSales)
    adminProductReport().then(setProducts)
  }, [period])

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-slate-800">Reports</h1>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="annually">Annually</option>
        </select>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800">Sales by period</h2>
          <div className="mt-3 space-y-2 text-sm">
            {sales.length === 0 ? (
              <p className="text-slate-400">No sales data yet</p>
            ) : sales.map((s) => (
              <div key={s.period} className="flex justify-between border-b border-slate-50 py-2">
                <span>{s.period}</span>
                <span className="font-semibold">{formatPrice(s.net_sales)} ({s.order_count} orders)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-800">Product performance</h2>
          <div className="mt-3 space-y-2 text-sm">
            {products.slice(0, 10).map((p) => (
              <div key={p.id} className="flex justify-between border-b border-slate-50 py-2">
                <span className="truncate pr-2">{p.name}</span>
                <span className="shrink-0 font-semibold">{p.units_sold || 0} sold · {formatPrice(p.revenue || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
