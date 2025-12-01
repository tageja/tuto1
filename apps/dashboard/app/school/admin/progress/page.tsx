import { Download } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';

export default function AdminProgressPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Progress Reports</h1>
          <p className="text-gray-600">Monitor student academic progress across all classes</p>
        </div>
        <Button variant="outline" className="gap-2" disabled title="Coming in Phase 2">
          <Download className="w-4 h-4" />
          Generate Reports
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4"><p className="text-sm text-gray-600">Total Students</p><p className="text-2xl font-bold">144</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">Avg Grade</p><p className="text-2xl font-bold text-green-600">4.2/5.0</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">Improvement Rate</p><p className="text-2xl font-bold text-blue-600">+8.5%</p></Card>
        <Card className="p-4"><p className="text-sm text-gray-600">At Risk Students</p><p className="text-2xl font-bold text-red-600">6</p></Card>
      </div>

      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Class Performance Overview</h3>
        <div className="grid grid-cols-6 gap-4">
          {['Math', 'Science', 'English', 'History', 'Geography', 'PE'].map((subject) => (
            <div key={subject} className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-blue-600">{(Math.random() * 1.5 + 3.5).toFixed(1)}</span>
              </div>
              <p className="text-sm font-medium">{subject}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Reports</h3>
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Grade {Math.floor(i / 2) + 1}A - Term {(i % 2) + 1} Reports</p>
                <p className="text-sm text-gray-600">Generated on Oct {20 - i}, 2025</p>
              </div>
              <Button variant="outline" size="sm">View</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

















