'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { EventsKpis } from '../../../../../components/events/EventsKpis';
import { EventsFilters } from '../../../../../components/events/EventsFilters';
import { EventCard } from '../../../../../components/events/EventCard';
import { EventDetailDrawer } from '../../../../../components/events/EventDetailDrawer';
import supabase from '../../../../../lib/supabase';
import type { EventDto } from '../../../../../components/events/types';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
}

export default function ParentEventsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const schoolId = decodeURIComponent(params.schoolId as string);

  // URL params
  const tabParam = searchParams.get('tab') || 'All';
  const searchParam = searchParams.get('search') || '';
  const monthParam = searchParams.get('month') || '';

  // State
  const [tab, setTab] = useState(tabParam);
  const [search, setSearch] = useState(searchParam);
  const [month, setMonth] = useState(monthParam);
  const [events, setEvents] = useState<EventDto[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [registrations, setRegistrations] = useState<Record<string, { status: 'registered' | 'waitlisted'; studentId: string }>>({});
  const [loading, setLoading] = useState(true);

  // Modal/Drawer state
  const [selectedEvent, setSelectedEvent] = useState<EventDto | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (tab !== 'All') params.set('tab', tab);
    if (search) params.set('search', search);
    if (month) params.set('month', month);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [tab, search, month, router]);

  // Fetch user's children
  useEffect(() => {
    fetchChildren();
  }, [schoolId]);

  // Fetch events and registrations
  useEffect(() => {
    if (children.length > 0 && !selectedChildId && children[0]) {
      setSelectedChildId(children[0].id);
    }
    if (selectedChildId) {
      fetchEvents();
      fetchRegistrations();
    }
  }, [schoolId, tab, search, month, selectedChildId, children]);

  const fetchChildren = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', authUser.id)
        .single();

      if (!userData) return;

      const { data: parentStudents } = await supabase
        .from('school_parent_students')
        .select('student_id, school_students(id, first_name, last_name)')
        .eq('parent_user_id', userData.id)
        .eq('school_id', schoolId);

      if (parentStudents) {
        const childrenList = parentStudents
          .map((ps: any) => ({
            id: ps.student_id,
            first_name: ps.school_students?.first_name || '',
            last_name: ps.school_students?.last_name || '',
          }))
          .filter((c: any) => c.first_name);

        setChildren(childrenList);
        if (childrenList.length > 0 && !selectedChildId) {
          setSelectedChildId(childrenList[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        schoolId,
        role: 'parent',
      });

      if (tab !== 'All') params.append('tab', tab);
      if (search) params.append('search', search);
      if (month) params.append('month', month);

      const response = await fetch(`/api/school/events?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setEvents(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    if (!selectedChildId) return;

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', authUser.id)
        .single();

      if (!userData) return;

      // Get all registrations for this parent's children
      const { data: regs } = await supabase
        .from('event_registrations')
        .select('event_id, student_id, status')
        .eq('parent_user_id', userData.id)
        .in('status', ['registered', 'waitlisted']);

      if (regs) {
        const regMap: Record<string, { status: 'registered' | 'waitlisted'; studentId: string }> = {};
        regs.forEach((reg: any) => {
          regMap[reg.event_id] = {
            status: reg.status,
            studentId: reg.student_id,
          };
        });
        setRegistrations(regMap);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const handleFilterChange = (filters: {
    tab: string;
    search: string;
    month: string;
    category: string[];
  }) => {
    setTab(filters.tab);
    setSearch(filters.search);
    setMonth(filters.month);
  };

  const handleRegister = async (eventId: string, studentId: string) => {
    try {
      // Optimistic update
      const prevReg = registrations[eventId];
      setRegistrations((prev) => ({
        ...prev,
        [eventId]: { status: 'registered', studentId },
      }));

      // Get access token from Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        throw new Error('No active session');
      }

      const response = await fetch(`/api/school/events/${eventId}/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ studentId }),
      });

      const result = await response.json();

      if (!result.success) {
        // Revert on error
        if (prevReg) {
          setRegistrations((prev) => ({
            ...prev,
            [eventId]: prevReg,
          }));
        } else {
          setRegistrations((prev) => {
            const newRegs = { ...prev };
            delete newRegs[eventId];
            return newRegs;
          });
        }
        alert(`Failed to register: ${result.error}`);
        return;
      }

      // Update registration status based on result
      setRegistrations((prev) => ({
        ...prev,
        [eventId]: { status: result.status, studentId },
      }));

      alert(
        result.status === 'waitlisted'
          ? 'Added to waitlist'
          : 'Registered successfully'
      );

      // Refresh events to update capacity
      fetchEvents();
    } catch (error: any) {
      console.error('Error registering:', error);
      alert(`Failed to register: ${error.message}`);
      // Revert optimistic update
      setRegistrations((prev) => {
        const newRegs = { ...prev };
        delete newRegs[eventId];
        return newRegs;
      });
    }
  };

  const handleUnregister = async (eventId: string, studentId: string) => {
    try {
      // Optimistic update
      const prevReg = registrations[eventId];
      setRegistrations((prev) => {
        const newRegs = { ...prev };
        delete newRegs[eventId];
        return newRegs;
      });

      // Get access token from Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        throw new Error('No active session');
      }

      const response = await fetch(`/api/school/events/${eventId}/unregister`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ studentId }),
      });

      const result = await response.json();

      if (!result.success) {
        // Revert on error
        if (prevReg) {
          setRegistrations((prev) => ({
            ...prev,
            [eventId]: prevReg,
          }));
        }
        alert(`Failed to unregister: ${result.error}`);
        return;
      }

      alert('Unregistered successfully');
      fetchEvents();
    } catch (error: any) {
      console.error('Error unregistering:', error);
      alert(`Failed to unregister: ${error.message}`);
      // Revert optimistic update
      if (registrations[eventId]) {
        setRegistrations((prev) => ({
          ...prev,
          [eventId]: registrations[eventId],
        }));
      }
    }
  };

  const handleViewDetails = (event: EventDto) => {
    setSelectedEvent(event);
    setShowDetailDrawer(true);
  };

  // Child selector
  const selectedChild = children.find((c) => c.id === selectedChildId);
  const registrationStatus = (eventId: string) => {
    const reg = registrations[eventId];
    if (!reg || reg.studentId !== selectedChildId) return null;
    return reg.status;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Events</h1>
        <p className="text-gray-600">
          {selectedChild
            ? `Upcoming school events for ${selectedChild.first_name} ${selectedChild.last_name}`
            : 'Upcoming school events'}
          {' • '}
          {schoolId}
        </p>
      </div>

      {/* Child Selector */}
      {children.length > 1 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Child
          </label>
          <select
            value={selectedChildId}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.first_name} {child.last_name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* KPIs */}
      <EventsKpis
        schoolId={schoolId}
        filters={{ tab, search, month, role: 'parent' }}
        loading={loading}
      />

      {/* Filters */}
      <EventsFilters
        schoolId={schoolId}
        role="parent"
        onFilterChange={handleFilterChange}
        initialTab={tab}
        initialSearch={search}
        initialMonth={month}
        initialCategory={[]}
      />

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">
            {tab === 'Registered'
              ? 'No registered events'
              : 'No events found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              role="parent"
              onViewDetails={handleViewDetails}
              onRegister={selectedChildId ? handleRegister : undefined}
              onUnregister={selectedChildId ? handleUnregister : undefined}
              registrationStatus={registrationStatus(event.id)}
              studentId={selectedChildId}
            />
          ))}
        </div>
      )}

      {/* Detail Drawer */}
      <EventDetailDrawer
        event={selectedEvent}
        isOpen={showDetailDrawer}
        onClose={() => {
          setShowDetailDrawer(false);
          setSelectedEvent(null);
        }}
        role="parent"
        onRegister={selectedChildId ? handleRegister : undefined}
        onUnregister={selectedChildId ? handleUnregister : undefined}
        registrationStatus={selectedEvent ? registrationStatus(selectedEvent.id) : null}
        studentId={selectedChildId}
      />
    </div>
  );
}
