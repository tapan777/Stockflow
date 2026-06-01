import { useState, useEffect, useCallback } from 'react'
import { subscribe } from '../../lib/toast'

const CONFIG = {
  success: {
    bar: 'bg-emerald-500',
    icon: (
      <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    ),
  },
  error: {
    bar: 'bg-red-500',
    icon: (
      <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    ),
  },
  warning: {
    bar: 'bg-yellow-500',
    icon: (
      <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
        <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
    ),
  },
}

function ToastItem({ id, type, message, onRemove }) {
  const [show, setShow] = useState(false)
  const cfg = CONFIG[type] || CONFIG.success

  useEffect(() => {
    const t1 = setTimeout(() => setShow(true), 10)
    const t2 = setTimeout(() => setShow(false), 2600)
    const t3 = setTimeout(() => onRemove(id), 3000)
    return () => [t1, t2, t3].forEach(clearTimeout)
  }, [id, onRemove])

  return (
    <div
      className={`
        relative flex items-center gap-3 bg-white rounded-2xl shadow-xl border border-gray-100
        px-4 py-3 w-80 overflow-hidden cursor-default
        transition-all duration-300 ease-out
        ${show ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}
      `}
    >
      {cfg.icon}

      <p className="text-sm font-medium text-gray-800 flex-1 leading-snug">{message}</p>

      <button
        onClick={() => onRemove(id)}
        className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Progress bar */}
      <div className={`absolute bottom-0 left-0 h-0.5 ${cfg.bar} transition-all duration-[2600ms] ease-linear ${show ? 'w-0' : 'w-full'}`} />
    </div>
  )
}

export default function Toaster() {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), [])

  useEffect(() => {
    return subscribe(t => setToasts(prev => [...prev, t]))
  }, [])

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem {...t} onRemove={remove} />
        </div>
      ))}
    </div>
  )
}
