import { supabase, getCurrentUser } from '../../config/supabase';
import type {
  Event,
  EventWithCounts,
  EventRegistration,
  EventFilters,
  EventKPIs,
  EventCategory,
  EventStatus,
  EventRegistrationStatus,
  Child,
  ChildEventRegistration,
} from '../../types/school/events';

/**
 * Resolve school identifier (name or UUID) to UUID
 */
async function resolveSchoolId(schoolIdentifier: string): Promise<string | null> {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(schoolIdentifier)) {
      return schoolIdentifier;
    }

    // Try to find school by exact name match
    const { data, error } = await supabase
      .from('schools')
      .select('id')
      .eq('name', schoolIdentifier)
      .single();

    if (error) {
      // Try case-insensitive match as fallback
      const { data: dataIlike } = await supabase
        .from('schools')
        .select('id')
        .ilike('name', schoolIdentifier)
        .limit(1)
        .single();

      if (dataIlike) {
        return dataIlike.id;
      }

      // Last resort: get first school
      const { data: firstSchool } = await supabase
        .from('schools')
        .select('id')
        .limit(1)
        .single();

      return firstSchool?.id || null;
    }

    return data?.id || null;
  } catch (error) {
    console.error('Error resolving school ID:', error);
    return null;
  }
}

/**
 * Helper: Check if event is upcoming
 */
export function isEventUpcoming(event: Event): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(event.ends_at);
  endDate.setHours(0, 0, 0, 0);
  return endDate >= today && event.status !== 'completed' && event.status !== 'cancelled';
}

/**
 * Helper: Check if event is completed
 */
export function isEventCompleted(event: Event): boolean {
  if (event.status === 'completed' || event.status === 'cancelled') {
    return true;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(event.ends_at);
  endDate.setHours(0, 0, 0, 0);
  return endDate < today;
}

/**
 * Helper: Format event date for display
 */
export function formatEventDate(dateString: string): string {
  const date = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Helper: Format event time range for display
 */
export function formatEventTime(startString: string, endString: string): string {
  const start = new Date(startString);
  const end = new Date(endString);
  
  const formatTime = (date: Date): string => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

  return `${formatTime(start)} – ${formatTime(end)}`;
}

/**
 * Helper: Convert month string (e.g., "December 2025") to date range
 */
export function getMonthRange(monthString: string): [Date, Date] | null {
  if (!monthString) return null;

  try {
    const [monthName, yearStr] = monthString.split(' ');
    const year = parseInt(yearStr, 10);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthIndex = monthNames.findIndex(m => m.toLowerCase().startsWith(monthName.toLowerCase()));
    
    if (monthIndex === -1) return null;

    const startDate = new Date(year, monthIndex, 1);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(year, monthIndex + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    return [startDate, endDate];
  } catch (error) {
    console.error('Error parsing month range:', error);
    return null;
  }
}

/**
 * Fetch admin events with filters
 */
export async function fetchAdminEvents(
  schoolId: string,
  filters: EventFilters
): Promise<EventWithCounts[]> {
  try {
    console.log('📅 fetchAdminEvents called with:', { schoolId, filters });
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) {
      console.error('❌ Invalid school ID:', schoolId);
      throw new Error('Invalid school ID');
    }

    console.log('📅 Resolved school ID:', resolvedSchoolId);

    let query = supabase
      .from('school_events')
      .select('*')
      .eq('school_id', resolvedSchoolId)
      .order('starts_at', { ascending: true });

    // Filter by category
    if (filters.category && filters.category !== 'All Events') {
      const categoryValue = filters.category.toLowerCase();
      console.log('📅 Filtering by category:', categoryValue);
      query = query.eq('category', categoryValue);
    }

    // Filter by month
    if (filters.month) {
      const monthRange = getMonthRange(filters.month);
      if (monthRange) {
        const [startDate, endDate] = monthRange;
        console.log('📅 Filtering by month range:', startDate.toISOString(), 'to', endDate.toISOString());
        query = query
          .gte('starts_at', startDate.toISOString())
          .lte('starts_at', endDate.toISOString());
      }
    }

    // Filter by search
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim().toLowerCase();
      console.log('📅 Filtering by search:', searchTerm);
      // Supabase .or() syntax: field.operator.value,field2.operator.value
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
    }

    console.log('📅 Executing query...');
    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching admin events:', error);
      throw error;
    }

    console.log('📅 Fetched events:', data?.length || 0);

    // Get participant counts for each event
    const eventsWithCounts: EventWithCounts[] = await Promise.all(
      (data || []).map(async (event: Event) => {
        const { data: registrations } = await supabase
          .from('event_registrations')
          .select('id, status')
          .eq('event_id', event.id)
          .eq('status', 'registered');

        const registeredCount = registrations?.length || 0;
        const waitlistedCount = 0; // TODO: implement waitlist logic if needed

        return {
          ...event,
          registered_count: registeredCount,
          waitlisted_count: waitlistedCount,
          is_full: event.capacity ? registeredCount >= event.capacity : false,
          available_spots: event.capacity ? Math.max(0, event.capacity - registeredCount) : null,
        };
      })
    );

    return eventsWithCounts;
  } catch (error) {
    console.error('Error in fetchAdminEvents:', error);
    return [];
  }
}

