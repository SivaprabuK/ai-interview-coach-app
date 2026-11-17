
import { useEffect, useState } from 'react'
import {
  FileText,
  RefreshCw,
  AlertCircle,
  Trash2,
} from 'lucide-react'
import {
  getDocuments,
  deleteDocument,
} from '../../services/documentService'
import type { Document } from '../../types/document'

interface DocumentListProps {
  refreshTrigger: number
}

function DocumentList({ refreshTrigger }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true)
        setError('')

        const data = await getDocuments()
        setDocuments(data)
      } catch {
        setError('Unable to load documents. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [refreshTrigger])

  const handleDelete = async (document: Document) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove "${document.filename}"?`,
    )

    if (!confirmed) return

    try {
      setDeletingId(document.document_id)
      setActionError('')

      await deleteDocument(document.document_id)

      setDocuments((previous) =>
        previous.filter(
          (item) => item.document_id !== document.document_id,
        ),
      )
    } catch {
      setActionError(
        `Unable to remove "${document.filename}". Please try again.`,
      )
    } finally {
      setDeletingId(null)
    }
  }

  const formatFileSize = (size: number) => {
    return size < 1024 * 1024
      ? `${(size / 1024).toFixed(1)} KB`
      : `${(size / (1024 * 1024)).toFixed(2)} MB`
  }

  const formatDate = (date?: string) => {
    if (!date) return '--'

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'processed':
        return 'bg-green-50 text-green-700'
      case 'failed':
        return 'bg-red-50 text-red-700'
      case 'processing':
      case 'pending':
        return 'bg-yellow-50 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Uploaded Documents
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your uploaded interview preparation documents.
          </p>
        </div>

        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
          {documents.length} Documents
        </span>
      </div>

      {actionError && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle size={18} />
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="animate-spin text-purple-600" size={22} />
          <span className="ml-3 text-sm text-gray-500">
            Loading documents...
          </span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 py-10">
          <AlertCircle className="text-red-500" size={28} />
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="py-12 text-center">
          <FileText className="mx-auto text-gray-300" size={36} />
          <p className="mt-3 text-sm font-medium text-gray-600">
            No documents uploaded yet.
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Upload a PDF or DOCX document to get started.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                <th className="pb-4 font-semibold">Document</th>
                <th className="pb-4 font-semibold">Size</th>
                <th className="pb-4 font-semibold">Uploaded</th>
                <th className="pb-4 font-semibold">Status</th>
                <th className="pb-4 text-right font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {documents.map((document) => (
                <tr
                  key={document.document_id}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="shrink-0 text-purple-600" size={21} />
                      <span className="max-w-xs truncate text-sm font-medium text-gray-800">
                        {document.filename}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 text-sm text-gray-600">
                    {formatFileSize(document.file_size)}
                  </td>

                  <td className="py-4 text-sm text-gray-600">
                    {formatDate(document.created_at)}
                  </td>

                  <td className="py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(document.status)}`}
                    >
                      {document.status}
                    </span>
                  </td>

                  <td className="py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(document)}
                      disabled={deletingId !== null}
                      title="Remove document"
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      {deletingId === document.document_id
                        ? 'Removing...'
                        : 'Remove'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default DocumentList
