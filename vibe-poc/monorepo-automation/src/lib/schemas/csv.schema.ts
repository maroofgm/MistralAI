import { PersonalSchema } from './personal.schema'

export const CsvRowSchema = PersonalSchema

export const REQUIRED_CSV_HEADERS = [
  'first_name',
  'last_name',
  'dob',
  'birth_place',
  'add_1',
  'zip_code',
  'profession',
  'age',
  'salary',
] as const
