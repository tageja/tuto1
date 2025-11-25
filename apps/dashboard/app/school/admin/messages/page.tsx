import { Plus } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { StatusBadge } from '../../../../components/school/shared/StatusBadge';

export default function AdminMessagesPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Internal messaging system</p>
        </div>
        <Button className="gap-2" disabled title="Coming in Phase 2">
          <Plus className="w-4 h-4" />
          Compose
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Inbox</h3>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <p className="text-sm font-medium">Parent {i + 1}</p>
                <p className="text-xs text-gray-600 truncate">Message subject...</p>
                <p className="text-xs text-gray-400 mt-1">{i + 1}h ago</p>
              </div>
            ))}
          </div>
        </Card>
        <div className="lg:col-span-2">
          <Card className="p-6">
            <p className="text-gray-500 text-center py-12">Select a message to view</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
















