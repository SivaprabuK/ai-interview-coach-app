import api from './api'

interface LoginRequest {
  email: string
  password: string
}

interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

interface ApiResponse<T> {
  status: boolean
  data: T
  status_code: number
  message: string
}

export const loginUser = async (
  credentials: LoginRequest,
): Promise<LoginResponse> => {
  const response = await api.post<ApiResponse<LoginResponse>>(
    '/auth/login',
    credentials,
  )

  const tokens = response.data.data

  localStorage.setItem('access_token', tokens.access_token)
  localStorage.setItem('refresh_token', tokens.refresh_token)

  return tokens
}


export const logoutUser = async (): Promise<void> => {
  try {
    await api.post('/auth/logout')
  } finally {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
}

