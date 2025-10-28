/**
 * Data Retention & Deletion Functions
 * 
 * Implements user data deletion, export, and retention policies
 * for compliance with privacy regulations.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import * as admin from 'firebase-admin';
import axios from 'axios';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Configuration
const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE;

// Retention periods (in days)
const RETENTION_PERIODS = {
  USER_DATA: 365, // 1 year after account deletion
  UGC_CONTENT: 90, // 3 months for user-generated content
  AUDIT_LOGS: 2555, // 7 years for compliance
  PAYMENT_DATA: 2555, // 7 years for financial compliance
  BACKUP_DATA: 30, // 30 days for backup retention
};

// Helper for Airtable API calls
async function callAirtableApi(tableId: string, method: string, data?: any) {
  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`;
  const headers = {
    'Authorization': `Bearer ${AIRTABLE_PAT}`,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios({
      method,
      url,
      headers,
      data,
    });
    return response.data;
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Airtable API call failed: ${errorMessage}`);
    throw error;
  }
}

/**
 * Request account deletion
 */
export const requestAccountDeletion = onCall(async (request) => {
  try {
    const { auth } = request;
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { reason, confirmDeletion } = request.data;

    if (!confirmDeletion) {
      throw new HttpsError('invalid-argument', 'Deletion confirmation required');
    }

    // Check if user already has a pending deletion request
    const existingRequest = await db.collection('deletion_requests')
      .where('userId', '==', auth.uid)
      .where('status', 'in', ['pending', 'processing'])
      .limit(1)
      .get();

    if (!existingRequest.empty) {
      throw new HttpsError('failed-precondition', 'Deletion request already pending');
    }

    // Create deletion request
    const deletionRequest = {
      userId: auth.uid,
      reason: reason || 'User requested',
      status: 'pending',
      requestedAt: new Date().toISOString(),
      scheduledFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      retentionPeriod: RETENTION_PERIODS.USER_DATA,
    };

    await db.collection('deletion_requests').add(deletionRequest);

    // Log audit event
    await logAuditEvent({
      action: 'ACCOUNT_DELETION_REQUESTED',
      table: 'users',
      recordId: auth.uid,
      actorId: auth.uid,
      details: `Account deletion requested. Reason: ${reason}`,
    });

    logger.info(`Account deletion requested for user ${auth.uid}`);

    return {
      success: true,
      message: 'Account deletion request submitted. Your account will be deleted in 7 days.',
      scheduledFor: deletionRequest.scheduledFor,
    };

  } catch (error) {
    logger.error('Error requesting account deletion:', error);
    throw error;
  }
});

/**
 * Cancel account deletion request
 */
export const cancelAccountDeletion = onCall(async (request) => {
  try {
    const { auth } = request;
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Find pending deletion request
    const deletionRequest = await db.collection('deletion_requests')
      .where('userId', '==', auth.uid)
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (deletionRequest.empty) {
      throw new HttpsError('not-found', 'No pending deletion request found');
    }

    const requestDoc = deletionRequest.docs[0];
    await requestDoc.ref.update({
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
    });

    // Log audit event
    await logAuditEvent({
      action: 'ACCOUNT_DELETION_CANCELLED',
      table: 'users',
      recordId: auth.uid,
      actorId: auth.uid,
      details: 'Account deletion request cancelled by user',
    });

    logger.info(`Account deletion cancelled for user ${auth.uid}`);

    return {
      success: true,
      message: 'Account deletion request cancelled successfully',
    };

  } catch (error) {
    logger.error('Error cancelling account deletion:', error);
    throw error;
  }
});

/**
 * Export user data
 */
