import api from './api'
import type {
  InsightsApiResponse,
  InsightsOverview,
} from '../types/insights'

export const getInsightsOverview =
  async (): Promise<InsightsOverview> => {
    const response = await api.get<InsightsApiResponse>(
      '/insights/overview',
    )

    return response.data.data
  }
