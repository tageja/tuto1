# School Dashboard - Role Selection & View Logic

**Question**: When does the user select the dashboard view (Admin vs Parent)?

**Answer**: **They DON'T select it manually** - it's **automatically determined** by their account type.

---

## 🎯 **The Complete Flow (Step-by-Step)**

### **Step 1: User Clicks "School Dashboard"**

```
Homepage → "School Dashboard" link clicked
```

**Location**: `apps/dashboard/app/(home)/page.tsx` line 93  
**Route**: `/school`

---

### **Step 2: System Automatically Detects Role**

**File**: `apps/dashboard/app/school/layout.tsx` (lines 16-64)

```typescript
// Priority order for role detection:

1️⃣ Check Firebase Custom Claims (if user is authenticated)
   const idTokenResult = await user.getIdTokenResult();
   const role = idTokenResult.claims.schoolRole; // 'admin' or 'parent'
   
   ✅ If found → use this role
   ❌ If not found → proceed to step 2

2️⃣ Query Airtable: TutoSchoolTeachers
   GET /v0/{BASE_ID}/TutoSchoolTeachers
   ?filterByFormula=SEARCH("user@email.com", {Email})
   
   ✅ If record found → role = 'admin'
   ❌ If not found → proceed to step 3

3️⃣ Query Airtable: TutoSchoolStudents
   GET /v0/{BASE_ID}/TutoSchoolStudents
   ?filterByFormula=SEARCH("user@email.com", {Parent Email})
   
   ✅ If record found → role = 'parent'
   ❌ If not found → proceed to step 4

4️⃣ Default (Demo Mode)
   role = 'admin' (for testing purposes)
```

**Result**: System now knows if user is 'admin' or 'parent'

---

### **Step 3: Show School Selector**

**File**: `apps/dashboard/components/school/SchoolSelector.tsx`

```typescript
<SchoolSelector role={detectedRole} />
// Role is ALREADY determined - just used to filter schools
```

**Display**: Grid of schools user has access to

**Note**: User does NOT choose role here - they just choose which school

---

### **Step 4: User Selects a School**

```typescript
handleSelect(school) {
  setSelectedSchool(school); // Save to context + localStorage
  router.push(`/school/${role}`); // Redirect based on DETECTED role
}
```

**Auto-Redirect**:
- If role = 'admin' → `/school/admin`
- If role = 'parent' → `/school/parent`

---

### **Step 5: User Lands on Dashboard**

**Admin Account** → Automatically sent to:
```
/school/admin
├── Sees AdminLayout with AdminSidebar (17 items)
├── Dashboard, Classes, Teachers, Students, etc.
└── Can manage school-wide data
```

**Parent Account** → Automatically sent to:
```
/school/parent
├── Sees ParentLayout with ParentSidebar (12 items)
├── Dashboard, Announcements, Homework, Progress, etc.
└── Can only see their child's data
```

---

## 🔒 **Can Users Change Their View?**

### **In Production (when demo mode is off):**
❌ **NO** - Users are locked to their role-based view:
- Admin accounts can ONLY access `/school/admin/*`
- Parent accounts can ONLY access `/school/parent/*`
- Trying to manually navigate to wrong role → redirected back

### **In Development (with demo mode):**
✅ **YES** - Developers can switch for testing:
- Click "Parent →" button in admin view
- Click "Admin →" button in parent view
- Bypasses role detection for testing purposes

---

## 🎭 **Demo Mode Banner Explained**

### **What I Just Implemented (Option C):**

```typescript
// Only shows in development mode
{process.env.NODE_ENV === 'development' && (
  <div className="Demo Mode Banner">
    <button disabled>Admin</button>         // Disabled (current view)
    <button onClick={switchToParent}>Parent →</button>  // Functional
  </div>
)}
```

**Features**:
1. ✅ **Dev-Only**: Banner hidden in production builds
2. ✅ **Functional Buttons**: Actually switch between views
3. ✅ **Visual Indicators**: 
   - Current role button is disabled with darker color
   - Other role button is clickable with arrow "→"
   - Different colors (blue for admin, purple for parent)
4. ✅ **Live Data Indicator**: Shows data is synced

---

## 📊 **Visual Diagram**

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER ACCOUNT IN DATABASE                     │
│                                                                 │
│  Option 1: Email in TutoSchoolTeachers                         │
│            → Role: ADMIN                                        │
│            → Sees: /school/admin (automatically)                │
│                                                                 │
│  Option 2: Email in TutoSchoolStudents (Parent Email field)    │
│            → Role: PARENT                                       │
│            → Sees: /school/parent (automatically)               │
│                                                                 │
│  Option 3: Email in BOTH tables (dual role - rare)             │
│            → Role: Priority to ADMIN                            │
│            → Sees: /school/admin (can't access parent view)     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔑 **Key Takeaways**

1. **Automatic, Not Manual**:
   - User does NOT choose "I want to be admin" or "I want to be parent"
   - System detects based on account type in database
   - Similar to how Gmail knows if you're admin@company.com or user@company.com

2. **One Role Per User**:
   - Each user account has ONE role
   - Cannot switch roles (unless you're a developer in dev mode)
   - Need 2 accounts to see both views in production

3. **Demo Mode is for Developers**:
   - Shows ONLY in development (`npm run dev`)
   - Hidden in production builds
   - Allows testing both views without creating 2 accounts

4. **School Switching is Allowed**:
   - Users CAN switch between schools (if they have access to multiple)
   - Uses dropdown in header
   - Role stays the same, just data changes

---

## 🧪 **Testing Different Roles**

### **Method 1: Demo Mode (Development)**
- ✅ Start dev server: `npm run dev`
- ✅ See demo banner with functional role switch buttons
- ✅ Click "Parent →" from admin view (or vice versa)
- ✅ Test both dashboards easily

### **Method 2: Real Accounts (Production)**
- ✅ Create admin user in `TutoSchoolTeachers` with email
- ✅ Create parent user in `TutoSchoolStudents` with Parent Email
- ✅ Login with each account to see respective dashboard
- ❌ Cannot switch roles (locked to account type)

---

## 📝 **Production Behavior**

When you deploy to production (`npm run build`):
- ✅ Demo banner **will NOT appear** (dev-only)
- ✅ Clean professional UI
- ✅ Role detection still works automatically
- ✅ Users see only their authorized dashboard

---

## 🎯 **Summary**

**Q**: When does the user select the dashboard view?  
**A**: **They don't** - it's automatic based on their account type in the database.

**Q**: Are we giving option to change view after entering?  
**A**: 
- **Production**: NO - locked to their role
- **Development**: YES - demo mode allows switching for testing

**Q**: How is the view determined?  
**A**: Firebase claims → Airtable query → Default (in that order)

---

**The demo mode banner you see is now functional and dev-only! Try clicking the buttons - they'll switch between admin and parent views for testing.** 🎯

















