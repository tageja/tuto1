# Events Schema Audit

**Date**: 2025-01-XX  
**Purpose**: Audit existing schema for Events feature implementation

## Summary

This audit was performed to understand the current state of the database schema before implementing the Events feature. The audit checked for:
- `school_events` table
- `event_registrations` table  
- `school_notifications` table
- `school_parent_students` table (for parent-student mapping)
- Helper functions for RLS

## Findings

### Tables

#### ✅ `school_parent_students`
- **Status**: EXISTS
- **Structure**: 
  - `school_id` (uuid, NOT NULL)
  - `parent_user_id` (uuid, NOT NULL)
  - `student_id` (uuid, NOT NULL)
  - Composite primary key: `(school_id, parent_user_id, student_id)`
- **Usage**: Used to map parents to their children for event registration access control

#### ❌ `school_events`
- **Status**: DOES NOT EXIST
- **Note**: Migration file `001_initial_schema.sql` shows creation of `school_events`, but the table does not exist in the database
- **Required Schema**:
  - `id` (uuid, PK)
  - `school_id` (uuid, FK to schools)
  - `title` (text, NOT NULL)
  - `description` (text)
  - `category` (text, check: 'school','class','competition','workshop','outing','practice','celebration')
  - `class_id` (uuid, FK to school_classes, nullable)
  - `starts_at` (timestamptz, NOT NULL)
  - `ends_at` (timestamptz, NOT NULL)
  - `location` (text)
  - `status` (text, check: 'draft','published','completed','cancelled', default 'draft')
  - `capacity` (int, nullable)
  - `parent_note` (text, nullable)
  - `created_by` (uuid, FK to users, NOT NULL)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

#### ❌ `event_registrations`
- **Status**: DOES NOT EXIST
- **Required Schema**:
  - `id` (uuid, PK)
  - `school_id` (uuid, FK to schools, NOT NULL)
  - `event_id` (uuid, FK to school_events, NOT NULL, CASCADE delete)
  - `student_id` (uuid, FK to school_students, NOT NULL)
  - `parent_user_id` (uuid, FK to users, NOT NULL)
  - `status` (text, check: 'registered','cancelled','waitlisted', default 'registered')
  - `registered_at` (timestamptz, default now())
  - Unique index on `(event_id, student_id)` where `status='registered'`

#### ❌ `school_notifications`
- **Status**: DOES NOT EXIST
- **Note**: Migration file `008_school_announcements.sql` shows creation, but table does not exist
- **Required Schema**:
  - `id` (uuid, PK)
  - `school_id` (uuid, FK to schools, NOT NULL)
  - `type` (text, check: 'announcement','event')
  - `ref_id` (uuid, NOT NULL)
  - `title` (text, NOT NULL)
  - `message` (text, nullable) - NEW COLUMN for event notifications
  - `audience_scope` (text, check: 'School','Classes', default 'School')
  - `class_ids` (uuid[], nullable)
  - `created_at` (timestamptz, default now())

#### ⚠️ `events` (Legacy)
- **Status**: EXISTS (but different schema)
- **Note**: This appears to be a legacy table with different structure:
  - Uses `event_date`, `start_time`, `end_time` instead of `starts_at`/`ends_at`
  - Uses `event_type` instead of `category`
  - Status values: 'scheduled','in progress','completed','cancelled'
  - Missing: `capacity`, `parent_note`, `class_id`
- **Action**: Not used for Events feature. We will create `school_events` as specified.

### Helper Functions

#### ✅ `is_admin()`
- **Status**: EXISTS
- **Type**: FUNCTION
- **Usage**: Returns boolean indicating if current user is admin

#### ✅ `get_user_school_ids()`
- **Status**: EXISTS
- **Type**: FUNCTION
- **Returns**: UUID[] - Array of school IDs the user has access to
- **Usage**: Used in RLS policies to filter by school

#### ✅ `get_user_child_student_ids()`
- **Status**: EXISTS
- **Type**: FUNCTION
- **Returns**: UUID[] - Array of student IDs that are children of the current user
- **Usage**: Used in RLS policies for parent access control

## Migration Plan

### Migration File: `010_events.sql`

1. **Create `school_events` table** with full schema as specified
2. **Create `event_registrations` table** with full schema
3. **Create `school_notifications` table** (if not exists) or update type check to include 'event'
4. **Add indexes**:
   - `idx_events_school_start` on `(school_id, starts_at)`
   - `idx_events_school_category_start` on `(school_id, category, starts_at)`
   - `idx_regs_event` on `event_registrations(event_id)`
   - `uq_reg_unique` unique partial index on `(event_id, student_id)` where `status='registered'`
5. **Add RLS policies**:
   - `school_events`: Admin full CRUD, Parent read published only
   - `event_registrations`: Admin full access, Parent insert/update own children only
   - `school_notifications`: Read access for users in school
6. **Add triggers**: `updated_at` trigger for both tables

## RLS Policy Requirements

### `school_events`
- **Admin**: Full CRUD within `school_id IN get_user_school_ids()`
- **Parent**: 
  - SELECT only where `status='published'` AND `school_id IN get_user_school_ids()`
  - If `class_id` is set, parent must have child in that class

### `event_registrations`
- **Admin**: Full CRUD within `school_id IN get_user_school_ids()`
- **Parent**: 
  - INSERT/UPDATE only where `parent_user_id = auth.uid()` AND `student_id IN get_user_child_student_ids()`
  - Event must be published and in same school

### `school_notifications`
- **All authenticated users**: SELECT where `school_id IN get_user_school_ids()`
- **Admin**: INSERT where `school_id IN get_user_school_ids()`

## Next Steps

1. Create migration file `010_events.sql`
2. Apply migration via MCP
3. Verify schema creation
4. Test RLS policies
5. Proceed with API implementation

