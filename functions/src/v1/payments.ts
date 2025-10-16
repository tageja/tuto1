import { onRequest } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { PaymentSchema, CreatePaymentSchema, RefundSchema, CreateRefundSchema } from '@tuto/schemas'

// Mock data for now - will be replaced with Airtable integration
const mockPayments = [
  {
    id: '1',
    studentId: '1',
    amount: 500000,
    currency: 'VND',
    status: 'completed' as const,
    paymentMethod: 'credit_card',
    description: 'Monthly tuition fee',
    schoolId: 'school1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
]

const mockRefunds = [
  {
    id: '1',
    paymentId: '1',
    amount: 250000,
    reason: 'Student withdrawal',
    status: 'completed' as const,
    processedBy: 'admin1',
    processedAt: new Date().toISOString(),
  }
]

export const getPayments = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res) => {
  try {
    // TODO: Add auth middleware
    // TODO: Add rate limiting
    // TODO: Add audit logging

    const { schoolId, status } = req.query
    
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School ID is required'
      })
    }

    let payments = mockPayments.filter(p => p.schoolId === schoolId)
    
    if (status) {
      payments = payments.filter(p => p.status === status)
    }
    
    res.json({
      success: true,
      data: payments,
      pagination: {
        page: 1,
        limit: 10,
        total: payments.length,
        totalPages: 1
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

export const getRefunds = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res) => {
  try {
    // TODO: Add auth middleware
    // TODO: Add rate limiting
    // TODO: Add audit logging

    const { schoolId } = req.query
    
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: 'School ID is required'
      })
    }

    // Get refunds for payments in this school
    const schoolPayments = mockPayments.filter(p => p.schoolId === schoolId)
    const paymentIds = schoolPayments.map(p => p.id)
    const refunds = mockRefunds.filter(r => paymentIds.includes(r.paymentId))
    
    res.json({
      success: true,
      data: refunds,
      pagination: {
        page: 1,
        limit: 10,
        total: refunds.length,
        totalPages: 1
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

export const createRefund = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res) => {
  try {
    // TODO: Add auth middleware
    // TODO: Add rate limiting
    // TODO: Add audit logging

    const validatedData = CreateRefundSchema.parse(req.body)
    
    const newRefund = {
      id: Date.now().toString(),
      ...validatedData,
    }

    // TODO: Save to Airtable
    mockRefunds.push(newRefund)

    // TODO: Add audit log entry

    res.status(201).json({
      success: true,
      data: newRefund
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      })
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})


