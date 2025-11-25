import { Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { StatusBadge } from '../../../../components/school/shared/StatusBadge';

export default function ExtracurricularPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Extracurricular Activities</h1>
          <p className="text-gray-600">Manage clubs, sports, and after-school programs</p>
        </div>
        <Button className="gap-2" disabled title="Coming in Phase 2">
          <Plus className="w-4 h-4" />
          Create Activity
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4"><p className="text-sm text-gray-600">Total Activities</p><p className="text-2xl font-bold">18</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">Active Programs</p><p className="text-2xl font-bold text-green-600">15</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">Total Participants</p><p className="text-2xl font-bold text-blue-600">286</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">This Week</p><p className="text-2xl font-bold text-purple-600">8</p></Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'Chess Club', type: 'Academic', schedule: 'Mon & Wed, 3:30-4:30 PM', participants: '15/20', status: 'Active', icon: '♟️' },
          { name: 'Soccer Team', type: 'Sports', schedule: 'Tue & Thu, 4:00-5:30 PM', participants: '22/25', status: 'Active', icon: '⚽' },
          { name: 'Art Workshop', type: 'Creative', schedule: 'Friday, 3:00-4:30 PM', participants: '18/20', status: 'Active', icon: '🎨' },
          { name: 'Robotics Club', type: 'Technology', schedule: 'Wed, 3:30-5:00 PM', participants: '12/15', status: 'Active', icon: '🤖' },
          { name: 'Drama Club', type: 'Creative', schedule: 'Thu, 3:30-5:00 PM', participants: '20/25', status: 'Active', icon: '🎭' },
          { name: 'Basketball Team', type: 'Sports', schedule: 'Mon & Fri, 4:00-5:30 PM', participants: '15/15', status: 'Full', icon: '🏀' },
        ].map((activity, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{activity.icon}</div>
              <StatusBadge status={activity.status} />
            </div>
            <h3 className="font-semibold text-lg mb-2">{activity.name}</h3>
            <div className="space-y-1 text-sm text-gray-600 mb-4">
              <div>📁 {activity.type}</div>
              <div>🕐 {activity.schedule}</div>
              <div>👥 {activity.participants}</div>
            </div>
            <Button variant="outline" className="w-full" size="sm">Manage</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
















