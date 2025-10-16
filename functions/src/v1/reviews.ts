import { onRequest } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { ReviewSchema, CreateReviewSchema, UpdateReviewSchema } from '@tuto/schemas'

// Mock data for now - will be replaced with Airtable integration
const mockReviews = [
  {
    id: '1',
    teacherId: '1',
    studentId: '1',
    rating: 5,
    comment: 'Great teacher!',
    status: 'pending' as const,
    schoolId: 'school1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
]

export const getReviews = onRequest({
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

    let reviews = mockReviews.filter(r => r.schoolId === schoolId)
    
    if (status) {
      reviews = reviews.filter(r => r.status === status)
    }
    
    res.json({
      success: true,
      data: reviews,
      pagination: {
        page: 1,
        limit: 10,
        total: reviews.length,
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

export const updateReviewStatus = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res) => {
  try {
    // TODO: Add auth middleware
    // TODO: Add rate limiting
    // TODO: Add audit logging

    const { id } = req.params
    const validatedData = UpdateReviewSchema.parse(req.body)
    
    const reviewIndex = mockReviews.findIndex(r => r.id === id)
    if (reviewIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      })
    }

    const updatedReview = {
      ...mockReviews[reviewIndex],
      ...validatedData,
      updatedAt: new Date().toISOString(),
    }

    mockReviews[reviewIndex] = updatedReview

    // TODO: Add audit log entry

    res.json({
      success: true,
      data: updatedReview
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


