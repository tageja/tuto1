import { z } from 'zod'

export const ClassSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Class name is required'),
  subject: z.string(),
  teacherId: z.string(),
  schoolId: z.string(),
  schedule: z.object({
    days: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])),
    startTime: z.string(),
    endTime: z.string(),
  }),
  capacity: z.number().min(1),
  enrolledStudents: z.array(z.string()),
  status: z.enum(['active', 'inactive', 'completed']),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const CreateClassSchema = ClassSchema.omit({
  id: true,
  enrolledStudents: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdateClassSchema = CreateClassSchema.partial()

export const AttendanceSchema = z.object({
  id: z.string(),
  classId: z.string(),
  studentId: z.string(),
  date: z.string(),
  status: z.enum(['present', 'absent', 'late']),
  notes: z.string().optional(),
})

export const CreateAttendanceSchema = AttendanceSchema.omit({
  id: true,
})

export type Class = z.infer<typeof ClassSchema>
export type CreateClass = z.infer<typeof CreateClassSchema>
export type UpdateClass = z.infer<typeof UpdateClassSchema>
export type Attendance = z.infer<typeof AttendanceSchema>
export type CreateAttendance = z.infer<typeof CreateAttendanceSchema>


