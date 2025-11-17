# Security Checklist

**Last Updated**: Post-migration  
**Status**: All items must be ✅ before going to production

---

## 🔒 Database Security

- [ ] RLS enabled on ALL tables (verify: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'`)
- [ ] No permissive policies (no `USING (true)` except for public read tables like subjects, teachers)
- [ ] Helper functions use SECURITY DEFINER appropriately
- [ ] Foreign keys have proper ON DELETE clauses
- [ ] Sensitive fields (passwords, tokens) properly handled

---

## 🔐 Authentication

- [ ] Supabase Auth enabled
- [ ] Email confirmation required (optional but recommended)
- [ ] Password requirements enforced (min 6 chars)
- [ ] Google OAuth configured correctly
- [ ] Redirect URLs whitelisted
- [ ] Session timeout configured (default 3600s)

---

## 🗝️ API Keys & Secrets

- [ ] Service role key NEVER in client code
- [ ] Service role key only in server-side code (API routes, Functions)
- [ ] Anon key safe for client use (RLS enforced)
- [ ] .env files in .gitignore
- [ ] No secrets committed to Git
- [ ] Environment variables set in production hosting

---

## 📦 Storage Security

- [ ] Storage bucket `tuto-media` is PRIVATE
- [ ] No public access to files
- [ ] Access only via signed URLs
- [ ] File size limits enforced (10MB max)
- [ ] Allowed file types restricted (images, PDFs only)

---

## 🏫 Multi-Tenancy

- [ ] School-scoped policies work correctly
- [ ] Users can only access their school's data
- [ ] Cross-school access denied (except admins)
- [ ] Parent can only see their own children
- [ ] Teacher can only see their own classes

---

## 👥 Role-Based Access

- [ ] Admin can access all data
- [ ] School admin can access their school only
- [ ] Teacher can access their classes/students
- [ ] Parent can access their children only
- [ ] Student can access their own data only

---

## 📊 Data Privacy

- [ ] Personal data (emails, phones) protected by RLS
- [ ] Health records accessible only to parents and school staff
- [ ] Payment data accessible only to relevant parties
- [ ] Messages private (sender/receiver only)
- [ ] Posts respect privacy settings

---

## 🔍 Audit & Monitoring

- [ ] Supabase audit logs enabled
- [ ] Monitor auth attempts (failed logins)
- [ ] Monitor RLS policy errors
- [ ] Set up alerts for suspicious activity
- [ ] Regular security reviews scheduled

---

## 🚨 Incident Response

- [ ] Rollback procedure documented (see ROLLBACK.md)
- [ ] Contact info for Supabase support
- [ ] Escalation path defined
- [ ] Data breach response plan

---

## 📝 Compliance

- [ ] GDPR compliance (if applicable)
- [ ] Data retention policy enforced
- [ ] User data deletion procedure
- [ ] Privacy policy updated
- [ ] Terms of service updated

---

## ✅ Verification Commands

Run these in Supabase SQL Editor to verify security:

```sql
-- Check RLS is enabled on all tables
SELECT 
  schemaname, 
  tablename, 
  CASE WHEN rowsecurity THEN '✅ RLS Enabled' ELSE '❌ RLS DISABLED' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check policies exist
SELECT 
  schemaname, 
  tablename, 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check user roles are set
SELECT role, COUNT(*) 
FROM public.users 
GROUP BY role;

-- Test that anon cannot access sensitive data
SET ROLE anon;
SELECT COUNT(*) FROM public.users; -- Should fail
SELECT COUNT(*) FROM public.teachers WHERE status = 'active'; -- Should work (public)
RESET ROLE;
```

---

## 🎯 Security Best Practices

1. **Principle of Least Privilege**: Users get minimum access needed
2. **Default Deny**: RLS defaults to deny, specific policies allow
3. **Server-Side Validation**: Never trust client input
4. **Audit Everything**: Log all sensitive operations
5. **Regular Reviews**: Review policies monthly

---

**Status**: Complete this checklist before production cutover.





