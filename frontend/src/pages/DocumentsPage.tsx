import { useState, type FormEvent } from 'react'
import {
  MessageCircle,
  Send,
  Sparkles,
  Loader2,
  AlertCircle,
} from 'lucide-react'

import DocumentUpload from '../components/documents/DocumentUpload'
import DocumentList from '../components/documents/DocumentList'
import { askDocumentQuestion } from '../services/documentService'
import type {
  DocumentUploadResponse,
  DocumentQuestionResponse,
} from '../types/document'
import ReactMarkdown from 'react-markdown'

function DocumentsPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [successMessage, setSuccessMessage] = useState('')

  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<DocumentQuestionResponse | null>(null)
  const [asking, setAsking] = useState(false)
  const [questionError, setQuestionError] = useState('')

  const handleDocumentUploaded = (
    document: DocumentUploadResponse,
  ) => {
    setRefreshTrigger((previous) => previous + 1)
    setSuccessMessage(`${document.filename} uploaded successfully.`)

    setTimeout(() => {
      setSuccessMessage('')
    }, 4000)
  }

  const handleAskQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!question.trim()) {
      setQuestionError('Please enter a question.')
      return
    }

    try {
      setAsking(true)
      setQuestionError('')
      setAnswer(null)

      const response = await askDocumentQuestion({
        query: question.trim(),
        top_k: 5,
      })

      setAnswer(response)
    } catch {
      setQuestionError(
        'Unable to get an answer. Please try again.',
      )
    } finally {
      setAsking(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Document Management
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Upload and manage your interview preparation materials.
          Ask AI questions about your documents and generate
          personalized interview questions.
        </p>
      </div>

      {successMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
          {successMessage}
        </div>
      )}

      <DocumentUpload onUploaded={handleDocumentUploaded} />

      {/* Document Q&A */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-purple-100 p-3">
            <Sparkles className="text-purple-600" size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Ask AI About Your Documents
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Get answers based on your uploaded interview preparation materials.
            </p>
          </div>
        </div>

        <form onSubmit={handleAskQuestion} className="space-y-4">
          <div>
            <label
              htmlFor="document-question"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Enter your question
            </label>

            <textarea
              id="document-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Example: Explain the authentication requirements in my uploaded document..."
              rows={3}
              maxLength={2000}
              disabled={asking}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 disabled:bg-gray-50"
            />
          </div>

          {questionError && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle size={17} />
              {questionError}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={asking || !question.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {asking ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Finding Answer...
                </>
              ) : (
                <>
                  <Send size={17} />
                  Ask AI
                </>
              )}
            </button>
          </div>
        </form>

        {answer && (
          <div className="mt-6 rounded-xl border border-purple-100 bg-purple-50/50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <MessageCircle className="text-purple-600" size={19} />
              <h3 className="text-sm font-semibold text-gray-900">
                AI Response
              </h3>
            </div>

            <p className="mb-3 text-sm font-medium text-gray-700">
              {answer.question}
            </p>

            <div className="whitespace-pre-wrap text-sm leading-7 text-gray-700">
                <ReactMarkdown>
                     {answer.answer}
                </ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      <DocumentList refreshTrigger={refreshTrigger} />
    </div>
  )
}

export default DocumentsPage
