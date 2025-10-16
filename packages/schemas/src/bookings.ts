import { z } from 'zod'

export const BookingSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  teacherId: z.string(),
  subject: z.string(),
  scheduledDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no-show']),
  notes: z.string().optional(),
  schoolId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const CreateBookingSchema = BookingSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdateBookingSchema = CreateBookingSchema.partial()

export const BookingStatusUpdateSchema = z.object({
  status: z.enum(['confirmed', 'cancelled', 'completed', 'no-show']),
  notes: z.string().optional(),
})

export type Booking = z.infer<typeof BookingSchema>
export type CreateBooking = z.infer<typeof CreateBookingSchema>
export type UpdateBooking = z.infer<typeof UpdateBookingSchema>
export type BookingStatusUpdate = z.infer<typeof BookingStatusUpdateSchema>


