import axios, {
  type InternalAxiosRequestConfig,
} from 'axios'

const BASE_URL = 'http://127.0.0.1:8000/api/v1'

interface ApiResponse<T> {
  status: boolean
  data: T
  status_code: number
  message: string
}

interface RefreshResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Shared refresh promise for concurrent requests
let refreshPromise: Promise<RefreshResponse> | null = null

const refreshAccessToken = async (): Promise<RefreshResponse> => {
  const refreshToken = localStorage.getItem('refresh_token')

  if (!refreshToken) {
    throw new Error('Refresh token not found')
  }

  const response = await axios.post<ApiResponse<RefreshResponse>>(
    `${BASE_URL}/auth/refresh`,
    {
      refresh_token: refreshToken,
    },
  )

  const tokens = response.data.data

  localStorage.setItem('access_token', tokens.access_token)
  localStorage.setItem('refresh_token', tokens.refresh_token)

  return tokens
}

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Allow the browser to set the multipart boundary for FormData
  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type')
  }

  return config
})

// Handle expired access tokens
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config as RetryConfig | undefined

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      originalRequest._retry = true

      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken()
        }

        const tokens = await refreshPromise

        originalRequest.headers.Authorization =
          `Bearer ${tokens.access_token}`

        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')

        return Promise.reject(refreshError)
      } finally {
        refreshPromise = null
      }
    }

    return Promise.reject(error)
  },
)

export default api