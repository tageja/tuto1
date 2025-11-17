"use strict";
/**
 * Content Moderation & User Safety Functions
 *
 * Handles reporting, blocking, and content moderation for the Tuto community.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveReport = exports.getModerationQueue = exports.unblockUser = exports.blockUser = exports.reportContent = exports.BlockStatus = exports.ReportStatus = exports.ReportType = void 0;
const https_1 = require("firebase-functions/v2/https");
const firebase_functions_1 = require("firebase-functions");
const admin = __importStar(require("firebase-admin"));
// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = admin.firestore();
// Report types
var ReportType;
(function (ReportType) {
    ReportType["SPAM"] = "spam";
    ReportType["INAPPROPRIATE"] = "inappropriate";
    ReportType["HARASSMENT"] = "harassment";
    ReportType["BULLYING"] = "bullying";
    ReportType["HATE_SPEECH"] = "hate_speech";
    ReportType["VIOLENCE"] = "violence";
    ReportType["SEXUAL_CONTENT"] = "sexual_content";
    ReportType["SCAM"] = "scam";
    ReportType["COPYRIGHT"] = "copyright";
    ReportType["OTHER"] = "other";
})(ReportType || (exports.ReportType = ReportType = {}));
// Report status
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["PENDING"] = "pending";
    ReportStatus["REVIEWING"] = "reviewing";
    ReportStatus["RESOLVED"] = "resolved";
    ReportStatus["DISMISSED"] = "dismissed";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
// Block status
var BlockStatus;
(function (BlockStatus) {
    BlockStatus["ACTIVE"] = "active";
    BlockStatus["EXPIRED"] = "expired";
    BlockStatus["REVOKED"] = "revoked";
})(BlockStatus || (exports.BlockStatus = BlockStatus = {}));
/**
 * Report content or user
 */
exports.reportContent = (0, https_1.onCall)(async (request) => {
    try {
        const { auth } = request;
        if (!auth) {
            throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
        }
        const { reportedUserId, reportedPostId, reportedCommentId, reportType, description, evidence } = request.data;
        // Validate required fields
        if (!reportType || !description) {
            throw new https_1.HttpsError('invalid-argument', 'Report type and description are required');
        }
        // Validate report type
        if (!Object.values(ReportType).includes(reportType)) {
            throw new https_1.HttpsError('invalid-argument', 'Invalid report type');
        }
        // Check if user has already reported this content
        const existingReport = await db.collection('reports')
            .where('reporterId', '==', auth.uid)
            .where('reportedUserId', '==', reportedUserId || null)
            .where('reportedPostId', '==', reportedPostId || null)
            .where('reportedCommentId', '==', reportedCommentId || null)
            .limit(1)
            .get();
        if (!existingReport.empty) {
            throw new https_1.HttpsError('already-exists', 'You have already reported this content');
        }
        // Create report
        const reportData = {
            reporterId: auth.uid,
            reportedUserId,
            reportedPostId,
            reportedCommentId,
            reportType,
            description,
            evidence: evidence || [],
            timestamp: new Date().toISOString(),
            status: ReportStatus.PENDING
        };
        const reportRef = await db.collection('reports').add(reportData);
        // Log the report
        firebase_functions_1.logger.info(`Report created: ${reportRef.id} by ${auth.uid}`, {
            reportType,
            reportedUserId,
            reportedPostId,
            reportedCommentId
        });
        // Check for repeat offenders
        if (reportedUserId) {
            await checkRepeatOffender(reportedUserId);
        }
        return {
            success: true,
            reportId: reportRef.id,
            message: 'Report submitted successfully'
        };
    }
    catch (error) {
        firebase_functions_1.logger.error('Error creating report:', error);
        throw error;
    }
});
/**
 * Block a user
 */
