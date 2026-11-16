
import { useEffect, useState } from 'react'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MessageSquare,
  RefreshCw,
  X,
  Eye,
} from 'lucide-react'

import {
  getAnswerEvaluationHistory,
  getAnswerEvaluationById,
} from '../services/answerEvaluationService'

import type { AnswerEvaluationHistoryItem } from '../types/evaluation'

const PAGE_SIZE = 10

const InterviewHistoryPage = () => {
  const [evaluations, setEvaluations] = useState<AnswerEvaluationHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  const [selectedEvaluation, setSelectedEvaluation] =
    useState<AnswerEvaluationHistoryItem | null>(null)

  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState<string | null>(null)

  const fetchHistory = async (currentPage: number) => {
    try {
      setLoading(true)
      setError(null)

      const data = await getAnswerEvaluationHistory(
        currentPage * PAGE_SIZE,
        PAGE_SIZE
      )

      setEvaluations(data)
      setHasMore(data.length === PAGE_SIZE)
    } catch (err) {
      console.error('Failed to fetch interview history:', err)
      setError('Unable to load interview history. Please try again.')
      setEvaluations([])
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory(page)
  }, [page])

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400 bg-green-400/10'
    if (score >= 70) return 'text-yellow-400 bg-yellow-400/10'
    return 'text-red-400 bg-red-400/10'
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }

  const handleViewDetails = async (evaluationId: number) => {
    try {
      setDetailsLoading(true)
      setDetailsError(null)
      setSelectedEvaluation(null)

      const data = await getAnswerEvaluationById(evaluationId)
      setSelectedEvaluation(data)
    } catch (err) {
      console.error('Failed to fetch evaluation details:', err)
      setDetailsError('Unable to load evaluation details. Please try again.')
    } finally {
      setDetailsLoading(false)
    }
  }

  const closeDetails = () => {
    setSelectedEvaluation(null)
    setDetailsError(null)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Interview History
        </h1>
        <p className="text-gray-400 mt-1">
          Review your previous interview answers and AI evaluations.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <RefreshCw className="w-8 h-8 animate-spin mb-3" />
          <p>Loading interview history...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => fetchHistory(page)}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      ) : evaluations.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-10 text-center">
          <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white">
            No interview history found
          </h2>
          <p className="text-gray-400 mt-2">
            Complete an interview to see your evaluations here.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {evaluations.map((evaluation) => (
              <div
                key={evaluation.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-violet-500/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="w-4 h-4 text-violet-400 shrink-0" />
                      <span className="text-sm text-gray-400">
                        Evaluation #{evaluation.id}
                      </span>
                    </div>

                    <h3 className="text-white font-medium leading-relaxed">
                      {evaluation.question}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-400">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {formatDate(evaluation.created_at)}
                      </span>

                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        AI evaluated
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-lg font-semibold ${getScoreColor(evaluation.score)}`}
                    >
                      {evaluation.score}/100
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => handleViewDetails(evaluation.id)}
                    disabled={detailsLoading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600/20 text-violet-400 hover:bg-violet-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Eye className="w-4 h-4" />
                    {detailsLoading ? 'Loading...' : 'View Details'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-gray-800 pt-5">
            <p className="text-sm text-gray-400">
              Page {page + 1}
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setPage((current) => current - 1)}
                disabled={page === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-gray-900 hover:bg-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={() => setPage((current) => current + 1)}
                disabled={!hasMore}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {detailsError && (
        <div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-400">{detailsError}</p>
          <button
            onClick={() => setDetailsError(null)}
            className="text-red-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {selectedEvaluation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={closeDetails}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-gray-700 bg-[#171729] p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Evaluation Details
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Evaluation #{selectedEvaluation.id}
                </p>
              </div>

              <button
                onClick={closeDetails}
                className="text-gray-400 hover:text-white transition"
                aria-label="Close details"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-violet-400 mb-2">
                  Question
                </h3>
                <p className="text-white leading-relaxed">
                  {selectedEvaluation.question}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-violet-400 mb-2">
                  Your Answer
                </h3>
                <div className="bg-gray-800/70 rounded-lg p-4">
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {selectedEvaluation.user_answer}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-violet-400 mb-2">
                  AI Feedback
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {selectedEvaluation.feedback}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-green-400 mb-2">
                  Strengths
                </h3>
                {selectedEvaluation.strengths.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    {selectedEvaluation.strengths.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No strengths available.</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-yellow-400 mb-2">
                  Areas to Improve
                </h3>
                {selectedEvaluation.areas_to_improve.length > 0 ? (
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    {selectedEvaluation.areas_to_improve.map((item, index) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400">No improvement areas available.</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-violet-400 mb-2">
                  Suggested Answer
                </h3>
                <div className="bg-gray-800/70 rounded-lg p-4">
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {selectedEvaluation.suggested_answer}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-5 flex items-center justify-between">
                <span className="text-gray-400 font-medium">
                  AI Evaluation Score
                </span>

                <span
                  className={`text-xl font-bold px-4 py-2 rounded-lg ${getScoreColor(selectedEvaluation.score)}`}
                >
                  {selectedEvaluation.score}/100
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Calendar size={16} />
                {formatDate(selectedEvaluation.created_at)}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeDetails}
                className="px-5 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InterviewHistoryPage
