export interface InsightItem {
  name: string
  count: number
}

export interface ScoreTrendItem {
  evaluation_id: number
  score: number
  created_at: string
}

export interface InsightsOverview {
  total_evaluations: number
  average_score: number
  recent_score_trend: ScoreTrendItem[]
  top_strengths: InsightItem[]
  improvement_areas: InsightItem[]
}

export interface InsightsApiResponse {
  status: boolean
  data: InsightsOverview
  status_code: number
  message: string
}
