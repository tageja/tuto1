'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useI18n } from '../../../../../contexts/I18nContext';
import { Button } from '../../../../../components/ui/Button';
import { EventsKpis } from '../../../../../components/events/EventsKpis';
import { EventsFilters } from '../../../../../components/events/EventsFilters';
import { EventCard } from '../../../../../components/events/EventCard';
import { CreateEditEventModal } from '../../../../../components/events/CreateEditEventModal';
import { EventDetailDrawer } from '../../../../../components/events/EventDetailDrawer';
import { RegistrationsPanel } from '../../../../../components/events/RegistrationsPanel';
import type { EventDto } from '../../../../../components/events/types';

export default function AdminEventsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const schoolId = decodeURIComponent(params.schoolId as string);

  // URL params
  const tabParam = searchParams.get('tab') || 'All';
  const searchParam = searchParams.get('search') || '';
  const monthParam = searchParams.get('month') || '';
  const categoryParam = searchParams.getAll('category[]');

  // State
  const [tab, setTab] = useState(tabParam);
  const [search, setSearch] = useState(searchParam);
  const [month, setMonth] = useState(monthParam);
  const [category, setCategory] = useState<string[]>(categoryParam);
  const [events, setEvents] = useState<EventDto[]>([]);
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Modal/Drawer state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDto | null>(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [showRegistrationsPanel, setShowRegistrationsPanel] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventDto | null>(null);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (tab !== 'All') params.set('tab', tab);
    if (search) params.set('search', search);
    if (month) params.set('month', month);
    category.forEach((cat) => params.append('category[]', cat));
    router.push(`?${params.toString()}`, { scroll: false });
  }, [tab, search, month, category, router]);

  // Fetch classes
  useEffect(() => {
    fetchClasses();
  }, [schoolId]);

  // Fetch events
  useEffect(() => {
    fetchEvents();
  }, [schoolId, tab, search, month, category]);

  const fetchClasses = async () => {
    try {
      const response = await fetch(`/api/school/classes?schoolId=${encodeURIComponent(schoolId)}&status=active`);
      const result = await response.json();
      if (result.success) {
        setClasses(result.data.records || []);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        schoolId,
        role: 'admin',
      });

      if (tab !== 'All') params.append('tab', tab);
      if (search) params.append('search', search);
      if (month) params.append('month', month);
      category.forEach((cat) => params.append('category[]', cat));

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

  const handleFilterChange = (filters: {
    tab: string;
    search: string;
    month: string;
    category: string[];
  }) => {
    setTab(filters.tab);
    setSearch(filters.search);
    setMonth(filters.month);
    setCategory(filters.category);
  };

  const handleViewDetails = (event: EventDto) => {
    setSelectedEvent(event);
    setShowDetailDrawer(true);
  };

  const handleManage = (event: EventDto) => {
    setSelectedEvent(event);
    setShowRegistrationsPanel(true);
  };

  const handleEdit = (event: EventDto) => {
    setEditingEvent(event);
    setShowCreateModal(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await fetch(`/api/school/events/${eventId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        alert('Event deleted successfully');
        fetchEvents();
      } else {
        alert(`Failed to delete event: ${result.error}`);
      }
    } catch (error: any) {
      console.error('Error deleting event:', error);
      alert(`Failed to delete event: ${error.message}`);
    }
  };

  const handleSuccess = () => {
    fetchEvents();
    setShowCreateModal(false);
    setEditingEvent(null);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.events.title') || 'Events'}</h1>
          <p className="text-sm text-gray-500 mt-1">{schoolId}</p>
        </div>
        <Button className="gap-2" onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />
          {t('dashboard.events.createEvent') || 'Create Event'}
        </Button>
      </div>

      {/* KPIs */}
      <EventsKpis
        schoolId={schoolId}
        filters={{ tab, search, month, category, role: 'admin' }}
        loading={loading}
      />

      {/* Filters */}
      <EventsFilters
        schoolId={schoolId}
        role="admin"
        onFilterChange={handleFilterChange}
        initialTab={tab}
        initialSearch={search}
        initialMonth={month}
        initialCategory={category}
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
          <p className="text-gray-600">{t('dashboard.events.empty.noEvents') || 'No events found'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              role="admin"
              onViewDetails={handleViewDetails}
              onManage={handleManage}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <CreateEditEventModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingEvent(null);
        }}
        onSuccess={handleSuccess}
        schoolId={schoolId}
        event={editingEvent}
        classes={classes}
      />

      {/* Detail Drawer */}
      <EventDetailDrawer
        event={selectedEvent}
        isOpen={showDetailDrawer}
        onClose={() => {
          setShowDetailDrawer(false);
          setSelectedEvent(null);
        }}
        role="admin"
      />

      {/* Registrations Panel (shown in drawer when Manage is clicked) */}
      {showRegistrationsPanel && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 md:items-center">
          <div className="bg-white w-full md:w-2/3 lg:w-1/2 max-h-[90vh] overflow-y-auto rounded-t-lg md:rounded-lg shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Manage: {selectedEvent.title}
                </h2>
                <button
                  onClick={() => {
                    setShowRegistrationsPanel(false);
                    setSelectedEvent(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <RegistrationsPanel eventId={selectedEvent.id} schoolId={schoolId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
