import { useState, useEffect } from 'react'
import { fetchSettings, saveSettings } from '../api/settingsApi'
import { toast } from '../lib/toast'

export default function Settings() {
  const [settings, setSettings] = useState(null)
  const [threshold, setThreshold] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
      .then(res => {
        setSettings(res.data)
        setThreshold(res.data.defaultLowStockThreshold ?? 5)
      })
      .catch(err => toast('error', err.message))
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await saveSettings(Number(threshold))
      setSettings(res.data)
      toast('success', res.message)
    } catch (err) {
      toast('error', err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-gray-400 text-sm">Loading settings...</div>

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Settings</h2>
        <p className="text-gray-500 text-sm mt-1">Manage your organization preferences</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-8 max-w-lg">
        <div className="mb-6 pb-6 border-b border-gray-100">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Organization</p>
          <p className="text-gray-800 font-semibold text-lg">{settings?.organizationName}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Default Low Stock Threshold
            </label>
            <input
              type="number"
              value={threshold}
              onChange={e => setThreshold(e.target.value)}
              min={0}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            />
            <p className="text-xs text-gray-400 mt-2">
              Products with quantity ≤ this value are flagged as low stock when no product-specific threshold is set.
            </p>
          </div>
          <button type="submit" disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors disabled:opacity-60 text-sm shadow-sm">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  )
}
