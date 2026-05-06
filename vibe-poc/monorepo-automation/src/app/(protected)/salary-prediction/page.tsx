'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { PredictionForm } from '@/components/salary-prediction/PredictionForm'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import type { SalaryPredictionResult } from '@/lib/types'

// Dynamic import to avoid SSR hydration mismatch with Recharts
const SalaryChart = dynamic(
  () => import('@/components/salary-prediction/SalaryChart').then((m) => m.SalaryChart),
  { ssr: false, loading: () => <div className="flex justify-center py-8"><Spinner /></div> }
)

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function SalaryPredictionPage() {
  const [result, setResult] = useState<SalaryPredictionResult | null>(null)
  const [profession, setProfession] = useState('')

  function handleResult(r: SalaryPredictionResult) {
    setResult(r)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Salary Prediction</h1>
        <p className="text-sm text-gray-500 mt-1">
          Predict salary based on profession, age, and birth place using historical data
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enter Details</CardTitle>
        </CardHeader>
        <PredictionForm
          onResult={(r, input) => {
            handleResult(r)
            setProfession(input.profession)
          }}
        />
      </Card>

      {result && (
        <>
          {/* Prediction result */}
          {result.sample_size === 0 ? (
            <Card>
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">{result.message ?? 'Not enough data to make a prediction.'}</p>
              </div>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Prediction Result</CardTitle>
              </CardHeader>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold text-indigo-700">
                      {formatCurrency(result.predicted_salary)}
                    </span>
                    <span className="text-sm text-gray-500">/ year</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    Confidence range:{' '}
                    <span className="font-medium text-gray-700">
                      {formatCurrency(result.confidence_low)} – {formatCurrency(result.confidence_high)}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Based on {result.sample_size} similar record{result.sample_size !== 1 ? 's' : ''} in the dataset
                  </p>
                </div>

                <div className="bg-indigo-50 rounded-xl p-4 flex flex-col items-center justify-center">
                  <p className="text-xs text-indigo-500 uppercase tracking-wide font-medium mb-1">Margin</p>
                  <p className="text-2xl font-bold text-indigo-700">
                    ±{formatCurrency(result.confidence_high - result.predicted_salary)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Salary distribution chart */}
          {result.average_by_profession.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Average Salary by Profession</CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">
                  Based on all records in the database
                  {profession && (
                    <> — <span className="text-indigo-600 font-medium">{profession}</span> highlighted</>
                  )}
                </p>
              </CardHeader>
              <SalaryChart data={result.average_by_profession} highlightProfession={profession} />
            </Card>
          )}
        </>
      )}
    </div>
  )
}
