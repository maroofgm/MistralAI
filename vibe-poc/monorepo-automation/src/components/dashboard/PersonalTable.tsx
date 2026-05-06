import type { PersonalRecord } from '@/lib/types'

interface PersonalTableProps {
  records: PersonalRecord[]
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatCurrency(value: number | null): string {
  if (value === null) return '—'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

export function PersonalTable({ records }: PersonalTableProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-sm">No records found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Name', 'DOB', 'Birth Place', 'Address', 'Zip', 'Profession', 'Age', 'Salary', 'Created'].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {records.map((record) => (
            <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-100">
              <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                {[record.first_name, record.last_name].filter(Boolean).join(' ') || '—'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(record.dob)}</td>
              <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{record.birth_place || '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap max-w-[200px] truncate">
                {[record.add_1, record.add_2].filter(Boolean).join(', ') || '—'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{record.zip_code ?? '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{record.profession || '—'}</td>
              <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{record.age ?? '—'}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-700 whitespace-nowrap">
                {formatCurrency(record.salary)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">{formatDate(record.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
