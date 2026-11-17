
import api from './api'
import type {
  Document,
  DocumentUploadResponse,
  DocumentQuestionRequest,
  DocumentQuestionResponse,
  DocumentApiResponse,
} from '../types/document'

export interface DocumentInterviewRequest {
  document_id: number
  difficulty: string
  question_count: number
}

export interface GeneratedInterviewQuestion {
  question: string
  expected_answer_points: string[]
}

export interface DocumentInterviewResponse {
  document_id: number
  difficulty: string
  questions: GeneratedInterviewQuestion[]
}

export const uploadDocument = async (
  file: File,
): Promise<DocumentUploadResponse> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post<
    DocumentApiResponse<DocumentUploadResponse>
  >('/documents/upload', formData)

  return response.data.data
}

export const getDocuments = async (): Promise<Document[]> => {
  const response = await api.get<DocumentApiResponse<Document[]>>(
    '/documents/',
  )

  return response.data.data
}

export const askDocumentQuestion = async (
  payload: DocumentQuestionRequest,
): Promise<DocumentQuestionResponse> => {
  const response = await api.post<
    DocumentApiResponse<DocumentQuestionResponse>
  >('/documents/ask', payload)

  return response.data.data
}

export const generateDocumentInterview = async (
  payload: DocumentInterviewRequest,
): Promise<DocumentInterviewResponse> => {
  const response = await api.post<
    DocumentApiResponse<DocumentInterviewResponse>
  >('/documents/generate-interview',
    payload,
  )

  return response.data.data
}

export const deleteDocument = async (
  documentId: number,
): Promise<void> => {
  await api.delete(`/documents/${documentId}`)
}
