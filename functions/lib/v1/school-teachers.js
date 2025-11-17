"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSchoolTeacherKPIs = exports.getSchoolTeacherTeachingHours = exports.getSchoolTeacherFeedback = exports.getSchoolTeacherAttendance = exports.updateSchoolTeacher = exports.createSchoolTeacher = exports.getSchoolTeacherById = exports.getSchoolTeachers = void 0;
const https_1 = require("firebase-functions/v2/https");
const cors_1 = require("./cors");
const rate_limit_1 = require("./rate-limit");
const airtable_1 = require("./airtable");
/**
 * Get all teachers for a school
 * GET /api/v1/school/teachers?schoolId=X&status=Active
 */
exports.getSchoolTeachers = (0, https_1.onRequest)({
    cors: true,
    region: 'asia-southeast1',
}, async (req, res) => {
    try {
        (0, cors_1.corsMiddleware)(req, res, () => { });
        // Authentication optional for read operations (Next.js layer handles auth)
        // await authenticateToken(req as AuthenticatedRequest, res, () => {})
        (0, rate_limit_1.readRateLimit)(req, res, () => { });
        const { schoolId, status, subject, q, page, limit, parentEmail } = req.query;
        if (!schoolId) {
            res.status(400).json({
                success: false,
                code: 'BAD_REQUEST',
                message: 'School ID is required'
            });
            return;
        }
        const filters = {
            ...(status && { status: status }),
            ...(subject && { subject: subject }),
            ...(q && { q: q }),
            ...(page && { page: parseInt(page) }),
            ...(limit && { limit: parseInt(limit) }),
            ...(parentEmail && { parentEmail: parentEmail }),
        };
        const teachers = await airtable_1.airtableService.getSchoolTeachers(schoolId, filters);
        res.json({
            success: true,
            data: teachers
        });
    }
    catch (error) {
        console.error('Error in getSchoolTeachers:', error);
        res.status(500).json({
            success: false,
            code: 'INTERNAL_ERROR',
            message: 'Internal server error'
        });
    }
});
/**
 * Get a single teacher by ID
 * GET /api/v1/school/teachers/:teacherId?schoolId=X
 */
exports.getSchoolTeacherById = (0, https_1.onRequest)({
    cors: true,
    region: 'asia-southeast1',
}, async (req, res) => {
    try {
        (0, cors_1.corsMiddleware)(req, res, () => { });
        (0, rate_limit_1.readRateLimit)(req, res, () => { });
        const teacherId = req.query.teacherId;
        const schoolId = req.query.schoolId;
        if (!teacherId) {
            res.status(400).json({
                success: false,
                code: 'BAD_REQUEST',
                message: 'Teacher ID is required'
            });
            return;
        }
        const teacher = await airtable_1.airtableService.getSchoolTeacherById(teacherId);
        if (!teacher) {
            res.status(404).json({
                success: false,
                code: 'NOT_FOUND',
                message: 'Teacher not found'
            });
            return;
        }
        // Calculate aggregated stats if schoolId provided
        let stats = {};
        if (schoolId && teacher.fields['Teacher Name']) {
            const teacherName = teacher.fields['Teacher Name'];
            // Tenure calculation
            const hireDate = teacher.fields['Hire Date'];
            let tenure = 0;
            if (hireDate) {
                const hired = new Date(hireDate);
                const now = new Date();
                tenure = Math.floor((now.getTime() - hired.getTime()) / (1000 * 60 * 60 * 24 * 365));
            }
            // Fetch attendance, feedback, and teaching hours
            const [attendance, feedback, hours] = await Promise.all([
                airtable_1.airtableService.getTeacherAttendance(teacherName, schoolId, 30),
                airtable_1.airtableService.getTeacherFeedback(teacherName, schoolId, 10),
                airtable_1.airtableService.getTeachingHours(teacherName, schoolId, 4)
            ]);
            const absences = attendance.filter(a => a.fields.Status === 'Absent' || a.fields.Status === 'On Leave').length;
            const feedbackRatings = feedback
                .map(f => f.fields.Rating)
                .filter(r => typeof r === 'number');
            const avgFeedbackRating = feedbackRatings.length > 0
                ? feedbackRatings.reduce((sum, r) => sum + r, 0) / feedbackRatings.length
                : 0;
            const totalHours = hours
                .map(h => h.fields['Total Hours'])
                .filter(h => typeof h === 'number');
            const avgWorkload = totalHours.length > 0
                ? totalHours.reduce((sum, h) => sum + h, 0) / totalHours.length
                : 0;
            stats = {
                tenure,
                absences,
                avgFeedbackRating: Math.round(avgFeedbackRating * 10) / 10,
                feedbackCount: feedback.length,
                avgWorkload: Math.round(avgWorkload * 10) / 10
            };
        }
        res.json({
            success: true,
            data: {
                ...teacher,
                stats
            }
        });
    }
    catch (error) {
        console.error('Error in getSchoolTeacherById:', error);
        res.status(500).json({
            success: false,
            code: 'INTERNAL_ERROR',
            message: 'Internal server error'
        });
    }
});
/**
 * Create a new teacher (admin only)
 * POST /api/v1/school/teachers
 */
