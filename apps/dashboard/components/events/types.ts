/**
 * Events Component Types
 * TypeScript interfaces for events components
 */

export interface EventDto {
  id: string;
  school_id: string;
  title: string;
  description?: string | null;
  category: 'school' | 'class' | 'competition' | 'workshop' | 'outing' | 'practice' | 'celebration';
  class_id?: string | null;
  starts_at: string;
  ends_at: string;
  location?: string | null;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  capacity?: number | null;
  parent_note?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  registered_count?: number;
  waitlisted_count?: number;
  is_full?: boolean;
  available_spots?: number | null;
}

export interface RegistrationDto {
  id: string;
  event_id: string;
  student_id: string;
  parent_user_id: string;
  status: 'registered' | 'cancelled' | 'waitlisted';
  registered_at: string;
  student?: {
    id: string;
    name: string;
    student_number?: string;
  } | null;
  parent?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
}

export interface EventsKpisProps {
  schoolId: string;
  filters: {
    tab?: string;
    search?: string;
    month?: string;
    category?: string[];
    role?: 'admin' | 'parent';
  };
  loading?: boolean;
}

export interface EventsFiltersProps {
  schoolId: string;
  role: 'admin' | 'parent';
  onFilterChange: (filters: {
    tab: string;
    search: string;
    month: string;
    category: string[];
  }) => void;
  initialTab?: string;
  initialSearch?: string;
  initialMonth?: string;
  initialCategory?: string[];
}

export interface EventCardProps {
  event: EventDto;
  role: 'admin' | 'parent';
  onViewDetails: (event: EventDto) => void;
  onManage?: (event: EventDto) => void;
  onRegister?: (eventId: string, studentId: string) => void;
  onUnregister?: (eventId: string, studentId: string) => void;
  registrationStatus?: 'registered' | 'waitlisted' | null;
  studentId?: string;
}

export interface AdminEventActionsProps {
  event: EventDto;
  onViewDetails: () => void;
  onManage: () => void;
}

export interface CreateEditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schoolId: string;
  event?: EventDto | null;
  classes: Array<{ id: string; name: string }>;
}

export interface EventDetailDrawerProps {
  event: EventDto | null;
  isOpen: boolean;
  onClose: () => void;
  role: 'admin' | 'parent';
  onRegister?: (eventId: string, studentId: string) => void;
  onUnregister?: (eventId: string, studentId: string) => void;
  registrationStatus?: 'registered' | 'waitlisted' | null;
  studentId?: string;
}

export interface RegistrationsPanelProps {
  eventId: string;
  schoolId: string;
}

