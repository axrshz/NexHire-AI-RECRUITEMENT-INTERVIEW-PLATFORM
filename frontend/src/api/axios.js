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

let refreshPromise = null //flag used to prevent twice api calling by react strictmode
export const asyncHandler = async (fn) => {
  try {
    return await fn()
  } catch (error) {
    if (error?.response?.status === 401) {
      try {
        if (!refreshPromise) {
          refreshPromise = api.get('/user/refresh-token')
            .then((res) => {
              const token = res.data?.data?.accessToken || res.data?.data
              SetAccessToken(token)
              return token
            })
            .finally(() => {
              refreshPromise = null
            })
        }
        await refreshPromise
        return await fn()
      } catch (err) {
        console.log(err?.response?.data?.message || "couldn't refresh accessToken")
      }
    }
    throw error
  }
}

export default api
 