/**
 * Fetch event KPIs (summary counters)
 */
export async function fetchEventKPIs(
  schoolId: string,
  filters: EventFilters
): Promise<EventKPIs> {
  try {
    console.log('📊 fetchEventKPIs called with:', { schoolId, filters });
    const events = await fetchAdminEvents(schoolId, filters);
    console.log('📊 fetchEventKPIs got events:', events.length);
    
    const totalEvents = events.length;
    const upcoming = events.filter(isEventUpcoming).length;
    const completed = events.filter(isEventCompleted).length;
    
    // Calculate total participants across all events
    let totalParticipants = 0;
    for (const event of events) {
      totalParticipants += event.registered_count || 0;
    }

    console.log('📊 fetchEventKPIs calculated KPIs:', { totalEvents, upcoming, completed, totalParticipants });

    return {
      totalEvents,
      upcoming,
      completed,
      totalParticipants,
    };
  } catch (error) {
    console.error('Error in fetchEventKPIs:', error);
    return {
      totalEvents: 0,
      upcoming: 0,
      completed: 0,
      totalParticipants: 0,
    };
  }
}

/**
 * Create a new event
 */
export async function createEvent(eventData: {
  school_id: string;
  title: string;
  description?: string;
  category: EventCategory;
  class_id?: string | null;
  starts_at: string;
  ends_at: string;
  location?: string;
  status: EventStatus;
  capacity?: number | null;
  parent_note?: string;
}): Promise<Event> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get user's database ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User profile not found');
    }

    const resolvedSchoolId = await resolveSchoolId(eventData.school_id);
    if (!resolvedSchoolId) {
      throw new Error('Invalid school ID');
    }

    const { data, error } = await supabase
      .from('school_events')
      .insert({
        ...eventData,
        school_id: resolvedSchoolId,
        created_by: userData.id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      throw error;
    }

    return data as Event;
  } catch (error) {
    console.error('Error in createEvent:', error);
    throw error;
  }
}

/**
 * Fetch parent events (events relevant to a child)
 */
export async function fetchParentEvents(
  schoolId: string,
  childId: string,
  filters: EventFilters
): Promise<EventWithCounts[]> {
  try {
    console.log('👶 fetchParentEvents called with:', { schoolId, childId, filters });
    
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) {
      throw new Error('Invalid school ID');
    }
    console.log('👶 Resolved school ID:', resolvedSchoolId);

    // Get child's class_id
    const { data: childData, error: childError } = await supabase
      .from('school_students')
      .select('class_id')
      .eq('id', childId)
      .single();

    if (childError || !childData) {
      console.error('❌ Child not found:', childError);
      throw new Error('Child not found');
    }

    const childClassId = childData.class_id;
    console.log('👶 Child class ID:', childClassId);

    let query = supabase
      .from('school_events')
      .select('*')
      .eq('school_id', resolvedSchoolId)
      .eq('status', 'published') // Only published events for parents
      .order('starts_at', { ascending: true });

    console.log('👶 Base query built: school_id =', resolvedSchoolId, 'status = published');

    // Filter by class: show school-wide (class_id IS NULL) or child's class events
    if (childClassId) {
      // Use PostgREST filter: (class_id IS NULL OR class_id = childClassId)
      console.log('👶 Adding class filter: class_id IS NULL OR class_id =', childClassId);
      query = query.or(`class_id.is.null,class_id.eq.${childClassId}`);
    } else {
      // Child has no class, only show school-wide events
      console.log('👶 Child has no class, filtering: class_id IS NULL');
      query = query.is('class_id', null);
    }

    // Filter by month
    if (filters.month) {
      const monthRange = getMonthRange(filters.month);
      if (monthRange) {
        const [startDate, endDate] = monthRange;
        console.log('👶 Filtering by month range:', startDate.toISOString(), 'to', endDate.toISOString());
        query = query
          .gte('starts_at', startDate.toISOString())
          .lte('starts_at', endDate.toISOString());
      }
    }

    // Filter by search
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.trim().toLowerCase();
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
    }

    console.log('📅 Executing parent events query...');
    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching parent events:', error);
      throw error;
    }

    console.log('📅 Fetched parent events:', data?.length || 0);

    // Get participant counts and registration status
    const eventsWithCounts: EventWithCounts[] = await Promise.all(
      (data || []).map(async (event: Event) => {
        try {
          const { data: registrations, error: regError } = await supabase
            .from('event_registrations')
            .select('id, status')
            .eq('event_id', event.id)
            .eq('status', 'registered');

          if (regError) {
            console.warn('⚠️ Error fetching registrations for event', event.id, regError);
          }

          const registeredCount = registrations?.length || 0;

          return {
            ...event,
            registered_count: registeredCount,
            waitlisted_count: 0,
            is_full: event.capacity ? registeredCount >= event.capacity : false,
            available_spots: event.capacity ? Math.max(0, event.capacity - registeredCount) : null,
          };
        } catch (err) {
          console.error('Error processing parent event', event.id, err);
          return {
            ...event,
            registered_count: 0,
            waitlisted_count: 0,
            is_full: false,
            available_spots: event.capacity || null,
          };
        }
      })
    );

    // Apply status tab filter
    let filteredEvents = eventsWithCounts;
    if (filters.statusTab === 'Registered') {
      // Get child's registrations
      const registrations = await fetchChildEventRegistrations(childId);
      const registeredEventIds = registrations
        .filter(r => r.is_registered)
        .map(r => r.event_id);
      filteredEvents = eventsWithCounts.filter(e => registeredEventIds.includes(e.id));
    } else if (filters.statusTab === 'Upcoming') {
      filteredEvents = eventsWithCounts.filter(isEventUpcoming);
    }

    return filteredEvents;
  } catch (error) {
    console.error('Error in fetchParentEvents:', error);
    return [];
  }
}

