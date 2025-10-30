'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function EditAnnouncementPage() {
  const router = useRouter();
  const params = useParams();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Phase 2: Fetch announcement data
    setLoading(false);
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Phase 2: Implement actual update
    alert('This feature will be available in Phase 2');
    setSubmitting(false);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.back()} className="gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Edit Announcement</h1>
        <p className="text-gray-600">Update announcement details</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              name="title"
              defaultValue="Parent-Teacher Conference Schedule"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select name="category" className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                <option value="School Event" selected>School Event</option>
                <option value="Academic">Academic</option>
                <option value="Important Notice">Important Notice</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select name="priority" className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                <option value="Normal">Normal</option>
                <option value="High" selected>High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
            <textarea
              name="content"
              rows={8}
              defaultValue="Parent-teacher conferences will be held from November 1-5, 2025..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg"
            />
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Phase 2 Feature:</strong> Edit functionality will be available in Phase 2.
            </p>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="button" variant="outline" className="text-red-600 border-red-300" disabled title="Coming in Phase 2">Delete</Button>
            <Button type="submit" disabled title="Coming in Phase 2">Update</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}



