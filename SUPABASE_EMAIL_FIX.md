# Supabase Email Confirmation Fix

## Issue
Email confirmation emails are not being sent when users sign up.

## Common Causes

### 1. **Email Confirmation Disabled in Supabase** (Most Likely)
**To Fix:**
1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **Authentication** → **Settings**
4. Look for **"Enable email confirmations"**
5. If it's OFF → Turn it ON
6. Save changes

### 2. **Using Development/Local Environment**
- Supabase may not send emails in local development by default
- Check your Supabase project settings

### 3. **Email Template Not Configured**
**To Fix:**
1. Go to **Authentication** → **Email Templates**
2. Check the **"Confirm signup"** template
3. Make sure it's enabled and has proper content
4. Default template should work, but you can customize it

### 4. **SMTP Not Configured (If using custom domain)**
**To Fix:**
1. Go to **Project Settings** → **Auth**
2. Check if "Email" provider is enabled
3. If using custom SMTP, verify credentials
4. For quick testing, use Supabase's default email service

### 5. **Missing `emailRedirectTo` in signUp options**

Update your signup code to include email redirect:

```typescript
// In src/config/supabase.ts - Update the signUpWithEmail function

export async function signUpWithEmail(email: string, password: string, metadata?: any) {
  const { data, error } = await supabase.auth.signUp({
    email: email.toLowerCase().trim(),
    password,
    options: {
      data: metadata,
      emailRedirectTo: 'tuto://auth/callback', // Add this for mobile
    },
  });
  
  if (error) throw error;
  return data;
}
```

## Quick Test

To verify emails are being sent:

1. **Check Supabase Dashboard Logs:**
   - Go to **Logs** → **Auth logs**
   - Look for signup events
   - Check if email was attempted

2. **Check Spam Folder:**
   - Supabase emails sometimes go to spam
   - Check recipient's spam/junk folder

3. **Test with Different Email:**
   - Try Gmail, Outlook, etc.
   - Some email providers block automated emails

## Recommended Configuration

### Supabase Auth Settings (in Dashboard):
```
✅ Enable email confirmations: ON
✅ Double confirm email changes: ON (optional)
✅ Enable email signup: ON
✅ Site URL: tuto://
✅ Redirect URLs: 
   - tuto://
   - tuto://auth/callback
   - http://localhost:8081 (for development)
```

### Email Template Variables Available:
- `{{ .ConfirmationURL }}` - The confirmation link
- `{{ .SiteURL }}` - Your site URL
- `{{ .Token }}` - Confirmation token

## Development Workaround

If you need to test without email confirmation during development:

1. **Disable email confirmation temporarily:**
   - Supabase Dashboard → Auth → Settings
   - Turn OFF "Enable email confirmations"
   - Users will be auto-confirmed

2. **Or manually confirm users:**
   - Go to **Authentication** → **Users**
   - Find the user
   - Click the user → Manually confirm their email

## Check Your Current Settings

Run this in your Supabase SQL Editor to see user confirmation status:

```sql
SELECT 
  id,
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
```

If `email_confirmed_at` is NULL, the email hasn't been confirmed yet.

## Next Steps

1. **First**, check Supabase Dashboard → Authentication → Settings
2. **Enable email confirmations** if disabled
3. **Test signup** with a new email
4. **Check Auth logs** to see if email was sent
5. **Check spam folder** of the test email

## Contact Supabase Support

If none of the above works:
- Go to Supabase Dashboard → Support
- Describe the issue: "Email confirmations not being sent"
- They usually respond within 24 hours
