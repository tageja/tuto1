import { Card } from '../../../../../components/ui/Card';
import { StatusBadge } from '../../../../../components/school/shared/StatusBadge';
import { Button } from '../../../../../components/ui/Button';

export default async function ParentPaymentsPage({
  params,
}: {
  params: Promise<{ schoolId: string }>;
}) {
  const { schoolId } = await params;
  const decodedSchoolId = decodeURIComponent(schoolId);

  const studentName = 'Emily Chen';
  const className = 'Grade 5A';

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="text-gray-600">{studentName} • {className} • {decodedSchoolId}</p>
      </div>

      {/* Payment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Paid</p>
          <p className="text-2xl font-bold text-green-600">$4,850</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">$1,200</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Overdue</p>
          <p className="text-2xl font-bold text-red-600">$0</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Next Due</p>
          <p className="text-2xl font-bold text-gray-900">Dec 1</p>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="overflow-hidden mb-6">
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
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { desc: 'Tuition Fee - December', amount: '$1,200', due: 'Dec 01, 2025', paid: '-', status: 'Pending', method: '-' },
                { desc: 'Tuition Fee - November', amount: '$1,200', due: 'Nov 01, 2025', paid: 'Oct 28, 2025', status: 'Paid', method: 'Bank Transfer' },
                { desc: 'Field Trip - Science Museum', amount: '$50', due: 'Nov 15, 2025', paid: 'Nov 12, 2025', status: 'Paid', method: 'Credit Card' },
                { desc: 'Tuition Fee - October', amount: '$1,200', due: 'Oct 01, 2025', paid: 'Sep 28, 2025', status: 'Paid', method: 'Bank Transfer' },
                { desc: 'Sports Fee', amount: '$150', due: 'Oct 20, 2025', paid: 'Oct 18, 2025', status: 'Paid', method: 'Cash' },
                { desc: 'Library Fee', amount: '$30', due: 'Oct 01, 2025', paid: 'Sep 30, 2025', status: 'Paid', method: 'Cash' },
              ].map((payment, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{payment.desc}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right font-medium">{payment.amount}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{payment.due}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{payment.paid}</td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{payment.method}</td>
                  <td className="px-6 py-4 text-center">
                    {payment.status === 'Paid' ? (
                      <Button variant="outline" size="sm" disabled title="Coming in Phase 2">
                        Download
                      </Button>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Payment Methods */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
        <div className="space-y-3">
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                  VISA
                </div>
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-gray-600">Expires 12/2026</p>
                </div>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Primary</span>
            </div>
          </div>
          
          <Button variant="outline" className="w-full" disabled title="Coming in Phase 2">
            + Add Payment Method
          </Button>
        </div>
      </Card>
    </div>
  );
}





