import { Request } from 'express'

export interface AuditLog {
  id: string
  timestamp: string
  actorUid: string
  action: string
  entity: string
  recordId: string
  payloadHash: string
  metadata?: any
}

export const createAuditLog = (
  actorUid: string,
  action: string,
  entity: string,
  recordId: string,
  payload?: any
): AuditLog => {
  const crypto = require('crypto')
  
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    actorUid,
    action,
    entity,
    recordId,
    payloadHash: payload ? crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex') : '',
  }
}

export const logAudit = (auditLog: AuditLog) => {
  // TODO: Store in Airtable or database
  console.log('AUDIT:', JSON.stringify(auditLog, null, 2))
}

export const auditMiddleware = (action: string, entity: string) => {
  return (req: any, res: any, next: any) => {
    const originalSend = res.send
    
    res.send = function(data: any) {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        const recordId = req.params.id || req.body.id || 'unknown'
        const auditLog = createAuditLog(
          req.user.uid,
          action,
          entity,
          recordId,
          req.body
        )
        logAudit(auditLog)
      }
      originalSend.call(this, data)
    }
    
    next()
  }
}


