import { onRequest } from 'firebase-functions/v2/https'
import { corsMiddleware } from './cors'
import { authenticateToken, AuthenticatedRequest } from './auth'
import { readRateLimit } from './rate-limit'
import { airtableService } from './airtable'

/**
 * Get all teachers for a school
 * GET /api/v1/school/teachers?schoolId=X&status=Active
 */
export const getSchoolTeachers = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res): Promise<void> => {
  try {
    corsMiddleware(req, res, () => {})
    // Authentication optional for read operations (Next.js layer handles auth)
    // await authenticateToken(req as AuthenticatedRequest, res, () => {})
    readRateLimit(req, res, () => {})
    
    const { schoolId, status, subject, q, page, limit, parentEmail } = req.query
    
    if (!schoolId) {
      res.status(400).json({
        success: false,
        code: 'BAD_REQUEST',
        message: 'School ID is required'
      })
      return
    }

    const filters = {
      ...(status && { status: status as string }),
      ...(subject && { subject: subject as string }),
      ...(q && { q: q as string }),
      ...(page && { page: parseInt(page as string) }),
      ...(limit && { limit: parseInt(limit as string) }),
      ...(parentEmail && { parentEmail: parentEmail as string }),
    }
    
    const teachers = await airtableService.getSchoolTeachers(schoolId as string, filters)
    
    res.json({
      success: true,
      data: teachers
    })
  } catch (error) {
    console.error('Error in getSchoolTeachers:', error)
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    })
  }
})

/**
 * Get a single teacher by ID
 * GET /api/v1/school/teachers/:teacherId?schoolId=X
 */
export const getSchoolTeacherById = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res): Promise<void> => {
  try {
    corsMiddleware(req, res, () => {})
    readRateLimit(req, res, () => {})
    
    const teacherId = req.query.teacherId as string
    const schoolId = req.query.schoolId as string
    
    if (!teacherId) {
      res.status(400).json({
        success: false,
        code: 'BAD_REQUEST',
        message: 'Teacher ID is required'
      })
      return
    }

    const teacher = await airtableService.getSchoolTeacherById(teacherId)
    
    if (!teacher) {
      res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Teacher not found'
      })
      return
    }

    // Calculate aggregated stats if schoolId provided
    let stats = {}
    if (schoolId && teacher.fields['Teacher Name']) {
      const teacherName = teacher.fields['Teacher Name'] as string
      
      // Tenure calculation
      const hireDate = teacher.fields['Hire Date']
      let tenure = 0
      if (hireDate) {
        const hired = new Date(hireDate)
        const now = new Date()
        tenure = Math.floor((now.getTime() - hired.getTime()) / (1000 * 60 * 60 * 24 * 365))
      }

      // Fetch attendance, feedback, and teaching hours
      const [attendance, feedback, hours] = await Promise.all([
        airtableService.getTeacherAttendance(teacherName, schoolId, 30),
        airtableService.getTeacherFeedback(teacherName, schoolId, 10),
        airtableService.getTeachingHours(teacherName, schoolId, 4)
      ])

      const absences = attendance.filter(a => a.fields.Status === 'Absent' || a.fields.Status === 'On Leave').length
      
      const feedbackRatings = feedback
        .map(f => f.fields.Rating as number)
        .filter(r => typeof r === 'number')
      const avgFeedbackRating = feedbackRatings.length > 0
        ? feedbackRatings.reduce((sum, r) => sum + r, 0) / feedbackRatings.length
        : 0

      const totalHours = hours
        .map(h => h.fields['Total Hours'] as number)
        .filter(h => typeof h === 'number')
      const avgWorkload = totalHours.length > 0
        ? totalHours.reduce((sum, h) => sum + h, 0) / totalHours.length
        : 0

      stats = {
        tenure,
        absences,
        avgFeedbackRating: Math.round(avgFeedbackRating * 10) / 10,
        feedbackCount: feedback.length,
        avgWorkload: Math.round(avgWorkload * 10) / 10
      }
    }
    
    res.json({
      success: true,
      data: {
        ...teacher,
        stats
      }
    })
  } catch (error) {
    console.error('Error in getSchoolTeacherById:', error)
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    })
  }
})

/**
 * Create a new teacher (admin only)
 * POST /api/v1/school/teachers
 */
export const createSchoolTeacher = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res): Promise<void> => {
  try {
    corsMiddleware(req, res, () => {})
    // TODO: Enable auth for create operations
    // await authenticateToken(req as AuthenticatedRequest, res, () => {})
    
    const data = req.body
    
    if (!data || !data['Teacher Name'] || !data['School Name']) {
      res.status(400).json({
        success: false,
        code: 'BAD_REQUEST',
        message: 'Teacher Name and School Name are required'
      })
      return
    }

    const teacher = await airtableService.createSchoolTeacher(data)
    
    res.status(201).json({
      success: true,
      data: teacher
    })
  } catch (error) {
    console.error('Error in createSchoolTeacher:', error)
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    })
  }
})

/**
 * Update a teacher (admin only)
 * PATCH /api/v1/school/teachers/:teacherId
 */
export const updateSchoolTeacher = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res): Promise<void> => {
  try {
    corsMiddleware(req, res, () => {})
    // TODO: Enable auth for update operations
    // await authenticateToken(req as AuthenticatedRequest, res, () => {})
    
    const teacherId = req.query.teacherId as string
    const data = req.body
    
    if (!teacherId) {
      res.status(400).json({
        success: false,
        code: 'BAD_REQUEST',
        message: 'Teacher ID is required'
      })
      return
    }

    if (!data || Object.keys(data).length === 0) {
      res.status(400).json({
        success: false,
        code: 'BAD_REQUEST',
        message: 'Update data is required'
      })
      return
    }

    const teacher = await airtableService.updateSchoolTeacher(teacherId, data)
    
    res.json({
      success: true,
      data: teacher
    })
  } catch (error) {
    console.error('Error in updateSchoolTeacher:', error)
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    })
  }
})

