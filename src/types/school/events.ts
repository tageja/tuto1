/**
 * Events Types
 * TypeScript interfaces for school events feature
 */

export type EventCategory =
  | 'school'
  | 'class'
  | 'competition'
  | 'workshop'
  | 'outing'
  | 'practice'
  | 'celebration';

export type EventStatus = 'draft' | 'published' | 'completed' | 'cancelled';

export type EventRegistrationStatus = 'registered' | 'cancelled' | 'waitlisted';

export type EventStatusTab = 'All' | 'Registered' | 'Upcoming';

/**
 * Base event record from Supabase
 */
export interface Event {
  id: string;
  school_id: string;
  title: string;
  description?: string | null;
  category: EventCategory;
  class_id?: string | null;
  starts_at: string; // ISO timestamptz
  ends_at: string; // ISO timestamptz
  location?: string | null;
  status: EventStatus;
  capacity?: number | null;
  parent_note?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Event with computed participant counts
 */
export interface EventWithCounts extends Event {
  registered_count?: number;
  waitlisted_count?: number;
  is_full?: boolean;
  available_spots?: number | null;
}

/**
 * Event registration record
 */
export interface EventRegistration {
  id: string;
  school_id: string;
  event_id: string;
  student_id: string;
  parent_user_id: string;
  status: EventRegistrationStatus;
  registered_at: string;
}

/**
 * Event filters for queries
 */
export interface EventFilters {
  category?: string; // 'All Events' or specific category
  month?: string; // 'December 2025' format
  search?: string; // Search query
  statusTab?: EventStatusTab; // For parent view
}

/**
 * Event KPIs (summary counters)
 */
export interface EventKPIs {
  totalEvents: number;
  upcoming: number;
  completed: number;
  totalParticipants: number;
}

/**
 * Child information for parent events view
 */
export interface Child {
  id: string;
  first_name: string;
  last_name: string;
  class_id?: string | null;
  class_name?: string | null;
  school_id: string;
}

/**
 * Event registration status for a specific child
 */
export interface ChildEventRegistration {
  event_id: string;
  registration_id?: string | null;
  status?: EventRegistrationStatus | null;
  is_registered: boolean;
}






