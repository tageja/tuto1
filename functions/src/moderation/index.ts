/**
 * Content Moderation & User Safety Functions
 * 
 * Handles reporting, blocking, and content moderation for the Tuto community.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Report types
export enum ReportType {
  SPAM = 'spam',
  INAPPROPRIATE = 'inappropriate',
  HARASSMENT = 'harassment',
  BULLYING = 'bullying',
  HATE_SPEECH = 'hate_speech',
  VIOLENCE = 'violence',
  SEXUAL_CONTENT = 'sexual_content',
  SCAM = 'scam',
  COPYRIGHT = 'copyright',
  OTHER = 'other'
}

// Report status
export enum ReportStatus {
  PENDING = 'pending',
  REVIEWING = 'reviewing',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed'
}

// Block status
export enum BlockStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked'
}

interface ReportData {
  reporterId: string;
  reportedUserId?: string;
  reportedPostId?: string;
  reportedCommentId?: string;
  reportType: ReportType;
  description: string;
  evidence?: string[]; // URLs to screenshots or other evidence
  timestamp: string;
  status: ReportStatus;
  adminNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

interface BlockData {
  blockerId: string;
  blockedUserId: string;
  reason: string;
  timestamp: string;
  status: BlockStatus;
  expiresAt?: string;
}

interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  blockedUsers: number;
  activeBlocks: number;
}

/**
 * Report content or user
 */