exports.createSchoolTeacher = (0, https_1.onRequest)({
    cors: true,
    region: 'asia-southeast1',
}, async (req, res) => {
    try {
        (0, cors_1.corsMiddleware)(req, res, () => { });
        // TODO: Enable auth for create operations
        // await authenticateToken(req as AuthenticatedRequest, res, () => {})
        const data = req.body;
        if (!data || !data['Teacher Name'] || !data['School Name']) {
            res.status(400).json({
                success: false,
                code: 'BAD_REQUEST',
                message: 'Teacher Name and School Name are required'
            });
            return;
        }
        const teacher = await airtable_1.airtableService.createSchoolTeacher(data);
        res.status(201).json({
            success: true,
            data: teacher
        });
    }
    catch (error) {
        console.error('Error in createSchoolTeacher:', error);
        res.status(500).json({
            success: false,
            code: 'INTERNAL_ERROR',
            message: 'Internal server error'
        });
    }
});
/**
 * Update a teacher (admin only)
 * PATCH /api/v1/school/teachers/:teacherId
 */
exports.updateSchoolTeacher = (0, https_1.onRequest)({
    cors: true,
    region: 'asia-southeast1',
}, async (req, res) => {
    try {
        (0, cors_1.corsMiddleware)(req, res, () => { });
        // TODO: Enable auth for update operations
        // await authenticateToken(req as AuthenticatedRequest, res, () => {})
        const teacherId = req.query.teacherId;
        const data = req.body;
        if (!teacherId) {
            res.status(400).json({
                success: false,
                code: 'BAD_REQUEST',
                message: 'Teacher ID is required'
            });
            return;
        }
        if (!data || Object.keys(data).length === 0) {
            res.status(400).json({
                success: false,
                code: 'BAD_REQUEST',
                message: 'Update data is required'
            });
            return;
        }
        const teacher = await airtable_1.airtableService.updateSchoolTeacher(teacherId, data);
        res.json({
            success: true,
            data: teacher
        });
    }
    catch (error) {
        console.error('Error in updateSchoolTeacher:', error);
        res.status(500).json({
            success: false,
            code: 'INTERNAL_ERROR',
            message: 'Internal server error'
        });
    }
});
/**
 * Get teacher attendance records
 * GET /api/v1/school/teachers/:teacherId/attendance?schoolId=X&days=90
 */
exports.getSchoolTeacherAttendance = (0, https_1.onRequest)({
    cors: true,
    region: 'asia-southeast1',
}, async (req, res) => {
    try {
        (0, cors_1.corsMiddleware)(req, res, () => { });
        (0, rate_limit_1.readRateLimit)(req, res, () => { });
        const teacherId = req.query.teacherId;
        const schoolId = req.query.schoolId;
        const days = req.query.days ? parseInt(req.query.days) : 90;
        if (!teacherId || !schoolId) {
            res.status(400).json({
                success: false,
                code: 'BAD_REQUEST',
                message: 'Teacher ID and School ID are required'
            });
            return;
        }
        // Get teacher to fetch name
        const teacher = await airtable_1.airtableService.getSchoolTeacherById(teacherId);
        if (!teacher || !teacher.fields['Teacher Name']) {
            res.status(404).json({
                success: false,
                code: 'NOT_FOUND',
                message: 'Teacher not found'
            });
            return;
        }
        const attendance = await airtable_1.airtableService.getTeacherAttendance(teacher.fields['Teacher Name'], schoolId, days);
        // Calculate summary
        const total = attendance.length;
        const present = attendance.filter(a => a.fields.Status === 'Present').length;
        const absent = attendance.filter(a => a.fields.Status === 'Absent').length;
        const onLeave = attendance.filter(a => a.fields.Status === 'On Leave').length;
        const late = attendance.filter(a => a.fields.Status === 'Late').length;
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
        });
    }
    catch (error) {
        console.error('Error in getSchoolTeacherAttendance:', error);
        res.status(500).json({
            success: false,
            code: 'INTERNAL_ERROR',
            message: 'Internal server error'
        });
    }
});
/**
 * Get teacher feedback
 * GET /api/v1/school/teachers/:teacherId/feedback?schoolId=X&limit=20
 */
