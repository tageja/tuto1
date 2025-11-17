"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBookingStatus = exports.getBookings = void 0;
const https_1 = require("firebase-functions/v2/https");
const zod_1 = require("zod");
const schemas_1 = require("@tuto/schemas");
// Mock data for now - will be replaced with Airtable integration
const mockBookings = [
    {
        id: '1',
        studentId: '1',
        teacherId: '1',
        subject: 'Mathematics',
        scheduledDate: '2024-01-15',
        startTime: '14:00',
        endTime: '15:00',
        status: 'pending',
        notes: 'First session',
        schoolId: 'school1',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];
exports.getBookings = (0, https_1.onRequest)({
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
        let bookings = mockBookings.filter(b => b.schoolId === schoolId);
        if (status) {
            bookings = bookings.filter(b => b.status === status);
        }
        res.json({
            success: true,
            data: bookings,
            pagination: {
                page: 1,
                limit: 10,
                total: bookings.length,
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
exports.updateBookingStatus = (0, https_1.onRequest)({
    cors: true,
    region: 'asia-southeast1',
}, async (req, res) => {
    try {
        // TODO: Add auth middleware
        // TODO: Add rate limiting
        // TODO: Add audit logging
        const { id } = req.params;
        const validatedData = schemas_1.BookingStatusUpdateSchema.parse(req.body);
        const bookingIndex = mockBookings.findIndex(b => b.id === id);
        if (bookingIndex === -1) {
            res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
            return;
        }
        const updatedBooking = {
            ...mockBookings[bookingIndex],
            ...validatedData,
            updatedAt: new Date().toISOString(),
        };
        mockBookings[bookingIndex] = updatedBooking;
        // TODO: Add audit log entry
        res.json({
            success: true,
            data: updatedBooking
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
