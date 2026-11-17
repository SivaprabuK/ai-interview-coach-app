import { useState } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import { uploadDocument } from '../../services/documentService'
import type { DocumentUploadResponse } from '../../types/document'

interface DocumentUploadProps {
  onUploaded: (document: DocumentUploadResponse) => void
}

function DocumentUpload({ onUploaded }: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0]

    setError('')

    if (!selectedFile) return

    const extension = selectedFile.name.split('.').pop()?.toLowerCase()

    if (!['pdf', 'docx'].includes(extension || '')) {
      setError('Only PDF and DOCX files are allowed.')
      setFile(null)
      event.target.value = ''
      return
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must not exceed 10 MB.')
      setFile(null)
      event.target.value = ''
      return
    }

    if (selectedFile.size === 0) {
      setError('Empty files cannot be uploaded.')
      setFile(null)
      event.target.value = ''
      return
    }

    setFile(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    try {
      setLoading(true)
      setError('')

      const uploadedDocument = await uploadDocument(file)

      onUploaded(uploadedDocument)
      setFile(null)
    } catch {
      setError('Document upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-900">
          Upload Documents
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Upload PDF or DOCX files to use them for AI-powered interview preparation.
        </p>
      </div>

      <div className="rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/30 p-8 text-center">
        <Upload className="mx-auto text-purple-600" size={32} />

        <p className="mt-3 text-sm font-medium text-gray-700">
          Choose a document to upload
        </p>

        <p className="mt-1 text-xs text-gray-400">
          PDF or DOCX · Maximum size 10 MB
        </p>

        <label className="mt-5 inline-flex cursor-pointer items-center rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700">
          Browse Files
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="hidden"
            disabled={loading}
          />
        </label>
      </div>

      {file && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-100 p-3">
          <div className="flex min-w-0 items-center gap-3">
            <FileText className="shrink-0 text-purple-600" size={22} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-800">
                {file.name}
              </p>
              <p className="text-xs text-gray-400">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFile(null)}
            disabled={loading}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-red-500"
            aria-label="Remove selected file"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}

      <button
        type="button"
        onClick={handleUpload}
        disabled={!file || loading}
        className="mt-5 w-full rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Uploading...' : 'Upload Document'}
      </button>
    </div>
  )
}

export default DocumentUpload
