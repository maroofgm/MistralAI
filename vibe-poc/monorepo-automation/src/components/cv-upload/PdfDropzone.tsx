'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

interface PdfDropzoneProps {
  onExtracted: (data: Record<string, unknown>) => void
}

export function PdfDropzone({ onExtracted }: PdfDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const ACCEPTED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md', '.csv', '.xlsx']

  async function processFile(file: File) {
    setError(null)

    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      setError(`Unsupported file type. Accepted: ${ACCEPTED_EXTENSIONS.join(', ')}`)
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10 MB.')
      return
    }

    setFileName(file.name)
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/extract-cv', { method: 'POST', body: formData })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Extraction failed')
        return
      }

      onExtracted(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-gray-500">Extracting data from your CV...</p>
        <p className="text-xs text-gray-400">{fileName}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-indigo-400 transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files[0]
          if (file) processFile(file)
        }}
      >
        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium text-indigo-600">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-400">PDF, DOCX, TXT, MD, CSV, XLSX — max 10 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md,.csv,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) processFile(file)
          }}
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-center">
        <Button variant="secondary" onClick={() => inputRef.current?.click()}>
          Select File
        </Button>
      </div>
    </div>
  )
}
