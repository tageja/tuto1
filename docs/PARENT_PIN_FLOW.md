# Parent PIN Code Flow - Complete Process

## Overview
This document explains the complete flow of how parents join schools using the 6-digit PIN code system.

## Flowchart

```mermaid
flowchart TD
    Start([School Admin Enrolls New Student]) --> AddStudent[Admin adds student to school_students table<br/>with parent_email field]
    AddStudent --> SchoolHasPIN{School has<br/>parent_pin?}
    
    SchoolHasPIN -->|No| AutoGen[Database trigger auto-generates<br/>6-digit unique PIN]
    AutoGen --> PINStored[PIN stored in schools.parent_pin]
    SchoolHasPIN -->|Yes| PINStored
    
    PINStored --> AdminShares[Admin shares PIN with parent<br/>via email/phone/in-person]
    
    AdminShares --> ParentSignsUp[Parent creates account<br/>and signs up/logs in]
    
    ParentSignsUp --> WelcomePage[Parent lands on /welcome page]
    WelcomePage --> CheckAccess[System checks get_user_school_associations<br/>RPC function]
    
    CheckAccess --> HasAccess{Parent has<br/>school access?}
    
    HasAccess -->|Yes| ShowDashboard[Show school dashboard<br/>or school selector]
    HasAccess -->|No| CheckIsParent{Is user<br/>a parent?}
    
    CheckIsParent -->|No| ShowOptions[Show welcome options<br/>Join School / Continue to Tuto]
    CheckIsParent -->|Yes| ShowPINModal[Auto-show PIN Entry Modal]
    
    ShowPINModal --> ParentEntersPIN[Parent enters 6-digit PIN]
    ParentEntersPIN --> ValidatePIN[POST /api/school/validate-parent-pin<br/>Calls validate_parent_pin RPC]
    
    ValidatePIN --> CheckFormat{PIN format<br/>valid?}
    CheckFormat -->|No| ShowError[Show error:<br/>Invalid format]
    ShowError --> ParentEntersPIN
    
    CheckFormat -->|Yes| FindSchool[Find school by PIN<br/>Check if active]
    FindSchool --> SchoolFound{School<br/>found?}
    
    SchoolFound -->|No| ShowError2[Show error:<br/>Invalid PIN]
    ShowError2 --> ParentEntersPIN
    
    SchoolFound -->|Yes| CheckUserExists{User exists<br/>in users table?}
    CheckUserExists -->|No| ShowError3[Show error:<br/>User not found]
    ShowError3 --> ParentEntersPIN
    
    CheckUserExists -->|Yes| CheckAlreadyLinked{Already linked<br/>to school?}
    CheckAlreadyLinked -->|Yes| ShowError4[Show error:<br/>Already linked]
    ShowError4 --> ParentEntersPIN
    
    CheckAlreadyLinked -->|No| CreateLink[Insert into school_parents table<br/>joined_via_pin = true]
    
    CreateLink --> FindStudents[Find all students in school_students<br/>where parent_email matches]
    FindStudents --> LinkStudents[For each matching student:<br/>Insert into school_parent_students<br/>if not exists]
    
    LinkStudents --> ReturnSuccess[Return success with:<br/>schoolId, schoolName, studentsLinked count]
    
    ReturnSuccess --> ShowSuccess[Show success message<br/>in modal]
    ShowSuccess --> Redirect[Redirect to school dashboard<br/>/school/{schoolId}/parent]
    
    Redirect --> RefreshAssociations[Refresh get_user_school_associations<br/>Now includes PIN-linked school]
    RefreshAssociations --> End([Parent can now access<br/>school dashboard])
    
    style Start fill:#e1f5ff
    style End fill:#d4edda
    style ShowPINModal fill:#fff3cd
    style ValidatePIN fill:#f8d7da
    style CreateLink fill:#d1ecf1
    style LinkStudents fill:#d1ecf1
```

## Step-by-Step Process

### Phase 1: School Admin Enrolls Student

1. **Admin adds student** → Student record created in `school_students` table with:
   - `parent_email`: The parent's email address
   - `parent_name`: Parent's name
   - `parent_phone`: Parent's phone (optional)
   - `school_id`: Links student to school

2. **PIN Auto-Generation**:
   - If school doesn't have a PIN yet, database trigger automatically generates one
   - PIN is a unique 6-digit number (000000-999999)
   - Stored in `schools.parent_pin` column

