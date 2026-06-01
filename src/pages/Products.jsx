import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { fetchProducts, deleteProduct, adjustProductStock } from '../api/productApi'
import { toast } from '../lib/toast'
import ConfirmModal from '../components/ui/ConfirmModal'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [adjusting, setAdjusting] = useState(null)
  const [adjustValue, setAdjustValue] = useState('')
  const [adjustError, setAdjustError] = useState('')

  const loadProducts = useCallback((q = '') => {
    fetchProducts(q)
      .then(res => setProducts(res.data))
      .catch(err => toast('error', err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { loadProducts() }, [loadProducts])

  const handleSearch = (e) => {
    const v = e.target.value
    setSearch(v)
    loadProducts(v)
  }

  const handleDeleteConfirm = async () => {
    try {
      const res = await deleteProduct(deleteTarget.id)
      setProducts(prev => prev.filter(p => p.id !== deleteTarget.id))
      toast('success', res.message)
    } catch (err) {
      toast('error', err.message)
    } finally {
      setDeleteTarget(null)
    }
  }

  const openAdjust = (id) => { setAdjusting(id); setAdjustValue(''); setAdjustError('') }

  const handleAdjust = async (product) => {
    const adj = parseInt(adjustValue, 10)
    if (isNaN(adj) || adj === 0) return setAdjustError('Enter a non-zero number')
    try {
      const res = await adjustProductStock(product.id, adj)
      setProducts(prev => prev.map(p => p.id === product.id ? res.data : p))
      setAdjusting(null)
      setAdjustValue('')
      toast('success', res.message)
    } catch (err) {
      setAdjustError(err.message)
    }
  }

  const isLowStock = (p) => p.quantity_on_hand <= (p.low_stock_threshold ?? 5)

  if (loading) return <div className="text-gray-400 text-sm">Loading products...</div>

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Products</h2>
          <p className="text-gray-500 text-sm mt-0.5">{products.length} product{products.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/products/new"
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm w-full sm:w-auto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={handleSearch} placeholder="Search by name or SKU..."
              className="w-full sm:max-w-sm pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm" />
          </div>
        </div>

        {products.length === 0 ? (
          <div className="py-14 text-center">
            <div className="text-4xl mb-3">📦</div>
            <p className="text-gray-500 font-medium text-sm">{search ? 'No products found' : 'No products yet'}</p>
            {!search && <Link to="/products/new" className="mt-3 inline-block text-indigo-600 hover:underline text-sm font-medium">Add your first product →</Link>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'SKU', 'Quantity', 'Status', 'Price', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="font-medium text-gray-800 text-sm">{product.name}</div>
                      {product.description && <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[160px] sm:max-w-xs">{product.description}</div>}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 font-mono text-gray-500 text-xs sm:text-sm">{product.sku}</td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      {adjusting === product.id ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <input type="number" value={adjustValue}
                              onChange={e => { setAdjustValue(e.target.value); setAdjustError('') }}
                              placeholder="+/-"
                              className="w-16 sm:w-20 px-2 py-1.5 border border-indigo-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                              autoFocus onKeyDown={e => e.key === 'Enter' && handleAdjust(product)} />
                            <button onClick={() => handleAdjust(product)} className="text-xs text-emerald-600 font-semibold hover:underline">Apply</button>
                            <button onClick={() => setAdjusting(null)} className="text-xs text-gray-400 hover:underline">✕</button>
                          </div>
                          {adjustError && <p className="text-xs text-red-500">{adjustError}</p>}
                          <p className="text-xs text-gray-400">Now: {product.quantity_on_hand}</p>
                        </div>
                      ) : (
                        <span className="font-mono text-sm text-gray-700">{product.quantity_on_hand}</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      {isLowStock(product) ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />In Stock
                        </span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-600 text-sm whitespace-nowrap">
                      {product.selling_price != null ? `$${Number(product.selling_price).toFixed(2)}` : '—'}
                    </td>
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => openAdjust(product.id)} title="Adjust stock"
                          className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                          </svg>
                        </button>
                        <Link to={`/products/${product.id}/edit`} title="Edit product"
                          className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </Link>
                        <button onClick={() => setDeleteTarget(product)} title="Delete product"
                          className="p-1.5 sm:p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        variant="danger"
        title="Delete product?"
        description={deleteTarget ? `"${deleteTarget.name}" will be permanently removed.` : ''}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
