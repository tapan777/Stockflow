import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { fetchProductById, createProduct, updateProduct } from '../api/productApi'
import { toast } from '../lib/toast'

const EMPTY = {
  name: '', sku: '', description: '',
  quantity_on_hand: '', cost_price: '', selling_price: '', low_stock_threshold: '',
}

const inputCls = (hasError) =>
  `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-colors ${
    hasError
      ? 'border-red-400 focus:ring-red-400 bg-red-50'
      : 'border-gray-300 focus:ring-indigo-500'
  }`

function FieldError({ msg }) {
  if (!msg) return null
  return (
    <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
      {msg}
    </p>
  )
}

function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      <FieldError msg={error} />
      {hint && !error && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

function validate(form) {
  const e = {}

  if (!form.name.trim())
    e.name = 'Product name is required'
  else if (form.name.trim().length < 2)
    e.name = 'Name must be at least 2 characters'

  if (!form.sku.trim())
    e.sku = 'SKU is required'
  else if (/\s/.test(form.sku.trim()))
    e.sku = 'SKU cannot contain spaces'

  if (form.quantity_on_hand === '' || form.quantity_on_hand === null)
    e.quantity_on_hand = 'Quantity is required'
  else if (isNaN(Number(form.quantity_on_hand)) || Number(form.quantity_on_hand) < 0)
    e.quantity_on_hand = 'Quantity must be 0 or greater'
  else if (!Number.isInteger(Number(form.quantity_on_hand)))
    e.quantity_on_hand = 'Quantity must be a whole number'

  if (form.cost_price !== '' && (isNaN(Number(form.cost_price)) || Number(form.cost_price) < 0))
    e.cost_price = 'Cost price must be a positive number'

  if (form.selling_price !== '' && (isNaN(Number(form.selling_price)) || Number(form.selling_price) < 0))
    e.selling_price = 'Selling price must be a positive number'

  if (form.low_stock_threshold !== '' && (isNaN(Number(form.low_stock_threshold)) || Number(form.low_stock_threshold) < 0 || !Number.isInteger(Number(form.low_stock_threshold))))
    e.low_stock_threshold = 'Threshold must be a whole number (0 or greater)'

  return e
}

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return
    fetchProductById(id)
      .then(res => {
        const p = res.data
        setForm({
          name: p.name ?? '',
          sku: p.sku ?? '',
          description: p.description ?? '',
          quantity_on_hand: p.quantity_on_hand ?? '',
          cost_price: p.cost_price ?? '',
          selling_price: p.selling_price ?? '',
          low_stock_threshold: p.low_stock_threshold ?? '',
        })
      })
      .catch(err => toast('error', err.message))
      .finally(() => setFetchLoading(false))
  }, [id, isEdit])

  const set = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    // clear individual field error on change
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fieldErrors = validate(form)
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      toast('error', 'Please fix the errors below before submitting')
      return
    }

    setLoading(true)
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim() || null,
      quantity_on_hand: parseInt(form.quantity_on_hand, 10),
      cost_price: form.cost_price !== '' ? parseFloat(form.cost_price) : null,
      selling_price: form.selling_price !== '' ? parseFloat(form.selling_price) : null,
      low_stock_threshold: form.low_stock_threshold !== '' ? parseInt(form.low_stock_threshold, 10) : null,
    }

    try {
      const res = isEdit
        ? await updateProduct(id, payload)
        : await createProduct(payload)
      toast('success', res.message)
      navigate('/products')
    } catch (err) {
      toast('error', err.message)
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) return <div className="text-gray-400 text-sm">Loading product...</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <Link to="/products" className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{isEdit ? 'Edit Product' : 'Add Product'}</h2>
          <p className="text-gray-500 text-sm mt-0.5">
            {isEdit ? 'Update product details and stock' : 'Add a new product to your inventory'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Product Name" required error={errors.name}>
              <input type="text" value={form.name} onChange={set('name')} className={inputCls(errors.name)} placeholder="Blue T-Shirt" />
            </Field>
            <Field label="SKU" required error={errors.sku} hint="Auto-uppercased · unique per org">
              <input type="text" value={form.sku} onChange={set('sku')} className={inputCls(errors.sku)} placeholder="SKU-001" />
            </Field>
          </div>

          <Field label="Description">
            <textarea value={form.description} onChange={set('description')} rows={3}
              className={inputCls(false) + ' resize-none'} placeholder="Optional product description..." />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Field label="Quantity on Hand" required error={errors.quantity_on_hand}>
              <input type="number" value={form.quantity_on_hand} onChange={set('quantity_on_hand')}
                className={inputCls(errors.quantity_on_hand)} placeholder="0" />
            </Field>
            <Field label="Cost Price" error={errors.cost_price}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" value={form.cost_price} onChange={set('cost_price')} step="0.01"
                  className={inputCls(errors.cost_price) + ' pl-7'} placeholder="0.00" />
              </div>
            </Field>
            <Field label="Selling Price" error={errors.selling_price}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input type="number" value={form.selling_price} onChange={set('selling_price')} step="0.01"
                  className={inputCls(errors.selling_price) + ' pl-7'} placeholder="0.00" />
              </div>
            </Field>
          </div>

          <Field label="Low Stock Threshold" error={errors.low_stock_threshold} hint="Leave empty to use the global default from Settings.">
            <input type="number" value={form.low_stock_threshold} onChange={set('low_stock_threshold')}
              className={inputCls(errors.low_stock_threshold) + ' max-w-xs'} placeholder="e.g. 10" />
          </Field>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors disabled:opacity-60 text-sm shadow-sm">
              {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Add Product'}
            </button>
            <button type="button" onClick={() => navigate('/products')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-8 rounded-xl transition-colors text-sm">
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
