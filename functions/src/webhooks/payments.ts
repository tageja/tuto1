import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';
import * as crypto from 'crypto';
import axios from 'axios';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

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
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Airtable API call failed: ${errorMessage}`);
    throw error;
  }
}

// Verify Stripe webhook signature
function verifyStripeSignature(payload: string, signature: string): boolean {
  if (!WEBHOOK_SECRET) {
    console.warn('Webhook secret not configured, skipping signature verification');
    return true; // Allow in development
  }

  try {
    const elements = signature.split(',');
    const signatureHash = elements.find(el => el.startsWith('v1='))?.split('=')[1];
    
    if (!signatureHash) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signatureHash, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}

// Process payment succeeded event
async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Processing payment succeeded: ${paymentIntent.id}`);
  
  try {
    // Find the booking associated with this payment intent
    const bookingResponse = await callAirtableApi('TutoBookings', 'GET', {
      params: {
        filterByFormula: `{PaymentIntentId} = "${paymentIntent.id}"`,
      },
    });

    if (!bookingResponse.records || bookingResponse.records.length === 0) {
      console.error(`No booking found for payment intent: ${paymentIntent.id}`);
      return;
    }

    const booking = bookingResponse.records[0];
    const bookingId = booking.id;

    // Update booking status to paid
    await callAirtableApi('TutoBookings', 'PATCH', {
      records: [{
        id: bookingId,
        fields: {
          Status: 'Paid',
          PaymentStatus: 'Completed',
          PaymentCompletedAt: new Date().toISOString(),
        },
      }],
    });

    // Create receipt record
    await callAirtableApi('TutoReceipts', 'POST', {
      records: [{
        fields: {
          PaymentIntentId: paymentIntent.id,
          BookingId: bookingId,
          Amount: paymentIntent.amount,
          Currency: paymentIntent.currency,
          Status: 'Completed',
          StripeChargeId: paymentIntent.latest_charge as string,
          CreatedAt: new Date().toISOString(),
        },
      }],
    });

    // Log audit event
    await callAirtableApi('TutoAudit', 'POST', {
      records: [{
        fields: {
          Action: 'PaymentCompleted',
          Table: 'TutoBookings',
          RecordId: bookingId,
          ActorId: 'system',
          Details: `Payment intent ${paymentIntent.id} completed successfully`,
          Timestamp: new Date().toISOString(),
        },
      }],
    });

    console.log(`✅ Payment ${paymentIntent.id} processed successfully`);
  } catch (error) {
    console.error(`❌ Failed to process payment ${paymentIntent.id}:`, error);
    throw error;
  }
}

// Process payment failed event
async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Processing payment failed: ${paymentIntent.id}`);
  
  try {
    // Find the booking associated with this payment intent
    const bookingResponse = await callAirtableApi('TutoBookings', 'GET', {
      params: {
        filterByFormula: `{PaymentIntentId} = "${paymentIntent.id}"`,
      },
    });

    if (!bookingResponse.records || bookingResponse.records.length === 0) {
      console.error(`No booking found for payment intent: ${paymentIntent.id}`);
      return;
    }

    const booking = bookingResponse.records[0];
    const bookingId = booking.id;

    // Update booking status to payment failed
    await callAirtableApi('TutoBookings', 'PATCH', {
      records: [{
        id: bookingId,
        fields: {
          Status: 'PaymentFailed',
          PaymentStatus: 'Failed',
          PaymentFailedAt: new Date().toISOString(),
          PaymentFailureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
        },
      }],
    });

    // Log audit event
    await callAirtableApi('TutoAudit', 'POST', {
      records: [{
        fields: {
          Action: 'PaymentFailed',
          Table: 'TutoBookings',
          RecordId: bookingId,
          ActorId: 'system',
          Details: `Payment intent ${paymentIntent.id} failed: ${paymentIntent.last_payment_error?.message}`,
          Timestamp: new Date().toISOString(),
        },
      }],
    });

    console.log(`✅ Payment failure ${paymentIntent.id} processed successfully`);
  } catch (error) {
    console.error(`❌ Failed to process payment failure ${paymentIntent.id}:`, error);
    throw error;
  }
}

// Main webhook handler
export const stripeWebhook = functions.https.onRequest(async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  const signature = req.headers['stripe-signature'] as string;
  const payload = JSON.stringify(req.body);

  // Verify webhook signature
  if (!verifyStripeSignature(payload, signature)) {
    console.error('Invalid webhook signature');
    res.status(400).send('Invalid signature');
    return;
  }

  const event = req.body as Stripe.Event;
  console.log(`Received webhook: ${event.type}`);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing failed:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Manual reconciliation function for admin use
export const reconcilePayments = functions.https.onCall(async (data, context) => {
  // Verify admin role
  if (!context.auth || !context.auth.token.role || context.auth.token.role !== 'admin') {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  const { startDate, endDate } = data;
  
  try {
    // Get all payment intents from Stripe for the date range
    const paymentIntents = await stripe.paymentIntents.list({
      created: {
        gte: Math.floor(new Date(startDate).getTime() / 1000),
        lte: Math.floor(new Date(endDate).getTime() / 1000),
      },
      limit: 100,
    });

    const results = {
      processed: 0,
      errors: 0,
      details: [] as any[],
    };

    for (const paymentIntent of paymentIntents.data) {
      try {
        if (paymentIntent.status === 'succeeded') {
          await handlePaymentSucceeded(paymentIntent);
          results.processed++;
          results.details.push({
            id: paymentIntent.id,
            status: 'processed',
            amount: paymentIntent.amount,
          });
        } else if (paymentIntent.status === 'requires_payment_method') {
          await handlePaymentFailed(paymentIntent);
          results.processed++;
          results.details.push({
            id: paymentIntent.id,
            status: 'failed',
            amount: paymentIntent.amount,
          });
        }
      } catch (error) {
        results.errors++;
        results.details.push({
          id: paymentIntent.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Reconciliation failed:', error);
    throw new functions.https.HttpsError('internal', 'Reconciliation failed');
  }
});











