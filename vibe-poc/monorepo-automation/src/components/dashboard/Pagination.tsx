'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@/components/ui/Button'

interface PaginationProps {
  total: number
  page: number
  pageSize: number
}

export function Pagination({ total, page, pageSize }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  function goToPage(newPage: number) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(newPage))
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between px-1 mt-4">
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium">{from}</span>–<span className="font-medium">{to}</span> of{' '}
        <span className="font-medium">{total}</span> records
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => goToPage(page - 1)}
          disabled={page <= 1 || isPending}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => goToPage(page + 1)}
          disabled={page >= totalPages || isPending}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
