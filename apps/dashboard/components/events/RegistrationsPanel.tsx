'use client';

import { useState, useEffect } from 'react';
import { Download, Users } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { StatusBadge } from '../school/shared/StatusBadge';
import type { RegistrationsPanelProps, RegistrationDto } from './types';

export function RegistrationsPanel({ eventId, schoolId }: RegistrationsPanelProps) {
  const [registrations, setRegistrations] = useState<RegistrationDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegistrations();
  }, [eventId]);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/school/events/${eventId}/registrations`);
      const result = await response.json();

      if (result.success) {
        setRegistrations(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Student Name', 'Student Number', 'Parent Name', 'Parent Email', 'Status', 'Registered At'];
    const rows = registrations.map((reg) => [
      reg.student?.name || 'N/A',
      reg.student?.student_number || 'N/A',
      reg.parent?.name || 'N/A',
      reg.parent?.email || 'N/A',
      reg.status,
      new Date(reg.registered_at).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event-registrations-${eventId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (registrations.length === 0) {
    return (
      <div className="p-6 text-center">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No registrations yet</p>
      </div>
    );
  }

  const registered = registrations.filter((r) => r.status === 'registered');
  const waitlisted = registrations.filter((r) => r.status === 'waitlisted');
  const cancelled = registrations.filter((r) => r.status === 'cancelled');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Registrations</h3>
          <p className="text-sm text-gray-600">
            {registered.length} registered, {waitlisted.length} waitlisted
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Registrations List */}
      <div className="space-y-3">
        {registrations.map((reg) => (
          <Card key={reg.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-medium text-gray-900">
                    {reg.student?.name || 'Unknown Student'}
                  </p>
                  <StatusBadge
                    status={reg.status}
                    variant={
                      reg.status === 'registered'
                        ? 'success'
                        : reg.status === 'waitlisted'
                        ? 'warning'
                        : 'default'
                    }
                  />
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  {reg.student?.student_number && (
                    <p>Student #: {reg.student.student_number}</p>
                  )}
                  <p>
                    Parent: {reg.parent?.name || 'N/A'} ({reg.parent?.email || 'N/A'})
                  </p>
                  <p>
                    Registered: {new Date(reg.registered_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}


