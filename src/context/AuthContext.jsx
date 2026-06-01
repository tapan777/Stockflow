import { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentUser, loginUser, signupUser, logoutUser } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (localStorage.getItem('token')) {
      getCurrentUser()
        .then(setUser)
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const data = await loginUser(email, password)
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  const signup = async (email, password, organizationName) => {
    const data = await signupUser(email, password, organizationName)
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  const logout = async () => {
    try { await logoutUser() } catch (_) { /* token may already be invalid */ }
    localStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
