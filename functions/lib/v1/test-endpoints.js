"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testValidation = exports.testRateLimit = void 0;
const https_1 = require("firebase-functions/v2/https");
// Test endpoint to demonstrate 429 rate limiting
exports.testRateLimit = (0, https_1.onRequest)({
    cors: true,
    region: 'asia-southeast1',
}, async (req, res) => {
    // Simulate rate limiting
    res.status(429).json({
        success: false,
        code: 'RATE_LIMITED',
        message: 'Too many requests',
        retryAfter: 60
    });
});
// Test endpoint to demonstrate validation errors
exports.testValidation = (0, https_1.onRequest)({
    cors: true,
    region: 'asia-southeast1',
}, async (req, res) => {
    const { z } = require('zod');
    const TestSchema = z.object({
        name: z.string().min(1, 'Name is required'),
        email: z.string().email('Invalid email format'),
        age: z.number().min(18, 'Must be at least 18 years old')
    });
    try {
        TestSchema.parse(req.body);
        res.json({ success: true, message: 'Validation passed' });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
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
