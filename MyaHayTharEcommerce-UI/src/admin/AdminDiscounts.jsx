import { useEffect, useState } from 'react'
import { adminCreateDiscount, adminDiscounts } from '../lib/api'

export default function AdminDiscounts() {
  const [codes, setCodes] = useState([])
  const [form, setForm] = useState({ code: '', type: 'percent', value: 10, usage_limit: '', expires_at: '' })

  const load = () => adminDiscounts().then(setCodes)

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    await adminCreateDiscount({
      ...form,
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      expires_at: form.expires_at || null,
    })
    setForm({ code: '', type: 'percent', value: 10, usage_limit: '', expires_at: '' })
    load()
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-800">Promotions</h1>

      <form onSubmit={handleCreate} className="mt-6 flex flex-wrap gap-3 rounded-xl bg-white p-4 shadow-sm">
        <input placeholder="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
          <option value="percent">Percent</option>
          <option value="fixed">Fixed</option>
        </select>
        <input type="number" placeholder="Value" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        <input type="number" placeholder="Usage limit" value={form.usage_limit} onChange={(e) => setForm({ ...form, usage_limit: e.target.value })} className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        <button type="submit" className="rounded-lg bg-pink px-4 py-2 text-sm font-semibold text-white">Create</button>
      </form>

      <div className="mt-4 space-y-2">
        {codes.map((c) => (
          <div key={c.id} className="flex justify-between rounded-xl bg-white p-4 shadow-sm">
            <div>
              <p className="font-bold text-slate-800">{c.code}</p>
              <p className="text-sm text-slate-500">{c.type === 'percent' ? `${c.value}% off` : `$${c.value} off`}</p>
            </div>
            <div className="text-right text-sm text-slate-500">
              <p>Used {c.times_used}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</p>
              <p className={c.is_active ? 'text-emerald-600' : 'text-red-500'}>{c.is_active ? 'Active' : 'Inactive'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
