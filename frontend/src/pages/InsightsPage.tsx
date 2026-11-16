import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  BarChart3,
  Target,
  TrendingUp,
  Award,
  AlertCircle,
} from 'lucide-react'

import { getInsightsOverview } from '../services/insightsService'
import type { InsightsOverview } from '../types/insights'

function InsightsPage() {
  const [insights, setInsights] = useState<InsightsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const data = await getInsightsOverview()
        setInsights(data)
      } catch {
        setError('Unable to load your performance insights. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">Loading your insights...</p>
      </div>
    )
  }

  if (error || !insights) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <AlertCircle className="text-red-500" size={32} />
        <p className="text-gray-600">
          {error || 'No insights available.'}
        </p>
      </div>
    )
  }

  const scoreTrend = insights.recent_score_trend.map((item) => ({
    ...item,
    date: new Date(item.created_at).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
  }))

  const summaryCards = [
    {
      title: 'Total Evaluations',
      value: insights.total_evaluations,
      icon: BarChart3,
      description: 'Answers evaluated',
    },
    {
      title: 'Average Score',
      value: `${insights.average_score}%`,
      icon: Target,
      description: 'Overall performance',
    },
    {
      title: 'Recent Evaluations',
      value: insights.recent_score_trend.length,
      icon: TrendingUp,
      description: 'Latest 10 evaluations maximum',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Performance Insights
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Track your interview performance and identify areas for improvement.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  {card.title}
                </p>
                <div className="rounded-xl bg-purple-50 p-3">
                  <Icon className="text-purple-600" size={21} />
                </div>
              </div>

              <h2 className="mt-4 text-3xl font-bold text-gray-900">
                {card.value}
              </h2>

              <p className="mt-1 text-xs text-gray-400">
                {card.description}
              </p>
            </div>
          )
        })}
      </div>

      {/* Score Trend */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Score Trend
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Your latest evaluation scores over time
        </p>

        {scoreTrend.length > 0 ? (
          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#9333ea"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-16 text-center text-sm text-gray-400">
            Complete an answer evaluation to see your score trend.
          </p>
        )}
      </div>

      {/* Strengths and Improvement Areas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <Award className="text-green-600" size={23} />
            <div>
              <h2 className="font-semibold text-gray-900">
                Top Strengths
              </h2>
              <p className="text-xs text-gray-500">
                Frequently identified strengths
              </p>
            </div>
          </div>

          {insights.top_strengths.length > 0 ? (
            <div className="space-y-4">
              {insights.top_strengths.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3 last:border-0"
                >
                  <p className="text-sm text-gray-700">{item.name}</p>
                  <span className="shrink-0 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                    {item.count}x
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">
              No strengths recorded yet.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <AlertCircle className="text-orange-500" size={23} />
            <div>
              <h2 className="font-semibold text-gray-900">
                Areas to Improve
              </h2>
              <p className="text-xs text-gray-500">
                Frequently identified improvement areas
              </p>
            </div>
          </div>

          {insights.improvement_areas.length > 0 ? (
            <div className="space-y-4">
              {insights.improvement_areas.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3 last:border-0"
                >
                  <p className="text-sm text-gray-700">{item.name}</p>
                  <span className="shrink-0 rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                    {item.count}x
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-gray-400">
              No improvement areas recorded yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default InsightsPage
