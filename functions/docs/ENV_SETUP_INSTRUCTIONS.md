# Firebase Functions Environment Setup

**CRITICAL**: Firebase Functions need Airtable credentials to work!

---

## 🔧 **Create `functions/.env` File**

### **Step 1**: Create the file
In the `functions/` directory, create a new file called `.env`

### **Step 2**: Add your credentials

```env
# Airtable Configuration
AIRTABLE_PAT=patlzauOLrLxsf4QM.512407a6dba1d7dfefa3b1b70ebc7005e042a7313984cd5a31d2e00e9d2c9e46
AIRTABLE_BASE_ID=app34330Do0nm4qvM
```

### **Step 3**: Save the file

---

## ✅ **Verify It Worked**

The file should be at: `functions/.env`

And contain:
```
AIRTABLE_PAT=patlz...
AIRTABLE_BASE_ID=app34...
```

---

## 🚀 **Deploy Functions**

### **Build and Deploy**:
```bash
cd functions
npm install
npm run build
firebase deploy --only functions:v1
```

**Wait**: ~2-3 minutes for deployment

**Success**: You'll see URLs like:
```
✔  functions[v1-getSchoolClasses]: Successful create operation
✔  functions[v1-getSchoolClassKpis]: Successful create operation
...
```

---

## 🧪 **Test Locally (Optional)**

Instead of deploying, you can run locally:

```bash
cd functions
npm run serve
```

Then update `apps/dashboard/.env.local`:
```env
NEXT_PUBLIC_FUNCTIONS_BASE_URL=http://localhost:5001/tuto1-73fc4/asia-southeast1
```

---

## 📊 **What Functions Will Be Deployed**

**School Dashboard** (10 new):
- getSchoolClasses
- getSchoolClassById
- getSchoolGrades
- getSchoolClassKpis
- getSchoolClassStudents
- getSchoolClassAttendance
- getSchoolStudents
- getSchoolStudentById
- getSchoolTeachers
- getSchoolTeacherById

**Existing** (kept):
- getTeachers
- createTeacher
- updateTeacher
- getStudents
- createStudent
- updateStudent
- getBookings
- getPayments
- getReviews

**Total**: 19 Functions

---

## ⚠️ **Important Notes**

1. **Never commit `.env` files** - Already in `.gitignore` ✅

2. **For production**: Use Firebase console to set environment variables instead of `.env` file

3. **Cost**: Firebase Functions have a free tier, but monitor usage

4. **Logs**: Check Firebase console for errors if Functions fail

---

## 🎯 **Once Functions are Deployed**

Your web dashboard will:
- ✅ Call Firebase Functions (not Airtable directly)
- ✅ Share backend logic with mobile app
- ✅ Get live data from Airtable
- ✅ Show all 6 classes, 28 students, attendance data

**Ready to deploy!** 🚀


















