import { z } from 'zod'

export const FeedbackMessageSchema = z.object({
  id: z.string(),
  feedback_id: z.string(),
  sender_role: z.enum(['parent', 'admin']),
  sender_id: z.string(),
  message: z.string(),
  created_at: z.string(),
})

export const CreateFeedbackMessageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
})

export const FeedbackSchema = z.object({
  id: z.string(),
  school_id: z.string(),
  student_id: z.string(),
  parent_id: z.string(),
  code: z.string(),
  category: z.enum(['request', 'complaint', 'information']),
  title: z.string(),
  description: z.string(),
  status: z.enum(['open', 'overdue', 'closed']),
  deadline_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const FeedbackWithMessagesSchema = FeedbackSchema.extend({
  messages: z.array(FeedbackMessageSchema).optional(),
  student_name: z.string().optional(),
  student_code: z.string().optional(),
  parent_name: z.string().optional(),
})

export const CreateFeedbackSchema = z.object({
  schoolId: z.string().min(1, 'School ID is required'),
  studentId: z.string().min(1, 'Student ID is required'),
  category: z.enum(['request', 'complaint', 'information']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
})

export const UpdateFeedbackStatusSchema = z.object({
  status: z.enum(['closed']),
})

export type Feedback = z.infer<typeof FeedbackSchema>
export type FeedbackWithMessages = z.infer<typeof FeedbackWithMessagesSchema>
export type FeedbackMessage = z.infer<typeof FeedbackMessageSchema>
export type CreateFeedback = z.infer<typeof CreateFeedbackSchema>
export type CreateFeedbackMessage = z.infer<typeof CreateFeedbackMessageSchema>
export type UpdateFeedbackStatus = z.infer<typeof UpdateFeedbackStatusSchema>

