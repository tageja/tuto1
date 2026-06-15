import { z } from 'zod'

export const ReviewSchema = z.object({
  id: z.string(),
  teacherId: z.string(),
  studentId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  status: z.enum(['pending', 'approved', 'hidden']),
  schoolId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const CreateReviewSchema = ReviewSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdateReviewSchema = z.object({
  status: z.enum(['approved', 'hidden']),
  comment: z.string().optional(),
})

export type Review = z.infer<typeof ReviewSchema>
export type CreateReview = z.infer<typeof CreateReviewSchema>
export type UpdateReview = z.infer<typeof UpdateReviewSchema>


