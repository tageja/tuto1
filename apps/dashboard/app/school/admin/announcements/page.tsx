'use client';

import { Plus, Zap } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { StatusBadge } from '../../../../components/school/shared/StatusBadge';
import { QuickAddModal } from '../../../../components/school/shared/QuickAddModal';

export default function AdminAnnouncementsPage() {
  const router = useRouter();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600">Manage school-wide announcements and notices</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowQuickAdd(true)}>
            <Zap className="w-4 h-4" />
            Quick Add
          </Button>
          <Button className="gap-2" onClick={() => router.push('/school/admin/announcements/new')}>
            <Plus className="w-4 h-4" />
            Create Announcement
          </Button>
        </div>
      </div>

      <QuickAddModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        title="Quick Add Announcement"
        fullFormRoute="/school/admin/announcements/new"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input type="text" name="title" required className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority *</label>
            <select name="priority" className="w-full px-4 py-2 border border-gray-200 rounded-lg">
              <option value="Normal">Normal</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
            <textarea name="content" rows={4} required className="w-full px-4 py-2 border border-gray-200 rounded-lg" />
          </div>
          <p className="text-xs text-gray-500">Click "More Options" for advanced settings (category, target audience, schedule, etc.)</p>
        </div>
      </QuickAddModal>

      <div className="flex items-center gap-4 mb-6">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">All</button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Draft</button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Published</button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Archived</button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target Audience</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {announcements.slice(0, 10).map((ann) => (
                <tr key={ann.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{ann.fields['Announcement Title'] || 'Untitled'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{ann.fields.Category || 'General'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{ann.fields['Target Audience'] || 'All'}</td>
                  <td className="px-6 py-4 text-center"><StatusBadge status={ann.fields.Priority || 'Normal'} /></td>
                  <td className="px-6 py-4 text-center"><StatusBadge status={ann.fields.Status || 'Published'} /></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{ann.fields['Publish Date'] || 'N/A'}</td>
                  <td className="px-6 py-4 text-center"><Button variant="outline" size="sm">Edit</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