exports.blockUser = (0, https_1.onCall)(async (request) => {
    try {
        const { auth } = request;
        if (!auth) {
            throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
        }
        const { blockedUserId, reason } = request.data;
        if (!blockedUserId || !reason) {
            throw new https_1.HttpsError('invalid-argument', 'Blocked user ID and reason are required');
        }
        if (blockedUserId === auth.uid) {
            throw new https_1.HttpsError('invalid-argument', 'Cannot block yourself');
        }
        // Check if user is already blocked
        const existingBlock = await db.collection('blocks')
            .where('blockerId', '==', auth.uid)
            .where('blockedUserId', '==', blockedUserId)
            .where('status', '==', BlockStatus.ACTIVE)
            .limit(1)
            .get();
        if (!existingBlock.empty) {
            throw new https_1.HttpsError('already-exists', 'User is already blocked');
        }
        // Create block
        const blockData = {
            blockerId: auth.uid,
            blockedUserId,
            reason,
            timestamp: new Date().toISOString(),
            status: BlockStatus.ACTIVE
        };
        const blockRef = await db.collection('blocks').add(blockData);
        // Log the block
        firebase_functions_1.logger.info(`User blocked: ${blockedUserId} by ${auth.uid}`, {
            reason,
            blockId: blockRef.id
        });
        return {
            success: true,
            blockId: blockRef.id,
            message: 'User blocked successfully'
        };
    }
    catch (error) {
        firebase_functions_1.logger.error('Error blocking user:', error);
        throw error;
    }
});
/**
 * Unblock a user
 */
exports.unblockUser = (0, https_1.onCall)(async (request) => {
    try {
        const { auth } = request;
        if (!auth) {
            throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
        }
        const { blockedUserId } = request.data;
        if (!blockedUserId) {
            throw new https_1.HttpsError('invalid-argument', 'Blocked user ID is required');
        }
        // Find active block
        const blockQuery = await db.collection('blocks')
            .where('blockerId', '==', auth.uid)
            .where('blockedUserId', '==', blockedUserId)
            .where('status', '==', BlockStatus.ACTIVE)
            .limit(1)
            .get();
        if (blockQuery.empty) {
            throw new https_1.HttpsError('not-found', 'User is not blocked');
        }
        const blockDoc = blockQuery.docs[0];
        await blockDoc.ref.update({
            status: BlockStatus.REVOKED,
            revokedAt: new Date().toISOString()
        });
        firebase_functions_1.logger.info(`User unblocked: ${blockedUserId} by ${auth.uid}`);
        return {
            success: true,
            message: 'User unblocked successfully'
        };
    }
    catch (error) {
        firebase_functions_1.logger.error('Error unblocking user:', error);
        throw error;
    }
});
/**
 * Get moderation queue for admins
 */
exports.getModerationQueue = (0, https_1.onCall)(async (request) => {
    try {
        const { auth } = request;
        if (!auth) {
            throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
        }
        // Check if user is admin
        const userDoc = await db.collection('users').doc(auth.uid).get();
        const userData = userDoc.data();
        if (!userData || userData.role !== 'admin') {
            throw new https_1.HttpsError('permission-denied', 'Admin access required');
        }
        const { status = ReportStatus.PENDING, limit = 50 } = request.data;
        // Get reports
        const reportsQuery = db.collection('reports')
            .where('status', '==', status)
            .orderBy('timestamp', 'desc')
            .limit(limit);
        const reportsSnapshot = await reportsQuery.get();
        const reports = reportsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // Get moderation stats
        const stats = await getModerationStats();
        return {
            success: true,
            reports,
            stats
        };
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting moderation queue:', error);
        throw error;
    }
});
/**
 * Resolve a report (admin only)
 */
exports.resolveReport = (0, https_1.onCall)(async (request) => {
    try {
        const { auth } = request;
        if (!auth) {
            throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
        }
        // Check if user is admin
        const userDoc = await db.collection('users').doc(auth.uid).get();
        const userData = userDoc.data();
        if (!userData || userData.role !== 'admin') {
            throw new https_1.HttpsError('permission-denied', 'Admin access required');
        }
        const { reportId, status, adminNotes, action } = request.data;
        if (!reportId || !status) {
            throw new https_1.HttpsError('invalid-argument', 'Report ID and status are required');
        }
        if (!Object.values(ReportStatus).includes(status)) {
            throw new https_1.HttpsError('invalid-argument', 'Invalid status');
        }
        const reportRef = db.collection('reports').doc(reportId);
        const reportDoc = await reportRef.get();
        if (!reportDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Report not found');
        }
        const reportData = reportDoc.data();
        // Update report
        await reportRef.update({
            status,
            adminNotes,
            resolvedBy: auth.uid,
            resolvedAt: new Date().toISOString()
        });
        // Take action if specified
        if (action) {
            await takeModerationAction(reportData, action, auth.uid);
        }
        firebase_functions_1.logger.info(`Report resolved: ${reportId} by ${auth.uid}`, {
            status,
            action
        });
        return {
            success: true,
            message: 'Report resolved successfully'
        };
    }
    catch (error) {
        firebase_functions_1.logger.error('Error resolving report:', error);
        throw error;
    }
});
/**
 * Check for repeat offenders
 */
