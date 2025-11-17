import { onRequest } from 'firebase-functions/v2/https'
import { corsMiddleware } from './cors'
import { authenticateToken, AuthenticatedRequest } from './auth'
import { readRateLimit } from './rate-limit'
import { airtableService } from './airtable'

/**
 * Get all students for a school
 * GET /api/v1/school/students?schoolId=X&classId=Y&grade=5
 */
export const getSchoolStudents = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res): Promise<void> => {
  try {
    corsMiddleware(req, res, () => {})
    // Authentication optional for read operations (Next.js layer handles auth)
    // await authenticateToken(req as AuthenticatedRequest, res, () => {})
    readRateLimit(req, res, () => {})
    
    const { schoolId, className, grade } = req.query
    
    if (!schoolId) {
      res.status(400).json({
        success: false,
        code: 'BAD_REQUEST',
        message: 'School ID is required'
      })
      return
    }

    const filters = {
      className: className as string | undefined,
      grade: grade as string | undefined,
    }

    const students = await airtableService.getSchoolStudents(schoolId as string, filters)
    
    res.json({
      success: true,
      data: students
    })
  } catch (error) {
    console.error('Error in getSchoolStudents:', error)
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    })
  }
})

/**
 * Get a single student by ID
 * GET /api/v1/school/students/:studentId
 */
export const getSchoolStudentById = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res): Promise<void> => {
  try {
    corsMiddleware(req, res, () => {})
    // Authentication optional for read operations (Next.js layer handles auth)
    // await authenticateToken(req as AuthenticatedRequest, res, () => {})
    readRateLimit(req, res, () => {})
    
    const studentId = req.query.studentId as string
    
    if (!studentId) {
      res.status(400).json({
        success: false,
        code: 'BAD_REQUEST',
        message: 'Student ID is required'
      })
      return
    }

    const student = await airtableService.getSchoolStudentById(studentId)
    
    if (!student) {
      res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Student not found'
      })
      return
    }
    
    res.json({
      success: true,
      data: student
    })
  } catch (error) {
    console.error('Error in getSchoolStudentById:', error)
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    })
  }
})