exports.getSchoolTeacherFeedback = (0, https_1.onRequest)({
    cors: true,
    region: 'asia-southeast1',
}, async (req, res) => {
    try {
        (0, cors_1.corsMiddleware)(req, res, () => { });
        (0, rate_limit_1.readRateLimit)(req, res, () => { });
        const teacherId = req.query.teacherId;
        const schoolId = req.query.schoolId;
        const limit = req.query.limit ? parseInt(req.query.limit) : 20;
        if (!teacherId || !schoolId) {
            res.status(400).json({
                success: false,
                code: 'BAD_REQUEST',
                message: 'Teacher ID and School ID are required'
            });
            return;
        }
        const teacher = await airtable_1.airtableService.getSchoolTeacherById(teacherId);
        if (!teacher || !teacher.fields['Teacher Name']) {
            res.status(404).json({
                success: false,
                code: 'NOT_FOUND',
                message: 'Teacher not found'
            });
            return;
        }
        const feedback = await airtable_1.airtableService.getTeacherFeedback(teacher.fields['Teacher Name'], schoolId, limit);
        // Calculate summary
        const ratings = feedback
            .map(f => f.fields.Rating)
            .filter(r => typeof r === 'number');
        const avgRating = ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
            : 0;
        res.json({
            success: true,
            data: feedback,
            summary: {
                total: feedback.length,
                avgRating: Math.round(avgRating * 10) / 10
            }
        });
    }
    catch (error) {
        console.error('Error in getSchoolTeacherFeedback:', error);
        res.status(500).json({
            success: false,
            code: 'INTERNAL_ERROR',
            message: 'Internal server error'
        });
    }
});
/**
 * Get teacher teaching hours
 * GET /api/v1/school/teachers/:teacherId/teaching-hours?schoolId=X&weeks=12
 */
exports.getSchoolTeacherTeachingHours = (0, https_1.onRequest)({
    cors: true,
    region: 'asia-southeast1',
}, async (req, res) => {
    try {
        (0, cors_1.corsMiddleware)(req, res, () => { });
        (0, rate_limit_1.readRateLimit)(req, res, () => { });
        const teacherId = req.query.teacherId;
        const schoolId = req.query.schoolId;
        const weeks = req.query.weeks ? parseInt(req.query.weeks) : 12;
        if (!teacherId || !schoolId) {
            res.status(400).json({
                success: false,
                code: 'BAD_REQUEST',
                message: 'Teacher ID and School ID are required'
            });
            return;
        }
        const teacher = await airtable_1.airtableService.getSchoolTeacherById(teacherId);
        if (!teacher || !teacher.fields['Teacher Name']) {
            res.status(404).json({
                success: false,
                code: 'NOT_FOUND',
                message: 'Teacher not found'
            });
            return;
        }
        const hours = await airtable_1.airtableService.getTeachingHours(teacher.fields['Teacher Name'], schoolId, weeks);
        // Calculate summary
        const totalHours = hours
            .map(h => h.fields['Total Hours'])
            .filter(h => typeof h === 'number');
        const avgHours = totalHours.length > 0
            ? totalHours.reduce((sum, h) => sum + h, 0) / totalHours.length
            : 0;
        res.json({
            success: true,
            data: hours,
            summary: {
                weeksRecorded: hours.length,
                avgWeeklyHours: Math.round(avgHours * 10) / 10,
                totalHours: totalHours.reduce((sum, h) => sum + h, 0)
            }
        });
    }
    catch (error) {
        console.error('Error in getSchoolTeacherTeachingHours:', error);
        res.status(500).json({
            success: false,
            code: 'INTERNAL_ERROR',
            message: 'Internal server error'
        });
    }
});
/**
 * Get teacher KPIs for dashboard
 * GET /api/v1/school/teachers/kpis?schoolId=X
 */
exports.getSchoolTeacherKPIs = (0, https_1.onRequest)({
    cors: true,
    region: 'asia-southeast1',
}, async (req, res) => {
    try {
        (0, cors_1.corsMiddleware)(req, res, () => { });
        (0, rate_limit_1.readRateLimit)(req, res, () => { });
        const schoolId = req.query.schoolId;
        if (!schoolId) {
            res.status(400).json({
                success: false,
                code: 'BAD_REQUEST',
                message: 'School ID is required'
            });
            return;
        }
        const kpis = await airtable_1.airtableService.getTeacherKPIs(schoolId);
        res.json({
            success: true,
            data: kpis
        });
    }
    catch (error) {
        console.error('Error in getSchoolTeacherKPIs:', error);
        res.status(500).json({
            success: false,
            code: 'INTERNAL_ERROR',
            message: 'Internal server error'
        });
    }
});
