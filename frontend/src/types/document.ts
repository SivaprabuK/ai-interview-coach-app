export interface Document {
  document_id: number
  filename: string
  file_size: number
  content_type: string
  status: string
  created_at?: string
}

export interface DocumentUploadResponse {
  document_id: number
  filename: string
  file_size: number
  status: string
}

export interface DocumentQuestionRequest {
  query: string
  top_k?: number
}

export interface DocumentQuestionResponse {
  question: string
  answer: string
}

export interface DocumentApiResponse<T> {
  status: boolean
  data: T
  status_code: number
  message: string
}