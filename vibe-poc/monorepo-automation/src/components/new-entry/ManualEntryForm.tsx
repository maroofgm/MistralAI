'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PersonalSchema, type PersonalFormData } from '@/lib/schemas/personal.schema'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function ManualEntryForm() {
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<PersonalFormData>({
    resolver: zodResolver(PersonalSchema) as any,
  })

  const onSubmit = async (data: PersonalFormData) => {
    setServerError(null)
    setSuccess(false)
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
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="First Name"
          placeholder="Omar"
          error={errors.first_name?.message}
          {...register('first_name')}
        />
        <Input
          label="Last Name"
          placeholder="Garcia"
          error={errors.last_name?.message}
          {...register('last_name')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Date of Birth"
          type="date"
          error={errors.dob?.message}
          {...register('dob')}
        />
        <Input
          label="Birth Place"
          placeholder="UK"
          error={errors.birth_place?.message}
          {...register('birth_place')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Address Line 1"
          placeholder="Street 879"
          error={errors.add_1?.message}
          {...register('add_1')}
        />
        <Input
          label="Address Line 2 (optional)"
          placeholder="Apt 17"
          error={errors.add_2?.message}
          {...register('add_2')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Zip Code"
          type="number"
          placeholder="114892"
          error={errors.zip_code?.message}
          {...register('zip_code')}
        />
        <Input
          label="Age"
          type="number"
          placeholder="29"
          error={errors.age?.message}
          {...register('age')}
        />
        <Input
          label="Salary (annual)"
          type="number"
          placeholder="109144"
          error={errors.salary?.message}
          {...register('salary')}
        />
      </div>

      <Input
        label="Profession"
        placeholder="Consultant"
        error={errors.profession?.message}
        {...register('profession')}
      />

      {serverError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Record added successfully!
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting}>
          Add Record
        </Button>
      </div>
    </form>
  )
}
