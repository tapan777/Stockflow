import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from '../lib/toast'

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

function validate({ organizationName, email, password, confirmPassword }) {
  const e = {}
  if (!organizationName.trim()) e.organizationName = 'Organization name is required'
  else if (organizationName.trim().length < 2) e.organizationName = 'Name must be at least 2 characters'

  if (!email.trim()) e.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'Enter a valid email address'

  if (!password) e.password = 'Password is required'
  else if (password.length < 6) e.password = 'Password must be at least 6 characters'

  if (!confirmPassword) e.confirmPassword = 'Please confirm your password'
  else if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match'

  return e
}

const fieldCls = (err) =>
  `w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent text-sm transition-colors ${
    err ? 'border-red-400 focus:ring-red-400 bg-red-50' : 'border-gray-300 focus:ring-indigo-500'
  }`

export default function Signup() {
  const [form, setForm]       = useState({ organizationName: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors]   = useState({})
  const [loading, setLoading] = useState(false)
  const { signup } = useAuth()
  const navigate   = useNavigate()

  const set      = (f) => (e) => { setForm(p => ({ ...p, [f]: e.target.value })); clearErr(f) }
  const clearErr = (f) => setErrors(p => ({ ...p, [f]: '' }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fe = validate(form)
    if (Object.keys(fe).length) { setErrors(fe); return }
    setLoading(true)
    try {
      const res = await signup(form.email, form.password, form.organizationName)
      toast('success', res.message)
      navigate('/')
    } catch (err) {
      toast('error', err.message)
      if (err.message.toLowerCase().includes('email')) setErrors({ email: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-500 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">StockFlow</h1>
          <p className="text-indigo-300 mt-1 text-sm">Inventory Management System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Organization Name</label>
              <input type="text" value={form.organizationName} onChange={set('organizationName')}
                className={fieldCls(errors.organizationName)} placeholder="My Store" />
              <FieldError msg={errors.organizationName} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={set('email')}
                autoComplete="email" className={fieldCls(errors.email)} placeholder="you@example.com" />
              <FieldError msg={errors.email} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" value={form.password} onChange={set('password')}
                autoComplete="new-password" className={fieldCls(errors.password)} placeholder="Min. 6 characters" />
              <FieldError msg={errors.password} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')}
                autoComplete="new-password" className={fieldCls(errors.confirmPassword)} placeholder="••••••••" />
              <FieldError msg={errors.confirmPassword} />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
