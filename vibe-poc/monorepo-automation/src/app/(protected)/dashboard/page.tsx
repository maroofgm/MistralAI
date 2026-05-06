import { createClient } from '@/lib/supabase/server'
import { PersonalTable } from '@/components/dashboard/PersonalTable'
import { SearchBar } from '@/components/dashboard/SearchBar'
import { Pagination } from '@/components/dashboard/Pagination'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import type { PersonalRecord } from '@/lib/types'
import { Suspense } from 'react'
import { Spinner } from '@/components/ui/Spinner'

const PAGE_SIZE = 10

interface DashboardPageProps {
  searchParams: Promise<{ q?: string; page?: string }>
}

async function DashboardContent({ searchParams }: DashboardPageProps) {
  const params = await searchParams
  const supabase = await createClient()
  const page = Math.max(1, Number(params.page ?? 1))
  const query = params.q?.trim() ?? ''
  const offset = (page - 1) * PAGE_SIZE

  let dbQuery = supabase
    .from('personal')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  if (query) {
    dbQuery = dbQuery.or(
      `first_name.ilike.%${query}%,last_name.ilike.%${query}%,profession.ilike.%${query}%,birth_place.ilike.%${query}%`
    )
  }

  const { data, count, error } = await dbQuery

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
        Error loading records: {error.message}
      </div>
    )
  }

  return (
    <>
      <PersonalTable records={(data as PersonalRecord[]) ?? []} />
      <Pagination total={count ?? 0} page={page} pageSize={PAGE_SIZE} />
    </>
  )
}

export default function DashboardPage(props: DashboardPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Browse and search personal growth records</p>
      </div>

      <Card padding="none">
        <CardHeader className="px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <CardTitle>Records</CardTitle>
            <div className="flex-1 min-w-[240px] max-w-md">
              <Suspense fallback={null}>
                <SearchBar />
              </Suspense>
            </div>
          </div>
        </CardHeader>
        <div className="p-4">
          <Suspense
            fallback={
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            }
          >
            <DashboardContent {...props} />
          </Suspense>
        </div>
      </Card>
    </div>
  )
}
