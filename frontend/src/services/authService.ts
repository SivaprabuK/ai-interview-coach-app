import api from './api'

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  name: string
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

interface AccountDetails {
  id: number
  name: string
  email: string
}

interface UpdateAccountRequest {
  name: string
  email: string
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


export const registerUser = async (
  userData: RegisterRequest,
): Promise<void> => {
  await api.post('/auth/register', userData)
}


export const logoutUser = async (): Promise<void> => {
  try {
    await api.post('/auth/logout')
  } finally {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }
}


export const getAccountDetails = async (): Promise<AccountDetails> => {
  const response = await api.get<ApiResponse<AccountDetails>>('/auth/me')

  return response.data.data
}

export const updateAccount = async (
  accountData: UpdateAccountRequest,
): Promise<AccountDetails> => {
  const response = await api.patch<ApiResponse<AccountDetails>>(
    '/auth/me',
    accountData,
  )

  return response.data.data
}

export const changePassword = async (
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  await api.post('/auth/change-password', {
    current_password: currentPassword,
    new_password: newPassword,
  })
}