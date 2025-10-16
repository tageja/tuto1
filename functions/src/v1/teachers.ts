import { onRequest } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { TeacherSchema, CreateTeacherSchema, UpdateTeacherSchema } from '@tuto/schemas'
import { corsMiddleware } from './cors'
import { authenticateToken, requireRole, requireSchoolAccess, AuthenticatedRequest } from './auth'
import { writeRateLimit, readRateLimit } from './rate-limit'
import { auditMiddleware } from './audit'
import { airtableService } from './airtable'

export const getTeachers = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res) => {
  try {
    corsMiddleware(req, res, () => {})
    await authenticateToken(req as AuthenticatedRequest, res, () => {})
    readRateLimit(req, res, () => {})
    
    const { schoolId } = req.query
    
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        code: 'BAD_REQUEST',
        message: 'School ID is required'
      })
    }

    const teachers = await airtableService.getTeachers(schoolId as string)
    
    res.json({
      success: true,
      data: teachers,
      pagination: {
        page: 1,
        limit: 10,
        total: teachers.length,
        totalPages: 1
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    })
  }
})

export const createTeacher = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res) => {
  try {
    corsMiddleware(req, res, () => {})
    await authenticateToken(req as AuthenticatedRequest, res, () => {})
    await requireRole(['school_admin', 'tuto_admin'])(req as AuthenticatedRequest, res, () => {})
    writeRateLimit(req, res, () => {})
    auditMiddleware('CREATE', 'teacher')(req, res, () => {})

    const validatedData = CreateTeacherSchema.parse(req.body)
    
    const newTeacher = await airtableService.createTeacher(validatedData)

    res.status(201).json({
      success: true,
      data: newTeacher
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Validation error',
        details: error.errors
      })
    }
    
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    })
  }
})

export const updateTeacher = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res) => {
  try {
    corsMiddleware(req, res, () => {})
    await authenticateToken(req as AuthenticatedRequest, res, () => {})
    await requireRole(['school_admin', 'tuto_admin'])(req as AuthenticatedRequest, res, () => {})
    writeRateLimit(req, res, () => {})
    auditMiddleware('UPDATE', 'teacher')(req, res, () => {})

    const { id } = req.params
    const validatedData = UpdateTeacherSchema.parse(req.body)
    
    const updatedTeacher = await airtableService.updateTeacher(id, validatedData)

    res.json({
      success: true,
      data: updatedTeacher
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        code: 'VALIDATION_ERROR',
        message: 'Validation error',
        details: error.errors
      })
    }
    
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    })
  }
})