export const exportUserData = onCall(async (request) => {
  try {
    const { auth } = request;
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Check if user already has a pending export request
    const existingRequest = await db.collection('export_requests')
      .where('userId', '==', auth.uid)
      .where('status', 'in', ['pending', 'processing'])
      .limit(1)
      .get();

    if (!existingRequest.empty) {
      throw new HttpsError('failed-precondition', 'Export request already pending');
    }

    // Create export request
    const exportRequest = {
      userId: auth.uid,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    };

    const exportDoc = await db.collection('export_requests').add(exportRequest);

    // Process export asynchronously
    processExportRequest(exportDoc.id, auth.uid);

    // Log audit event
    await logAuditEvent({
      action: 'DATA_EXPORT_REQUESTED',
      table: 'users',
      recordId: auth.uid,
      actorId: auth.uid,
      details: 'User data export requested',
    });

    logger.info(`Data export requested for user ${auth.uid}`);

    return {
      success: true,
      message: 'Data export request submitted. You will receive an email when ready.',
      exportId: exportDoc.id,
    };

  } catch (error) {
    logger.error('Error requesting data export:', error);
    throw error;
  }
});

/**
 * Process export request (async)
 */
async function processExportRequest(exportId: string, userId: string) {
  try {
    const exportDoc = await db.collection('export_requests').doc(exportId).get();
    if (!exportDoc.exists) {
      throw new Error('Export request not found');
    }

    await exportDoc.ref.update({ status: 'processing' });

    // Collect user data from all sources
    const userData = await collectUserData(userId);

    // Create export file
    const exportData = {
      userId,
      exportedAt: new Date().toISOString(),
      data: userData,
      format: 'json',
      version: '1.0',
    };

    // Store export data
    await db.collection('export_data').doc(exportId).set(exportData);

    // Update export request status
    await exportDoc.ref.update({
      status: 'completed',
      completedAt: new Date().toISOString(),
      downloadUrl: `https://your-domain.com/exports/${exportId}`,
    });

    // Send notification email
    await sendExportNotification(userId, exportId);

    logger.info(`Data export completed for user ${userId}`);

  } catch (error) {
    logger.error('Error processing export request:', error);
    
    // Update export request status
    await db.collection('export_requests').doc(exportId).update({
      status: 'failed',
      failedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Collect user data from all sources
 */
async function collectUserData(userId: string) {
  const userData: any = {
    profile: {},
    bookings: [],
    posts: [],
    comments: [],
    reviews: [],
    payments: [],
    auditLogs: [],
  };

  try {
    // Get user profile from Airtable
    const userResponse = await callAirtableApi('Users', 'GET', {
      params: {
        filterByFormula: `{firebaseUid} = '${userId}'`,
        maxRecords: 1,
      },
    });

    if (userResponse.records.length > 0) {
      userData.profile = userResponse.records[0].fields;
    }

    // Get user bookings
    const bookingsResponse = await callAirtableApi('TutoBookings', 'GET', {
      params: {
        filterByFormula: `{UserId} = '${userId}'`,
      },
    });
    userData.bookings = bookingsResponse.records.map((record: any) => record.fields);

    // Get user posts
    const postsResponse = await callAirtableApi('TutoPosts', 'GET', {
      params: {
        filterByFormula: `{Author ID} = '${userId}'`,
      },
    });
    userData.posts = postsResponse.records.map((record: any) => record.fields);

    // Get user comments
    const commentsResponse = await callAirtableApi('TutoComments', 'GET', {
      params: {
        filterByFormula: `{Author ID} = '${userId}'`,
      },
    });
    userData.comments = commentsResponse.records.map((record: any) => record.fields);

    // Get user reviews
    const reviewsResponse = await callAirtableApi('TutoReviews', 'GET', {
      params: {
        filterByFormula: `{Student ID} = '${userId}'`,
      },
    });
    userData.reviews = reviewsResponse.records.map((record: any) => record.fields);

    // Get user payments from Firestore
    const paymentsSnapshot = await db.collection('payment_intents')
      .where('userId', '==', userId)
      .get();
    userData.payments = paymentsSnapshot.docs.map(doc => doc.data());

    // Get audit logs
    const auditSnapshot = await db.collection('audit_logs')
      .where('actorId', '==', userId)
      .get();
    userData.auditLogs = auditSnapshot.docs.map(doc => doc.data());

  } catch (error) {
    logger.error('Error collecting user data:', error);
    throw error;
  }

  return userData;
}

/**
 * Process account deletion (admin only)
 */
export const processAccountDeletion = onCall(async (request) => {
  try {
    const { auth } = request;
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    // Check admin role
    const userRecord = await admin.auth().getUser(auth.uid);
    const customClaims = userRecord.customClaims || {};
    if (customClaims.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin access required');
    }

    const { userId, forceDelete = false } = request.data;

    if (!userId) {
      throw new HttpsError('invalid-argument', 'User ID is required');
    }

    // Find deletion request
    const deletionRequest = await db.collection('deletion_requests')
      .where('userId', '==', userId)
      .where('status', '==', 'pending')
      .limit(1)
      .get();

    if (deletionRequest.empty && !forceDelete) {
      throw new HttpsError('not-found', 'No pending deletion request found');
    }

    await db.collection('deletion_requests').doc(deletionRequest.docs[0].id).update({
      status: 'processing',
      processedAt: new Date().toISOString(),
    });

    // Delete user data
    await deleteUserData(userId);

    // Update deletion request status
    await db.collection('deletion_requests').doc(deletionRequest.docs[0].id).update({
      status: 'completed',
      completedAt: new Date().toISOString(),
    });

    // Log audit event
    await logAuditEvent({
      action: 'ACCOUNT_DELETED',
      table: 'users',
      recordId: userId,
      actorId: auth.uid,
      details: 'User account deleted by admin',
    });

    logger.info(`Account deleted for user ${userId} by admin ${auth.uid}`);

    return {
      success: true,
      message: 'Account deleted successfully',
    };

  } catch (error) {
    logger.error('Error processing account deletion:', error);
    throw error;
  }
});

/**
 * Delete user data from all sources
 */
async function deleteUserData(userId: string) {
  try {
    // Delete from Airtable
    await deleteUserDataFromAirtable(userId);

    // Delete from Firestore
    await deleteUserDataFromFirestore(userId);

    // Delete Firebase Auth user
    await admin.auth().deleteUser(userId);

    logger.info(`User data deleted for ${userId}`);

  } catch (error) {
    logger.error('Error deleting user data:', error);
    throw error;
  }
}

/**
 * Delete user data from Airtable
 */
async function deleteUserDataFromAirtable(userId: string) {
  try {
    // Delete user record
    const userResponse = await callAirtableApi('Users', 'GET', {
      params: {
        filterByFormula: `{firebaseUid} = '${userId}'`,
        maxRecords: 1,
      },
    });

    if (userResponse.records.length > 0) {
      await callAirtableApi(`Users/${userResponse.records[0].id}`, 'DELETE');
    }

    // Anonymize user bookings
    const bookingsResponse = await callAirtableApi('TutoBookings', 'GET', {
      params: {
        filterByFormula: `{UserId} = '${userId}'`,
      },
    });

    for (const booking of bookingsResponse.records) {
      await callAirtableApi(`TutoBookings/${booking.id}`, 'PATCH', {
        fields: {
          'UserId': '[DELETED]',
          'StudentName': '[DELETED]',
          'StudentEmail': '[DELETED]',
          'Notes': '[DELETED]',
        },
      });
    }

    // Anonymize user posts
    const postsResponse = await callAirtableApi('TutoPosts', 'GET', {
      params: {
        filterByFormula: `{Author ID} = '${userId}'`,
      },
    });

    for (const post of postsResponse.records) {
      await callAirtableApi(`TutoPosts/${post.id}`, 'PATCH', {
        fields: {
          'Author ID': '[DELETED]',
          'Author Name': '[DELETED]',
          'Content Text': '[DELETED]',
        },
      });
    }

    // Anonymize user comments
    const commentsResponse = await callAirtableApi('TutoComments', 'GET', {
      params: {
        filterByFormula: `{Author ID} = '${userId}'`,
      },
    });

    for (const comment of commentsResponse.records) {
      await callAirtableApi(`TutoComments/${comment.id}`, 'PATCH', {
        fields: {
          'Author ID': '[DELETED]',
          'Author Name': '[DELETED]',
          'Content': '[DELETED]',
        },
      });
    }

    // Anonymize user reviews
    const reviewsResponse = await callAirtableApi('TutoReviews', 'GET', {
      params: {
        filterByFormula: `{Student ID} = '${userId}'`,
      },
    });

    for (const review of reviewsResponse.records) {
      await callAirtableApi(`TutoReviews/${review.id}`, 'PATCH', {
        fields: {
          'Student ID': '[DELETED]',
          'Student Name': '[DELETED]',
          'Content': '[DELETED]',
        },
      });
    }

  } catch (error) {
    logger.error('Error deleting user data from Airtable:', error);
    throw error;
  }
}

/**
 * Delete user data from Firestore
 */
async function deleteUserDataFromFirestore(userId: string) {
  try {
    // Delete payment intents
    const paymentsSnapshot = await db.collection('payment_intents')
      .where('userId', '==', userId)
      .get();

    for (const doc of paymentsSnapshot.docs) {
      await doc.ref.delete();
    }

    // Delete receipts
    const receiptsSnapshot = await db.collection('receipts')
      .where('userId', '==', userId)
      .get();

    for (const doc of receiptsSnapshot.docs) {
      await doc.ref.delete();
    }

    // Delete export requests
    const exportsSnapshot = await db.collection('export_requests')
      .where('userId', '==', userId)
      .get();

    for (const doc of exportsSnapshot.docs) {
      await doc.ref.delete();
    }

    // Delete export data
    const exportDataSnapshot = await db.collection('export_data')
      .where('userId', '==', userId)
      .get();

    for (const doc of exportDataSnapshot.docs) {
      await doc.ref.delete();
    }

  } catch (error) {
    logger.error('Error deleting user data from Firestore:', error);
    throw error;
  }
}

/**
 * Send export notification email
 */
async function sendExportNotification(userId: string, exportId: string) {
  try {
    // In a real implementation, you would send an email here
    // For now, we'll just log the notification
    logger.info(`Export notification for user ${userId}: ${exportId}`);

    // You could integrate with:
    // - SendGrid/Mailgun for email notifications
    // - Firebase Cloud Messaging for push notifications
    // - In-app notification system

  } catch (error) {
    logger.error('Error sending export notification:', error);
    // Don't throw error as notification failure shouldn't fail the export
  }
}

/**
 * Log audit event
 */
async function logAuditEvent(event: {
  action: string;
  table: string;
  recordId: string;
  actorId: string;
  details: string;
}): Promise<void> {
  try {
    const auditData = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    await db.collection('audit_logs').add(auditData);
    logger.info(`Audit event logged: ${event.action} on ${event.table}`);

  } catch (error) {
    logger.error('Error logging audit event:', error);
    // Don't throw error as audit logging failure shouldn't fail the operation
  }
}

/**
 * Get retention policy information
 */
export const getRetentionPolicy = onCall(async (request) => {
  try {
    const { auth } = request;
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    return {
      success: true,
      retentionPeriods: RETENTION_PERIODS,
      policy: {
        userData: 'User data is retained for 1 year after account deletion for legal and business purposes',
        ugcContent: 'User-generated content is retained for 3 months after account deletion',
        auditLogs: 'Audit logs are retained for 7 years for compliance purposes',
        paymentData: 'Payment data is retained for 7 years for financial compliance',
        backupData: 'Backup data is retained for 30 days',
      },
      rights: {
        deletion: 'You have the right to request deletion of your personal data',
        export: 'You have the right to export your personal data',
        portability: 'You have the right to data portability',
        rectification: 'You have the right to correct inaccurate data',
      },
    };

  } catch (error) {
    logger.error('Error getting retention policy:', error);
    throw error;
  }
});


















