/**
 * useEventsData Hook
 * Data access layer for Events screens using Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import {
  fetchAdminEvents,
  fetchParentEvents,
  fetchEventKPIs,
  fetchParentChildren,
  fetchChildEventRegistrations,
  fetchEventMonths,
  isEventUpcoming,
  isEventCompleted,
  type EventWithCounts,
  type EventKPIs,
  type EventFilters,
  type Child,
  type ChildEventRegistration,
} from '../services/school/events';

/**
 * Hook for Admin Events Screen
 */
export function useAdminEvents(schoolId: string | null, filters: EventFilters) {
  const [events, setEvents] = useState<EventWithCounts[]>([]);
  const [kpis, setKpis] = useState<EventKPIs>({
    totalEvents: 0,
    upcoming: 0,
    completed: 0,
    totalParticipants: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!schoolId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [eventsData, kpisData] = await Promise.all([
        fetchAdminEvents(schoolId, filters),
        fetchEventKPIs(schoolId, filters),
      ]);

      setEvents(eventsData);
      setKpis(kpisData);
    } catch (err) {
      console.error('Error loading admin events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load events');
      setEvents([]);
      setKpis({
        totalEvents: 0,
        upcoming: 0,
        completed: 0,
        totalParticipants: 0,
      });
    } finally {
      setLoading(false);
    }
  }, [schoolId, filters.category, filters.month, filters.search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    events,
    kpis,
    loading,
    error,
    refetch: loadData,
  };
}

/**
 * Hook for Parent Events Screen
 */
export function useParentEvents(
  schoolId: string | null,
  childId: string | null,
  filters: EventFilters
) {
  const [events, setEvents] = useState<EventWithCounts[]>([]);
  const [registrations, setRegistrations] = useState<Map<string, ChildEventRegistration>>(
    new Map()
  );
  const [kpis, setKpis] = useState<{
    totalEvents: number;
    upcoming: number;
    completed: number;
  }>({
    totalEvents: 0,
    upcoming: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!schoolId || !childId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch events and registrations in parallel
      const [eventsData, registrationsData] = await Promise.all([
        fetchParentEvents(schoolId, childId, filters),
        fetchChildEventRegistrations(childId),
      ]);

      setEvents(eventsData);

      // Create registration map for quick lookup
      const regMap = new Map<string, ChildEventRegistration>();
      registrationsData.forEach((reg) => {
        regMap.set(reg.event_id, reg);
      });
      setRegistrations(regMap);

      // Calculate KPIs
      const totalEvents = eventsData.length;
      const upcoming = eventsData.filter(isEventUpcoming).length;
      const completed = eventsData.filter(isEventCompleted).length;

      setKpis({ totalEvents, upcoming, completed });
    } catch (err) {
      console.error('Error loading parent events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load events');
      setEvents([]);
      setRegistrations(new Map());
      setKpis({ totalEvents: 0, upcoming: 0, completed: 0 });
    } finally {
      setLoading(false);
    }
  }, [schoolId, childId, filters.category, filters.month, filters.search, filters.statusTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper to check if child is registered for an event
  const isRegistered = useCallback(
    (eventId: string): boolean => {
      const reg = registrations.get(eventId);
      return reg?.is_registered || false;
    },
    [registrations]
  );

  return {
    events,
    registrations,
    kpis,
    loading,
    error,
    isRegistered,
    refetch: loadData,
  };
}

/**
 * Hook for fetching parent's children
 */
export function useParentChildren(schoolId: string | null) {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChildren = useCallback(async () => {
    if (!schoolId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await fetchParentChildren(schoolId);
      setChildren(data);
    } catch (err) {
      console.error('Error loading children:', err);
      setError(err instanceof Error ? err.message : 'Failed to load children');
      setChildren([]);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  return {
    children,
    loading,
    error,
    refetch: loadChildren,
  };
}

/**
 * Hook for fetching available event months
 */
export function useEventMonths(schoolId: string | null) {
  const [months, setMonths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMonths = useCallback(async () => {
    if (!schoolId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await fetchEventMonths(schoolId);
      setMonths(data);
    } catch (err) {
      console.error('Error loading event months:', err);
      // Fallback to current month
      const d = new Date();
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      setMonths([`${monthNames[d.getMonth()]} ${d.getFullYear()}`]);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    loadMonths();
  }, [loadMonths]);

  return {
    months,
    loading,
    refetch: loadMonths,
  };
}


