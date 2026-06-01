import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { fetchProductById, createProduct, updateProduct } from '../api/productApi'
import { toast } from '../lib/toast'

const EMPTY = {
  name: '', sku: '', description: '',
  quantity_on_hand: 0, cost_price: '', selling_price: '', low_stock_threshold: '',
}

const inputCls = 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm'

function Field({ label, required, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEdit)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isEdit) return
    fetchProductById(id)
      .then(p => setForm({
        name: p.name ?? '',
        sku: p.sku ?? '',
        description: p.description ?? '',
        quantity_on_hand: p.quantity_on_hand ?? 0,
        cost_price: p.cost_price ?? '',
        selling_price: p.selling_price ?? '',
        low_stock_threshold: p.low_stock_threshold ?? '',
      }))
      .catch(err => setError(err.message))
      .finally(() => setFetchLoading(false))
  }, [id, isEdit])

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim() || null,
      quantity_on_hand: parseInt(form.quantity_on_hand, 10) || 0,
      cost_price: form.cost_price !== '' ? parseFloat(form.cost_price) : null,
      selling_price: form.selling_price !== '' ? parseFloat(form.selling_price) : null,
      low_stock_threshold: form.low_stock_threshold !== '' ? parseInt(form.low_stock_threshold, 10) : null,
    }
    try {
      if (isEdit) {
        await updateProduct(id, payload)
        toast('success', 'Product updated successfully')
      } else {
        await createProduct(payload)
        toast('success', 'Product added successfully')
      }
      navigate('/products')
    } catch (err) {
      setError(err.message)
      toast('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) return <div className="text-gray-400 text-sm">Loading product...</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <Link to="/products" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {isEdit ? 'Update product details and stock' : 'Add a new product to your inventory'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-8 max-w-2xl">
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Product Name" required>
              <input type="text" value={form.name} onChange={set('name')} required className={inputCls} placeholder="Blue T-Shirt" />
            </Field>
            <Field label="SKU" required hint="Auto-uppercased. Must be unique per org.">
              <input type="text" value={form.sku} onChange={set('sku')} required className={inputCls} placeholder="SKU-001" />
            </Field>
          </div>

          <Field label="Description">
            <textarea value={form.description} onChange={set('description')} rows={3} className={inputCls + ' resize-none'} placeholder="Optional product description..." />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Field label="Quantity on Hand">
              <input type="number" value={form.quantity_on_hand} onChange={set('quantity_on_hand')} min={0} className={inputCls} />
            </Field>
            <Field label="Cost Price">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" value={form.cost_price} onChange={set('cost_price')} step="0.01" min={0} className={inputCls + ' pl-7'} placeholder="0.00" />
              </div>
            </Field>
            <Field label="Selling Price">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" value={form.selling_price} onChange={set('selling_price')} step="0.01" min={0} className={inputCls + ' pl-7'} placeholder="0.00" />
              </div>
            </Field>
          </div>

          <Field label="Low Stock Threshold" hint="Leave empty to use the global default from Settings.">
            <input type="number" value={form.low_stock_threshold} onChange={set('low_stock_threshold')} min={0} className={inputCls + ' max-w-xs'} placeholder="e.g. 10" />
          </Field>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors disabled:opacity-60 text-sm shadow-sm">
              {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
            </button>
            <button type="button" onClick={() => navigate('/products')} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-8 rounded-xl transition-colors text-sm">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
