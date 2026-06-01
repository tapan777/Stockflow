import { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentUser, loginUser, signupUser, logoutUser } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (localStorage.getItem('token')) {
      getCurrentUser()
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await loginUser(email, password)
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
    return res
  }

  const signup = async (email, password, organizationName) => {
    const res = await signupUser(email, password, organizationName)
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
    return res
  }

  const logout = async () => {
    try { await logoutUser() } catch (_) {}
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
