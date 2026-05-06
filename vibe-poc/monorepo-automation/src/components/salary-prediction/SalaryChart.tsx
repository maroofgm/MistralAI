'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface SalaryChartProps {
  data: { profession: string; avg_salary: number }[]
  highlightProfession?: string
}

export function SalaryChart({ data, highlightProfession }: SalaryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-gray-400">
        No data available for chart
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 20, bottom: 80, left: 20 }}
        barCategoryGap="25%"
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="profession"
          angle={-35}
          textAnchor="end"
          interval={0}
          tick={{ fontSize: 11, fill: '#6b7280' }}
        />
        <YAxis
          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11, fill: '#6b7280' }}
        />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Avg Salary']}
          labelStyle={{ fontWeight: 600, color: '#111827' }}
          contentStyle={{
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        />
        <Bar dataKey="avg_salary" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                highlightProfession &&
                entry.profession.toLowerCase() === highlightProfession.toLowerCase()
                  ? '#4f46e5'
                  : '#a5b4fc'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
