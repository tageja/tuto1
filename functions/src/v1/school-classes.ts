import { onRequest } from 'firebase-functions/v2/https'
import { corsMiddleware } from './cors'
import { authenticateToken, AuthenticatedRequest } from './auth'
import { readRateLimit } from './rate-limit'
import { airtableService } from './airtable'

/**
 * Get all classes for a school with optional filters
 * GET /api/v1/school/classes?schoolId=X&grade=5&search=math&page=1&pageSize=10
 */
export const getSchoolClasses = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res): Promise<void> => {
  try {
    corsMiddleware(req, res, () => {})
    // Authentication optional for read operations (Next.js layer handles auth)
    // await authenticateToken(req as AuthenticatedRequest, res, () => {})
    readRateLimit(req, res, () => {})
    
    const { schoolId, grade, search, page = '1', pageSize = '10' } = req.query
    
    if (!schoolId) {
      res.status(400).json({
        success: false,
        code: 'BAD_REQUEST',
        message: 'School ID is required'
      })
      return
    }

    const filters = {
      grade: grade as string | undefined,
      search: search as string | undefined,
    }

    const allRecords = await airtableService.getSchoolClasses(schoolId as string, filters)
    
    // Pagination
    const pageNum = parseInt(page as string)
    const pageSizeNum = parseInt(pageSize as string)
    const start = (pageNum - 1) * pageSizeNum
    const end = start + pageSizeNum
    const paginatedRecords = allRecords.slice(start, end)
    
    res.json({
      success: true,
      records: paginatedRecords,
      total: allRecords.length,
      page: pageNum,
      pageSize: pageSizeNum,
      totalPages: Math.ceil(allRecords.length / pageSizeNum),
    })
  } catch (error) {
    console.error('Error in getSchoolClasses:', error)
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    })
  }
})

/**
 * Get a single class by ID
 * GET /api/v1/school/classes/:classId
 */
export const getSchoolClassById = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res): Promise<void> => {
  try {
    corsMiddleware(req, res, () => {})
    // Authentication optional for read operations (Next.js layer handles auth)
    // await authenticateToken(req as AuthenticatedRequest, res, () => {})
    readRateLimit(req, res, () => {})
    
    const classId = req.query.classId as string
    
    if (!classId) {
      res.status(400).json({
        success: false,
        code: 'BAD_REQUEST',
        message: 'Class ID is required'
      })
      return
    }

    const classRecord = await airtableService.getSchoolClassById(classId)
    
    if (!classRecord) {
      res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Class not found'
      })
      return
    }
    
    res.json({
      success: true,
      data: classRecord
    })
  } catch (error) {
    console.error('Error in getSchoolClassById:', error)
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    })
  }
})

/**
 * Get distinct grades for a school
 * GET /api/v1/school/classes/grades?schoolId=X
 */
export const getSchoolGrades = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res): Promise<void> => {
  try {
    corsMiddleware(req, res, () => {})
    // Authentication optional for read operations (Next.js layer handles auth)
    // await authenticateToken(req as AuthenticatedRequest, res, () => {})
    readRateLimit(req, res, () => {})
    
    const { schoolId } = req.query
    
    if (!schoolId) {
      res.status(400).json({
        success: false,
        code: 'BAD_REQUEST',
        message: 'School ID is required'
      })
      return
    }

    const grades = await airtableService.getDistinctGrades(schoolId as string)
    
    res.json({
      success: true,
      grades
    })
  } catch (error) {
    console.error('Error in getSchoolGrades:', error)
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    })
  }
})

/**
 * Get KPIs for classes
 * GET /api/v1/school/classes/kpis?schoolId=X
 */
export const getSchoolClassKpis = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res): Promise<void> => {
  try {
    corsMiddleware(req, res, () => {})
    // Authentication optional for read operations (Next.js layer handles auth)
    // await authenticateToken(req as AuthenticatedRequest, res, () => {})
    readRateLimit(req, res, () => {})
    
    const { schoolId } = req.query
    
    if (!schoolId) {
      res.status(400).json({
        success: false,
        code: 'BAD_REQUEST',
        message: 'School ID is required'
      })
      return
    }

    // Get all classes
    const classes = await airtableService.getSchoolClasses(schoolId as string)
    const totalClasses = classes.length
    const activeClasses = classes.filter((c: any) => c.fields?.Status === 'Active').length
    
    // Get all students
    const students = await airtableService.getSchoolStudents(schoolId as string)
    const totalStudents = students.length
    
    // Calculate total capacity
    const totalCapacity = classes.reduce((sum, c) => {
      const capacity = (c as any).fields?.['Student Count'] || 25
      return sum + capacity
    }, 0)
    const capacityUsage = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0
    
    // Get attendance for last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const dateFilter = thirtyDaysAgo.toISOString().split('T')[0]
    
    const attendanceRecords = await airtableService.getAttendanceRecords(schoolId as string, {
      date: dateFilter
    })
    
    const presentCount = attendanceRecords.filter(r => r.fields?.Status === 'Present').length
    const avgAttendance = attendanceRecords.length > 0 
      ? Math.round((presentCount / attendanceRecords.length) * 100)
      : 0
    
    res.json({
      success: true,
      data: {
        totalClasses,
        activeClasses,
        totalStudents,
        capacityUsage,
        avgAttendance,
      }
    })
  } catch (error) {
    console.error('Error in getSchoolClassKpis:', error)
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    })
  }
})

