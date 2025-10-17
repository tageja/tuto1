import { z } from 'zod'

export const PaymentSchema = z.object({
  id: z.string(),
  studentId: z.string(),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('VND'),
  status: z.enum(['pending', 'completed', 'failed', 'refunded']),
  paymentMethod: z.string(),
  description: z.string(),
  schoolId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const CreatePaymentSchema = PaymentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const RefundSchema = z.object({
  id: z.string(),
  paymentId: z.string(),
  amount: z.number().positive('Refund amount must be positive'),
  reason: z.string(),
  status: z.enum(['pending', 'completed', 'failed']),
  processedBy: z.string(),
  processedAt: z.string().optional(),
})

export const CreateRefundSchema = RefundSchema.omit({
  id: true,
  processedAt: true,
})

export type Payment = z.infer<typeof PaymentSchema>
export type CreatePayment = z.infer<typeof CreatePaymentSchema>
export type Refund = z.infer<typeof RefundSchema>
export type CreateRefund = z.infer<typeof CreateRefundSchema>


