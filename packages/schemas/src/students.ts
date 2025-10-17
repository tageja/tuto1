import { z } from 'zod'

export const StudentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  grade: z.string(),
  subjects: z.array(z.string()),
  enrollmentDate: z.string(),
  status: z.enum(['active', 'inactive', 'graduated']),
  parentContact: z.string().optional(),
  schoolId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const CreateStudentSchema = StudentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdateStudentSchema = CreateStudentSchema.partial()

export type Student = z.infer<typeof StudentSchema>
export type CreateStudent = z.infer<typeof CreateStudentSchema>
export type UpdateStudent = z.infer<typeof UpdateStudentSchema>


