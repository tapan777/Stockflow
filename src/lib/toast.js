// Lightweight event-bus toast — no external dependency
const listeners = new Set()

export function toast(type, message) {
  const id = Date.now() + Math.random()
  listeners.forEach(fn => fn({ id, type, message }))
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
