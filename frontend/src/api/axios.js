import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1/user",
  withCredentials: true
})

// Request interceptor to attach bearer token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const errorHandler = async (fn) => {
  try {
    return await fn()
  } catch (error) {
    if (error?.response?.status === 401) {
      console.log("refresh token required or unauthorized")
    }
    throw error
  }
}

export default api



