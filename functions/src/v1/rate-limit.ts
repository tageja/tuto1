import { Request, Response } from 'express'

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export const rateLimit = (windowMs: number, maxRequests: number) => {
  return (req: any, res: Response, next: any) => {
    const identifier = req.user?.uid || req.ip
    const now = Date.now()
    const windowStart = now - windowMs
    
    const entry = rateLimitStore.get(identifier)
    
    if (!entry || entry.resetTime < now) {
      // New window or expired entry
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      })
      next()
      return
    }
    
    if (entry.count >= maxRequests) {
      // Rate limit exceeded
      res.status(429).json({
        success: false,
        code: 'RATE_LIMITED',
        message: 'Too many requests',
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      })
      return
    }
    
    entry.count++
    next()
  }
}

export const writeRateLimit = rateLimit(60000, 10) // 10 writes per minute
export const readRateLimit = rateLimit(60000, 100) // 100 reads per minute