/**
 * Fetch child's event registrations
 */
export async function fetchChildEventRegistrations(
  childId: string
): Promise<ChildEventRegistration[]> {
  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('id, event_id, status')
      .eq('student_id', childId)
      .eq('status', 'registered');

    if (error) {
      console.error('Error fetching child registrations:', error);
      return [];
    }

    // Create a map of event_id -> registration
    const registrationMap = new Map<string, ChildEventRegistration>();

    // Get all events this child is registered for
    const eventIds = (data || []).map(r => r.event_id);
    if (eventIds.length > 0) {
      const { data: events } = await supabase
        .from('school_events')
        .select('id')
        .in('id', eventIds);

      (events || []).forEach(event => {
        const registration = (data || []).find(r => r.event_id === event.id);
        registrationMap.set(event.id, {
          event_id: event.id,
          registration_id: registration?.id || null,
          status: (registration?.status as EventRegistrationStatus) || null,
          is_registered: !!registration,
        });
      });
    }

    return Array.from(registrationMap.values());
  } catch (error) {
    console.error('Error in fetchChildEventRegistrations:', error);
    return [];
  }
}

/**
 * Register child for an event
 */
export async function registerForEvent(
  eventId: string,
  studentId: string,
  parentUserId: string,
  schoolId: string
): Promise<EventRegistration> {
  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        student_id: studentId,
        parent_user_id: parentUserId,
        school_id: schoolId,
        status: 'registered',
      })
      .select()
      .single();

    if (error) {
      console.error('Error registering for event:', error);
      throw error;
    }

    return data as EventRegistration;
  } catch (error) {
    console.error('Error in registerForEvent:', error);
    throw error;
  }
}

/**
 * Unregister child from an event
 */
export async function unregisterFromEvent(
  eventId: string,
  studentId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('event_registrations')
      .update({ status: 'cancelled' })
      .eq('event_id', eventId)
      .eq('student_id', studentId)
      .eq('status', 'registered');

    if (error) {
      console.error('Error unregistering from event:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in unregisterFromEvent:', error);
    throw error;
  }
}

/**
 * Fetch parent's children for events (reuse from attendance service)
 */
export async function fetchParentChildren(schoolId: string): Promise<Child[]> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) {
      throw new Error('Invalid school ID');
    }

    // Get user's database ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User profile not found');
    }

    // Fetch children via parent-student mapping
    const { data: mappings, error: mappingsError } = await supabase
      .from('school_parent_students')
      .select(
        `
        student_id,
        school_students!inner (
          id,
          first_name,
          last_name,
          class_id,
          school_classes (name)
        )
      `
      )
      .eq('school_id', resolvedSchoolId)
      .eq('parent_user_id', userData.id);

    if (mappingsError) {
      console.error('Error fetching parent-student mappings:', mappingsError);
      return [];
    }

    return (mappings || []).map((m: any) => ({
      id: m.school_students.id,
      first_name: m.school_students.first_name || '',
      last_name: m.school_students.last_name || '',
      class_id: m.school_students.class_id,
      class_name: m.school_students.school_classes?.name,
      school_id: resolvedSchoolId,
    }));
  } catch (error) {
    console.error('Error in fetchParentChildren:', error);
    return [];
  }
}

