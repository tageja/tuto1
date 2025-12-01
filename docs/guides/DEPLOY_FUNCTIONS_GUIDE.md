# Deploy Firebase Functions - Step by Step Guide

**Purpose**: Deploy the school dashboard Functions to Firebase  
**Time**: ~5 minutes

---

## 📋 **Prerequisites**

Before deploying, you need to create the `.env` file with your Airtable credentials.

### **Step 1: Create `functions/.env` File**

1. Navigate to `functions/` folder
2. Create a new file called `.env`
3. Add these 2 lines:

```env
AIRTABLE_PAT=patlzauOLrLxsf4QM.512407a6dba1d7dfefa3b1b70ebc7005e042a7313984cd5a31d2e00e9d2c9e46
AIRTABLE_BASE_ID=app34330Do0nm4qvM
```

4. Save the file

---

## 🚀 **Deploy Commands** (PowerShell)

### **Option A: Deploy Everything** (Recommended)

Run these commands **one at a time**:

```powershell
cd functions
npm install
npm run build
firebase deploy --only functions
```

### **Option B: Deploy Only New School Functions**

```powershell
cd functions
npm install
firebase deploy --only functions:getSchoolClasses,functions:getSchoolClassById,functions:getSchoolGrades,functions:getSchoolClassKpis,functions:getSchoolClassStudents,functions:getSchoolClassAttendance,functions:getSchoolStudents,functions:getSchoolStudentById,functions:getSchoolTeachers,functions:getSchoolTeacherById
```

---

## ⚠️ **If Build Fails with TypeScript Errors**

The build shows errors in **existing files** (not your new school functions). You have 2 options:

### **Option 1: Ignore and Deploy Anyway** (Quick)

Some Functions have pre-existing TypeScript errors. To deploy anyway:

```powershell
cd functions
$env:TSC_COMPILE_ON_ERROR='true'
npm run build
firebase deploy --only functions
```

### **Option 2: Skip Problem Files** (Safer)

Only deploy the school dashboard functions:

```powershell
cd functions  
firebase deploy --only functions:getSchoolClasses,functions:getSchoolClassById,functions:getSchoolGrades,functions:getSchoolClassKpis,functions:getSchoolClassStudents,functions:getSchoolClassAttendance,functions:getSchoolStudents,functions:getSchoolStudentById,functions:getSchoolTeachers,functions:getSchoolTeacherById
```

---

## ✅ **Verify Deployment**

After deployment completes, you'll see:

```
✔  functions[getSchoolClasses(asia-southeast1)]: Successful create operation
✔  functions[getSchoolClassById(asia-southeast1)]: Successful create operation
✔  functions[getSchoolGrades(asia-southeast1)]: Successful create operation
✔  functions[getSchoolClassKpis(asia-southeast1)]: Successful create operation
...
```

**Success!** Your Functions are live! 🎉

---

## 🧪 **Test After Deployment**

1. **Restart your web dashboard**:
```powershell
cd ..\apps\dashboard
npm run dev
```

2. **Open browser**: `http://localhost:3000/school/admin/classes`

3. **Select "Tuto Demo School"**

4. **See your data**: 6 classes, 28 students! ✨

---

## 🔍 **Troubleshooting**

### **Error: "Firebase not logged in"**
```powershell
firebase login
```

### **Error: "Project not set"**
```powershell
firebase use tuto1-73fc4
```

### **Functions not working after deploy?**
Check Firebase console logs:
```
https://console.firebase.google.com/project/tuto1-73fc4/functions/logs
```

### **Still seeing zeros on Classes page?**
1. Check Functions deployed successfully
2. Check `NEXT_PUBLIC_FUNCTIONS_BASE_URL` in `apps/dashboard/.env.local`
3. Check browser console for errors
4. Check Firebase Functions logs

---

## 📊 **What Gets Deployed**

### **New School Dashboard Functions** (10):
- ✅ getSchoolClasses
- ✅ getSchoolClassById
- ✅ getSchoolGrades
- ✅ getSchoolClassKpis
- ✅ getSchoolClassStudents
- ✅ getSchoolClassAttendance
- ✅ getSchoolStudents
- ✅ getSchoolStudentById
- ✅ getSchoolTeachers
- ✅ getSchoolTeacherById

### **Existing Functions** (kept):
- Teachers (get, create, update)
- Students (get, create, update)
- Bookings
- Payments
- Reviews

---

## 🎯 **After Successful Deployment**

Your architecture will be:
```
Web Dashboard → Firebase Functions → Airtable
Mobile App    → Firebase Functions → Airtable
                (SAME backend!)
```

**Single source of truth!** ✅

---

**Ready to deploy!** 🚀


















