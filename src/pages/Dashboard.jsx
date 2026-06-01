import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchDashboardStats } from '../api/dashboardApi'
import { useAuth } from '../context/AuthContext'
import { toast } from '../lib/toast'

function StatCard({ label, value, color, icon }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs sm:text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className="text-2xl sm:text-3xl opacity-20">{icon}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
      .then(res => setData(res.data))
      .catch(err => toast('error', err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-gray-400 text-sm">Loading dashboard...</div>
  if (!data)   return null

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, <span className="font-medium text-gray-700">{user?.organizationName}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Products"       value={data.totalProducts} color="border-indigo-500"  icon="📦" />
        <StatCard label="Total Units in Stock" value={data.totalUnits}    color="border-emerald-500" icon="🏭" />
        <StatCard label="Low Stock Alerts"     value={data.lowStockCount} color="border-red-500"     icon="⚠️" />
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-gray-800">Low Stock Items</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Threshold default: {data.defaultThreshold}</p>
          </div>
          <Link to="/products" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium self-start sm:self-auto">
            View all →
          </Link>
        </div>

        {data.lowStockItems.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-gray-500 font-medium text-sm">All products are well stocked!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead className="bg-gray-50">
                <tr>
                  {['Name', 'SKU', 'Qty on Hand', 'Threshold', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.lowStockItems.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 sm:px-6 py-3 font-medium text-gray-800 text-sm">{item.name}</td>
                    <td className="px-4 sm:px-6 py-3 font-mono text-gray-500 text-xs sm:text-sm">{item.sku}</td>
                    <td className="px-4 sm:px-6 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        {item.quantity_on_hand}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-gray-500 text-sm">
                      {item.low_stock_threshold != null ? item.low_stock_threshold : `${data.defaultThreshold} (def)`}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <Link to={`/products/${item.id}/edit`} title="Edit & restock"
                        className="p-1.5 inline-flex rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
