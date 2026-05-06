'use client'

import { useState } from 'react'
import { PdfDropzone } from '@/components/cv-upload/PdfDropzone'
import { ExtractedDataForm } from '@/components/cv-upload/ExtractedDataForm'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import type { PersonalFormData } from '@/lib/schemas/personal.schema'

type State = 'idle' | 'preview'

function toPartialFormData(raw: Record<string, unknown>): Partial<PersonalFormData> {
  return {
    first_name: typeof raw.first_name === 'string' ? raw.first_name : undefined,
    last_name: typeof raw.last_name === 'string' ? raw.last_name : undefined,
    dob: typeof raw.dob === 'string' ? raw.dob : undefined,
    birth_place: typeof raw.birth_place === 'string' ? raw.birth_place : undefined,
    add_1: typeof raw.add_1 === 'string' ? raw.add_1 : undefined,
    add_2: typeof raw.add_2 === 'string' ? raw.add_2 : undefined,
    zip_code:
      typeof raw.zip_code === 'number'
        ? raw.zip_code
        : typeof raw.zip_code === 'string'
        ? Number(raw.zip_code) || undefined
        : undefined,
    profession: typeof raw.profession === 'string' ? raw.profession : undefined,
    age:
      typeof raw.age === 'number'
        ? raw.age
        : typeof raw.age === 'string'
        ? Number(raw.age) || undefined
        : undefined,
    salary:
      typeof raw.salary === 'number'
        ? raw.salary
        : typeof raw.salary === 'string'
        ? Number(raw.salary) || undefined
        : undefined,
  }
}

export default function CvUploadPage() {
  const [state, setState] = useState<State>('idle')
  const [extractedData, setExtractedData] = useState<Partial<PersonalFormData>>({})

  function handleExtracted(raw: Record<string, unknown>) {
    setExtractedData(toPartialFormData(raw))
    setState('preview')
  }

  function handleReset() {
    setExtractedData({})
    setState('idle')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CV Upload & Extract</h1>
        <p className="text-sm text-gray-500 mt-1">Upload a PDF resume to automatically extract personal details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {state === 'idle' ? 'Upload CV / Resume' : 'Review Extracted Data'}
          </CardTitle>
          {state === 'idle' && (
            <p className="text-sm text-gray-500 mt-1">
              Our AI will extract name, address, profession, and other fields from your PDF.
            </p>
          )}
        </CardHeader>

        {state === 'idle' && <PdfDropzone onExtracted={handleExtracted} />}
        {state === 'preview' && (
          <ExtractedDataForm defaultValues={extractedData} onReset={handleReset} />
        )}
      </Card>
    </div>
  )
}
