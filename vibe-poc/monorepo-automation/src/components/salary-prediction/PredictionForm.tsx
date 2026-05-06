'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import type { SalaryPredictionResult } from '@/lib/types'

const PredictionInputSchema = z.object({
  profession: z.string().min(1, 'Profession is required'),
  age: z.coerce.number().int().min(0, 'Age must be positive').max(130),
  birth_place: z.string().min(1, 'Birth place is required'),
})

type PredictionInput = z.infer<typeof PredictionInputSchema>

interface PredictionFormProps {
  onResult: (result: SalaryPredictionResult, input: PredictionInput) => void
}

export function PredictionForm({ onResult }: PredictionFormProps) {
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<PredictionInput>({
    resolver: zodResolver(PredictionInputSchema) as any,
  })

  const onSubmit = async (data: PredictionInput) => {
    setServerError(null)
    const res = await fetch('/api/salary-prediction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (!res.ok) {
      setServerError(json.error ?? 'Prediction failed')
      return
    }
    onResult(json, data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Profession"
          placeholder="e.g. Consultant"
          error={errors.profession?.message}
          {...register('profession')}
        />
        <Input
          label="Age"
          type="number"
          placeholder="e.g. 30"
          error={errors.age?.message}
          {...register('age')}
        />
        <Input
          label="Birth Place"
          placeholder="e.g. UK"
          error={errors.birth_place?.message}
          {...register('birth_place')}
        />
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting}>
          Predict Salary
        </Button>
      </div>
    </form>
  )
}
