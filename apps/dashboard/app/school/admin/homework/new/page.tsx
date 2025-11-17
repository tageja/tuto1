'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../../../../../components/ui/Card';
import { Button } from '../../../../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export default function NewHomeworkPage() {
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
        <h1 className="text-2xl font-bold text-gray-900">Create Homework Assignment</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Title *</label>
            <input type="text" name="title" required className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="e.g., Math Problem Set 3.2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
              <select name="subject" required className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                <option value="">Select subject</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="History">History</option>
                <option value="Geography">Geography</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class *</label>
              <select name="class" required className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                <option value="">Select class</option>
                <option value="Grade 5A">Grade 5A</option>
                <option value="Grade 5B">Grade 5B</option>
                <option value="Grade 6A">Grade 6A</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea name="description" rows={6} className="w-full px-4 py-2 border border-gray-200 rounded-lg" placeholder="Describe the assignment, instructions, and requirements..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
              <input type="date" name="dueDate" required className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adaptive Level</label>
              <select name="adaptiveLevel" className="w-full px-4 py-2 border border-gray-200 rounded-lg">
                <option value="1">Level 1 - Basic</option>
                <option value="2">Level 2 - Intermediate</option>
                <option value="3">Level 3 - Advanced</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800"><strong>Phase 2:</strong> Form submission will be enabled in Phase 2.</p>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled title="Coming in Phase 2">Assign Homework</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}












