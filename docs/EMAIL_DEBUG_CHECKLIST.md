# Email Debugging Checklist - Step by Step

## Current Issue
Emails are not being sent. Error: `534 5.7.9 Please log in with your web browser`

## Systematic Debugging Steps

### Step 1: Verify App Password Was Generated Correctly

1. **Go to:** https://myaccount.google.com/apppasswords
2. **Sign in with:** Your Google account email
3. **Check:**
   - Is 2-Step Verification enabled? (Required for App Passwords)
   - Do you see any App Passwords listed?
   - If yes, note the name (should be "Supabase SMTP" or similar)
   - If no App Passwords exist, generate a new one

4. **Generate New App Password:**
   - App: Select "Mail"
   - Device: Select "Other" → Type "Supabase SMTP"
   - Click "Generate"
   - **IMPORTANT:** Copy the 16-character password immediately
   - Format: `xxxx xxxx xxxx xxxx` (remove ALL spaces when using)

### Step 2: Verify Supabase SMTP Configuration

1. **Go to Supabase Dashboard:**
   ```
   https://app.supabase.com/project/YOUR_PROJECT_ID/settings/auth
   ```
   (Replace YOUR_PROJECT_ID with your actual Supabase project ID)

2. **Scroll to "SMTP Settings"**

3. **Verify ALL these settings match EXACTLY:**
   ```
   ✅ Enable Custom SMTP: ON
   
   SMTP Host: smtp.gmail.com
   SMTP Port: 587
   SMTP Username: your-email@example.com
   SMTP Password: [Paste App Password - NO SPACES]
   
   Sender Email: your-email@example.com
   Sender Name: Tuto Support Team
   
   ✅ Enable TLS: Yes
   ```

4. **Common Mistakes:**
   - ❌ Using regular password instead of App Password
   - ❌ Leaving spaces in App Password
   - ❌ Wrong port (should be 587, not 465)
   - ❌ Username doesn't match sender email
   - ❌ TLS not enabled

### Step 3: Test SMTP Connection

**Option A: Use Test Email API Endpoint (Recommended)**
1. **Call the test email endpoint:**
   ```bash
   # Using curl
   curl -X POST http://localhost:3000/api/test-email \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     -d '{"email": "your-test-email@example.com", "type": "confirmation"}'
   ```

   Or from your browser console (while logged in):
   ```javascript
   const response = await fetch('/api/test-email', {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
     },
     body: JSON.stringify({
       email: 'your-test-email@example.com',
       type: 'confirmation'
     })
   });
   const result = await response.json();
   console.log(result);
   ```

2. **Check the response:**
   - If `success: true` → Email was sent (check inbox/spam)
   - If `success: false` → Check the `error` field for details
   - If `isSmtpError: true` → SMTP configuration issue

3. **Check Email Configuration:**
   ```bash
   # Check configuration status
   curl -X GET http://localhost:3000/api/test-email/check-config \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```

   This will show:
   - Signup statistics
   - Links to Supabase Dashboard
   - Recommendations for fixing issues

**Option B: Use Supabase Dashboard Test Email (if available)**
1. In SMTP settings, look for "Send test email" button
2. Enter your email address
3. Click send
4. Check inbox and spam

**Option C: Try Signup**
1. Go to your app signup page
2. Sign up with a test email
3. Check logs immediately after

### Step 4: Check Google Account Security

1. **Go to:** https://myaccount.google.com/security
2. **Check "Recent security activity":**
   - Look for any blocked login attempts
   - Check if Google flagged anything suspicious

3. **If you see blocked attempts:**
   - Click "Yes, that was me" to unblock
   - This might be blocking SMTP access

### Step 5: Verify Google Workspace Settings

If `support@tutoglobal.com` is a Google Workspace account:

1. **Go to:** https://admin.google.com
2. **Navigate to:** Apps → Google Workspace → Gmail
3. **Check:**
   - Is SMTP relay enabled?
   - Are there any restrictions on the account?
   - Is the account active?

### Step 6: Alternative - Try Port 465 (SSL)

