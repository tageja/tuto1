"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireSchoolAccess = exports.requireRole = exports.authenticateToken = void 0;
const auth_1 = require("firebase-admin/auth");
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: 'Missing or invalid authorization header'
            });
        }
        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await (0, auth_1.getAuth)().verifyIdToken(idToken);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email || '',
            role: decodedToken.role || 'teacher',
            schoolIds: decodedToken.schoolIds || []
        };
        next();
    }
    catch (error) {
        return res.status(401).json({
            success: false,
            code: 'UNAUTHORIZED',
            message: 'Invalid token'
        });
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                code: 'FORBIDDEN',
                message: 'Insufficient permissions'
            });
        }
        next();
    };
};
exports.requireRole = requireRole;
const requireSchoolAccess = (req, res, next) => {
    const schoolId = req.params.schoolId || req.query.schoolId;
    if (!schoolId) {
        return res.status(400).json({
            success: false,
            code: 'BAD_REQUEST',
            message: 'School ID is required'
        });
    }
    if (!req.user || !req.user.schoolIds.includes(schoolId)) {
        return res.status(403).json({
            success: false,
            code: 'FORBIDDEN',
            message: 'Access denied for this school'
        });
    }
    next();
};
exports.requireSchoolAccess = requireSchoolAccess;
