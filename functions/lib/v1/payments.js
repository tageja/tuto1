"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRefund = exports.getRefunds = exports.getPayments = void 0;
const https_1 = require("firebase-functions/v2/https");
const zod_1 = require("zod");
const schemas_1 = require("@tuto/schemas");
// Mock data for now - will be replaced with Airtable integration
const mockPayments = [
    {
        id: '1',
        studentId: '1',
        amount: 500000,
        currency: 'VND',
        status: 'completed',
        paymentMethod: 'credit_card',
        description: 'Monthly tuition fee',
        schoolId: 'school1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];
const mockRefunds = [
    {
        id: '1',
        paymentId: '1',
        amount: 250000,
        reason: 'Student withdrawal',
        status: 'completed',
        processedBy: 'admin1',
        processedAt: new Date().toISOString(),
    }
];
exports.getPayments = (0, https_1.onRequest)({
    cors: true,
    region: 'asia-southeast1',
}, async (req, res) => {
    try {
        // TODO: Add auth middleware
        // TODO: Add rate limiting
        // TODO: Add audit logging
        const { schoolId, status } = req.query;
        if (!schoolId) {
            res.status(400).json({
                success: false,
                message: 'School ID is required'
            });
            return;
        }
        let payments = mockPayments.filter(p => p.schoolId === schoolId);
        if (status) {
            payments = payments.filter(p => p.status === status);
        }
        res.json({
            success: true,
            data: payments,
            pagination: {
                page: 1,
                limit: 10,
                total: payments.length,
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
exports.getRefunds = (0, https_1.onRequest)({
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
        // Get refunds for payments in this school
        const schoolPayments = mockPayments.filter(p => p.schoolId === schoolId);
        const paymentIds = schoolPayments.map(p => p.id);
        const refunds = mockRefunds.filter(r => paymentIds.includes(r.paymentId));
        res.json({
            success: true,
            data: refunds,
            pagination: {
                page: 1,
                limit: 10,
                total: refunds.length,
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
exports.createRefund = (0, https_1.onRequest)({
    cors: true,
    region: 'asia-southeast1',
}, async (req, res) => {
    try {
        // TODO: Add auth middleware
        // TODO: Add rate limiting
        // TODO: Add audit logging
        const validatedData = schemas_1.CreateRefundSchema.parse(req.body);
        const newRefund = {
            id: Date.now().toString(),
            ...validatedData,
            processedAt: new Date().toISOString(),
        };
        // TODO: Save to Airtable
        mockRefunds.push(newRefund);
        // TODO: Add audit log entry
        res.status(201).json({
            success: true,
            data: newRefund
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
