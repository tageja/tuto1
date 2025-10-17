# Payment Webhooks & Reconciliation

## Overview

This document describes the webhook system for handling Stripe payment events and the reconciliation process to ensure data consistency between Stripe and our Airtable database.

## Webhook Endpoint

### Stripe Webhook Handler

**Endpoint:** `https://your-functions-url/stripeWebhook`

**Method:** POST

**Purpose:** Receives and processes Stripe webhook events for payment status changes.

### Supported Events

- `payment_intent.succeeded` - Payment completed successfully
- `payment_intent.payment_failed` - Payment failed

### Webhook Processing Flow

1. **Signature Verification**: Validates the webhook signature using Stripe's webhook secret
2. **Event Processing**: Routes the event to the appropriate handler
3. **Database Updates**: Updates booking status and creates receipt records
4. **Audit Logging**: Records all payment events for audit trail

### Security

- Webhook signature verification using HMAC-SHA256
- Only processes events from verified Stripe webhooks
- Rate limiting and error handling for failed processing

## Reconciliation System

### Manual Reconciliation

**Function:** `reconcilePayments`

**Purpose:** Allows admins to manually reconcile payment data between Stripe and Airtable for a specific date range.

**Parameters:**
- `startDate`: Start date for reconciliation (ISO string)
- `endDate`: End date for reconciliation (ISO string)

**Returns:**
```typescript
{
  processed: number,
  errors: number,
  details: Array<{
    id: string,
    status: 'processed' | 'failed' | 'error',
    amount?: number,
    error?: string
  }>
}
```

### Reconciliation Process

1. **Fetch Payment Intents**: Retrieves all payment intents from Stripe for the date range
2. **Process Each Payment**: Updates booking status and creates receipts
3. **Error Handling**: Captures and reports any processing errors
4. **Audit Trail**: Logs all reconciliation activities

## Database Schema

### TutoReceipts Table

Fields:
- `PaymentIntentId`: Stripe payment intent ID
- `BookingId`: Associated booking record ID
- `Amount`: Payment amount in cents
- `Currency`: Payment currency (e.g., 'usd', 'vnd')
- `Status`: Payment status ('Completed', 'Failed', 'Refunded')
- `StripeChargeId`: Stripe charge ID
- `CreatedAt`: Receipt creation timestamp

### TutoBookings Table Updates

Additional fields for payment tracking:
- `PaymentIntentId`: Stripe payment intent ID
- `PaymentStatus`: Current payment status
- `PaymentCompletedAt`: Payment completion timestamp
- `PaymentFailedAt`: Payment failure timestamp
- `PaymentFailureReason`: Reason for payment failure

## Configuration

### Environment Variables

- `STRIPE_SECRET_KEY`: Stripe secret key for API access
- `STRIPE_WEBHOOK_SECRET`: Webhook endpoint secret for signature verification
- `AIRTABLE_PAT`: Airtable personal access token
- `AIRTABLE_BASE`: Airtable base ID

### Stripe Dashboard Setup

1. **Webhook Endpoint**: Configure webhook URL in Stripe dashboard
2. **Events**: Subscribe to `payment_intent.succeeded` and `payment_intent.payment_failed`
3. **Secret**: Copy webhook signing secret to environment variables

## Error Handling

### Webhook Failures

- Invalid signature: Returns 400 Bad Request
- Processing errors: Returns 500 Internal Server Error
- Unhandled events: Logs and returns 200 OK

### Reconciliation Failures

- Individual payment processing errors are captured and reported
- Failed payments are marked with error details
- Audit trail maintains record of all attempts

## Monitoring & Alerts

### Recommended Monitoring

1. **Webhook Success Rate**: Monitor webhook processing success
2. **Reconciliation Errors**: Alert on high error rates
3. **Payment Status Mismatches**: Detect inconsistencies between Stripe and Airtable
4. **Audit Trail**: Regular review of payment events

### Logging

All webhook and reconciliation activities are logged with:
- Event type and ID
- Processing status
- Error details (if any)
- Timestamps
- User context (for manual reconciliation)

## Testing

### Webhook Testing

1. **Stripe CLI**: Use `stripe listen` and `stripe trigger` for local testing
2. **Test Events**: Send test webhook events to verify processing
3. **Signature Verification**: Test with valid and invalid signatures

### Reconciliation Testing

1. **Date Range**: Test reconciliation with various date ranges
2. **Error Scenarios**: Test with failed payments and missing data
3. **Admin Access**: Verify admin-only access to reconciliation function

## Best Practices

1. **Idempotency**: Webhook processing is idempotent to handle duplicate events
2. **Retry Logic**: Failed webhook processing should be retried by Stripe
3. **Data Consistency**: Regular reconciliation to ensure data accuracy
4. **Security**: Never expose webhook secrets in client-side code
5. **Monitoring**: Set up alerts for webhook failures and reconciliation errors

## Troubleshooting

### Common Issues

1. **Webhook Not Receiving Events**: Check Stripe dashboard configuration
2. **Signature Verification Fails**: Verify webhook secret configuration
3. **Database Updates Fail**: Check Airtable permissions and API limits
4. **Reconciliation Errors**: Review error logs and data consistency

### Debug Steps

1. Check webhook endpoint logs in Firebase Functions
2. Verify Stripe webhook configuration
3. Test with Stripe CLI for local debugging
4. Review Airtable API response codes
5. Check environment variable configuration






