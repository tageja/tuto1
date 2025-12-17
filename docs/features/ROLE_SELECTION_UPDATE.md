# Role Selection Screen - Update Record

**Date:** December 8, 2024
**Status:** ✅ Complete
**Platform:** Mobile App (React Native/Expo)

---

## Overview

Modified the mobile RoleSelectionScreen to implement a three-tier role system:
1. **Parent** - No school code needed, goes directly to home
2. **School Admin** - Requires school code, gets admin privileges
3. **Teacher** - Requires school code, loads teacher view (placeholder for now)

---

## Changes Made

### 1. **Role Options Updated**
**Before:** Parent, Student, Teacher
**After:** Parent, School Admin, Teacher

- Changed "Student" option to "School Admin"
- Updated icon from `school` to `admin-panel-settings`
- Added proper i18n support for "School Admin"

### 2. **School Code Modal**
**New Feature:** Modal appears when selecting Admin or Teacher roles

**Features:**
- School code input field
- Auto-uppercase conversion
- Validation (required field)
- Loading states
- Error handling for invalid codes
- Uses existing `joinSchool()` function from SchoolContext
- Matches app design patterns

**Modal Flow:**
```
User selects Admin/Teacher
↓
Modal appears with school code input
↓
User enters code + taps "Continue"
↓
Code validated via Airtable invitation system
↓
If valid: Role set + navigate to Home
↓
If invalid: Error alert shown
```

### 3. **Navigation Logic**

| Role | School Code Required | Navigation Target | Notes |
|------|---------------------|------------------|-------|
| Parent | ❌ No | Home | Direct navigation |
| School Admin | ✅ Yes | Home | Admin privileges activated |
| Teacher | ✅ Yes | Home | Teacher view placeholder (not implemented) |

### 4. **School Code Validation**
- Uses existing `joinSchool()` function from SchoolContext
- Validates against `TutoSchoolInvitations` Airtable table
- Checks invitation status, expiry, usage limits
- Joins user to school if valid
- Updates school context state

---

## Files Modified

### Mobile App Only (src/)
| File | Changes | Impact |
|------|---------|--------|
| `src/screens/RoleSelectionScreen.tsx` | Major overhaul | ✅ Role options, modal, navigation |
| `src/translations/index.ts` | Added schoolAdmin keys | ✅ EN/VI translations |

### Web Dashboard (apps/dashboard/)
| File | Changes |
|------|---------|
| _(none)_ | ✅ **Zero changes - guaranteed safe** |

---

## Technical Implementation

### **Role Selection Logic**
```typescript
const handleRoleSelection = async (role: 'parent' | 'admin' | 'teacher') => {
  if (role === 'parent') {
    // Direct navigation
    await setRoleAndNavigate(role);
  } else if (role === 'admin' || role === 'teacher') {
    // Show school code modal
    setSchoolCodeModal({ visible: true, role });
  }
};
```

### **School Code Modal State**
```typescript
const [schoolCodeModal, setSchoolCodeModal] = useState<{
  visible: boolean;
  role: 'admin' | 'teacher' | null;
}>({ visible: false, role: null });
```

### **School Code Validation**
```typescript
const handleSchoolCodeSubmit = async () => {
  const success = await joinSchool(schoolCode.trim().toUpperCase());

  if (success) {
    const role = schoolCodeModal.role!;
    await setRoleAndNavigate(role);
  } else {
    // Show error alert
  }
};
```

---

## User Experience

### **Parent Flow:**
1. Select "Parent" card
2. Instant navigation to Home screen
3. Can later choose school from home if they have enrolled children

### **Admin/Teacher Flow:**
1. Select "School Admin" or "Teacher" card
2. Modal appears with school code input
3. Enter invitation code (e.g., "ABC123")
4. Tap "Continue"
5. If valid: Navigate to Home with appropriate role
6. If invalid: Error message shown

### **School Code Requirements:**
- Invitation codes from Airtable `TutoSchoolInvitations` table
- Case-insensitive (auto-converted to uppercase)
- Must be active, not expired, within usage limits
- Links user to specific school with appropriate role

---

## Design Consistency

### **Modal Design**
- Matches app's design system (colors, spacing, typography)
- White background with rounded corners
- Same input field styling as login screen
- Primary button with blue background
- Loading states with ActivityIndicator
- Error states with Alert dialogs

### **Icon Usage**
- Parent: `family-restroom` (unchanged)
- School Admin: `admin-panel-settings` (new)
- Teacher: `school` (unchanged)

### **Translations**
- Added `schoolAdmin` key to both EN/VI translations
- Maintains existing translation patterns
- No hardcoded strings in JSX

---

## Error Handling

### **Validation Errors**
- Empty school code: "Please enter a school code"
- Invalid code: "Please check your school code and try again"
- Network errors: "Failed to validate school code. Please try again"

### **Loading States**
- Role selection buttons disabled during processing
- Modal submit button shows loading spinner
- User cannot interact during async operations

### **Fallbacks**
- If school code validation fails, user stays in modal
- Can cancel modal and return to role selection
- All errors are user-friendly with localized messages

---

## Future Considerations

### **Teacher View Implementation**
**Current:** Teachers navigate to Home (same as parents)
**Future:** Should navigate to dedicated teacher interface

**When teacher view is implemented:**
```typescript
// Future code:
if (role === 'teacher') {
  navigation.navigate('TeacherDashboard'); // Instead of 'Home'
}
```

### **Additional Role Types**
**Potential future roles:**
- Student (if needed for school-issued devices)
- School Staff (non-teaching staff)
- Super Admin (multi-school management)

### **School Code Improvements**
**Potential enhancements:**
- QR code scanning for invitation codes
- Email-based invitation links
- Auto-fill from email deep links
- Code format validation (alphanumeric patterns)

---

## Database Integration

### **Airtable Tables Used**
- `TutoSchoolInvitations` - Validates invitation codes
- `TutoSchools` - Links to school information
- User-school relationships created via `joinSchool()` function

### **School Context Updates**
When school code is validated successfully:
- User added to `joinedSchools` array
- School set as `currentSchool`
- `schoolUser` role set
- `isSchoolMode` enabled
- All data persisted to AsyncStorage

---

## Testing Checklist

### **Parent Role**
- [x] Parent selection navigates directly to Home
- [x] No school code required
- [x] No modal appears

### **School Admin Role**
- [x] Admin selection shows school code modal
- [x] Valid code accepts and navigates to Home
- [x] Invalid code shows error message
- [x] Empty code shows validation error
- [x] Modal can be cancelled

### **Teacher Role**
- [x] Teacher selection shows school code modal
- [x] Valid code accepts and navigates to Home (placeholder)
- [x] Invalid code shows error message
- [x] Modal can be cancelled

### **UI/UX**
- [x] Modal design matches app styling
- [x] Loading states work correctly
- [x] Error messages are localized
- [x] Keyboard handling works on iOS/Android
- [x] No lint errors

---

## Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Role options updated | ✅ Complete | Parent, School Admin, Teacher |
| School code modal | ✅ Complete | Full validation & error handling |
| Navigation logic | ✅ Complete | Parent direct, Admin/Teacher via code |
| Translations | ✅ Complete | EN/VI support for new roles |
| Error handling | ✅ Complete | User-friendly messages |
| Design consistency | ✅ Complete | Matches app design system |
| Web dashboard impact | ✅ Zero | Isolated to mobile app |

**Overall Status:** Production-ready with comprehensive error handling and user experience.

---

**End of Document**
_Last Updated: December 8, 2024_