3. **Admin Shares PIN**:
   - Admin can see PIN in:
     - Main dashboard (before KPI cards)
     - Settings → Integrations tab
   - Admin copies PIN and shares with parent via:
     - Email
     - SMS/WhatsApp
     - In-person meeting
     - Printed handout

### Phase 2: Parent First Login

1. **Parent Creates Account**:
   - Parent signs up/logs in to the web dashboard
   - Account created in `users` table with their email

2. **Welcome Page Check**:
   - System calls `get_user_school_associations` RPC function
   - Checks three sources:
     - `school_teachers` (if parent is also a teacher)
     - `school_students` (if student already linked via email)
     - `school_parents` (if already linked via PIN)

3. **No Access Detected**:
   - If no schools found AND user is identified as a parent
   - System automatically shows PIN Entry Modal

### Phase 3: PIN Validation & Linking

1. **Parent Enters PIN**:
   - Modal shows 6-digit input field
   - Only accepts numeric input
   - Validates format (exactly 6 digits)

2. **API Call**:
   - `POST /api/school/validate-parent-pin`
   - Sends PIN to backend
   - Backend calls `validate_parent_pin(pin, user_email)` RPC function

3. **Database Validation**:
   - Validates PIN format (6 digits, numeric only)
   - Finds school by PIN (must be active)
   - Verifies user exists in `users` table
   - Checks if already linked (prevents duplicates)

4. **Create Parent-School Link**:
   - Inserts record into `school_parents` table:
     ```sql
     INSERT INTO school_parents (
       school_id,
       parent_user_id,
       joined_via_pin,
       joined_at
     ) VALUES (...)
     ```

5. **Auto-Link Existing Students**:
   - Finds all students in `school_students` where:
     - `school_id` matches
     - `parent_email` matches parent's email (case-insensitive)
     - `status = 'active'`
   - For each matching student, creates link in `school_parent_students`:
     ```sql
     INSERT INTO school_parent_students (
       school_id,
       parent_user_id,
       student_id
     ) VALUES (...)
     ON CONFLICT DO NOTHING
     ```

6. **Return Success**:
   - Returns: `{ success: true, schoolId, schoolName, studentsLinked: N }`
   - Shows success message in modal
   - Redirects to `/school/{schoolId}/parent`

### Phase 4: Ongoing Access

1. **Future Logins**:
   - `get_user_school_associations` now includes the PIN-linked school
   - Parent sees school in welcome page
   - Can access school dashboard directly

2. **Student Updates**:
   - If admin adds more students with same `parent_email`:
     - Students are NOT automatically linked
     - Parent would need to use PIN again OR
     - Admin can manually link via `school_parent_students` table

## Database Tables Involved

### `schools`
- `id` (UUID): School identifier
- `parent_pin` (VARCHAR(6)): Unique 6-digit PIN
- `status`: Must be 'active' for PIN to work

### `school_students`
- `id` (UUID): Student identifier
- `school_id` (UUID): Links to school
- `parent_email` (TEXT): Used for auto-linking
- `status`: Must be 'active' for auto-linking

### `school_parents`
- `id` (UUID): Record identifier
- `school_id` (UUID): Links to school
- `parent_user_id` (UUID): Links to users table
- `joined_via_pin` (BOOLEAN): true if joined via PIN
- `joined_at` (TIMESTAMP): When parent joined

### `school_parent_students`
- `school_id` (UUID): Composite key
- `parent_user_id` (UUID): Composite key
- `student_id` (UUID): Composite key
- Links parent to specific students in school

## Key Features

1. **Automatic PIN Generation**: Every school gets a unique PIN automatically
2. **One-Time Linking**: Parent can only link to a school once (prevents duplicates)
3. **Auto-Student Linking**: All existing students with matching email are linked automatically
4. **Secure**: PIN validation happens server-side, format is strictly validated
5. **User-Friendly**: Modal appears automatically when parent has no access

## Error Scenarios

- **Invalid PIN Format**: Not exactly 6 digits → Shows format error
- **PIN Not Found**: PIN doesn't exist or school inactive → Shows invalid PIN error
- **User Not Found**: User account doesn't exist → Shows login error
- **Already Linked**: Parent already linked to school → Shows already linked error
- **Network Error**: API call fails → Shows retry error

## Future Enhancements

- PIN expiration dates
- PIN usage limits (max uses per PIN)
- Admin can regenerate PIN
- PIN history/audit log
- Bulk student linking when parent uses PIN
