import { useEffect, useState } from 'react'
import { adminCustomers, adminNewsletter } from '../lib/api'
import { formatPrice } from '../lib/products'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('customers')

  useEffect(() => {
    adminCustomers(search ? { search } : {}).then((r) => setCustomers(r.data || r))
    adminNewsletter().then(setSubscribers)
  }, [search])

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-800">CRM</h1>

      <div className="mt-4 flex gap-2">
        <button onClick={() => setTab('customers')} className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === 'customers' ? 'bg-pink text-white' : 'bg-white text-slate-600'}`}>
          Customers
        </button>
        <button onClick={() => setTab('newsletter')} className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === 'newsletter' ? 'bg-pink text-white' : 'bg-white text-slate-600'}`}>
          Newsletter ({subscribers.length})
        </button>
      </div>

      {tab === 'customers' && (
        <>
          <input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-4 w-full max-w-md rounded-lg border border-slate-200 px-4 py-2 text-sm"
          />
          <div className="mt-4 space-y-2">
            {customers.map((c) => (
              <div key={c.id} className="flex flex-wrap justify-between rounded-xl bg-white p-4 shadow-sm">
                <div>
                  <p className="font-semibold text-slate-800">{c.name}</p>
                  <p className="text-sm text-slate-500">{c.email}</p>
                </div>
                <div className="text-right text-sm">
                  <p>{c.orders_count} orders</p>
                  <p className="font-semibold text-pink">{formatPrice(c.lifetime_value || 0)} LTV</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'newsletter' && (
        <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">Export-ready subscriber list</p>
          <ul className="mt-3 max-h-96 space-y-1 overflow-y-auto text-sm">
            {subscribers.map((s) => (
              <li key={s.id} className="text-slate-700">{s.email}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
