import { onRequest } from 'firebase-functions/v2/https'
import { z } from 'zod'
import { StudentSchema, CreateStudentSchema, UpdateStudentSchema } from '@tuto/schemas'

// Mock data for now - will be replaced with Airtable integration
const mockStudents = [
  {
    id: '1',
    name: 'Alice Smith',
    email: 'alice@example.com',
    phone: '+1234567891',
    grade: 'Grade 10',
    subjects: ['Mathematics', 'Physics'],
    enrollmentDate: '2024-01-01',
    status: 'active' as const,
    parentContact: '+1234567892',
    schoolId: 'school1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
]

export const getStudents = onRequest({
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

    const students = mockStudents.filter(s => s.schoolId === schoolId)
    
    res.json({
      success: true,
      data: students,
      pagination: {
        page: 1,
        limit: 10,
        total: students.length,
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

export const createStudent = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res) => {
  try {
    // TODO: Add auth middleware
    // TODO: Add rate limiting
    // TODO: Add audit logging

    const validatedData = CreateStudentSchema.parse(req.body)
    
    const newStudent = {
      id: Date.now().toString(),
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // TODO: Save to Airtable
    mockStudents.push(newStudent)

    res.status(201).json({
      success: true,
      data: newStudent
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

export const updateStudent = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res) => {
  try {
    // TODO: Add auth middleware
    // TODO: Add rate limiting
    // TODO: Add audit logging

    const { id } = req.params
    const validatedData = UpdateStudentSchema.parse(req.body)
    
    const studentIndex = mockStudents.findIndex(s => s.id === id)
    if (studentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      })
    }

    const updatedStudent = {
      ...mockStudents[studentIndex],
      ...validatedData,
      updatedAt: new Date().toISOString(),
    }

    mockStudents[studentIndex] = updatedStudent

    res.json({
      success: true,
      data: updatedStudent
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


