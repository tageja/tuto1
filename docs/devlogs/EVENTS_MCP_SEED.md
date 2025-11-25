# Events MCP Seed Data

**Date**: 2025-01-XX  
**Purpose**: Seed test data for Events feature

## Prerequisites

- School ID: `48998eeb-fc31-4843-a995-c1692c1c849c` (Tuto Demo School)
- Class 5A ID: `e26196a4-4501-4c44-a971-bb027050a398`
- Parent User ID: `65d64149-5bed-4547-833e-cc62833078a8` (tarun.tageja@gmail.com)

## Seed Steps

### Step 1: Create/Update Student "Mung Tageja"

```sql
-- Check if student exists
SELECT id, first_name, last_name FROM public.school_students 
WHERE first_name ILIKE '%Mung%' AND last_name ILIKE '%Tageja%';

-- If not exists, create student
INSERT INTO public.school_students (
  school_id, class_id, first_name, last_name, status
) VALUES (
  '48998eeb-fc31-4843-a995-c1692c1c849c',
  'e26196a4-4501-4c44-a971-bb027050a398',
  'Mung',
  'Tageja',
  'active'
) RETURNING id;
```

### Step 2: Link Parent to Student

```sql
-- Link parent to Mung Tageja (use student ID from Step 1)
INSERT INTO public.school_parent_students (
  school_id, parent_user_id, student_id
) VALUES (
  '48998eeb-fc31-4843-a995-c1692c1c849c',
  '65d64149-5bed-4547-833e-cc62833078a8',
  '<STUDENT_ID_FROM_STEP_1>'
) ON CONFLICT DO NOTHING;
```

### Step 3: Create Events

7 events across categories with dates in next 30-60 days, 2 in the past.

**Events Created:**
1. Annual Sports Day (school, published, upcoming, capacity 300) - ID: `07f9225e-861f-4139-b750-14583de38d30`
2. Grade 5A Field Trip - Science Museum (class, published, upcoming, capacity 45, class_id set, parent_note) - ID: `076b1f83-f173-4a12-9484-e6543f8ccbcb`
3. Science Fair (competition, published, upcoming, capacity 100) - ID: `54ca77e8-92ca-4114-bc33-5269df93ec67`
4. Art Workshop - Watercolor Techniques (workshop, published, upcoming, capacity 25) - ID: `4e0f31fd-b131-4ac1-9182-1c940ddf4048`
5. Nature Walk (outing, published, upcoming, capacity 50) - ID: `e035e340-a883-42d4-af42-aff83ed823d0`
6. Basketball Practice (practice, published, completed, past date) - ID: `7cee59b3-e6fc-4293-9500-423c8a109678`
7. Winter Festival (celebration, published, completed, past date) - ID: `3ebe1148-02c4-479c-9f15-ce17a14a9d70`

### Step 4: Create Registrations

**Registrations Created:**
- Mung Tageja registered for:
  - Grade 5A Field Trip (registered)
  - Annual Sports Day (registered)
  - Science Fair (registered)
- Student No. 1 registered for Art Workshop (registered)
- Student No. 2 registered for Art Workshop (registered)

**MCP Commands Executed:**
All SQL commands executed successfully via MCP. Events and registrations are now in the database.

