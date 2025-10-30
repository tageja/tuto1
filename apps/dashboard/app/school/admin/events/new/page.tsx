'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function NewEventPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    alert('This feature will be available in Phase 2');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()} className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Event Title *</label>
            <input type="text" name="title" required className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label>
              <select name="type" required className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                <option value="">Select type</option>
                <option value="School">School</option>
                <option value="Class">Class</option>
                <option value="Competition">Competition</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <input type="text" name="location" required className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
              <input type="date" name="startDate" required className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input type="date" name="endDate" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <input type="time" name="startTime" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <input type="time" name="endTime" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea name="description" rows={4} className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Attendees</label>
              <input type="number" name="maxAttendees" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Organizer</label>
              <input type="text" name="organizer" className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800"><strong>Phase 2:</strong> Form submission will be enabled in Phase 2.</p>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled title="Coming in Phase 2">Create Event</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}



