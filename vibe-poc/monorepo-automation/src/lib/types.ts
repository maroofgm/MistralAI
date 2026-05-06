export type PersonalRecord = {
  id: number
  created_at: string
  first_name: string | null
  last_name: string | null
  dob: string | null
  birth_place: string | null
  add_1: string | null
  add_2: string | null
  zip_code: number | null
  profession: string | null
  age: number | null
  salary: number | null
}

export type SalaryPredictionResult = {
  predicted_salary: number
  confidence_low: number
  confidence_high: number
  sample_size: number
  average_by_profession: { profession: string; avg_salary: number }[]
  message?: string
}