If port 587 doesn't work, try SSL:

1. **In Supabase SMTP Settings:**
   ```
   SMTP Port: 465
   Enable SSL: Yes (instead of TLS)
   ```

2. **Save and test again**

### Step 7: Check if Configuration Was Saved

After updating SMTP settings in Supabase:
1. **Refresh the page**
2. **Verify settings are still there**
3. **Wait 1-2 minutes** (Supabase may need time to reload config)
4. **Try sending test email again**

### Step 8: Nuclear Option - Use Supabase Default Email

If Gmail continues to fail:

1. **In Supabase Dashboard:**
   - Go to Settings → Auth → SMTP
   - **Disable "Enable Custom SMTP"**
   - This uses Supabase's default email service

2. **Test signup** - emails should work (may have rate limits)

3. **Note:** Emails will come from Supabase domain, not your custom domain

## What the Error Means

**Error: "534 5.7.9 Please log in with your web browser"**

This means:
- Google detected an app trying to login
- Google requires you to verify it's you
- The App Password might not be working
- OR Google has blocked the account for security

## Quick Fixes to Try

### Fix 1: Generate Fresh App Password
1. Delete old App Password
2. Generate new one
3. Update Supabase immediately
4. Test within 5 minutes

### Fix 2: Check Google Account Activity
1. Go to: https://myaccount.google.com/notifications
2. Look for security alerts
3. Approve any blocked login attempts

### Fix 3: Verify Account Access
1. Try logging into Gmail with your configured email address
2. Make sure account is active and accessible
3. Check if account is suspended or restricted

### Fix 4: Use Different Email Provider
If Gmail continues to fail, consider:
- **SendGrid** (free tier: 100 emails/day)
- **Mailgun** (free tier: 5,000 emails/month)
- **AWS SES** (very cheap, pay per email)

## Using the Test Email API Endpoints

### Test Email Endpoint
**POST** `/api/test-email`

**Request Body:**
```json
{
  "email": "test@example.com",
  "type": "confirmation" // or "invite"
}
```

**Response (Success):**
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

**Response (Error):**
```json
{
  "success": false,
  "error": "534 5.7.9 Please log in with your web browser...",
  "isSmtpError": true,
  "message": "SMTP configuration error detected...",
  "help": {
    "dashboard_url": "https://app.supabase.com/project/.../settings/auth",
    "checklist": "/docs/EMAIL_DEBUG_CHECKLIST.md"
  }
}
```

### Configuration Checker Endpoint
**GET** `/api/test-email/check-config`

**Response:**
```json
{
  "success": true,
  "config": {
    "project_id": "...",
    "supabase_url": "...",
    "has_service_role_key": true,
    "signup_stats": {
      "total_recent": 0,
      "confirmed": 0,
      "unconfirmed": 0,
      "confirmation_rate": 0
    }
  },
  "dashboard_links": {
    "auth_providers": "https://app.supabase.com/project/.../auth/providers",
    "smtp_settings": "https://app.supabase.com/project/.../settings/auth",
    "auth_logs": "https://app.supabase.com/project/.../logs/explorer?q=auth"
  },
  "recommendations": [
    "Verify 'Confirm email' is enabled...",
    "Check SMTP settings...",
    "Use the POST /api/test-email endpoint..."
  ],
  "manual_checks": [
    {
      "name": "Email Confirmation Enabled",
      "url": "...",
      "instructions": "..."
    }
  ]
}
```

## Next Steps

After trying the above:
1. **Use the test email endpoint** (`POST /api/test-email`) to send a test email
2. **Check the response** for success/error details
3. **If error occurs**, check the `isSmtpError` flag and follow the recommendations
4. **Check Supabase auth logs** immediately after sending test email
5. **If still failing**, we can switch to a different email provider

## Current Status

From the logs, the most recent attempt was at **07:08:11Z** and it's still failing with the same error. This suggests:
- The App Password might not have been updated correctly
- OR Supabase hasn't reloaded the new configuration yet
- OR Google is still blocking the account

Let me know which step you want to try first, or if you've already tried any of these!
