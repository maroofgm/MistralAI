'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { SignupSchema, type SignupFormData } from '@/lib/schemas/auth.schema'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function SignupForm() {
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(SignupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setServerError(error.message)
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <Card>
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h3>
          <p className="text-sm text-gray-500 mb-4">
            We&apos;ve sent a confirmation link to your email address. Click it to activate your account.
          </p>
          <Link href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
            Back to sign in
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Create your account</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {serverError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <Button type="submit" loading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign in
        </Link>
      </p>
    </Card>
  )
}
