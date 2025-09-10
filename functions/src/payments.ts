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
