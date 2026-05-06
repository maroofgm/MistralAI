import { z } from 'zod'

export const PersonalSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  dob: z.string().min(1, 'Date of birth is required'),
  birth_place: z.string().min(1, 'Birth place is required'),
  add_1: z.string().min(1, 'Address line 1 is required'),
  add_2: z.string().optional().or(z.literal('')),
  zip_code: z.coerce
    .number()
    .int('Zip code must be a whole number')
    .positive('Zip code must be positive'),
  profession: z.string().min(1, 'Profession is required'),
  age: z.coerce
    .number()
    .int('Age must be a whole number')
    .min(0, 'Age must be 0 or more')
    .max(130, 'Age must be 130 or less'),
  salary: z.coerce
    .number()
    .min(0, 'Salary must be 0 or more'),
})

export type PersonalFormData = z.infer<typeof PersonalSchema>
