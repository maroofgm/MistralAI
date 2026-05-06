export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { predictSalary } from '@/lib/salary'
import { z } from 'zod'
import type { PersonalRecord } from '@/lib/types'

const InputSchema = z.object({
  profession: z.string().min(1, 'Profession is required'),
  age: z.coerce.number().int().min(0).max(130),
  birth_place: z.string().min(1, 'Birth place is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = InputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('personal')
      .select('id, profession, age, salary, birth_place')
      .not('salary', 'is', null)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const result = predictSalary((data as PersonalRecord[]) ?? [], parsed.data)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[salary-prediction]', err)
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}
