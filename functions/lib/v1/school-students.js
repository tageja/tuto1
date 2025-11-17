"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchoolStudentById = exports.getSchoolStudents = void 0;
const https_1 = require("firebase-functions/v2/https");
const cors_1 = require("./cors");
const rate_limit_1 = require("./rate-limit");
const airtable_1 = require("./airtable");
/**
 * Get all students for a school
 * GET /api/v1/school/students?schoolId=X&classId=Y&grade=5
 */
exports.getSchoolStudents = (0, https_1.onRequest)({
    cors: true,
    region: 'asia-southeast1',
}, async (req, res) => {
    try {
        (0, cors_1.corsMiddleware)(req, res, () => { });
        // Authentication optional for read operations (Next.js layer handles auth)
        // await authenticateToken(req as AuthenticatedRequest, res, () => {})
        (0, rate_limit_1.readRateLimit)(req, res, () => { });
        const { schoolId, className, grade } = req.query;
        if (!schoolId) {
            res.status(400).json({
                success: false,
                code: 'BAD_REQUEST',
                message: 'School ID is required'
            });
            return;
        }
        const filters = {
            className: className,
            grade: grade,
        };
        const students = await airtable_1.airtableService.getSchoolStudents(schoolId, filters);
        res.json({
            success: true,
            data: students
        });
    }
    catch (error) {
        console.error('Error in getSchoolStudents:', error);
        res.status(500).json({
            success: false,
            code: 'INTERNAL_ERROR',
            message: 'Internal server error'
        });
    }
});
/**
 * Get a single student by ID
 * GET /api/v1/school/students/:studentId
 */
exports.getSchoolStudentById = (0, https_1.onRequest)({
    cors: true,
    region: 'asia-southeast1',
}, async (req, res) => {
    try {
        (0, cors_1.corsMiddleware)(req, res, () => { });
        // Authentication optional for read operations (Next.js layer handles auth)
        // await authenticateToken(req as AuthenticatedRequest, res, () => {})
        (0, rate_limit_1.readRateLimit)(req, res, () => { });
        const studentId = req.query.studentId;
        if (!studentId) {
            res.status(400).json({
                success: false,
                code: 'BAD_REQUEST',
                message: 'Student ID is required'
            });
            return;
        }
        const student = await airtable_1.airtableService.getSchoolStudentById(studentId);
        if (!student) {
            res.status(404).json({
                success: false,
                code: 'NOT_FOUND',
                message: 'Student not found'
            });
            return;
        }
        res.json({
            success: true,
            data: student
        });
    }
    catch (error) {
        console.error('Error in getSchoolStudentById:', error);
        res.status(500).json({
            success: false,
            code: 'INTERNAL_ERROR',
            message: 'Internal server error'
        });
    }
});