async function checkRepeatOffender(userId) {
    try {
        // Count reports against this user in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const reportsQuery = await db.collection('reports')
            .where('reportedUserId', '==', userId)
            .where('timestamp', '>=', thirtyDaysAgo.toISOString())
            .get();
        const reportCount = reportsQuery.size;
        // If user has 5+ reports, flag for review
        if (reportCount >= 5) {
            await db.collection('moderation_flags').add({
                userId,
                type: 'repeat_offender',
                reportCount,
                timestamp: new Date().toISOString(),
                status: 'pending'
            });
            firebase_functions_1.logger.warn(`Repeat offender flagged: ${userId} with ${reportCount} reports`);
        }
    }
    catch (error) {
        firebase_functions_1.logger.error('Error checking repeat offender:', error);
    }
}
/**
 * Take moderation action
 */
async function takeModerationAction(reportData, action, adminId) {
    try {
        switch (action) {
            case 'remove_content':
                if (reportData.reportedPostId) {
                    await db.collection('posts').doc(reportData.reportedPostId).delete();
                }
                if (reportData.reportedCommentId) {
                    await db.collection('comments').doc(reportData.reportedCommentId).delete();
                }
                break;
            case 'warn_user':
                if (reportData.reportedUserId) {
                    await db.collection('user_warnings').add({
                        userId: reportData.reportedUserId,
                        reason: reportData.description,
                        adminId,
                        timestamp: new Date().toISOString()
                    });
                }
                break;
            case 'suspend_user':
                if (reportData.reportedUserId) {
                    await db.collection('users').doc(reportData.reportedUserId).update({
                        status: 'suspended',
                        suspendedAt: new Date().toISOString(),
                        suspendedBy: adminId,
                        suspensionReason: reportData.description
                    });
                }
                break;
            case 'ban_user':
                if (reportData.reportedUserId) {
                    await db.collection('users').doc(reportData.reportedUserId).update({
                        status: 'banned',
                        bannedAt: new Date().toISOString(),
                        bannedBy: adminId,
                        banReason: reportData.description
                    });
                }
                break;
        }
    }
    catch (error) {
        firebase_functions_1.logger.error('Error taking moderation action:', error);
    }
}
/**
 * Get moderation statistics
 */
async function getModerationStats() {
    try {
        const [reportsSnapshot, blocksSnapshot] = await Promise.all([
            db.collection('reports').get(),
            db.collection('blocks').where('status', '==', BlockStatus.ACTIVE).get()
        ]);
        const totalReports = reportsSnapshot.size;
        const pendingReports = reportsSnapshot.docs.filter(doc => doc.data().status === ReportStatus.PENDING).length;
        const resolvedReports = reportsSnapshot.docs.filter(doc => doc.data().status === ReportStatus.RESOLVED).length;
        const activeBlocks = blocksSnapshot.size;
        // Count unique blocked users
        const blockedUserIds = new Set(blocksSnapshot.docs.map(doc => doc.data().blockedUserId));
        const blockedUsers = blockedUserIds.size;
        return {
            totalReports,
            pendingReports,
            resolvedReports,
            blockedUsers,
            activeBlocks
        };
    }
    catch (error) {
        firebase_functions_1.logger.error('Error getting moderation stats:', error);
        return {
            totalReports: 0,
            pendingReports: 0,
            resolvedReports: 0,
            blockedUsers: 0,
            activeBlocks: 0
        };
    }
}
