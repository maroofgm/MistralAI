'use client'

import { useRef, useState } from 'react'
import Papa from 'papaparse'
import { CsvRowSchema, REQUIRED_CSV_HEADERS } from '@/lib/schemas/csv.schema'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import type { PersonalFormData } from '@/lib/schemas/personal.schema'

interface RowError {
  row: number
  errors: string[]
}

interface ParseResult {
  validRows: PersonalFormData[]
  invalidRows: RowError[]
}

function normalizeDateString(val: string): string {
  // Convert MM/DD/YYYY to YYYY-MM-DD
  const mmddyyyy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  const match = val.trim().match(mmddyyyy)
  if (match) {
    const [, m, d, y] = match
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  return val.trim()
}

export function CsvUploader() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [headerError, setHeaderError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  function handleFile(file: File) {
    setParseResult(null)
    setHeaderError(null)
    setUploadSuccess(null)
    setUploadError(null)

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, meta }) => {
        const fields = meta.fields ?? []
        const missing = REQUIRED_CSV_HEADERS.filter((h) => !fields.includes(h))
        if (missing.length > 0) {
          setHeaderError(`Missing required columns: ${missing.join(', ')}`)
          return
        }

        const validRows: PersonalFormData[] = []
        const invalidRows: RowError[] = []

        data.forEach((row, i) => {
          const normalized = { ...row }
          if (normalized.dob) normalized.dob = normalizeDateString(normalized.dob)

          const result = CsvRowSchema.safeParse(normalized)
          if (result.success) {
            validRows.push(result.data)
          } else {
            const errs = result.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`)
            invalidRows.push({ row: i + 2, errors: errs })
          }
        })

        setParseResult({ validRows, invalidRows })
      },
      error: (err) => {
        setHeaderError(`Failed to parse CSV: ${err.message}`)
      },
    })
  }

  async function handleUpload() {
    if (!parseResult || parseResult.validRows.length === 0) return
    setUploading(true)
    setUploadError(null)

    const supabase = createClient()
    const rows = parseResult.validRows.map((r) => ({ ...r, add_2: r.add_2 || null }))
    const { error } = await supabase.from('personal').insert(rows)

    setUploading(false)
    if (error) {
      setUploadError(error.message)
    } else {
      setUploadSuccess(parseResult.validRows.length)
      setParseResult(null)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* File input */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files[0]
          if (file) handleFile(file)
        }}
      >
        <svg className="mx-auto h-10 w-10 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm text-gray-600">
          <span className="font-medium text-indigo-600">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-gray-400 mt-1">CSV files only</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
          }}
        />
      </div>

      {/* Download sample */}
      <p className="text-xs text-gray-500">
        Need a template?{' '}
        <a href="/sample.csv" download className="text-indigo-600 hover:underline font-medium">
          Download sample CSV
        </a>
      </p>

      {/* Header error */}
      {headerError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {headerError}
        </div>
      )}

      {/* Parse results */}
      {parseResult && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="success">{parseResult.validRows.length} valid rows</Badge>
            {parseResult.invalidRows.length > 0 && (
              <Badge variant="error">{parseResult.invalidRows.length} invalid rows</Badge>
            )}
          </div>

          {/* Preview first 5 valid rows */}
          {parseResult.validRows.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-gray-200 text-sm">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                  <tr>
                    {['Name', 'DOB', 'Profession', 'Age', 'Salary'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {parseResult.validRows.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-gray-700">{row.first_name} {row.last_name}</td>
                      <td className="px-3 py-2 text-gray-500">{row.dob}</td>
                      <td className="px-3 py-2 text-gray-500">{row.profession}</td>
                      <td className="px-3 py-2 text-gray-500">{row.age}</td>
                      <td className="px-3 py-2 text-gray-500">${Number(row.salary).toLocaleString()}</td>
                    </tr>
                  ))}
                  {parseResult.validRows.length > 5 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-2 text-gray-400 text-xs italic">
                        ...and {parseResult.validRows.length - 5} more rows
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Invalid row errors */}
          {parseResult.invalidRows.length > 0 && (
            <details className="rounded-lg border border-yellow-200 bg-yellow-50">
              <summary className="px-4 py-2 text-sm font-medium text-yellow-800 cursor-pointer">
                Show {parseResult.invalidRows.length} invalid rows (will be skipped)
              </summary>
              <div className="px-4 pb-3 space-y-1 max-h-40 overflow-y-auto">
                {parseResult.invalidRows.map((r) => (
                  <p key={r.row} className="text-xs text-yellow-700">
                    Row {r.row}: {r.errors.join('; ')}
                  </p>
                ))}
              </div>
            </details>
          )}

          {parseResult.validRows.length > 0 && (
            <div className="flex justify-end">
              <Button onClick={handleUpload} loading={uploading}>
                Upload {parseResult.validRows.length} record{parseResult.validRows.length !== 1 ? 's' : ''}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Upload feedback */}
      {uploadSuccess !== null && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Successfully uploaded {uploadSuccess} record{uploadSuccess !== 1 ? 's' : ''}!
        </div>
      )}
      {uploadError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Upload failed: {uploadError}
        </div>
      )}
    </div>
  )
}
