import { z } from 'zod'

export const TeacherSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  subjects: z.array(z.string()),
  experience: z.number().min(0),
  rating: z.number().min(0).max(5),
  availability: z.array(z.string()),
  bio: z.string().optional(),
  verified: z.boolean().default(false),
  schoolId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const CreateTeacherSchema = TeacherSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdateTeacherSchema = CreateTeacherSchema.partial()

export type Teacher = z.infer<typeof TeacherSchema>
export type CreateTeacher = z.infer<typeof CreateTeacherSchema>
export type UpdateTeacher = z.infer<typeof UpdateTeacherSchema>


