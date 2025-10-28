import { Download } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { StatusBadge } from '../../../../components/school/shared/StatusBadge';
import { getSchoolPayments } from '../../../../lib/school/data';

export default async function PaymentsPage() {
  const schoolId = 'Sunrise International School';
  const payments = await getSchoolPayments(schoolId);

  const totalCollection = 640000;
  const paid = 485000;
  const pending = 120000;
  const overdue = 35000;

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        </div>
        <Button variant="outline" className="gap-2" disabled title="Coming in Phase 2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Collection</p>
          <p className="text-2xl font-bold text-gray-900">${(totalCollection / 1000).toFixed(0)}K</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Paid</p>
          <p className="text-2xl font-bold text-green-600">${(paid / 1000).toFixed(0)}K</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">${(pending / 1000).toFixed(0)}K</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Overdue</p>
          <p className="text-2xl font-bold text-red-600">${(overdue / 1000).toFixed(0)}K</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Fee Collection Overview */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Fee Collection Overview</h3>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  strokeDashoffset="62.8"
                  transform="rotate(-90 50 50)"
                />
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="none" 
                  stroke="#fbbf24" 
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  strokeDashoffset="188.4"
                  transform="rotate(90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold">75%</div>
                  <div className="text-xs text-gray-500">Collected</div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded"></div>
                <span>Paid</span>
              </div>
              <span className="font-medium">75%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Pending</span>
              </div>
              <span className="font-medium">19%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Overdue</span>
              </div>
              <span className="font-medium">6%</span>
            </div>
          </div>
        </Card>

        {/* Overdue Payments Alert */}
        <div className="lg:col-span-2">
          <Card className="p-6 bg-red-50 border-red-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-2">Overdue Payments</h3>
                <p className="text-sm text-red-800 mb-4">1 students have overdue payments totaling $35,000.</p>
                <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100" disabled title="Coming in Phase 2">
                  Send Reminders
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">All Transactions</button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Paid</button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Pending</button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50">Overdue</button>
      </div>

      {/* Payments Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Date</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { student: 'Emily Chen', class: 'Grade 5A', type: 'Tuition Fee', amount: '$1200', due: 'Oct 01, 2025', paid: 'Sep 28, 2025', status: 'Paid', method: 'Bank Transfer' },
                { student: 'Michael Brown', class: 'Grade 5A', type: 'Tuition Fee', amount: '$1200', due: 'Oct 01, 2025', paid: '-', status: 'Pending', method: '-' },
                { student: 'Sarah Wilson', class: 'Grade 5A', type: 'Field Trip', amount: '$50', due: 'Oct 15, 2025', paid: 'Oct 12, 2025', status: 'Paid', method: 'Credit Card' },
                { student: 'David Lee', class: 'Grade 5A', type: 'Tuition Fee', amount: '$1200', due: 'Sep 01, 2025', paid: '-', status: 'Overdue', method: '-' },
                { student: 'Jessica Martinez', class: 'Grade 5A', type: 'Sports Fee', amount: '$150', due: 'Oct 20, 2025', paid: '-', status: 'Pending', method: '-' },
                { student: 'Ryan Taylor', class: 'Grade 5A', type: 'Library Fee', amount: '$30', due: 'Oct 01, 2025', paid: 'Sep 30, 2025', status: 'Paid', method: 'Cash' },
              ].map((payment, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.student}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{payment.class}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{payment.type}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{payment.amount}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{payment.due}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{payment.paid}</td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{payment.method}</td>
                  <td className="px-6 py-4 text-center">
                    {payment.status === 'Pending' || payment.status === 'Overdue' ? (
                      <Button size="sm" variant="outline" disabled title="Coming in Phase 2">Send Reminder</Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


