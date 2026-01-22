# Google Workspace SMTP Configuration for Supabase

## Overview
Configure Supabase to send emails through your Google Workspace account (support@tutoglobal.com)

## Prerequisites
- ✅ Google Workspace account active
- ✅ 2-Step Verification enabled on Google account
- ✅ Admin access to Supabase project

---

## Step-by-Step Setup

### 1. Generate Google App Password

1. **Sign in to Google Account:**
   - Go to: https://myaccount.google.com
   - Use your `support@tutoglobal.com` account

2. **Enable 2-Step Verification** (if not done):
   - Go to: Security → 2-Step Verification
   - Follow the setup wizard

3. **Create App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - App: **Mail**
   - Device: **Other** → Type "Supabase SMTP"
   - Click **Generate**
   - **IMPORTANT:** Copy the 16-character password
   - Format: `xxxx xxxx xxxx xxxx` (remove spaces when pasting)

### 2. Configure Supabase SMTP

1. **Open Supabase Dashboard:**
   ```
   https://app.supabase.com/project/fkjeggdxqifqqwhuqpgm/settings/auth
   ```

2. **Scroll to "SMTP Settings"**

3. **Enable Custom SMTP:**
   - Toggle: **Enable Custom SMTP** → ON

4. **Fill in Settings:**
   ```
   SMTP Host:       smtp.gmail.com
   SMTP Port:       587
   SMTP Username:   support@tutoglobal.com
   SMTP Password:   [Your App Password - no spaces]
   
   Sender Email:    support@tutoglobal.com
   Sender Name:     Tuto Support Team
   
   Admin Email:     tarun@tutoglobal.com (for admin notifications)
   ```

5. **Security Settings:**
   - ✅ Enable TLS: **Yes**
   - Encryption: **TLS/STARTTLS**

6. **Click "Save"**

### 3. Test Email Configuration

1. **Send Test Email:**
   - In Supabase SMTP settings, look for "Send test email" button
   - Enter a test email address
   - Click "Send test email"

2. **Check Inbox:**
   - Test email should arrive from `support@tutoglobal.com`
   - Check spam folder if not received

3. **Test Signup Flow:**
   - Sign up with a new email in your app
   - Confirmation email should come from `support@tutoglobal.com`

---

## Alternative SMTP Ports

If port 587 doesn't work, try:

### Port 465 (SSL):
```
SMTP Port: 465
Enable SSL: Yes
```

### Port 25 (Not recommended):
```
SMTP Port: 25
Less secure, may be blocked by providers
```

---

## Troubleshooting

### Issue: "Authentication failed"
**Solutions:**
- ✅ Verify App Password is correct (no spaces)
- ✅ Make sure 2-Step Verification is enabled
- ✅ Try generating a new App Password
- ✅ Check username is full email: `support@tutoglobal.com`

### Issue: "Connection timeout"
**Solutions:**
- ✅ Check if your network/firewall blocks port 587
- ✅ Try port 465 instead
- ✅ Verify SMTP host: `smtp.gmail.com`

### Issue: "Emails not sending"
**Solutions:**
- ✅ Check Google Workspace admin hasn't blocked SMTP
- ✅ Verify sender email exists in Google Workspace
- ✅ Check Supabase logs: Dashboard → Logs → Auth
- ✅ Review Google account activity for blocks

### Issue: "From address not allowed"
**Solutions:**
- ✅ Make sure Sender Email matches SMTP Username
- ✅ Both should be: `support@tutoglobal.com`
- ✅ Don't use aliases or group emails

---

## Google Workspace Admin Settings

If emails still don't send, check Google Workspace Admin Console:

1. **Go to:** https://admin.google.com
2. **Navigate to:** Apps → Google Workspace → Gmail → User settings
3. **Check:** "Allow per-user outbound gateways"
4. **Ensure:** SMTP relay is allowed for your domain

---

## Email Template Customization

After SMTP is working, customize your email templates:

1. **Go to:** Authentication → Email Templates
2. **Edit:** "Confirm signup" template
3. **Customize:** Branding, colors, text
4. **Save changes**

### Example Template:
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background-color: #0B5FFF; padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Welcome to Tuto!</h1>
  </div>
  
  <div style="padding: 40px 20px; background-color: #f9f9f9;">
    <h2 style="color: #333;">Confirm Your Email Address</h2>
    <p style="color: #666; line-height: 1.6;">
      Thank you for signing up for Tuto Education Platform. 
      Please confirm your email address to complete your registration.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}" 
         style="background-color: #0B5FFF; color: white; padding: 15px 40px; 
                text-decoration: none; border-radius: 8px; display: inline-block;">
        Confirm Email Address
      </a>
    </div>
    
    <p style="color: #999; font-size: 12px; margin-top: 40px;">
      If you didn't create an account, you can safely ignore this email.
    </p>
  </div>
  
  <div style="background-color: #333; padding: 20px; text-align: center;">
    <p style="color: #999; font-size: 12px; margin: 0;">
      © 2026 Tuto Education Platform | 
      <a href="https://www.tutoglobal.com" style="color: #0B5FFF;">tutoglobal.com</a>
    </p>
  </div>
</div>
```

---

## Quick Reference

**Google Workspace SMTP:**
```
Host:     smtp.gmail.com
Port:     587 (TLS) or 465 (SSL)
Auth:     App Password (not regular password)
From:     support@tutoglobal.com
```

**Supabase Settings URL:**
```
https://app.supabase.com/project/fkjeggdxqifqqwhuqpgm/settings/auth
```

**Google App Passwords:**
```
https://myaccount.google.com/apppasswords
```

---

## Important Notes

1. **App Password Required:**
   - Regular Google password WON'T work
   - Must use 16-character App Password

2. **Sending Limits:**
   - Google Workspace: 2,000 emails/day per account
   - If you need more, consider using SendGrid or AWS SES

3. **Deliverability:**
   - Emails from your domain have better deliverability
   - Less likely to go to spam than Supabase default

4. **Monitoring:**
   - Check Google Workspace admin console for email activity
   - Monitor Supabase logs for email errors

---

## Next Steps After Setup

1. ✅ Test signup flow with new email
2. ✅ Verify confirmation emails arrive
3. ✅ Check emails don't go to spam
4. ✅ Customize email templates (optional)
5. ✅ Monitor sending limits

---

## Support

**If you need help:**
- Google Workspace: https://support.google.com/a
- Supabase: https://supabase.com/docs/guides/auth/auth-smtp

**Common Issues:**
- Most issues are due to incorrect App Password
- Make sure 2-Step Verification is enabled
- Verify sender email exists in Google Workspace
