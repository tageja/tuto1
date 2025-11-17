"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditMiddleware = exports.logAudit = exports.createAuditLog = void 0;
const createAuditLog = (actorUid, action, entity, recordId, payload) => {
    const crypto = require('crypto');
    return {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        actorUid,
        action,
        entity,
        recordId,
        payloadHash: payload ? crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex') : '',
    };
};
exports.createAuditLog = createAuditLog;
const logAudit = (auditLog) => {
    // TODO: Store in Airtable or database
    console.log('AUDIT:', JSON.stringify(auditLog, null, 2));
};
exports.logAudit = logAudit;
const auditMiddleware = (action, entity) => {
    return (req, res, next) => {
        const originalSend = res.send;
        res.send = function (data) {
            if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
                const recordId = req.params.id || req.body.id || 'unknown';
                const auditLog = (0, exports.createAuditLog)(req.user.uid, action, entity, recordId, req.body);
                (0, exports.logAudit)(auditLog);
            }
            originalSend.call(this, data);
        };
        next();
    };
};
exports.auditMiddleware = auditMiddleware;
