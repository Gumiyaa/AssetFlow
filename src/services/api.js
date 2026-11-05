import axios from 'axios'
import { readStore, STORAGE_KEYS } from './storage'

/**
 * Central Axios instance for the real backend.
 *
 * The demo application reads and writes its mock data through
 * `src/services/*` (localStorage backed). When a backend becomes
 * available, point VITE_API_URL at it and swap the service bodies for
 * `api.get/post/put/delete` calls — every page already calls the service
 * layer instead of talking to data directly.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 20000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const session = readStore(STORAGE_KEYS.session)
  if (session?.token) {
    config.headers.Authorization = `Bearer ${session.token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Terjadi kesalahan saat menghubungi server.'
    return Promise.reject(Object.assign(error, { friendlyMessage: message }))
  },
)

export default api
