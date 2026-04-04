import axios from 'axios'

// We create an axios instance without a baseURL assuming Vite proxy handles /api/*
const api = axios.create()

// Request interceptor to dynamically attach the token
api.interceptors.request.use(
  (config) => {
    // Attempt to grab token directly if user stores as 'token'
    let token = localStorage.getItem('token')

    // Fallback: check how AuthContext currently stores it ('emergency_user' JSON)
    if (!token) {
      const storedUserExp = localStorage.getItem('emergency_user')
      if (storedUserExp) {
        try {
          const parsedUser = JSON.parse(storedUserExp)
          token = parsedUser.token
        } catch (e) {
          console.error('Failed to parse emergency_user from localStorage', e)
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      console.warn('⚠️ No token found in localStorage for protected route:', config.url)
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for generic error handling (like 401s)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('🔒 401 Unauthorized: Invalid or missing token.', error.response.data)
      localStorage.removeItem('token')
      localStorage.removeItem('emergency_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
