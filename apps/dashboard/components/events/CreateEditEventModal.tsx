'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type { CreateEditEventModalProps } from './types';

export function CreateEditEventModal({
  isOpen,
  onClose,
  onSuccess,
  schoolId,
  event,
  classes,
}: CreateEditEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'school' | 'class' | 'competition' | 'workshop' | 'outing' | 'practice' | 'celebration'>('school');
  const [classId, setClassId] = useState<string>('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [capacity, setCapacity] = useState<string>('');
  const [parentNote, setParentNote] = useState('');

  // Initialize form when event is provided (edit mode)
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || '');
      setCategory(event.category);
      setClassId(event.class_id || '');
      const start = new Date(event.starts_at);
      const end = new Date(event.ends_at);
      setStartDate(start.toISOString().split('T')[0]);
      setStartTime(start.toTimeString().slice(0, 5));
      setEndDate(end.toISOString().split('T')[0]);
      setEndTime(end.toTimeString().slice(0, 5));
      setLocation(event.location || '');
      setStatus(event.status === 'draft' ? 'draft' : 'published');
      setCapacity(event.capacity?.toString() || '');
      setParentNote(event.parent_note || '');
    } else {
      // Reset form for create mode
      setTitle('');
      setDescription('');
      setCategory('school');
      setClassId('');
      const now = new Date();
      setStartDate(now.toISOString().split('T')[0]);
      setStartTime('09:00');
      setEndDate(now.toISOString().split('T')[0]);
      setEndTime('17:00');
      setLocation('');
      setStatus('draft');
      setCapacity('');
      setParentNote('');
    }
  }, [event, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !startDate || !startTime || !endDate || !endTime) {
      alert('Please fill in all required fields');
      return;
    }

    if (category === 'class' && !classId) {
      alert('Please select a class for class events');
      return;
    }

    // Combine date and time
    const startsAt = new Date(`${startDate}T${startTime}`).toISOString();
    const endsAt = new Date(`${endDate}T${endTime}`).toISOString();

    if (new Date(startsAt) >= new Date(endsAt)) {
      alert('End date/time must be after start date/time');
      return;
    }

    setLoading(true);

    try {
      // Get current user for created_by
      const { data: { user: authUser } } = await (await import('../../lib/supabase')).default.auth.getUser();
      if (!authUser) {
        throw new Error('User not authenticated. Please log in again.');
      }

      const { data: userData, error: userError } = await (await import('../../lib/supabase')).default
        .from('users')
        .select('id')
        .eq('auth_user_id', authUser.id)
        .single();

      if (userError || !userData) {
        throw new Error('User profile not found. Please contact support.');
      }

      const eventData = {
        school_id: schoolId,
        title,
        description: description || null,
        category,
        class_id: category === 'class' ? classId : null,
        starts_at: startsAt,
        ends_at: endsAt,
        location: location || null,
        status,
        capacity: capacity ? parseInt(capacity) : null,
        parent_note: parentNote || null,
        created_by: userData.id,
      };

      const url = event
        ? `/api/school/events/${event.id}`
        : '/api/school/events';
      const method = event ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Failed to save event';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch {
          errorMessage = errorText || `Server error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || result.message || 'Failed to save event');
      }

      alert(event ? 'Event updated successfully!' : 'Event created successfully!');
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Error saving event:', error);
      alert(`Failed to save event: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {event ? 'Edit Event' : 'Create Event'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Annual Sports Day"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Event description..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as any);
                  if (e.target.value !== 'class') {
                    setClassId('');
                  }
                }}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="school">School</option>
                <option value="class">Class</option>
                <option value="competition">Competition</option>
                <option value="workshop">Workshop</option>
                <option value="outing">Outing</option>
                <option value="practice">Practice</option>
                <option value="celebration">Celebration</option>
              </select>
            </div>

            {/* Class (conditional) */}
            {category === 'class' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class <span className="text-red-500">*</span>
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date/Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  min={today}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  min={startDate || today}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Main Sports Field"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            {/* Capacity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity (optional)
              </label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Leave empty for unlimited"
              />
            </div>

            {/* Parent Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Note
              </label>
              <textarea
                value={parentNote}
                onChange={(e) => setParentNote(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Special instructions for parents (e.g., Bring backpack, water bottle)"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}

