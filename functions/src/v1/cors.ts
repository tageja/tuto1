import { onRequest } from 'firebase-functions/v2/https'

const ALLOWED_ORIGINS = [
  'http://localhost:3000', // Dashboard dev
  'https://dashboard.tuto.app', // Dashboard prod
  'https://admin.tuto.app', // Admin portal
]

export const corsMiddleware = (req: any, res: any, next: any) => {
  const origin = req.headers.origin
  
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin)
  }
  
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.set('Access-Control-Allow-Credentials', 'true')
  
  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }
  
  next()
}


