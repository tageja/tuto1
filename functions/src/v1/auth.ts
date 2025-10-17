import { getAuth } from 'firebase-admin/auth'
import { Request, Response } from 'express'

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string
    email: string
    role: string
    schoolIds: string[]
  }
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid authorization header'
      })
    }

    const idToken = authHeader.split('Bearer ')[1]
    const decodedToken = await getAuth().verifyIdToken(idToken)
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: decodedToken.role || 'teacher',
      schoolIds: decodedToken.schoolIds || []
    }
    
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      code: 'UNAUTHORIZED',
      message: 'Invalid token'
    })
  }
}

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: any) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: 'Insufficient permissions'
      })
    }
    next()
  }
}

export const requireSchoolAccess = (req: AuthenticatedRequest, res: Response, next: any) => {
  const schoolId = req.params.schoolId || req.query.schoolId
  if (!schoolId) {
    return res.status(400).json({
      success: false,
      code: 'BAD_REQUEST',
      message: 'School ID is required'
    })
  }
  
  if (!req.user || !req.user.schoolIds.includes(schoolId as string)) {
    return res.status(403).json({
      success: false,
      code: 'FORBIDDEN',
      message: 'Access denied for this school'
    })
  }
  
  next()
}


