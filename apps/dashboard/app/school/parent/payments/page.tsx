import { Card } from '../../../../components/ui/Card';
import { StatusBadge } from '../../../../components/school/shared/StatusBadge';
import { Button } from '../../../../components/ui/Button';

export default function ParentPaymentsPage() {
  const studentName = 'Mai Nguyen';
  const className = 'Class 5A';
  
  const totalPaid = 12500;
  const pending = 1200;
  const status = 'Up to date';

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payments</h1>
        <p className="text-gray-600">{studentName} • {className}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Paid This Year</p>
          <p className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Pending Payments</p>
          <p className="text-2xl font-bold text-yellow-600">${pending.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Payment Status</p>
          <StatusBadge status={status} variant="success" />
        </Card>
      </div>

      {/* Next Payment Due */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 mb-2">Next Payment Due</p>
            <h3 className="text-3xl font-bold mb-1">$1,200</h3>
            <p className="text-blue-100">November Tuition Fee • Due: Nov 01, 2025</p>
          </div>
          <Button variant="secondary" size="lg" disabled title="Coming in Phase 2">
            Pay Now
          </Button>
        </div>
      </Card>

      {/* Payment History */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Payment History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Date</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { description: 'November Tuition Fee', amount: '$1,200', due: 'Nov 01, 2025', paid: '-', status: 'Pending', method: '-' },
                { description: 'Field Trip - Science Museum', amount: '$50', due: 'Oct 27, 2025', paid: '-', status: 'Pending', method: '-' },
                { description: 'October Tuition Fee', amount: '$1,200', due: 'Oct 01, 2025', paid: 'Sep 28, 2025', status: 'Paid', method: 'Bank Transfer' },
                { description: 'Sports Fee', amount: '$150', due: 'Sep 20, 2025', paid: 'Sep 18, 2025', status: 'Paid', method: 'Credit Card' },
                { description: 'September Tuition Fee', amount: '$1,200', due: 'Sep 01, 2025', paid: 'Aug 30, 2025', status: 'Paid', method: 'Bank Transfer' },
                { description: 'Textbooks & Materials', amount: '$350', due: 'Aug 15, 2025', paid: 'Aug 12, 2025', status: 'Paid', method: 'Credit Card' },
                { description: 'Registration Fee', amount: '$500', due: 'Aug 01, 2025', paid: 'Jul 28, 2025', status: 'Paid', method: 'Bank Transfer' },
                { description: 'August Tuition Fee', amount: '$1,200', due: 'Aug 01, 2025', paid: 'Jul 29, 2025', status: 'Paid', method: 'Bank Transfer' },
              ].map((payment, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{payment.amount}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{payment.due}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{payment.paid}</td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{payment.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

















