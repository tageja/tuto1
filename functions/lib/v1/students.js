"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStudent = exports.createStudent = exports.getStudents = void 0;
const https_1 = require("firebase-functions/v2/https");
const zod_1 = require("zod");
const schemas_1 = require("@tuto/schemas");
// Mock data for now - will be replaced with Airtable integration
const mockStudents = [
    {
        id: '1',
        name: 'Alice Smith',
        email: 'alice@example.com',
        phone: '+1234567891',
        grade: 'Grade 10',
        subjects: ['Mathematics', 'Physics'],
        enrollmentDate: '2024-01-01',
        status: 'active',
        parentContact: '+1234567892',
        schoolId: 'school1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];
exports.getStudents = (0, https_1.onRequest)({
    cors: true,
    region: 'asia-southeast1',
}, async (req, res) => {
    try {
        // TODO: Add auth middleware
        // TODO: Add rate limiting
        // TODO: Add audit logging
        const { schoolId } = req.query;
        if (!schoolId) {
            res.status(400).json({
                success: false,
                message: 'School ID is required'
            });
            return;
        }
        const students = mockStudents.filter(s => s.schoolId === schoolId);
        res.json({
            success: true,
            data: students,
            pagination: {
                page: 1,
                limit: 10,
                total: students.length,
                totalPages: 1
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.createStudent = (0, https_1.onRequest)({
    cors: true,
    region: 'asia-southeast1',
}, async (req, res) => {
    try {
        // TODO: Add auth middleware
        // TODO: Add rate limiting
        // TODO: Add audit logging
        const validatedData = schemas_1.CreateStudentSchema.parse(req.body);
        const newStudent = {
            id: Date.now().toString(),
            name: validatedData.name || '',
            email: validatedData.email || '',
            phone: validatedData.phone || '',
            grade: validatedData.grade || '',
            subjects: validatedData.subjects || [],
            enrollmentDate: validatedData.enrollmentDate || new Date().toISOString(),
            status: validatedData.status || 'active',
            parentContact: validatedData.parentContact || '',
            schoolId: validatedData.schoolId || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        // TODO: Save to Airtable
        mockStudents.push(newStudent);
        res.status(201).json({
            success: true,
            data: newStudent
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
exports.updateStudent = (0, https_1.onRequest)({
    cors: true,
    region: 'asia-southeast1',
}, async (req, res) => {
    try {
        // TODO: Add auth middleware
        // TODO: Add rate limiting
        // TODO: Add audit logging
        const { id } = req.params;
        const validatedData = schemas_1.UpdateStudentSchema.parse(req.body);
        const studentIndex = mockStudents.findIndex(s => s.id === id);
        if (studentIndex === -1) {
            res.status(404).json({
                success: false,
                message: 'Student not found'
            });
            return;
        }
        const updatedStudent = {
            ...mockStudents[studentIndex],
            ...validatedData,
            updatedAt: new Date().toISOString(),
        };
        mockStudents[studentIndex] = updatedStudent;
        res.json({
            success: true,
            data: updatedStudent
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
