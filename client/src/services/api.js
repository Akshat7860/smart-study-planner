import axios from 'axios'

// Base URL:
// - Development: blank → Vite proxy handles /api → localhost:5000 (see vite.config.js)
// - Production:  set VITE_API_URL in client/.env to your backend URL
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000, // 10 second timeout — prevents hanging forever
})

// Attach JWT token to every request automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ssp_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

// Global response handler
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Token expired or invalid → auto logout
    if (err.response?.status === 401) {
      const isAuthRoute = err.config?.url?.includes('/auth/login') ||
                          err.config?.url?.includes('/auth/register')
      if (!isAuthRoute) {
        localStorage.removeItem('ssp_token')
        localStorage.removeItem('ssp_user')
        window.location.href = '/login'
      }
    }

    // Network error (server not running, no internet)
    if (!err.response) {
      err.message = 'Cannot connect to server. Make sure the backend is running on port 5000.'
    }

    return Promise.reject(err)
  }
)

export default api
