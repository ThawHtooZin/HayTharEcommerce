import { useEffect, useState } from 'react'
import { adminProducts, adminUpdateProduct } from '../lib/api'
import { formatPrice } from '../lib/products'

export default function AdminProducts() {
  const [products, setProducts] = useState([])

  const load = () => adminProducts().then((r) => setProducts(r.data || r))

  useEffect(() => { load() }, [])

  const adjustStock = async (id, stock) => {
    await adminUpdateProduct(id, { stock: Number(stock), in_stock: Number(stock) > 0 })
    load()
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-800">Products & Inventory</h1>
      <p className="mt-1 text-sm text-slate-500">{products.length} products in catalog</p>

      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-slate-50">
                <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                <td className="px-4 py-3">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">
                  <input
                    type="number"
                    defaultValue={p.stock ?? 100}
                    min={0}
                    onBlur={(e) => adjustStock(p.id, e.target.value)}
                    className="w-20 rounded border border-slate-200 px-2 py-1"
                  />
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${p.in_stock ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {p.in_stock ? 'In stock' : 'Out of stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
