import axios from 'axios'
import { GetAccessToken, SetAccessToken } from './memory.tokenStore.js'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true
})

// Request interceptor to attach bearer token if available
api.interceptors.request.use((config) => {
  const token = GetAccessToken()
  if (token) {
    config.headers.Authorization = `bearer ${token}`
  }
  return config
})


export const asyncHandler = async (fn) => {
  try {
    return await fn()
  } catch (error) {
    if (error.response.statusCode === 401) {
      api.get('/user/refresh-token')
        .then((res) => {
          SetAccessToken(res.data.data.accessToken)
          return fn()
        })
        .catch((err) => {
          console.log(err.response.message || "could'nt refresh accessToken")
        })
    }
  }
}

export default api



