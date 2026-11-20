export interface UserProfile {
  id: number
  user_id: number
  professional_summary: string | null
  years_of_experience: number | null
  technical_skills: string[]
  target_roles: string[]
  preferred_difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  preferred_question_count: number
}

export interface UserProfileRequest {
  professional_summary: string | null
  years_of_experience: number | null
  technical_skills: string[]
  target_roles: string[]
  preferred_difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  preferred_question_count?: number
}