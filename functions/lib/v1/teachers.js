"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTeacher = exports.createTeacher = exports.getTeachers = void 0;
const https_1 = require("firebase-functions/v2/https");
const zod_1 = require("zod");
const schemas_1 = require("@tuto/schemas");
const cors_1 = require("./cors");
const auth_1 = require("./auth");
const rate_limit_1 = require("./rate-limit");
const audit_1 = require("./audit");
const airtable_1 = require("./airtable");
exports.getTeachers = (0, https_1.onRequest)({
    cors: true,
    region: 'asia-southeast1',
}, async (req, res) => {
    try {
        (0, cors_1.corsMiddleware)(req, res, () => { });
        await (0, auth_1.authenticateToken)(req, res, () => { });
        (0, rate_limit_1.readRateLimit)(req, res, () => { });
        const { schoolId } = req.query;
        if (!schoolId) {
            res.status(400).json({
                success: false,
                code: 'BAD_REQUEST',
                message: 'School ID is required'
            });
            return;
        }
        const teachers = await airtable_1.airtableService.getTeachers(schoolId);
        res.json({
            success: true,
            data: teachers,
            pagination: {
                page: 1,
                limit: 10,
                total: teachers.length,
                totalPages: 1
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            code: 'INTERNAL_ERROR',
            message: 'Internal server error'
        });
    }
});
exports.createTeacher = (0, https_1.onRequest)({
    cors: true,
    region: 'asia-southeast1',
}, async (req, res) => {
    try {
        (0, cors_1.corsMiddleware)(req, res, () => { });
        await (0, auth_1.authenticateToken)(req, res, () => { });
        await (0, auth_1.requireRole)(['school_admin', 'tuto_admin'])(req, res, () => { });
        (0, rate_limit_1.writeRateLimit)(req, res, () => { });
        (0, audit_1.auditMiddleware)('CREATE', 'teacher')(req, res, () => { });
        const validatedData = schemas_1.CreateTeacherSchema.parse(req.body);
        const newTeacher = await airtable_1.airtableService.createTeacher(validatedData);
        res.status(201).json({
            success: true,
            data: newTeacher
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                code: 'VALIDATION_ERROR',
                message: 'Validation error',
                details: error.errors
            });
            return;
        }
        res.status(500).json({
            success: false,
            code: 'INTERNAL_ERROR',
            message: 'Internal server error'
        });
    }
});
exports.updateTeacher = (0, https_1.onRequest)({
    cors: true,
    region: 'asia-southeast1',
}, async (req, res) => {
    try {
        (0, cors_1.corsMiddleware)(req, res, () => { });
        await (0, auth_1.authenticateToken)(req, res, () => { });
        await (0, auth_1.requireRole)(['school_admin', 'tuto_admin'])(req, res, () => { });
        (0, rate_limit_1.writeRateLimit)(req, res, () => { });
        (0, audit_1.auditMiddleware)('UPDATE', 'teacher')(req, res, () => { });
        const { id } = req.params;
        const validatedData = schemas_1.UpdateTeacherSchema.parse(req.body);
        const updatedTeacher = await airtable_1.airtableService.updateTeacher(id, validatedData);
        res.json({
            success: true,
            data: updatedTeacher
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                code: 'VALIDATION_ERROR',
                message: 'Validation error',
                details: error.errors
            });
            return;
        }
        res.status(500).json({
            success: false,
            code: 'INTERNAL_ERROR',
            message: 'Internal server error'
        });
    }
});
