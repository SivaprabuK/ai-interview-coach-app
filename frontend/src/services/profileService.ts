import api from './api'
import type {
  UserProfile,
  UserProfileRequest,
} from '../types/profile'

interface ApiResponse<T> {
  status: boolean
  data: T
  status_code: number
  message: string
}

export const getUserProfile = async (): Promise<UserProfile | null> => {
  const response = await api.get<ApiResponse<UserProfile | null>>(
    '/profile/',
  )

  return response.data.data
}

export const saveUserProfile = async (
  profileData: UserProfileRequest,
): Promise<UserProfile> => {
  const response = await api.put<ApiResponse<UserProfile>>(
    '/profile/',
    profileData,
  )

  return response.data.data
}