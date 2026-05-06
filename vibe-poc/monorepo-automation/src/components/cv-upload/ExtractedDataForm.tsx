'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PersonalSchema, type PersonalFormData } from '@/lib/schemas/personal.schema'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface ExtractedDataFormProps {
  defaultValues: Partial<PersonalFormData>
  onReset: () => void
}

export function ExtractedDataForm({ defaultValues, onReset }: ExtractedDataFormProps) {
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<PersonalFormData>({
    resolver: zodResolver(PersonalSchema) as any,
    defaultValues,
  })

  const onSubmit = async (data: PersonalFormData) => {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.from('personal').insert({
      ...data,
      add_2: data.add_2 || null,
    })
    if (error) {
      setServerError(error.message)
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Record saved!</h3>
        <p className="text-sm text-gray-500 mb-4">The extracted data has been added to your records.</p>
        <Button variant="secondary" onClick={onReset}>
          Upload another CV
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-indigo-50 border border-indigo-200 px-4 py-3 text-sm text-indigo-700">
        Review and edit the extracted data before saving.
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="First Name" error={errors.first_name?.message} {...register('first_name')} />
          <Input label="Last Name" error={errors.last_name?.message} {...register('last_name')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Date of Birth" type="date" error={errors.dob?.message} {...register('dob')} />
          <Input label="Birth Place" error={errors.birth_place?.message} {...register('birth_place')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Address Line 1" error={errors.add_1?.message} {...register('add_1')} />
          <Input label="Address Line 2 (optional)" error={errors.add_2?.message} {...register('add_2')} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Zip Code" type="number" error={errors.zip_code?.message} {...register('zip_code')} />
          <Input label="Age" type="number" error={errors.age?.message} {...register('age')} />
          <Input label="Salary (annual)" type="number" error={errors.salary?.message} {...register('salary')} />
        </div>

        <Input label="Profession" error={errors.profession?.message} {...register('profession')} />

        {serverError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <div className="flex justify-between pt-2">
          <Button variant="ghost" type="button" onClick={onReset}>
            Upload different CV
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Save Record
          </Button>
        </div>
      </form>
    </div>
  )
}
