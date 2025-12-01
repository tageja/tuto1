import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Download, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { ChartWidget } from '../ChartWidget';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

const feeCollectionData = [
  { name: 'Paid', value: 485 },
  { name: 'Pending', value: 120 },
  { name: 'Overdue', value: 35 },
];

const transactionData = [
  {
    id: 1,
    student: 'Emily Chen',
    class: 'Grade 5A',
    type: 'Tuition Fee',
    amount: 1200,
    dueDate: 'Oct 01, 2025',
    paidDate: 'Sep 28, 2025',
    status: 'paid',
    method: 'Bank Transfer',
  },
  {
    id: 2,
    student: 'Michael Brown',
    class: 'Grade 5A',
    type: 'Tuition Fee',
    amount: 1200,
    dueDate: 'Oct 01, 2025',
    paidDate: null,
    status: 'pending',
    method: null,
  },
  {
    id: 3,
    student: 'Sarah Wilson',
    class: 'Grade 5A',
    type: 'Field Trip',
    amount: 50,
    dueDate: 'Oct 15, 2025',
    paidDate: 'Oct 12, 2025',
    status: 'paid',
    method: 'Credit Card',
  },
  {
    id: 4,
    student: 'David Lee',
    class: 'Grade 5A',
    type: 'Tuition Fee',
    amount: 1200,
    dueDate: 'Sep 01, 2025',
    paidDate: null,
    status: 'overdue',
    method: null,
  },
  {
    id: 5,
    student: 'Jessica Martinez',
    class: 'Grade 5A',
    type: 'Sports Fee',
    amount: 150,
    dueDate: 'Oct 20, 2025',
    paidDate: null,
    status: 'pending',
    method: null,
  },
  {
    id: 6,
    student: 'Ryan Taylor',
    class: 'Grade 5A',
    type: 'Library Fee',
    amount: 30,
    dueDate: 'Oct 01, 2025',
    paidDate: 'Sep 30, 2025',
    status: 'paid',
    method: 'Cash',
  },
];

const parentPaymentSummary = {
  student: 'Emily Chen',
  class: 'Grade 5A',
  totalPaid: 2450,
  totalPending: 200,
  nextDue: {
    type: 'Sports Activity Fee',
    amount: 200,
    dueDate: 'Nov 15, 2025',
  },
};

export function PaymentsPage() {
  const { t, role } = useApp();
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  const filteredTransactions = transactionData.filter(tx => 
    filter === 'all' || tx.status === filter
  );

  const StatusBadge = ({ status }: { status: string }) => {
    const variants = {
      paid: { variant: 'default' as const, className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
      pending: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' },
      overdue: { variant: 'destructive' as const, className: '' },
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (role === 'parent') {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="m-0">{t('payments')}</h1>
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Payment History
          </Button>
        </div>

        {/* Payment Summary */}
        <div className="bg-gradient-to-r from-[#0B5FFF] to-[#6366F1] rounded-xl p-6 text-white">
          <h2 className="text-white m-0 mb-1">{parentPaymentSummary.student}</h2>
          <p className="text-white/90 m-0">{parentPaymentSummary.class}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-6">
            <p className="text-sm text-muted-foreground mb-1">Total Paid This Year</p>
            <p className="text-2xl text-green-600 m-0">${parentPaymentSummary.totalPaid.toLocaleString()}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <p className="text-sm text-muted-foreground mb-1">Pending Payments</p>
            <p className="text-2xl text-yellow-600 m-0">${parentPaymentSummary.totalPending}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-6">
            <p className="text-sm text-muted-foreground mb-1">Payment Status</p>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              Up to date
            </Badge>
          </div>
        </div>

        {/* Next Payment Due */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="m-0 mb-4">Next Payment Due</h3>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="m-0 mb-1">{parentPaymentSummary.nextDue.type}</h4>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar size={14} />
                <span className="text-sm">Due: {parentPaymentSummary.nextDue.dueDate}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl m-0">${parentPaymentSummary.nextDue.amount}</p>
              <Button className="mt-3">
                <CreditCard size={16} className="mr-2" />
                Pay Now
              </Button>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-6 border-b border-border">
            <h3 className="m-0">Payment History</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactionData.filter(tx => tx.student === 'Emily Chen').map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.type}</TableCell>
                  <TableCell>${tx.amount}</TableCell>
                  <TableCell>{tx.dueDate}</TableCell>
                  <TableCell>
                    <StatusBadge status={tx.status} />
                  </TableCell>
                  <TableCell>{tx.method || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="m-0">{t('payments')}</h1>
        <Button variant="outline">
          <Download size={16} className="mr-2" />
          {t('export')}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Collection</p>
          <p className="text-2xl m-0">$640K</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Paid</p>
          <p className="text-2xl text-green-600 m-0">$485K</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Pending</p>
          <p className="text-2xl text-yellow-600 m-0">$120K</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Overdue</p>
          <p className="text-2xl text-red-600 m-0">$35K</p>
        </div>
      </div>

      {/* Chart and Overdue Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartWidget data={feeCollectionData} title="Fee Collection Overview" defaultType="pie" />
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="text-red-600 flex-shrink-0" />
            <div>
              <h4 className="m-0 mb-2 text-red-900 dark:text-red-100">Overdue Payments</h4>
              <p className="text-sm text-red-700 dark:text-red-200 m-0 mb-4">
                {transactionData.filter(tx => tx.status === 'overdue').length} students have overdue payments totaling $35,000.
              </p>
              <Button variant="destructive" size="sm">
                Send Reminders
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Transaction Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Paid Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{tx.student}</TableCell>
                <TableCell>{tx.class}</TableCell>
                <TableCell>{tx.type}</TableCell>
                <TableCell>${tx.amount}</TableCell>
                <TableCell>{tx.dueDate}</TableCell>
                <TableCell>{tx.paidDate || '-'}</TableCell>
                <TableCell>
                  <StatusBadge status={tx.status} />
                </TableCell>
                <TableCell>{tx.method || '-'}</TableCell>
                <TableCell className="text-right">
                  {tx.status !== 'paid' && (
                    <Button variant="ghost" size="sm">
                      Send Reminder
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
