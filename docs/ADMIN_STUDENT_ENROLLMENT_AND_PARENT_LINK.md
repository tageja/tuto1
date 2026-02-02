# Admin Student Enrollment & Parent Connection Flow

## Overview

When an admin enrolls a student, the student is connected to a parent account so the parent can see the student’s information (attendance, homework, events, etc.). The link is **parent email** plus an optional explicit mapping table.

---

## 1. Admin Enrolls a Student

**Where:** Web dashboard (Add Student modal) or API `POST /api/school/students`.

**What happens:**

- A row is inserted into **`school_students`** with at least:
  - `school_id`, `student_number`, `first_name`, `last_name`, `class_id`, `status`
- Optional parent fields (used for the parent connection):
  - **`parent_email`** – parent’s email (main link to parent account)
  - `parent_name`, `parent_phone` (and `contact_email` / `contact_phone` map to these if provided)

**Code references:**

- Web: `apps/dashboard/components/students/AddStudentModal.tsx` → `requestBody.parent_email`
- API: `apps/dashboard/app/api/school/students/route.ts` (POST) → `insertData.parent_email`
- Mobile: `src/services/supabase-students.ts` (createStudent) + `src/components/school/AddStudentModal.tsx`

There is **no** automatic insert into **`school_parent_students`** when the admin creates the student. That table is filled in other ways (see below).

---

## 2. How the Parent Is Connected to the Student

Two mechanisms work together:

### A. Email match: `school_students.parent_email`

- **`get_user_school_ids()`**  
  Includes schools where the current user’s email equals `school_students.parent_email` (and via `school_parents` for PIN-only parents). So the parent gets access to the school.

- **`get_user_school_associations(user_email)`**  
  Returns schools where the user is a parent via:
  - `school_students.parent_email = user_email`, or  
  - `school_parents` (PIN-linked).

- **`get_user_child_student_ids()`** (in the live DB)  
  Returns student IDs for the current parent by:
  1. **First:** `school_parent_students` where `parent_user_id` = current user’s `public.users.id`.
  2. **Fallback:** `school_students` where `parent_email` = current user’s email.

So **RLS and backend logic** can treat a parent as “connected” to a student purely via **`parent_email`**, even if there is no row in `school_parent_students`.

### B. Explicit mapping: `school_parent_students`

- Table: `(school_id, parent_user_id, student_id)` – which parent user sees which student in which school.
- **Used by:**  
  - RLS (e.g. attendance, homework, events) when they use `get_user_child_student_ids()`.  
  - **UI “My children” lists:** both mobile and web load children by querying **`school_parent_students`** with `parent_user_id = current user’s public.users.id` (no fallback to `parent_email` in the app query).

**When does a row get into `school_parent_students`?**

- **When the parent enters the school PIN**  
  The RPC **`validate_parent_pin(pin, user_email)`** (migration 035):
  1. Inserts into **`school_parents`** (parent linked to school via PIN).
  2. For each **`school_students`** row in that school where `parent_email = user_email` and status is active, it inserts into **`school_parent_students`** (if not already there).

So:

- If the **admin adds the student first** (with `parent_email`) and **then** the parent enters the PIN → `validate_parent_pin` creates the `school_parent_students` rows and the parent sees the student everywhere (RLS + “My children” list).
- If the **parent joins via PIN first** (no students yet) and **then** the admin adds a student with that parent’s email → today nothing inserts into `school_parent_students`. The parent may still “see” the student for RLS if `get_user_child_student_ids()` has the **parent_email fallback**, but the **“My children” list** only reads from `school_parent_students`, so the new student can be missing from the list until we add an auto-link (e.g. trigger or API step when a student is created/updated with `parent_email`).

---

## 3. End-to-End Flows

### Flow A: Admin adds student first, parent joins later

1. Admin creates student in `school_students` with **`parent_email`** (e.g. `parent@example.com`).
2. Parent signs up / logs in with that email.
3. Parent enters school PIN → **`validate_parent_pin`** runs:
   - Inserts `school_parents` (parent ↔ school).
   - Finds all `school_students` in that school with `parent_email = parent@example.com` and inserts into **`school_parent_students`**.
4. Parent now has:
   - School access via `get_user_school_ids()` / `get_user_school_associations()`.
   - Child visible in “My children” (from `school_parent_students`) and in all RLS that use `get_user_child_student_ids()`.

### Flow B: Parent joins via PIN first, admin adds student later

1. Parent already joined school via PIN (`school_parents` exists; `school_parent_students` may be empty).
2. Admin adds a new student with **`parent_email`** = that parent’s email.
3. **Current behavior:**  
   - No automatic insert into `school_parent_students`.  
   - If `get_user_child_student_ids()` has the **parent_email fallback**, RLS will allow the parent to see that student’s data.  
   - The **“My children”** UI (which queries only `school_parent_students`) will **not** show this new student until we add an auto-link (see “Recommendation” below).

---

## 4. Where Parent Sees Student Data

- **School access:** `get_user_school_ids()`, `get_user_school_associations()` (email + PIN).
- **“My children” list:** Queries **`school_parent_students`** with `parent_user_id` (mobile: e.g. `school/homework.ts` `fetchParentChildren`; web: e.g. parent attendance/homework/events pages).
- **RLS (attendance, homework, payments, events, etc.):** Use **`get_user_child_student_ids()`**, which in the live DB uses `school_parent_students` first, then **fallback** to `school_students.parent_email`. Migrations 011/020 define it only with `school_parent_students`; the fallback may exist only in the current DB.

---

## 5. Recommendation

To make “admin adds student with parent_email” work the same whether the parent joined before or after:

1. **In migrations:** Define **`get_user_child_student_ids()`** to:
   - Prefer **`school_parent_students`** (by `public.users.id` ↔ `auth.uid()`),
   - **Fallback** to **`school_students`** where `parent_email` = current user’s email,  
   so RLS is consistent everywhere.

2. **When a student is created or updated with `parent_email`:**  
   Auto-insert into **`school_parent_students`** for any **parent user** (in `public.users`) whose email matches and who is already linked to that school (exists in **`school_parents`**). Options:
   - **DB trigger** on `school_students` (AFTER INSERT / UPDATE of `parent_email`), or  
   - **API step** in `POST /api/school/students` and in the student update route after insert/update.

That way the parent always sees the newly enrolled student in the “My children” list and in all features that rely on `get_user_child_student_ids()` or on `school_parent_students`.
