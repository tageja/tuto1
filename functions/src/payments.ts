/**
 * Payment Backend Functions
 * 
 * Server-side payment processing with Stripe integration.
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Payment configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

// Supported currencies
export enum Currency {
  VND = 'vnd',
  USD = 'usd',
  EUR = 'eur',
}

// Payment status
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
}

// Payment intent data
interface PaymentIntentData {
  amount: number;
  currency: Currency;
  description?: string;
  metadata?: Record<string, string>;
  bookingId?: string;
  userId: string;
}

// Payment intent response
interface PaymentIntentResponse {
  id: string;
  clientSecret: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  description?: string;
  metadata?: Record<string, string>;
}

// Amount validation rules
const AMOUNT_VALIDATION = {
  [Currency.VND]: { min: 1000, max: 100000000 }, // 1,000 VND to 100M VND
  [Currency.USD]: { min: 1, max: 10000 }, // $1 to $10,000
  [Currency.EUR]: { min: 1, max: 10000 }, // €1 to €10,000
};

/**
 * Create payment intent
 */
export const createPaymentIntent = onCall(async (request) => {
  try {
    const { auth } = request;
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { amount, currency, description, metadata, bookingId } = request.data;

    // Validate required fields
    if (!amount || !currency) {
      throw new HttpsError('invalid-argument', 'Amount and currency are required');
    }

    // Validate currency
    if (!Object.values(Currency).includes(currency)) {
      throw new HttpsError('invalid-argument', 'Invalid currency');
    }

    // Validate amount
    const validation = AMOUNT_VALIDATION[currency];
    if (amount < validation.min || amount > validation.max) {
      throw new HttpsError(
        'invalid-argument',
        `Amount must be between ${validation.min} and ${validation.max} ${currency.toUpperCase()}`
      );
    }

    // Check for existing payment intent (idempotency)
    const idempotencyKey = `${auth.uid}_${bookingId || 'general'}_${amount}_${currency}`;
    const existingIntent = await db.collection('payment_intents')
      .where('idempotencyKey', '==', idempotencyKey)
      .where('status', 'in', [PaymentStatus.PENDING, PaymentStatus.PROCESSING])
      .limit(1)
      .get();

    if (!existingIntent.empty) {
      const existing = existingIntent.docs[0].data();
      logger.info(`Returning existing payment intent: ${existing.id}`);
      return {
        success: true,
        paymentIntent: existing,
      };
    }

    // Create payment intent data
    const paymentIntentData: PaymentIntentData = {
      amount,
      currency,
      description,
      metadata: {
        ...metadata,
        userId: auth.uid,
        bookingId: bookingId || '',
        createdAt: new Date().toISOString(),
      },
      bookingId,
      userId: auth.uid,
    };

    // In a real implementation, you would call Stripe here
    // For now, we'll create a mock payment intent
    const mockPaymentIntent: PaymentIntentResponse = {
      id: `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clientSecret: `pi_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      status: PaymentStatus.PENDING,
      description,
      metadata: paymentIntentData.metadata,
    };

    // Store payment intent in database
    await db.collection('payment_intents').doc(mockPaymentIntent.id).set({
      ...mockPaymentIntent,
      idempotencyKey,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // If booking ID provided, update booking status
    if (bookingId) {
      await db.collection('bookings').doc(bookingId).update({
        paymentIntentId: mockPaymentIntent.id,
        paymentStatus: PaymentStatus.PENDING,
        updatedAt: new Date().toISOString(),
      });
    }

    logger.info(`Created payment intent: ${mockPaymentIntent.id} for user ${auth.uid}`);

    return {
      success: true,
      paymentIntent: mockPaymentIntent,
    };

  } catch (error) {
    logger.error('Error creating payment intent:', error);
    throw error;
  }
});

/**
 * Confirm payment intent
 */
export const confirmPaymentIntent = onCall(async (request) => {
  try {
    const { auth } = request;
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { paymentIntentId, paymentMethodId } = request.data;

    if (!paymentIntentId) {
      throw new HttpsError('invalid-argument', 'Payment intent ID is required');
    }

    // Get payment intent
    const paymentIntentDoc = await db.collection('payment_intents').doc(paymentIntentId).get();
    if (!paymentIntentDoc.exists) {
      throw new HttpsError('not-found', 'Payment intent not found');
    }

    const paymentIntent = paymentIntentDoc.data();
    if (paymentIntent.userId !== auth.uid) {
      throw new HttpsError('permission-denied', 'Access denied');
    }

    if (paymentIntent.status !== PaymentStatus.PENDING) {
      throw new HttpsError('failed-precondition', 'Payment intent is not in pending status');
    }

    // Update payment intent status
    await paymentIntentDoc.ref.update({
      status: PaymentStatus.PROCESSING,
      paymentMethodId,
      updatedAt: new Date().toISOString(),
    });

    // In a real implementation, you would confirm with Stripe here
    // For now, we'll simulate a successful payment
    const isSuccessful = Math.random() > 0.1; // 90% success rate for testing

    const newStatus = isSuccessful ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED;
    
    await paymentIntentDoc.ref.update({
      status: newStatus,
      confirmedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Update booking status if applicable
    if (paymentIntent.bookingId) {
      await db.collection('bookings').doc(paymentIntent.bookingId).update({
        paymentStatus: newStatus,
        paidAt: isSuccessful ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      });
    }

    // Create receipt if payment succeeded
    if (isSuccessful) {
      await createReceipt(paymentIntent, auth.uid);
    }

    logger.info(`Payment intent ${paymentIntentId} ${newStatus} for user ${auth.uid}`);

    return {
      success: isSuccessful,
      status: newStatus,
      paymentIntentId,
      message: isSuccessful ? 'Payment successful' : 'Payment failed',
    };

  } catch (error) {
    logger.error('Error confirming payment intent:', error);
    throw error;
  }
});

/**
 * Get payment intent status
 */
export const getPaymentIntentStatus = onCall(async (request) => {
  try {
    const { auth } = request;
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { paymentIntentId } = request.data;

    if (!paymentIntentId) {
      throw new HttpsError('invalid-argument', 'Payment intent ID is required');
    }

    // Get payment intent
    const paymentIntentDoc = await db.collection('payment_intents').doc(paymentIntentId).get();
    if (!paymentIntentDoc.exists) {
      throw new HttpsError('not-found', 'Payment intent not found');
    }

    const paymentIntent = paymentIntentDoc.data();
    if (paymentIntent.userId !== auth.uid) {
      throw new HttpsError('permission-denied', 'Access denied');
    }

    return {
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        description: paymentIntent.description,
        createdAt: paymentIntent.createdAt,
        updatedAt: paymentIntent.updatedAt,
      },
    };

  } catch (error) {
    logger.error('Error getting payment intent status:', error);
    throw error;
  }
});

/**
 * Cancel payment intent
 */
export const cancelPaymentIntent = onCall(async (request) => {
  try {
    const { auth } = request;
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { paymentIntentId } = request.data;

    if (!paymentIntentId) {
      throw new HttpsError('invalid-argument', 'Payment intent ID is required');
    }

    // Get payment intent
    const paymentIntentDoc = await db.collection('payment_intents').doc(paymentIntentId).get();
    if (!paymentIntentDoc.exists) {
      throw new HttpsError('not-found', 'Payment intent not found');
    }

    const paymentIntent = paymentIntentDoc.data();
    if (paymentIntent.userId !== auth.uid) {
      throw new HttpsError('permission-denied', 'Access denied');
    }

    if (paymentIntent.status !== PaymentStatus.PENDING) {
      throw new HttpsError('failed-precondition', 'Only pending payment intents can be canceled');
    }

    // Update payment intent status
    await paymentIntentDoc.ref.update({
      status: PaymentStatus.CANCELED,
      canceledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Update booking status if applicable
    if (paymentIntent.bookingId) {
      await db.collection('bookings').doc(paymentIntent.bookingId).update({
        paymentStatus: PaymentStatus.CANCELED,
        updatedAt: new Date().toISOString(),
      });
    }

    logger.info(`Payment intent ${paymentIntentId} canceled by user ${auth.uid}`);

    return {
      success: true,
      message: 'Payment intent canceled successfully',
    };

  } catch (error) {
    logger.error('Error canceling payment intent:', error);
    throw error;
  }
});

/**
 * Create receipt for successful payment
 */
async function createReceipt(paymentIntent: any, userId: string): Promise<void> {
  try {
    const receiptData = {
      paymentIntentId: paymentIntent.id,
      userId,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      description: paymentIntent.description,
      bookingId: paymentIntent.bookingId,
      metadata: paymentIntent.metadata,
      createdAt: new Date().toISOString(),
    };

    await db.collection('receipts').add(receiptData);
    logger.info(`Receipt created for payment intent ${paymentIntent.id}`);

  } catch (error) {
    logger.error('Error creating receipt:', error);
    // Don't throw error as receipt creation failure shouldn't fail the payment
  }
}

/**
 * Get user payment history
 */
export const getPaymentHistory = onCall(async (request) => {
  try {
    const { auth } = request;
    if (!auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { limit = 50, startAfter } = request.data;

    let query = db.collection('payment_intents')
      .where('userId', '==', auth.uid)
      .orderBy('createdAt', 'desc')
      .limit(limit);

    if (startAfter) {
      const startAfterDoc = await db.collection('payment_intents').doc(startAfter).get();
      query = query.startAfter(startAfterDoc);
    }

    const snapshot = await query.get();
    const payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      payments,
      hasMore: snapshot.docs.length === limit,
    };

  } catch (error) {
    logger.error('Error getting payment history:', error);
    throw error;
  }
});

/**
 * Create refund (admin only)
 */
export const createRefund = onCall(async (request) => {
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

    const { paymentIntentId, amount, reason, notifyUser = true } = request.data;

    if (!paymentIntentId) {
      throw new HttpsError('invalid-argument', 'Payment intent ID is required');
    }

    // Get payment intent
    const paymentIntentDoc = await db.collection('payment_intents').doc(paymentIntentId).get();
    if (!paymentIntentDoc.exists) {
      throw new HttpsError('not-found', 'Payment intent not found');
    }

    const paymentIntent = paymentIntentDoc.data();
    
    // Check if payment was successful
    if (paymentIntent.status !== PaymentStatus.SUCCEEDED) {
      throw new HttpsError('failed-precondition', 'Only successful payments can be refunded');
    }

    // Check if already refunded
    if (paymentIntent.status === PaymentStatus.REFUNDED) {
      throw new HttpsError('failed-precondition', 'Payment already refunded');
    }

    // Validate refund amount
    const refundAmount = amount || paymentIntent.amount;
    if (refundAmount > paymentIntent.amount) {
      throw new HttpsError('invalid-argument', 'Refund amount cannot exceed original payment amount');
    }

    // Check for existing refunds
    const existingRefunds = await db.collection('refunds')
      .where('paymentIntentId', '==', paymentIntentId)
      .where('status', 'in', ['pending', 'succeeded'])
      .get();

    const totalRefunded = existingRefunds.docs.reduce((sum, doc) => {
      const refund = doc.data();
      return sum + (refund.status === 'succeeded' ? refund.amount : 0);
    }, 0);

    if (totalRefunded + refundAmount > paymentIntent.amount) {
      throw new HttpsError('invalid-argument', 'Total refund amount would exceed original payment');
    }

    // Create refund record
    const refundData = {
      paymentIntentId,
      amount: refundAmount,
      currency: paymentIntent.currency,
      reason: reason || 'Admin refund',
      status: 'pending',
      createdBy: auth.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const refundRef = await db.collection('refunds').add(refundData);

    // In a real implementation, you would call Stripe here
    // For now, we'll simulate a successful refund
    const isSuccessful = Math.random() > 0.05; // 95% success rate for testing

    const newRefundStatus = isSuccessful ? 'succeeded' : 'failed';
    
    await refundRef.update({
      status: newRefundStatus,
      processedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Update payment intent status if full refund
    if (isSuccessful && refundAmount === paymentIntent.amount) {
      await paymentIntentDoc.ref.update({
        status: PaymentStatus.REFUNDED,
        refundedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Update booking status if applicable
      if (paymentIntent.bookingId) {
        await db.collection('bookings').doc(paymentIntent.bookingId).update({
          paymentStatus: PaymentStatus.REFUNDED,
          refundedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // Log audit event
    await logAuditEvent({
      action: 'REFUND_CREATED',
      table: 'payment_intents',
      recordId: paymentIntentId,
      actorId: auth.uid,
      details: `Refund of ${refundAmount} ${paymentIntent.currency} created. Reason: ${reason}`,
    });

    // Notify user if requested
    if (notifyUser && isSuccessful) {
      await notifyUserRefund(paymentIntent.userId, {
        amount: refundAmount,
        currency: paymentIntent.currency,
        reason,
        paymentIntentId,
      });
    }

    logger.info(`Refund ${refundRef.id} ${newRefundStatus} for payment intent ${paymentIntentId}`);

    return {
      success: isSuccessful,
      refundId: refundRef.id,
      status: newRefundStatus,
      amount: refundAmount,
      currency: paymentIntent.currency,
      message: isSuccessful ? 'Refund processed successfully' : 'Refund failed',
    };

  } catch (error) {
    logger.error('Error creating refund:', error);
    throw error;
  }
});

/**
 * Get refund history (admin only)
 */
export const getRefundHistory = onCall(async (request) => {
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

    const { limit = 50, startAfter, status, paymentIntentId } = request.data;

    let query = db.collection('refunds')
      .orderBy('createdAt', 'desc')
      .limit(limit);

    if (status) {
      query = query.where('status', '==', status);
    }

    if (paymentIntentId) {
      query = query.where('paymentIntentId', '==', paymentIntentId);
    }

    if (startAfter) {
      const startAfterDoc = await db.collection('refunds').doc(startAfter).get();
      query = query.startAfter(startAfterDoc);
    }

    const snapshot = await query.get();
    const refunds = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return {
      success: true,
      refunds,
      hasMore: snapshot.docs.length === limit,
    };

  } catch (error) {
    logger.error('Error getting refund history:', error);
    throw error;
  }
});

/**
 * Cancel refund (admin only)
 */
export const cancelRefund = onCall(async (request) => {
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

    const { refundId, reason } = request.data;

    if (!refundId) {
      throw new HttpsError('invalid-argument', 'Refund ID is required');
    }

    // Get refund
    const refundDoc = await db.collection('refunds').doc(refundId).get();
    if (!refundDoc.exists) {
      throw new HttpsError('not-found', 'Refund not found');
    }

    const refund = refundDoc.data();
    
    if (refund.status !== 'pending') {
      throw new HttpsError('failed-precondition', 'Only pending refunds can be canceled');
    }

    // Update refund status
    await refundDoc.ref.update({
      status: 'canceled',
      canceledAt: new Date().toISOString(),
      canceledBy: auth.uid,
      cancelReason: reason || 'Admin canceled',
      updatedAt: new Date().toISOString(),
    });

    // Log audit event
    await logAuditEvent({
      action: 'REFUND_CANCELED',
      table: 'refunds',
      recordId: refundId,
      actorId: auth.uid,
      details: `Refund canceled. Reason: ${reason}`,
    });

    logger.info(`Refund ${refundId} canceled by admin ${auth.uid}`);

    return {
      success: true,
      message: 'Refund canceled successfully',
    };

  } catch (error) {
    logger.error('Error canceling refund:', error);
    throw error;
  }
});

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
 * Notify user about refund
 */
async function notifyUserRefund(userId: string, refundDetails: {
  amount: number;
  currency: string;
  reason: string;
  paymentIntentId: string;
}): Promise<void> {
  try {
    // In a real implementation, you would send email/push notification here
    // For now, we'll just log the notification
    logger.info(`Refund notification for user ${userId}:`, refundDetails);

    // You could integrate with:
    // - Firebase Cloud Messaging for push notifications
    // - SendGrid/Mailgun for email notifications
    // - In-app notification system

  } catch (error) {
    logger.error('Error notifying user about refund:', error);
    // Don't throw error as notification failure shouldn't fail the refund
  }
}
