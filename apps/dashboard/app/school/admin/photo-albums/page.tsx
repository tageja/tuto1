import { Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { StatusBadge } from '../../../../components/school/shared/StatusBadge';

export default function PhotoAlbumsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Photo Albums</h1>
          <p className="text-gray-600">School events and activities photo galleries</p>
        </div>
        <Button className="gap-2" disabled title="Coming in Phase 2">
          <Plus className="w-4 h-4" />
          Create Album
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">All</button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Recent</button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Events</button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Class Activities</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {['Sports Day 2025', 'Science Fair', 'Halloween Party', 'Field Trip - Museum', 'Art Exhibition', 'Music Concert', 'Parent-Teacher Meet', 'Graduation Ceremony'].map((album, i) => (
          <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <span className="text-4xl">📷</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-1">{album}</h3>
              <p className="text-sm text-gray-600 mb-2">Oct {25 - i}, 2025 • {15 + i * 3} photos</p>
              <StatusBadge status="Active" variant="success" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}



