import { useEffect, useState } from 'react'
import { adminCreateProduct, adminProduct, adminProducts, adminUpdateProduct, getCategories, resolveStorageUrl } from '../lib/api'
import { formatPrice } from '../lib/products'
import AdminModal from './AdminModal'

const emptyForm = {
  category_id: '', name: '', description: '', price: '', compare_at_price: '', image: '', sku: '',
  stock: 0, badge: '',
}

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [stockDraft, setStockDraft] = useState('')
  const [stockSaving, setStockSaving] = useState(false)
  const stockAlertThreshold = 10
  const [modal, setModal] = useState(null)

  const load = () => adminProducts().then((r) => setProducts(r.data || r))

  useEffect(() => { load() }, [])
  useEffect(() => { getCategories().then(setCategories).catch(() => { }) }, [])

  const adjustStock = async (id, stock) => {
    await adminUpdateProduct(id, { stock: Number(stock), in_stock: Number(stock) > 0 })
    load()
  }

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const startEdit = (product) => {
    setEditingId(product.id)
    setForm({
      category_id: product.category_id || product.category?.id || '',
      name: product.name || '', description: product.description || '', price: product.price || '',
      compare_at_price: product.compare_at_price || '', image: product.image || '', sku: product.sku || '',
      stock: product.stock ?? 0, badge: product.badge || '',
    })
  }

  const openDetails = async (product) => {
    const detail = await adminProduct(product.id)
    setSelectedProduct(detail)
    setStockDraft(String(detail.product.stock ?? 0))
    setModal('detail')
  }

  const saveStock = async () => {
    if (stockDraft === '' || Number(stockDraft) < 0) return
    setStockSaving(true)
    try {
      await adjustStock(selectedProduct.product.id, stockDraft)
      await openDetails(selectedProduct.product)
    } finally {
      setStockSaving(false)
    }
  }

  const resetForm = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModal(null)
  }

  const saveProduct = async (event) => {
    event.preventDefault()
    setSaving(true)
    const data = {
      ...form,
      category_id: Number(form.category_id),
      price: Number(form.price),
      compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
      stock: Number(form.stock),
      in_stock: Number(form.stock) > 0,
    }
    try {
      if (editingId) await adminUpdateProduct(editingId, data)
      else await adminCreateProduct(data)
      resetForm()
      load()
    } finally {
      setSaving(false)
    }
  }

  const lowStockCount = products.filter((product) => Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 10).length
  const outOfStockCount = products.filter((product) => Number(product.stock || 0) === 0).length

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-slate-800">Products & Inventory</h1>
      <p className="mt-1 text-sm text-slate-500">{products.length} products in catalog</p>

      <div className="mt-4 flex justify-end">
        <button type="button" onClick={() => { resetForm(); setModal('form') }} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Add product</button>
      </div>

      {modal === 'detail' && selectedProduct && (
        <AdminModal title="Product detail" onClose={() => setModal(null)} wide>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex gap-4">
              <img src={resolveStorageUrl(selectedProduct.product.image)} alt="" className="h-20 w-20 rounded-lg bg-slate-100 object-cover" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Product detail</p>
                <h2 className="mt-1 text-xl font-bold text-slate-800">{selectedProduct.product.name}</h2>
                <p className="text-sm text-slate-500">SKU {selectedProduct.product.sku || 'Not assigned'} · {selectedProduct.product.category?.name || 'Uncategorized'}</p>
              </div>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ['Current stock', selectedProduct.product.stock ?? 0],
              ['Units sold', selectedProduct.product.sold_units ?? 0],
              ['Orders', selectedProduct.product.order_count ?? 0],
              ['Gross revenue', formatPrice(selectedProduct.product.gross_revenue || 0)],
              ['Reviews', selectedProduct.product.review_count ?? 0],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
                <p className="mt-1 font-semibold text-slate-800">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.4fr]">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-800">Stock control</h3>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${Number(stockDraft) === 0 ? 'bg-red-100 text-red-700' : Number(stockDraft) <= stockAlertThreshold ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {Number(stockDraft) === 0 ? 'Out of stock' : Number(stockDraft) <= stockAlertThreshold ? 'Restock alert' : 'Healthy stock'}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-500">Alert threshold: {stockAlertThreshold} units. Set a precise quantity for auditability.</p>
              <div className="mt-4 flex gap-2">
                <input type="number" min="0" value={stockDraft} onChange={(event) => setStockDraft(event.target.value)} className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                <button type="button" onClick={saveStock} disabled={stockSaving} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{stockSaving ? 'Saving...' : 'Save stock'}</button>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Recent order activity</h3>
              <div className="mt-2 space-y-2">
                {selectedProduct.recent_orders?.length ? selectedProduct.recent_orders.map((order) => (
                  <div key={order.id} className="flex flex-wrap justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm">
                    <span className="font-medium text-slate-700">{order.order_number}</span>
                    <span className="text-slate-500">{order.pivot?.quantity || 0} units · {order.status}</span>
                    <span className="text-slate-500">{order.email}</span>
                  </div>
                )) : <p className="text-sm text-slate-500">No orders recorded for this product yet.</p>}
              </div>
            </div>
          </div>
        </AdminModal>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          ['Catalog items', products.length],
          ['Low stock', lowStockCount],
          ['Out of stock', outOfStockCount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
            <p className="mt-1 text-xl font-bold text-slate-800">{value}</p>
          </div>
        ))}
      </div>

      {modal === 'form' && <AdminModal title={editingId ? 'Edit product' : 'Add product'} onClose={() => setModal(null)} wide>
        <form onSubmit={saveProduct}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-800">{editingId ? 'Edit product' : 'Add product'}</h2>
            {editingId && <button type="button" onClick={resetForm} className="text-sm text-slate-500 hover:text-pink">Cancel</button>}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Product name" required className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <select value={form.category_id} onChange={(e) => update('category_id', e.target.value)} required className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="">Category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <input value={form.image} onChange={(e) => update('image', e.target.value)} placeholder="Image filename" required className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => update('price', e.target.value)} placeholder="Price" required className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input type="number" step="0.01" min="0" value={form.compare_at_price} onChange={(e) => update('compare_at_price', e.target.value)} placeholder="Compare-at price" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input type="number" min="0" value={form.stock} onChange={(e) => update('stock', e.target.value)} placeholder="Stock" required className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input value={form.sku} onChange={(e) => update('sku', e.target.value)} placeholder="SKU" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <input value={form.badge} onChange={(e) => update('badge', e.target.value)} placeholder="Badge" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            <textarea value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Description" rows={3} className="rounded-lg border border-slate-200 px-3 py-2 text-sm sm:col-span-2 lg:col-span-3" />
          </div>
          <button type="submit" disabled={saving} className="mt-4 rounded-lg bg-pink px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            {saving ? 'Saving...' : editingId ? 'Save changes' : 'Add product'}
          </button>
        </form>
      </AdminModal>}

      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Sold</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr
                key={p.id}
                className={`border-b border-slate-50 ${
                  Number(p.stock) === 0
                    ? 'bg-red-50'
                    : Number(p.stock) <= stockAlertThreshold
                      ? 'bg-amber-50'
                      : ''
                }`}
              >
                <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                <td className="px-4 py-3">{formatPrice(p.price)}</td>
                <td className="px-4 py-3">
                  {p.stock ?? 100}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${p.in_stock ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {p.in_stock ? 'In stock' : 'Out of stock'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{p.sold_units ?? 0}</td>
                <td className="px-4 py-3 text-right">
                  <button type="button" onClick={() => openDetails(p)} className="mr-3 text-sm font-medium text-slate-600 hover:text-pink">View detail</button>
                  <button type="button" onClick={() => { startEdit(p); setModal('form') }} className="text-sm font-medium text-pink hover:underline">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