/**
 * Get students for a specific class
 * GET /api/v1/school/classes/:classId/students
 */
export const getSchoolClassStudents = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res): Promise<void> => {
  try {
    corsMiddleware(req, res, () => {})
    // Authentication optional for read operations (Next.js layer handles auth)
    // await authenticateToken(req as AuthenticatedRequest, res, () => {})
    readRateLimit(req, res, () => {})
    
    const { classId } = req.query
    
    if (!classId) {
      res.status(400).json({
        success: false,
        code: 'BAD_REQUEST',
        message: 'Class ID is required'
      })
      return
    }

    // Get class info first to get schoolId
    const classRecord = await airtableService.getSchoolClassById(classId as string)
    
    console.log('🔍 [getSchoolClassStudents] Class record fetched:', { classId, classRecord })
    
    if (!classRecord) {
      res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Class not found'
      })
      return
    }

    const schoolId = (classRecord as any).schoolId || classRecord.fields?.['School Name'] || ''
    const className = (classRecord as any).name || classRecord.fields?.['Class Name'] || '' // Get the class name (e.g., "Class 5A")
    
    console.log('📍 [getSchoolClassStudents] Using schoolId:', schoolId, 'and className:', className)
    console.log('🔍 [getSchoolClassStudents] Filter will be:', { 
      classId,
      schoolId,
      className 
    })
    
    // IMPORTANT: Pass className (e.g., "Class 5A") not classId (Airtable record ID)
    const students = await airtableService.getSchoolStudents(schoolId, { className })
    
    console.log('📊 [getSchoolClassStudents] Found students:', {
      count: students.length,
      firstStudent: students[0]
    })
    
    res.json({
      success: true,
      students
    })
  } catch (error) {
    console.error('Error in getSchoolClassStudents:', error)
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    })
  }
})

/**
 * Get attendance stats for a class
 * GET /api/v1/school/classes/:classId/attendance?days=7
 */
export const getSchoolClassAttendance = onRequest({
  cors: true,
  region: 'asia-southeast1',
}, async (req, res): Promise<void> => {
  try {
    corsMiddleware(req, res, () => {})
    // Authentication optional for read operations (Next.js layer handles auth)
    // await authenticateToken(req as AuthenticatedRequest, res, () => {})
    readRateLimit(req, res, () => {})
    
    const { classId, days = '7' } = req.query
    
    if (!classId) {
      res.status(400).json({
        success: false,
        code: 'BAD_REQUEST',
        message: 'Class ID is required'
      })
      return
    }

    // Get class info
    const classRecord = await airtableService.getSchoolClassById(classId as string)
    
    console.log('🔍 [getSchoolClassAttendance] Class record:', { classId, classRecord })
    
    if (!classRecord) {
      res.status(404).json({
        success: false,
        code: 'NOT_FOUND',
        message: 'Class not found'
      })
      return
    }

    const schoolId = (classRecord as any).schoolId || classRecord.fields?.['School Name'] || ''
    const className = (classRecord as any).name || classRecord.fields?.['Class Name'] || '' // Get the class name (e.g., "Class 5A")
    
    console.log('📍 [getSchoolClassAttendance] Using schoolId:', schoolId, 'and className:', className)
    
    // Get attendance for specified days
    const daysAgo = new Date()
    daysAgo.setDate(daysAgo.getDate() - parseInt(days as string))
    const startDate = daysAgo.toISOString().split('T')[0]
    
    // IMPORTANT: Pass className (e.g., "Class 5A") not classId (Airtable record ID)
    const attendanceRecords = await airtableService.getAttendanceRecords(schoolId, {
      className,
      date: startDate
    })
    
    // Get today's attendance
    const today = new Date().toISOString().split('T')[0]
    const todayRecords = await airtableService.getAttendanceRecords(schoolId, {
      className,
      date: today
    })
    
    const presentToday = todayRecords.filter(r => r.fields?.Status === 'Present').length
    const presentCount = attendanceRecords.filter(r => r.fields?.Status === 'Present').length
    const last7Days = attendanceRecords.length > 0 
      ? Math.round((presentCount / attendanceRecords.length) * 100)
      : 0
    
    res.json({
      success: true,
      presentToday,
      last7Days
    })
  } catch (error) {
    console.error('Error in getSchoolClassAttendance:', error)
    res.status(500).json({
      success: false,
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    })
  }
})


