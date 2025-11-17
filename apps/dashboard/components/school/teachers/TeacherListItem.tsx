'use client';

import { Mail, Phone, Star, Book } from 'lucide-react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { StatusBadge } from '../shared/StatusBadge';
import { useI18n } from '../../../contexts/I18nContext';

interface TeacherListItemProps {
  teacher: {
    id: string;
    // Supabase structure (flat)
    name?: string;
    email?: string;
    phone?: string;
    subjects?: string[] | string;
    status?: string;
    qualifications?: string;
    // Legacy Airtable structure (nested fields)
    fields?: {
      'Teacher Name'?: string;
      Email?: string;
      Phone?: string;
      Subjects?: string;
      Status?: string;
      Position?: string;
      'Experience Years'?: number;
      Rating?: number;
    };
  };
  onViewProfile: (teacherId: string) => void;
  showActions?: boolean;
}

export function TeacherListItem({ teacher, onViewProfile, showActions = true }: TeacherListItemProps) {
  const { t } = useI18n();
  
  // Support both Supabase (flat) and Airtable (nested fields) structures
  const isSupabaseStructure = !teacher.fields;
  
  const name = isSupabaseStructure 
    ? (teacher.name || 'Unnamed Teacher')
    : (teacher.fields?.['Teacher Name'] || 'Unnamed Teacher');
    
  const email = isSupabaseStructure 
    ? (teacher.email || '')
    : (teacher.fields?.Email || '');
    
  const phone = isSupabaseStructure 
    ? (teacher.phone || '')
    : (teacher.fields?.Phone || '');
    
  const status = isSupabaseStructure 
    ? (teacher.status || 'active')
    : (teacher.fields?.Status || 'Active');
    
  const position = isSupabaseStructure 
    ? (teacher.qualifications || 'Teacher')
    : (teacher.fields?.Position || 'Teacher');
    
  const experience = isSupabaseStructure 
    ? 0 // Not available in Supabase schema yet
    : (teacher.fields?.['Experience Years'] || 0);
    
  const rating = isSupabaseStructure 
    ? 0 // Not available in Supabase schema yet
    : (teacher.fields?.Rating || 0);

  // Parse subjects - handle both array (Supabase) and string (Airtable)
  let subjectList: string[] = [];
  if (isSupabaseStructure) {
    if (Array.isArray(teacher.subjects)) {
      subjectList = teacher.subjects.slice(0, 3);
    } else if (typeof teacher.subjects === 'string') {
      subjectList = teacher.subjects.split(/[,\n]/).map(s => s.trim()).filter(Boolean).slice(0, 3);
    }
  } else {
    const subjects = teacher.fields?.Subjects || '';
    subjectList = subjects.split(/[,\n]/).map(s => s.trim()).filter(Boolean).slice(0, 3);
  }
  
  const allSubjects = isSupabaseStructure
    ? (Array.isArray(teacher.subjects) ? teacher.subjects : (typeof teacher.subjects === 'string' ? teacher.subjects.split(/[,\n]/).map(s => s.trim()).filter(Boolean) : []))
    : (teacher.fields?.Subjects || '').split(/[,\n]/).map(s => s.trim()).filter(Boolean);

  // Get first letter for avatar (safely)
  const initials = name && name.length > 0 ? name[0].toUpperCase() : '?';

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xl font-semibold">
            {initials}
          </div>
          
          {/* Info */}
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900">{name}</h3>
            <p className="text-sm text-gray-600">{position}</p>
            
            {/* Rating */}
            {rating > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Status Badge */}
        <StatusBadge status={status} />
      </div>

      {/* Subjects */}
      {subjectList.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Book className="w-4 h-4 text-gray-400" />
            {subjectList.map((subject, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                {subject}
              </span>
            ))}
            {allSubjects.length > 3 && (
              <span className="text-xs text-gray-500">
                +{allSubjects.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        {email && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            {email}
          </div>
        )}
        {phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            {phone}
          </div>
        )}
        {experience > 0 && (
          <div className="text-sm text-gray-600">
            {experience} {t('dashboard.teachers.list.years')} {t('dashboard.teachers.list.experience').toLowerCase()}
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onViewProfile(teacher.id)}
        >
          {t('dashboard.teachers.viewProfile')}
        </Button>
      )}
    </Card>
  );
}






