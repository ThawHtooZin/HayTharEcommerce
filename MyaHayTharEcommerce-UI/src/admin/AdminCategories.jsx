import { useEffect, useState } from 'react'
import { FolderPlus, Pencil, Trash2 } from 'lucide-react'
import { adminCategories, adminCreateCategory, adminDeleteCategory, adminUpdateCategory } from '../lib/api'
import { useApp } from '../context/AppContext'
import AdminModal from './AdminModal'

const emptyForm = { name: '', description: '', image: '' }

export default function AdminCategories() {
  const { showToast } = useApp()
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = () => adminCategories().then(setCategories).catch(() => showToast('Could not load categories', 'error'))

  useEffect(() => { load() }, [])

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (category) => {
    setEditingId(category.id)
    setForm({
      name: category.name || '',
      description: category.description || '',
      image: category.image || '',
    })
    setModalOpen(true)
  }

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      if (editingId) await adminUpdateCategory(editingId, form)
      else await adminCreateCategory(form)
      setModalOpen(false)
      showToast(editingId ? 'Category updated' : 'Category created')
      load()
    } catch (error) {
      const message = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat()[0]
        : error.response?.data?.message || 'Could not save category'
      showToast(message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (category) => {
    if (!window.confirm(`Delete "${category.name}"? Categories with products must be emptied first.`)) return
    try {
      await adminDeleteCategory(category.id)
      showToast('Category deleted')
      load()
    } catch (error) {
      showToast(error.response?.data?.message || 'Could not delete category', 'error')
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Catalog structure</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-slate-800">Categories</h1>
          <p className="mt-1 text-sm text-slate-500">Organize products into clear storefront collections.</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">
          <FolderPlus size={16} /> Add category
        </button>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400">Total categories</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{categories.length}</p>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-400">Products organized</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">{categories.reduce((total, category) => total + Number(category.products_count || 0), 0)}</p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Products</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-4 font-semibold text-slate-800">{category.name}</td>
                <td className="px-4 py-4 text-slate-500">/{category.slug}</td>
                <td className="px-4 py-4 text-slate-600">{category.products_count || 0}</td>
                <td className="max-w-sm px-4 py-4 text-slate-500">{category.description || 'No description'}</td>
                <td className="px-4 py-4 text-right">
                  <button type="button" onClick={() => openEdit(category)} aria-label={`Edit ${category.name}`} className="mr-3 text-slate-500 hover:text-pink"><Pencil size={16} /></button>
                  <button type="button" onClick={() => remove(category)} aria-label={`Delete ${category.name}`} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr><td colSpan="5" className="px-4 py-12 text-center text-slate-500">No categories yet. Add your first catalog collection.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <AdminModal title={editingId ? 'Edit category' : 'Add category'} onClose={() => setModalOpen(false)}>
          <form onSubmit={save} className="space-y-4">
            <label className="block text-sm font-medium text-slate-700">
              Category name
              <input value={form.name} onChange={(event) => update('name', event.target.value)} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Description
              <textarea value={form.description} onChange={(event) => update('description', event.target.value)} rows={3} className="mt-1 w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Image filename
              <input value={form.image} onChange={(event) => update('image', event.target.value)} placeholder="Optional" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </label>
            <button type="submit" disabled={saving} className="rounded-lg bg-pink px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {saving ? 'Saving...' : editingId ? 'Save changes' : 'Create category'}
            </button>
          </form>
        </AdminModal>
      )}
    </div>
  )
}
