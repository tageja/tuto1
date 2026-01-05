# 📋 Privacy Policy & ToS - Information Required

**Purpose:** Generate production-ready Privacy Policy and Terms of Service for Apple App Store submission

**Status:** Awaiting Information from You ⏳

---

## 🔴 REQUIRED INFORMATION (Cannot proceed without these)

### 1. **Domain Information**
- [ ] **Primary Domain:** 'tutoglobal.com'
  - Example: `tuto.edu`, `myapp.com`, etc.
  - This is where the policy will be hosted
  
- [ ] **Subdomain preference (if any):** it's up to you, you can create it anywhere is the best. 
  - Example: `legal.tuto.edu`, `privacy.tuto.edu`, or just root domain
  - Leave blank if hosting at root (https://tuto.edu/privacy)

### 2. **Identity/Operator Information**
Choose ONE option:

**Option A: Individual Developer**
- [ ] **Your Full Name:** 'Tarun Tageja'
- [ ] **Operating As:** Tuto Education Platform
- [ ] **Type:** Individual/Sole Proprietor

**Option B: Project Name Only**
- [ ] **Project Name:** Tuto Education Platform
- [ ] **Operated by:** Independent Developer
- [ ] **Type:** Personal Project/MVP

**Option C: Informal Entity**
- [ ] **Entity Name:** _______________
- [ ] **Type:** Unregistered/Informal

**Recommendation:** Option A or B (most transparent and Apple-friendly)

### 3. **Location Information**
Required for GDPR/CCPA compliance:

- [ ] **City:** Ho Chi Min City
- [ ] **Country:** Vietnam
  - Example: "Ho Chi Minh City, Vietnam" or "Hanoi, Vietnam"

**Note:** You don't need a full street address for MVP. City + Country is sufficient.

### 4. **Contact Information**
- [ ] **Primary Contact Email:** support@tutoglobal.com
  - This MUST be a working email you check regularly
  - Options: 
    - `support@tuto.edu` (if you own domain and can set up)
    - `your.name@gmail.com` (totally acceptable!)
    - Any professional email you monitor
  
- [ ] **Alternative Contact (optional):** tarun@tutoglobal.com
  - Backup email if needed

- [ ] **Phone Number (optional but recommended):** +84 0349640253
  - Format: +[country code] [number]
  - Example: +84 XXX XXX XXX
  - Only for serious inquiries, not required by Apple

### 5. **Effective Date**
Choose ONE:
- [ ] **Option A:** "Effective as of [Date]" → Provide date: _______________
- [ ] **Option B:** "Effective upon app launch" (recommended for MVP)
- [ ] **Option C:** "January 1, 2025"

**Recommendation:** Option B (covers you if launch date shifts)

My answers - I go with option B
---

## 🟡 APP-SPECIFIC INFORMATION (Verify/Confirm)

I've audited your app. Please confirm or correct:

### 6. **Data Collection Confirmation**
Based on my audit, your app collects:
- [ ] ✅ **User names** (for profiles)
- [ ] ✅ **Email addresses** (for authentication)
- [ ] ✅ **Photos/Videos** (user-uploaded school activities)
- [ ] ✅ **Location data** (for teacher maps) - **Is this actually used for schools?**
- [ ] ✅ **Student records** (names, grades, attendance, health)
- [ ] ✅ **Messages/Communications** (school messaging)

**Question for you:**
- [ ] **Is location tracking actually needed for school features?**
  - If NO → I'll mark it as legacy/optional and recommend removing permission
  - If YES → I'll explain its use in policy

My answer - it's not needed for the school features, but the main features of the app (which live in the same app as the shcool dasbhoard) require location tracking .. these features are not implemented yet in the MVP but will be in a couple of months down the line.
### 7. **Third-Party Services Confirmation**
I found these services in your code. Confirm which are ACTIVE in production:

- [ ] ✅ **Firebase** (Authentication, Firestore) - maybe, i'm not sure
- [ ] ✅ **Airtable** (Database) - ❌ no, i am using supabase now.. 100% 
- [ ] ✅ **Cloudinary** (Image hosting) - **Or are images stored elsewhere?** - ❌ images are stored in supabase 
- [ ] ✅ **Sentry** (Crash reporting) - not sure .. i have no idea
- [ ] ✅ **Firebase Analytics** (Usage analytics) - yes i think, but not sure
- [ ] ⚠️ **Stripe** (Payments) - You said app is FREE, so this is DISABLED, correct?- ❌ not yet
- [ ] ❓ **Google OAuth** (For Google Sign-In) - yes ✅
- [ ] ❓ **Any other services?** _______________ Supabase ✅

**Mark each:**
- ✅ = Active in production
- ⚠️ = Code exists but disabled
- ❌ = Not used

### 8. **Age Restrictions**
- [ ] **Minimum age to use app independently:** 4+
  - Options: 4+, 13+, 16+, 18+
  - Recommendation: 4+ (since parents use it for young children)

- [ ] **App Store Age Rating Target:** _______________ 4+
  - Recommendation: 4+ (Ages 4 and up)

### 9. **School/Institution Information**
- [ ] **Is the app only for enrolled school students?** 
  - [ ] YES (stricter controls, school manages all access)
  - [ ✅] NO (public can download and try to join schools)
  
- [ ] **Who creates student accounts?**
  - [ ] School admins only - School admins will approve the request if a parent registers with a school name and school is present. but the Admin can create a link and give it to the parent to download and parent is registered with the email.
  - [ ✅] Parents can register
  - [ ✅] Students can self-register
  
- [ ] **Who owns student data?**
  - [ ✅] The school (recommended for FERPA compliance) - but i am not sure if this is implemented. we will need to implemente this.. not sure if we should and how?
  - [ ] The platform (Tuto)
  - [ ] Shared ownership

**Recommendation:** Schools own data, Tuto is just the processor

---

## 🟢 OPTIONAL INFORMATION (Enhances policy but not required)

### 10. **Data Retention Periods**
If you have specific policies, provide them. Otherwise I'll use defaults:

- [ ] **User account data:** ___✅_____your recommendation_______ (default: retained while account active)
- [ ] **Student records:** ______✅_____your recommendation____ (default: controlled by school)
- [ ] **Messages/Photos:** ___✅_____your recommendation_______ (default: retained while account active)
- [ ] **Analytics data:** ______✅____your recommendation_____ (default: 90 days)
- [ ] **Deleted data grace period:** ______✅___your recommendation______ (default: 30 days before permanent deletion)

### 11. **International Compliance**
Your app supports Vietnamese and English. Confirm target regions:

- [ ] **Primary Region:** ______Vietname_________ (e.g., Vietnam)
- [ ] **Secondary Regions:** _______Southeast Asia for now________ (e.g., Southeast Asia, Global)

**Question:** Do you need GDPR compliance? (If you have users in EU/Europe)
- [ ] YES - I'll include full GDPR provisions
- [✅ ] NO - I'll include basic privacy rights
- [ ] UNSURE - I'll include it anyway (safer)
I don't have users in EU yet.

### 12. **Special Features/Considerations**
- [✅ ] **Do you plan to add AI features later?** (If yes, I'll add placeholder)
- [ ✅] **Do you share data with government/authorities?** (Only if legally required, I assume)
- [no they don't pay anything for now ] **Do schools pay for the service?** (You said free, confirming)
- [ i have no idea. please check for your self ] **Do you use cookies on web dashboard?** (For web version at apps/dashboard/)

---

## 📄 DOCUMENTS I WILL CREATE

Once you provide the above information, I will generate:

### Primary Documents:
1. **Privacy Policy** (3,000-5,000 words)
   - COPPA compliant (children under 13)
   - FERPA compliant (student education records)
   - GDPR compliant (if needed)
   - CCPA compliant (California users)
   - Vietnamese schools specific
   - School data ownership
   - Parent rights
   - Data security measures

2. **Terms of Service** (2,000-3,000 words)
   - User responsibilities
   - Acceptable use policy
   - School terms
   - Content ownership
   - Liability limitations
   - Dispute resolution
   - Termination terms

3. **Data Retention Policy** (1,000-1,500 words)
   - Based on existing `docs/data-retention.md`
   - Polished for public consumption

### Supporting Files:
4. **README for hosting** (instructions)
5. **HTML versions** (ready to upload)
6. **Markdown versions** (for easy editing)
7. **Plain text versions** (backup)

### Code Updates:
8. **Updated URLs in app** (if domain changes)
   - `src/screens/settings/AboutAndLegalSettingsScreen.tsx`
   - `src/screens/settings/PrivacyDataSettingsScreen.tsx`

---

## 🎯 QUICK START (Minimum Required)

If you want to move fast, give me just these 5 things:

1. ✅ **Domain:** _______________
2. ✅ **Your name OR "Tuto Education Platform":** _______________
3. ✅ **City, Country:** _______________
4. ✅ **Contact email:** _______________
5. ✅ **Is location tracking needed for schools?** YES / NO

I can generate a solid privacy policy with just those 5 items, and we can refine later.

---

## 📝 HOW TO PROVIDE INFORMATION

**Option 1: Fill this template**
Copy this and fill in the blanks:

```
DOMAIN: 
OPERATOR: 
LOCATION: 
EMAIL: 
EFFECTIVE DATE: 

LOCATION TRACKING NEEDED: YES/NO
ACTIVE SERVICES: Firebase, Airtable, [others]
AGE RATING: 4+
SCHOOL OWNS DATA: YES
GDPR NEEDED: YES/NO

SPECIAL NOTES: [anything else I should know]
```

**Option 2: Just tell me in plain language**
I'll extract the information and confirm with you.

---

## ⏱️ TIMELINE AFTER YOU PROVIDE INFO

- **Step 1:** You provide information (5-10 minutes)
- **Step 2:** I generate all documents (10-15 minutes)
- **Step 3:** You review and request any changes (5-10 minutes)
- **Step 4:** I create final versions and hosting instructions (5 minutes)
- **Step 5:** You publish to your domain (15-30 minutes)

**Total: 1-2 hours from start to published!**

---

## 🚀 READY WHEN YOU ARE!

Fill out the information above and I'll create everything you need for Apple App Store submission.

**Minimum needed to start:** Items 1-5 under "Quick Start"

**For best results:** Fill out all REQUIRED sections (items 1-9)

**For perfect results:** Fill out everything including optional items

---

**Questions?** Just ask! I'm here to make this as easy as possible for you.

