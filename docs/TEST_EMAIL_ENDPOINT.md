# Test Email Endpoint - Quick Start Guide

## Overview

The test email endpoints allow you to verify that your SMTP configuration is working correctly without going through the full signup flow.

## Endpoints

### 1. Send Test Email
**POST** `/api/test-email`

Sends a test confirmation or invitation email to verify SMTP is working.

### 2. Check Configuration
**GET** `/api/test-email/check-config`

Checks email configuration status and provides recommendations.

## Quick Test (Browser Console)

While logged into the dashboard, open browser console and run:

```javascript
// Get your session token
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
const { data: { session } } = await supabase.auth.getSession();

// Send test email
const response = await fetch('/api/test-email', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token}`
  },
  body: JSON.stringify({
    email: 'your-test-email@example.com',
    type: 'confirmation' // or 'invite'
  })
});

const result = await response.json();
console.log('Test Email Result:', result);
```

## Using cURL

```bash
# First, get your access token (you'll need to be logged in)
# Then use it in the request:

curl -X POST http://localhost:3000/api/test-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "email": "test@example.com",
    "type": "confirmation"
  }'
```

## Check Configuration

```bash
curl -X GET http://localhost:3000/api/test-email/check-config \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Expected Responses

### Success Response
```json
{
  "success": true,
  "message": "Test email sent successfully to test@example.com",
  "details": {
    "method": "create_user",
    "user_id": "...",
    "email_sent": true,
    "requested_by": "admin@example.com",
    "target_email": "test@example.com",
    "type": "confirmation",
    "timestamp": "2026-01-27T..."
  },
  "next_steps": [
    "Check the recipient email inbox (and spam folder)",
    "Check Supabase auth logs for email send status",
    "If email doesn't arrive, verify SMTP settings in Supabase Dashboard"
  ]
}
```

### Error Response (SMTP Issue)
```json
{
  "success": false,
  "error": "534 5.7.9 Please log in with your web browser...",
  "isSmtpError": true,
  "message": "SMTP configuration error detected. Please check your Supabase SMTP settings in the dashboard.",
  "details": {
    "requested_by": "admin@example.com",
    "target_email": "test@example.com",
    "type": "confirmation"
  },
  "help": {
    "dashboard_url": "https://app.supabase.com/project/.../settings/auth",
    "checklist": "/docs/EMAIL_DEBUG_CHECKLIST.md"
  }
}
```

## Troubleshooting

1. **401 Unauthorized**: Make sure you're logged in and passing a valid access token
2. **Email not received**: 
   - Check spam folder
   - Verify SMTP settings in Supabase Dashboard
   - Check Supabase auth logs for errors
3. **SMTP Error**: Follow the `help.dashboard_url` link to check SMTP configuration

## Next Steps After Testing

1. If email is received → SMTP is working! ✅
2. If error occurs → Check the error message and follow recommendations
3. Check Supabase auth logs immediately after sending test email
4. Verify email confirmation is enabled in Supabase Dashboard
