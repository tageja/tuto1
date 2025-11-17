import { Plus, Inbox, Send, Mail } from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Card } from '../../../../components/ui/Card';
import { StatusBadge } from '../../../../components/school/shared/StatusBadge';

export default function MessagesPage() {
  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Communicate with teachers and school staff</p>
        </div>
        <Button className="gap-2" disabled title="Coming in Phase 2">
          <Plus className="w-4 h-4" />
          Compose
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-6">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2">
          <Inbox className="w-4 h-4" />
          Inbox (2)
        </button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
          <Send className="w-4 h-4" />
          Sent
        </button>
        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2">
          <Mail className="w-4 h-4" />
          Unread
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <div className="lg:col-span-1">
          <Card className="overflow-hidden">
            <div className="divide-y divide-gray-200">
              {[
                { from: 'Mrs. Emily Johnson', subject: 'Math Homework Clarification', preview: 'Hi! I wanted to clarify the homework assignment for...', time: '2h ago', priority: 'Normal', unread: true },
                { from: 'Principal Office', subject: 'Monthly Newsletter', priority: 'High', preview: 'Dear Parents, Please find attached the monthly newsletter...', time: '1 day ago', unread: true },
                { from: 'Mrs. Sarah Chen', subject: 'Field Trip Permission', preview: 'Reminder: Please submit the signed permission form...', time: '2 days ago', unread: false },
                { from: 'School Admin', subject: 'Fee Payment Reminder', preview: 'This is a friendly reminder about the upcoming...', time: '3 days ago', unread: false },
              ].map((message, index) => (
                <div
                  key={index}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    message.unread ? 'bg-blue-50' : ''
                  } ${index === 0 ? 'bg-gray-100' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className={`font-medium text-sm ${message.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                      {message.from}
                    </p>
                    <StatusBadge status={message.priority} />
                  </div>
                  <h4 className={`text-sm mb-1 ${message.unread ? 'font-semibold' : 'font-normal'}`}>
                    {message.subject}
                  </h4>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">{message.preview}</p>
                  <p className="text-xs text-gray-400">{message.time}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Math Homework Clarification</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>From: Mrs. Emily Johnson (Math Teacher)</span>
                    <span>•</span>
                    <span>2 hours ago</span>
                  </div>
                </div>
                <StatusBadge status="Normal" />
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="text-gray-700 mb-4">
                Dear Parent,
              </p>
              <p className="text-gray-700 mb-4">
                I wanted to clarify the homework assignment for this week. Students are expected to complete Problem Set 3.2 from pages 45-47 in their textbook.
              </p>
              <p className="text-gray-700 mb-4">
                The assignment focuses on:
              </p>
              <ul className="list-disc pl-6 mb-4 text-gray-700">
                <li>Multiplication tables (1-12)</li>
                <li>Basic division problems</li>
                <li>Word problems involving both operations</li>
              </ul>
              <p className="text-gray-700 mb-4">
                Please ensure your child completes the assignment by Friday, October 27. If you have any questions, feel free to reply to this message.
              </p>
              <p className="text-gray-700 mb-4">
                Best regards,<br />
                Mrs. Emily Johnson<br />
                Grade 5A Math Teacher
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button variant="outline" disabled title="Coming in Phase 2">Reply</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}












