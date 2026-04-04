import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('emergency_user')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
        axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`
      } catch (err) {
        localStorage.removeItem('emergency_user')
      }
    }
    setLoading(false)

    // Global Axios Response Interceptor to catch 401s
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          // Token is invalid/expired (happens if you re-seed the DB)
          localStorage.removeItem('emergency_user')
          delete axios.defaults.headers.common['Authorization']
          setUser(null)
          // Optionally, you can redirect to login here, or just let ProtectedRoute handle it
        }
        return Promise.reject(error)
      }
    )

    return () => {
      axios.interceptors.response.eject(interceptor)
    }
  }, [])

  const login = async (email, password, role) => {
    const res = await axios.post('/api/auth/login', { email, password, role })
    const { user: userData, token } = res.data
    const userWithToken = { ...userData, token }
    localStorage.setItem('emergency_user', JSON.stringify(userWithToken))
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userWithToken)
    return userWithToken
  }

  const register = async (data) => {
    const res = await axios.post('/api/auth/register', data)
    const { user: userData, token } = res.data
    const userWithToken = { ...userData, token }
    localStorage.setItem('emergency_user', JSON.stringify(userWithToken))
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userWithToken)
    return userWithToken
  }

  const logout = () => {
    localStorage.removeItem('emergency_user')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
