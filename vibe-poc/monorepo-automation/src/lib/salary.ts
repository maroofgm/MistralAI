import type { PersonalRecord, SalaryPredictionResult } from './types'

interface PredictionInput {
  profession: string
  age: number
  birth_place: string
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0
  const avg = mean(values)
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / (values.length - 1)
  return Math.sqrt(variance)
}

export function predictSalary(
  data: PersonalRecord[],
  input: PredictionInput
): SalaryPredictionResult {
  // Build chart data first (all records with salary)
  const withSalary = data.filter((r) => r.salary !== null && r.profession !== null)

  const professionMap = new Map<string, number[]>()
  for (const row of withSalary) {
    const prof = row.profession!
    if (!professionMap.has(prof)) professionMap.set(prof, [])
    professionMap.get(prof)!.push(row.salary!)
  }

  const average_by_profession = Array.from(professionMap.entries())
    .map(([profession, salaries]) => ({
      profession,
      avg_salary: Math.round(mean(salaries)),
    }))
    .sort((a, b) => b.avg_salary - a.avg_salary)

  // Filter by profession (case-insensitive)
  const professionData = withSalary.filter(
    (r) => r.profession?.toLowerCase() === input.profession.toLowerCase()
  )

  if (professionData.length === 0) {
    return {
      predicted_salary: 0,
      confidence_low: 0,
      confidence_high: 0,
      sample_size: 0,
      average_by_profession,
      message: `No salary data found for profession "${input.profession}". Try a different profession.`,
    }
  }

  const professionSalaries = professionData.map((r) => r.salary!)
  const professionAvg = mean(professionSalaries)

  // Filter by age band ±10 years
  const ageBandData = professionData.filter(
    (r) => r.age !== null && Math.abs(r.age! - input.age) <= 10
  )

  const ageBandSalaries =
    ageBandData.length >= 3 ? ageBandData.map((r) => r.salary!) : professionSalaries

  const ageBandAvg = mean(ageBandSalaries)

  // Weighted prediction: 70% age band, 30% profession average
  const predictedSalary = Math.round(0.7 * ageBandAvg + 0.3 * professionAvg)

  // Confidence range: ±1 std dev, minimum ±15%
  const sd = stdDev(ageBandSalaries)
  const fallback = predictedSalary * 0.15
  const margin = sd > fallback ? Math.round(sd) : Math.round(fallback)

  return {
    predicted_salary: predictedSalary,
    confidence_low: Math.max(0, predictedSalary - margin),
    confidence_high: predictedSalary + margin,
    sample_size: ageBandData.length > 0 ? ageBandData.length : professionData.length,
    average_by_profession,
  }
}
