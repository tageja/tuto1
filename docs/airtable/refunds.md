# Refund Management System

## Overview

This document describes the refund management system for handling payment refunds, including admin controls, audit logging, and user notifications.

## Refund Functions

### Create Refund (`createRefund`)

**Purpose:** Allows admins to create partial or full refunds for successful payments.

**Access:** Admin only (requires `admin` role in custom claims)

**Parameters:**
- `paymentIntentId` (required): ID of the payment intent to refund
- `amount` (optional): Refund amount (defaults to full payment amount)
- `reason` (optional): Reason for the refund
- `notifyUser` (optional): Whether to notify the user (default: true)

**Validation:**
- Payment must be in `succeeded` status
- Refund amount cannot exceed original payment amount
- Total refunds cannot exceed original payment amount
- Prevents double refunds

**Process:**
1. Validates admin permissions
2. Checks payment intent status and amount
3. Creates refund record in database
4. Processes refund with payment provider (Stripe)
5. Updates payment intent and booking status if full refund
6. Logs audit event
7. Notifies user if requested

**Response:**
```typescript
{
  success: boolean,
  refundId: string,
  status: 'succeeded' | 'failed',
  amount: number,
  currency: string,
  message: string
}
```

### Get Refund History (`getRefundHistory`)

**Purpose:** Retrieves refund history for admin review.

**Access:** Admin only

**Parameters:**
- `limit` (optional): Number of refunds to return (default: 50)
- `startAfter` (optional): Pagination cursor
- `status` (optional): Filter by refund status
- `paymentIntentId` (optional): Filter by payment intent ID

**Response:**
```typescript
{
  success: boolean,
  refunds: Refund[],
  hasMore: boolean
}
```

### Cancel Refund (`cancelRefund`)

**Purpose:** Allows admins to cancel pending refunds.

**Access:** Admin only

**Parameters:**
- `refundId` (required): ID of the refund to cancel
- `reason` (optional): Reason for cancellation

**Validation:**
- Refund must be in `pending` status
- Only pending refunds can be canceled

**Process:**
1. Validates admin permissions
2. Checks refund status
3. Updates refund status to `canceled`
4. Logs audit event

## Database Schema

### Refunds Collection

Fields:
- `id`: Unique refund identifier
- `paymentIntentId`: Associated payment intent ID
- `amount`: Refund amount
- `currency`: Payment currency
- `reason`: Refund reason
- `status`: Refund status (`pending`, `succeeded`, `failed`, `canceled`)
- `createdBy`: Admin user ID who created the refund
- `createdAt`: Refund creation timestamp
- `updatedAt`: Last update timestamp
- `processedAt`: Processing completion timestamp
- `canceledAt`: Cancellation timestamp
- `canceledBy`: Admin user ID who canceled the refund
- `cancelReason`: Reason for cancellation

### Payment Intent Updates

Additional fields for refund tracking:
- `refundedAt`: Full refund timestamp
- `status`: Updated to `refunded` for full refunds

### Booking Updates

Additional fields for refund tracking:
- `refundedAt`: Refund timestamp
- `paymentStatus`: Updated to `refunded` for full refunds

## Admin Interface

### Refund Management Screen

**Location:** `src/screens/RefundManagementScreen.tsx`

**Features:**
- List all refunds with status indicators
- Create new refunds with amount and reason
- Cancel pending refunds
- Filter and search functionality
- Real-time status updates

**UI Components:**
- Refund list with status badges
- Create refund modal with form validation
- Cancel confirmation dialogs
- Loading and error states

## Security & Permissions

### Admin Access Control

- All refund functions require admin role verification
- Custom claims checked: `customClaims.role === 'admin'`
- Unauthorized access returns `permission-denied` error

### Audit Logging

All refund operations are logged to the audit system:
- `REFUND_CREATED`: When a refund is created
- `REFUND_CANCELED`: When a refund is canceled

Audit entries include:
- Action type
- Table and record ID
- Admin user ID
- Timestamp
- Details and reason

## Error Handling

### Common Error Scenarios

1. **Unauthorized Access**
   - Error: `permission-denied`
   - Message: "Admin access required"

2. **Invalid Payment Intent**
   - Error: `not-found`
   - Message: "Payment intent not found"

3. **Invalid Refund Amount**
   - Error: `invalid-argument`
   - Message: "Refund amount cannot exceed original payment amount"

4. **Payment Not Refundable**
   - Error: `failed-precondition`
   - Message: "Only successful payments can be refunded"

5. **Already Refunded**
   - Error: `failed-precondition`
   - Message: "Payment already refunded"

### Error Recovery

- Failed refunds are marked with `failed` status
- Audit logs capture all error conditions
- Admin can retry failed refunds
- User notifications include error details

## User Notifications

### Refund Notifications

When a refund is successfully processed:
- Email notification (if configured)
- Push notification (if configured)
- In-app notification
- Receipt generation

### Notification Content

- Refund amount and currency
- Reason for refund
- Processing timeline
- Contact information for questions

## Integration Points

### Payment Provider (Stripe)

- Refund processing via Stripe API
- Webhook handling for refund status updates
- Idempotency key management
- Error handling and retries

### Audit System

- Integration with existing audit logging
- Consistent event format
- Searchable audit trail
- Compliance reporting

### User Management

- Admin role verification
- User notification system
- Contact information retrieval
- Communication preferences

## Testing

### Unit Tests

- Refund creation validation
- Permission checking
- Amount validation
- Status transitions

### Integration Tests

- End-to-end refund flow
- Admin interface functionality
- Error handling scenarios
- Audit logging verification

### Manual Testing

- Admin access verification
- Refund creation and cancellation
- User notification delivery
- Audit trail accuracy

## Monitoring & Alerts

### Key Metrics

- Refund success rate
- Average refund processing time
- Failed refund frequency
- Admin refund activity

### Alerts

- High refund failure rate
- Unusual refund patterns
- Admin access violations
- System errors

## Best Practices

1. **Refund Policies**
   - Clear refund time limits
   - Documented refund reasons
   - Consistent refund amounts
   - User communication

2. **Security**
   - Regular admin access reviews
   - Audit trail monitoring
   - Secure refund processing
   - Data protection compliance

3. **User Experience**
   - Clear refund status communication
   - Timely refund processing
   - Easy refund request process
   - Transparent refund policies

4. **Operational**
   - Regular refund reconciliation
   - Monitor refund patterns
   - Train admin users
   - Document procedures

## Troubleshooting

### Common Issues

1. **Refund Not Processing**
   - Check payment provider status
   - Verify refund amount limits
   - Review error logs
   - Check admin permissions

2. **User Not Notified**
   - Verify notification settings
   - Check user contact information
   - Review notification logs
   - Test notification delivery

3. **Audit Log Missing**
   - Check audit system status
   - Verify logging configuration
   - Review error logs
   - Test audit functionality

### Debug Steps

1. Check refund status in database
2. Review payment provider logs
3. Verify admin permissions
4. Check audit trail
5. Test notification delivery
6. Review error messages






