# Testing Guide - Supabase Migration

**All code is updated!** Here's how to test both apps.

---

## 🧪 Test Web Dashboard

### Step 1: Start the Server

Open a new terminal and run:

```bash
cd apps/dashboard
npm run dev
```

**Wait for**:
```
✓ Ready in X seconds
○ Local: http://localhost:3000
```

### Step 2: Open in Browser

Go to: http://localhost:3000

### Step 3: Test Authentication

**Create Account**:
1. Click "Sign Up" or go to `/register`
2. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Role: Admin or Parent
3. Click "Create Account"
4. Should redirect to home page

**Login**:
1. Go to `/login`
2. Enter the credentials you just created
3. Click "Sign In"
4. Should redirect to home page

### Step 4: Test Data Pages

- Go to Schools page
- Click on a school
- Check Teachers page - should show 4 teachers
- Check Students page - should show 28 students  
- Check Classes page - should show 6 classes

**Expected**: All data loads from Supabase ✅

---

## 📱 Test Mobile App

### Step 1: Start Expo

```bash
npx expo start --clear
```

### Step 2: Open on Device

- Scan QR code with Expo Go app
- Or press 'w' for web
- Or press 'a' for Android emulator
- Or press 'i' for iOS simulator

### Step 3: Test Authentication

**Create Account**:
1. Tap "Create Account" tab
2. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Role: Parent
3. Tap "Create Account"
4. Should show success message
5. Navigate to Role Selection

**Login**:
1. Tap "Sign In" tab
2. Enter credentials
3. Tap "Sign In"  
4. Should navigate to app

### Step 4: Test Features

- Browse teachers list
- Search for teachers
- Create a booking (if parent)
- View profile

**Expected**: Everything works with Supabase ✅

---

## 🐛 Common Issues & Fixes

### Web Dashboard Issues

**Issue**: "Missing environment variables"
**Fix**: Make sure `apps/dashboard/.env.local` exists with:
```env
NEXT_PUBLIC_SUPABASE_URL=https://fkjeggdxqifqqwhuqpgm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZramVnZ2R4cWlmcXF3aHVxcGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NTM4NDYsImV4cCI6MjA3ODMyOTg0Nn0.7e45smIALVo6zdVGOn2Af74fKRKj5kYvZn34nt26-hs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZramVnZ2R4cWlmcXF3aHVxcGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc1Mzg0NiwiZXhwIjoyMDc4MzI5ODQ2fQ.FDJ8X28wmvBtgQnmwtRW6y3lc-Enm_QTykmU1HGEX-w
```

**Issue**: Build errors
**Check**: Terminal output for specific error messages

**Issue**: "Cannot find module '@/lib/supabase'"
**Fix**: File exists, restart dev server: Ctrl+C, then `npm run dev`

### Mobile App Issues

**Issue**: "Supabase URL not configured"
**Fix**: Make sure root `.env` has:
```env
EXPO_PUBLIC_SUPABASE_URL=https://fkjeggdxqifqqwhuqpgm.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZramVnZ2R4cWlmcXF3aHVxcGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NTM4NDYsImV4cCI6MjA3ODMyOTg0Nn0.7e45smIALVo6zdVGOn2Af74fKRKj5kYvZn34nt26-hs
```

**Issue**: "Module not found @supabase/supabase-js"
**Fix**: Run `npm install --legacy-peer-deps`

---

## ✅ What Should Work

### Authentication ✅
- Email/password login
- Email/password registration
- User profile creation
- Session persistence

### Data Access ✅
- Teachers list (from Supabase)
- Students list (from Supabase)
- Classes list (from Supabase)
- All CRUD operations

### What Won't Work Yet ⏳
- Google OAuth (needs configuration in Supabase dashboard)
- Some screens that haven't been migrated yet

---

## 🎯 Success Criteria

**Web Dashboard**:
- ✅ Loads at http://localhost:3000
- ✅ Can create account
- ✅ Can login
- ✅ Teachers page shows 4 teachers
- ✅ Students page shows 28 students
- ✅ Classes page shows 6 classes

**Mobile App**:
- ✅ Loads in Expo Go
- ✅ Can create account
- ✅ Can login
- ✅ Profile loads
- ✅ App navigates correctly

---

## 📊 Testing Report Template

After testing, note:

**Web Dashboard**:
- [ ] Started successfully
- [ ] Login works
- [ ] Data loads
- [ ] Issues found: _______________

**Mobile App**:
- [ ] Started successfully
- [ ] Login works
- [ ] Data loads
- [ ] Issues found: _______________

---

## 🆘 If You Find Issues

1. **Check terminal output** for specific errors
2. **Check browser console** (F12) for errors
3. **Check Supabase logs**: https://fkjeggdxqifqqwhuqpgm.supabase.co/project/fkjeggdxqifqqwhuqpgm/logs
4. **Report errors** - I can help fix them!

---

**Start testing now!** Both apps are ready. 🚀





