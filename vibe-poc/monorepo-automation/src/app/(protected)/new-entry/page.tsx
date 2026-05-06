'use client'

import { useState } from 'react'
import { ManualEntryForm } from '@/components/new-entry/ManualEntryForm'
import { CsvUploader } from '@/components/new-entry/CsvUploader'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'

type Tab = 'manual' | 'csv'

export default function NewEntryPage() {
  const [activeTab, setActiveTab] = useState<Tab>('manual')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">New Entry & Bulk Upload</h1>
        <p className="text-sm text-gray-500 mt-1">Add records manually or upload a CSV file</p>
      </div>

      <Card>
        <CardHeader>
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'manual'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Manual Entry
            </button>
            <button
              onClick={() => setActiveTab('csv')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'csv'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Bulk CSV Upload
            </button>
          </div>
        </CardHeader>

        {activeTab === 'manual' && (
          <div>
            <CardTitle className="mb-4">Add a Single Record</CardTitle>
            <ManualEntryForm />
          </div>
        )}

        {activeTab === 'csv' && (
          <div>
            <CardTitle className="mb-1">Upload CSV File</CardTitle>
            <p className="text-sm text-gray-500 mb-4">
              Required columns: first_name, last_name, dob, birth_place, add_1, zip_code, profession, age, salary
            </p>
            <CsvUploader />
          </div>
        )}
      </Card>
    </div>
  )
}
