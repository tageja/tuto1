# Cutover Procedure - Airtable to Supabase

**Purpose**: Switch from Airtable to Supabase with minimal downtime  
**Estimated Time**: 30-60 minutes  
**Rollback Time**: 5 minutes (if needed)

---

## 📋 Pre-Cutover Checklist

Before starting the cutover, ensure:

- [ ] All migrations applied successfully (001, 002, 003)
- [ ] Data export completed (all Airtable tables exported)
- [ ] Data import completed (all records in Supabase)
- [ ] Verification passed (counts match)
- [ ] Supabase Auth configured (Google provider enabled)
- [ ] Environment variables set in both .env files
- [ ] @supabase/supabase-js installed
- [ ] Application code updated to use Supabase clients
- [ ] Testing completed in development

---

## 🎯 Cutover Steps

### Phase 1: Preparation (5 minutes)

1. **Announce Maintenance**:
   ```
   Send notification to users:
   "Tuto will be offline for 30-60 minutes for system upgrade.
   We're improving performance and reliability!"
   ```

2. **Create Backup**:
   - Airtable is already the backup
   - Export latest snapshot:
     ```bash
     npm run supabase:export-airtable
     ```

3. **Stop New Writes**:
   - Set Airtable to read-only mode (if possible)
   - Or accept that new writes during cutover may be lost

---

### Phase 2: Final Data Sync (10 minutes)

1. **Export Latest Data**:
   ```bash
   npm run supabase:export-airtable
   ```

2. **Import to Supabase**:
   ```bash
   npm run supabase:import-data
   ```

3. **Verify Counts**:
   ```bash
   npm run supabase:verify-import
   ```

4. **Check Critical Data**:
   ```sql
   -- In Supabase SQL Editor
   SELECT COUNT(*) FROM public.schools;
   SELECT COUNT(*) FROM public.school_students;
   SELECT COUNT(*) FROM public.teachers;
   SELECT COUNT(*) FROM public.users;
   ```

---

### Phase 3: Enable Supabase Auth (5 minutes)

1. **Configure Google OAuth** (if not done):
   - Go to: Auth > Providers > Google
   - Enable and configure
   - Add redirect URLs

2. **Test Auth**:
   - Create test user via Supabase dashboard:
     - Go to: Auth > Users > Invite user
     - Or use SQL:
       ```sql
       INSERT INTO auth.users (email, encrypted_password)
       VALUES ('test@example.com', crypt('password123', gen_salt('bf')));
       ```

3. **Verify RLS**:
   ```sql
   -- Should be enabled on all tables
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public'
   ORDER BY tablename;
   ```

---

### Phase 4: Deploy Updated Applications (15-20 minutes)

**Mobile App**:

1. **Update environment**:
   - Ensure .env has EXPO_PUBLIC_SUPABASE_* vars
   - Update app.config.js

2. **Build and deploy**:
   ```bash
   npx expo start --clear
   ```

3. **Test on device**:
   - Login with email/password
   - Test core features

**Web Dashboard**:

1. **Update environment**:
   - Ensure .env.local has NEXT_PUBLIC_SUPABASE_* vars

2. **Build**:
   ```bash
   cd apps/dashboard
   npm run build
   ```

3. **Deploy to hosting** (Vercel, Firebase Hosting, etc.):
   ```bash
   # Example for Vercel
   vercel deploy --prod
   ```

---

### Phase 5: Smoke Testing (10-15 minutes)

**Critical Flows to Test**:

1. **Authentication**:
   - [ ] Email/password login (mobile)
   - [ ] Email/password login (web)
   - [ ] Google OAuth (mobile)
   - [ ] Google OAuth (web)

2. **Data Access**:
   - [ ] Teachers list loads (mobile & web)
   - [ ] School dashboard loads (web)
   - [ ] Student list loads (web)
   - [ ] Classes list loads (web)

3. **CRUD Operations**:
   - [ ] Create a booking
   - [ ] Update a student record
   - [ ] Read attendance data

4. **Security**:
   - [ ] Users can only see their own data
   - [ ] School-scoped access works
   - [ ] Public teacher listing works

---

### Phase 6: Monitor (60 minutes)

**Watch for**:
- Error logs in Supabase dashboard
- User complaints/issues
- Performance issues
- Auth failures

**Monitoring URLs**:
- Supabase Dashboard: https://fkjeggdxqifqqwhuqpgm.supabase.co/project/fkjeggdxqifqqwhuqpgm
- Logs: https://fkjeggdxqifqqwhuqpgm.supabase.co/project/fkjeggdxqifqqwhuqpgm/logs/explorer
- Auth: https://fkjeggdxqifqqwhuqpgm.supabase.co/project/fkjeggdxqifqqwhuqpgm/auth/users

**Actions if issues arise**:
- See ROLLBACK.md for immediate rollback
- Document issues for fixing
- Consider partial rollback (auth only, or data only)

---

## ✅ Success Criteria

Cutover is successful when:

1. ✅ All users can login (email + Google)
2. ✅ Data loads correctly in all screens
3. ✅ CRUD operations work
4. ✅ No RLS policy errors
5. ✅ Performance is acceptable
6. ✅ No data loss reported

---

## 📊 Post-Cutover

**Immediate** (same day):
- [ ] Monitor for 24 hours
- [ ] Address any critical issues
- [ ] Document any workarounds

**Short-term** (within 1 week):
- [ ] Migrate remaining attachments
- [ ] Optimize slow queries
- [ ] Fix any edge cases

**Long-term** (within 1 month):
- [ ] Enable real-time features
- [ ] Archive Airtable (keep as backup)
- [ ] Remove Firebase dependencies (if fully migrated)
- [ ] Optimize database indexes

---

## 🔄 Rollback Plan

If critical issues arise, see `ROLLBACK.md` for:
- Immediate rollback steps (5 minutes)
- Partial rollback options
- Data recovery procedures

---

**Remember**: Keep Airtable data for at least 30 days as backup before archiving.

---

**Cutover Date**: TBD  
**Owner**: You  
**Duration**: 30-60 minutes  
**Risk**: Low (rollback available)