export const reportContent = onCall(async (request) => {
  try {
    const { auth } = request;
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const {
      reportedUserId,
      reportedPostId,
      reportedCommentId,
      reportType,
      description,
      evidence
    } = request.data;

    // Validate required fields
    if (!reportType || !description) {
      throw new HttpsError('invalid-argument', 'Report type and description are required');
    }

    // Validate report type
    if (!Object.values(ReportType).includes(reportType)) {
      throw new HttpsError('invalid-argument', 'Invalid report type');
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
      throw new HttpsError('already-exists', 'You have already reported this content');
    }

    // Create report
    const reportData: ReportData = {
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
    logger.info(`Report created: ${reportRef.id} by ${auth.uid}`, {
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

  } catch (error) {
    logger.error('Error creating report:', error);
    throw error;
  }
});

/**
 * Block a user
 */
export const blockUser = onCall(async (request) => {
  try {
    const { auth } = request;
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { blockedUserId, reason } = request.data;

    if (!blockedUserId || !reason) {
      throw new HttpsError('invalid-argument', 'Blocked user ID and reason are required');
    }

    if (blockedUserId === auth.uid) {
      throw new HttpsError('invalid-argument', 'Cannot block yourself');
    }

    // Check if user is already blocked
    const existingBlock = await db.collection('blocks')
      .where('blockerId', '==', auth.uid)
      .where('blockedUserId', '==', blockedUserId)
      .where('status', '==', BlockStatus.ACTIVE)
      .limit(1)
      .get();

    if (!existingBlock.empty) {
      throw new HttpsError('already-exists', 'User is already blocked');
    }

    // Create block
    const blockData: BlockData = {
      blockerId: auth.uid,
      blockedUserId,
      reason,
      timestamp: new Date().toISOString(),
      status: BlockStatus.ACTIVE
    };

    const blockRef = await db.collection('blocks').add(blockData);

    // Log the block
    logger.info(`User blocked: ${blockedUserId} by ${auth.uid}`, {
      reason,
      blockId: blockRef.id
    });

    return {
      success: true,
      blockId: blockRef.id,
      message: 'User blocked successfully'
    };

  } catch (error) {
    logger.error('Error blocking user:', error);
    throw error;
  }
});

/**
 * Unblock a user
 */
export const unblockUser = onCall(async (request) => {
  try {
    const { auth } = request;
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { blockedUserId } = request.data;

    if (!blockedUserId) {
      throw new HttpsError('invalid-argument', 'Blocked user ID is required');
    }

    // Find active block
    const blockQuery = await db.collection('blocks')
      .where('blockerId', '==', auth.uid)
      .where('blockedUserId', '==', blockedUserId)
      .where('status', '==', BlockStatus.ACTIVE)
      .limit(1)
      .get();

    if (blockQuery.empty) {
      throw new HttpsError('not-found', 'User is not blocked');
    }

    const blockDoc = blockQuery.docs[0];
    await blockDoc.ref.update({
      status: BlockStatus.REVOKED,
      revokedAt: new Date().toISOString()
    });

    logger.info(`User unblocked: ${blockedUserId} by ${auth.uid}`);

    return {
      success: true,
      message: 'User unblocked successfully'
    };

  } catch (error) {
    logger.error('Error unblocking user:', error);
    throw error;
  }
});

/**
 * Get moderation queue for admins
 */
export const getModerationQueue = onCall(async (request) => {
  try {
    const { auth } = request;
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Check if user is admin
    const userDoc = await db.collection('users').doc(auth.uid).get();
    const userData = userDoc.data();
    
    if (!userData || userData.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
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

  } catch (error) {
    logger.error('Error getting moderation queue:', error);
    throw error;
  }
});

/**
 * Resolve a report (admin only)
 */
export const resolveReport = onCall(async (request) => {
  try {
    const { auth } = request;
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Check if user is admin
    const userDoc = await db.collection('users').doc(auth.uid).get();
    const userData = userDoc.data();
    
    if (!userData || userData.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }

    const { reportId, status, adminNotes, action } = request.data;

    if (!reportId || !status) {
      throw new HttpsError('invalid-argument', 'Report ID and status are required');
    }

    if (!Object.values(ReportStatus).includes(status)) {
      throw new HttpsError('invalid-argument', 'Invalid status');
    }

    const reportRef = db.collection('reports').doc(reportId);
    const reportDoc = await reportRef.get();

    if (!reportDoc.exists) {
      throw new HttpsError('not-found', 'Report not found');
    }

    const reportData = reportDoc.data() as ReportData;

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

    logger.info(`Report resolved: ${reportId} by ${auth.uid}`, {
      status,
      action
    });

    return {
      success: true,
      message: 'Report resolved successfully'
    };

  } catch (error) {
    logger.error('Error resolving report:', error);
    throw error;
  }
});

/**
 * Check for repeat offenders
 */
async function checkRepeatOffender(userId: string): Promise<void> {
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

      logger.warn(`Repeat offender flagged: ${userId} with ${reportCount} reports`);
    }

  } catch (error) {
    logger.error('Error checking repeat offender:', error);
  }
}

/**
 * Take moderation action
 */
async function takeModerationAction(
  reportData: ReportData,
  action: string,
  adminId: string
): Promise<void> {
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

  } catch (error) {
    logger.error('Error taking moderation action:', error);
  }
}

/**
 * Get moderation statistics
 */
async function getModerationStats(): Promise<ModerationStats> {
  try {
    const [reportsSnapshot, blocksSnapshot] = await Promise.all([
      db.collection('reports').get(),
      db.collection('blocks').where('status', '==', BlockStatus.ACTIVE).get()
    ]);

    const totalReports = reportsSnapshot.size;
    const pendingReports = reportsSnapshot.docs.filter(
      doc => doc.data().status === ReportStatus.PENDING
    ).length;
    const resolvedReports = reportsSnapshot.docs.filter(
      doc => doc.data().status === ReportStatus.RESOLVED
    ).length;
    const activeBlocks = blocksSnapshot.size;

    // Count unique blocked users
    const blockedUserIds = new Set(
      blocksSnapshot.docs.map(doc => doc.data().blockedUserId)
    );
    const blockedUsers = blockedUserIds.size;

    return {
      totalReports,
      pendingReports,
      resolvedReports,
      blockedUsers,
      activeBlocks
    };

  } catch (error) {
    logger.error('Error getting moderation stats:', error);
    return {
      totalReports: 0,
      pendingReports: 0,
      resolvedReports: 0,
      blockedUsers: 0,
      activeBlocks: 0
    };
  }
}


































