import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(() => {
    const saved = localStorage.getItem('ssp_user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(true)

  // On mount: verify the stored token is still valid
  useEffect(() => {
    const verify = async () => {
      const token = localStorage.getItem('ssp_token')
      if (!token) { setLoading(false); return }
      try {
        const { data } = await api.get('/auth/me')
        setUser(data.user)
        localStorage.setItem('ssp_user', JSON.stringify(data.user))
      } catch {
        // Token expired or invalid — clear storage
        localStorage.removeItem('ssp_token')
        localStorage.removeItem('ssp_user')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('ssp_token', data.token)
    localStorage.setItem('ssp_user',  JSON.stringify(data.user))
    setUser(data.user)
    return data
  }, [])

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password })
    localStorage.setItem('ssp_token', data.token)
    localStorage.setItem('ssp_user',  JSON.stringify(data.user))
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('ssp_token')
    localStorage.removeItem('ssp_user')
    setUser(null)
    toast.success('Logged out')
  }, [])

  const updateUser = useCallback((updated) => {
    setUser(updated)
    localStorage.setItem('ssp_user', JSON.stringify(updated))
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook — use this everywhere instead of useContext(AuthContext)
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
