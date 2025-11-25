import { Card } from '../../../../components/ui/Card';
import { StatusBadge } from '../../../../components/school/shared/StatusBadge';

export default function ParentPhotoAlbumsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Photo Albums</h1>
        <p className="text-gray-600">View photos from school events and daily activities</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">All Albums</button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Recent</button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">My Child's Class</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {['Field Trip - Science Museum', 'Sports Day', 'Art Class - Watercolors', 'Halloween Party', 'Class Photo Oct 2025', 'Science Fair Projects', 'Music Concert', 'Birthday Celebrations'].map((album, i) => (
          <Card key={i} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
            <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
              <span className="text-5xl">📸</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold mb-1">{album}</h3>
              <p className="text-sm text-gray-600 mb-2">Oct {28 - i}, 2025 • {12 + i * 2} photos</p>
              <div className="flex items-center justify-between">
                <StatusBadge status="Active" variant="success" />
                <span className="text-xs text-gray-500">👁️ 45 views</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
