/**
 * Get teacher attendance records
 * GET /api/v1/school/teachers/:teacherId/attendance?schoolId=X&days=90
 */
export const getSchoolTeacherAttendance = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res): Promise<void> => {
  try {
    corsMiddleware(req, res, () => {})
    readRateLimit(req, res, () => {})
    
    const teacherId = req.query.teacherId as string
    const schoolId = req.query.schoolId as string
    const days = req.query.days ? parseInt(req.query.days as string) : 90
    
    if (!teacherId || !schoolId) {
      res.status(400).json({
        success: false,
        code: 'BAD_REQUEST',
        message: 'Teacher ID and School ID are required'
      })
      return
    }

    // Get teacher to fetch name
    const teacher = await airtableService.getSchoolTeacherById(teacherId)
    if (!teacher || !teacher.fields['Teacher Name']) {
      res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Teacher not found'
      })
      return
    }

    const attendance = await airtableService.getTeacherAttendance(
      teacher.fields['Teacher Name'] as string,
      schoolId,
      days
    )

    // Calculate summary
    const total = attendance.length
    const present = attendance.filter(a => a.fields.Status === 'Present').length
    const absent = attendance.filter(a => a.fields.Status === 'Absent').length
    const onLeave = attendance.filter(a => a.fields.Status === 'On Leave').length
    const late = attendance.filter(a => a.fields.Status === 'Late').length

    res.json({
      success: true,
      data: attendance,
      summary: {
        total,
        present,
        absent,
        onLeave,
        late,
        attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0
      }
    })
  } catch (error) {
    console.error('Error in getSchoolTeacherAttendance:', error)
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    })
  }
})

/**
 * Get teacher feedback
 * GET /api/v1/school/teachers/:teacherId/feedback?schoolId=X&limit=20
 */
export const getSchoolTeacherFeedback = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res): Promise<void> => {
  try {
    corsMiddleware(req, res, () => {})
    readRateLimit(req, res, () => {})
    
    const teacherId = req.query.teacherId as string
    const schoolId = req.query.schoolId as string
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20
    
    if (!teacherId || !schoolId) {
      res.status(400).json({
        success: false,
        code: 'BAD_REQUEST',
        message: 'Teacher ID and School ID are required'
      })
      return
    }

    const teacher = await airtableService.getSchoolTeacherById(teacherId)
    if (!teacher || !teacher.fields['Teacher Name']) {
      res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Teacher not found'
      })
      return
    }

    const feedback = await airtableService.getTeacherFeedback(
      teacher.fields['Teacher Name'] as string,
      schoolId,
      limit
    )

    // Calculate summary
    const ratings = feedback
      .map(f => f.fields.Rating as number)
      .filter(r => typeof r === 'number')
    
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0

    res.json({
      success: true,
      data: feedback,
      summary: {
        total: feedback.length,
        avgRating: Math.round(avgRating * 10) / 10
      }
    })
  } catch (error) {
    console.error('Error in getSchoolTeacherFeedback:', error)
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    })
  }
})

/**
 * Get teacher teaching hours
 * GET /api/v1/school/teachers/:teacherId/teaching-hours?schoolId=X&weeks=12
 */
export const getSchoolTeacherTeachingHours = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res): Promise<void> => {
  try {
    corsMiddleware(req, res, () => {})
    readRateLimit(req, res, () => {})
    
    const teacherId = req.query.teacherId as string
    const schoolId = req.query.schoolId as string
    const weeks = req.query.weeks ? parseInt(req.query.weeks as string) : 12
    
    if (!teacherId || !schoolId) {
      res.status(400).json({
        success: false,
        code: 'BAD_REQUEST',
        message: 'Teacher ID and School ID are required'
      })
      return
    }

    const teacher = await airtableService.getSchoolTeacherById(teacherId)
    if (!teacher || !teacher.fields['Teacher Name']) {
      res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Teacher not found'
      })
      return
    }

    const hours = await airtableService.getTeachingHours(
      teacher.fields['Teacher Name'] as string,
      schoolId,
      weeks
    )

    // Calculate summary
    const totalHours = hours
      .map(h => h.fields['Total Hours'] as number)
      .filter(h => typeof h === 'number')
    
    const avgHours = totalHours.length > 0
      ? totalHours.reduce((sum, h) => sum + h, 0) / totalHours.length
      : 0

    res.json({
      success: true,
      data: hours,
      summary: {
        weeksRecorded: hours.length,
        avgWeeklyHours: Math.round(avgHours * 10) / 10,
        totalHours: totalHours.reduce((sum, h) => sum + h, 0)
      }
    })
  } catch (error) {
    console.error('Error in getSchoolTeacherTeachingHours:', error)
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    })
  }
})

/**
 * Get teacher KPIs for dashboard
 * GET /api/v1/school/teachers/kpis?schoolId=X
 */
export const getSchoolTeacherKPIs = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res): Promise<void> => {
  try {
    corsMiddleware(req, res, () => {})
    readRateLimit(req, res, () => {})
    
    const schoolId = req.query.schoolId as string
    
    if (!schoolId) {
      res.status(400).json({
        success: false,
        code: 'BAD_REQUEST',
        message: 'School ID is required'
      })
      return
    }

    const kpis = await airtableService.getTeacherKPIs(schoolId)
    
    res.json({
      success: true,
      data: kpis
    })
  } catch (error) {
    console.error('Error in getSchoolTeacherKPIs:', error)
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    })
  }
})


