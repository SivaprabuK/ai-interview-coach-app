import api from './api'
import type {
  AnswerEvaluationRequest,
  AnswerEvaluation,
  AnswerEvaluationHistoryItem,
  ApiResponse,
} from '../types/evaluation'

export const evaluateAnswer = async (
  request: AnswerEvaluationRequest,
): Promise<AnswerEvaluation> => {
  const response = await api.post<ApiResponse<AnswerEvaluation>>(
    '/answer-evaluations',
    request,
  )

  return response.data.data
}


export const getAnswerEvaluationHistory = async (
  skip: number = 0,
  limit: number = 10
): Promise<AnswerEvaluationHistoryItem[]> => {
  const response = await api.get<ApiResponse<AnswerEvaluationHistoryItem[]>>(
    `/answer-evaluations?skip=${skip}&limit=${limit}`
  )

  return response.data.data
}


export const getAnswerEvaluationById = async (
  evaluationId: number
): Promise<AnswerEvaluationHistoryItem> => {
  const response = await api.get<ApiResponse<AnswerEvaluationHistoryItem>>(
    `/answer-evaluations/${evaluationId}`
  )

  return response.data.data
}
