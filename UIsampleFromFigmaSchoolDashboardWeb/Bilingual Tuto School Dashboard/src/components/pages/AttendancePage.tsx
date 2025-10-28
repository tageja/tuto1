import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Calendar } from '../ui/calendar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const attendanceData = [
  { id: 1, name: 'Emily Chen', class: 'Grade 5A', oct20: 'present', oct21: 'late', oct22: 'present', oct23: 'present', oct24: 'present', rate: '96%' },
  { id: 2, name: 'Michael Brown', class: 'Grade 5A', oct20: 'present', oct21: 'present', oct22: 'absent', oct23: 'present', oct24: 'present', rate: '92%' },
  { id: 3, name: 'Sarah Wilson', class: 'Grade 5A', oct20: 'present', oct21: 'present', oct22: 'present', oct23: 'late', oct24: 'present', rate: '96%' },
  { id: 4, name: 'David Lee', class: 'Grade 5A', oct20: 'present', oct21: 'present', oct22: 'present', oct23: 'present', oct24: 'absent', rate: '92%' },
  { id: 5, name: 'Jessica Martinez', class: 'Grade 5A', oct20: 'present', oct21: 'present', oct22: 'present', oct23: 'present', oct24: 'present', rate: '100%' },
  { id: 6, name: 'Ryan Taylor', class: 'Grade 5A', oct20: 'late', oct21: 'present', oct22: 'present', oct23: 'present', oct24: 'present', rate: '96%' },
  { id: 7, name: 'Amanda Garcia', class: 'Grade 5A', oct20: 'present', oct21: 'present', oct22: 'present', oct23: 'present', oct24: 'late', rate: '96%' },
  { id: 8, name: 'Kevin Johnson', class: 'Grade 5A', oct20: 'present', oct21: 'absent', oct22: 'present', oct23: 'present', oct24: 'present', rate: '92%' },
];

const AttendanceBadge = ({ status }: { status: string }) => {
  const variants = {
    present: { variant: 'default' as const, className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
    absent: { variant: 'destructive' as const, className: '' },
    late: { variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' },
  };
  
  const config = variants[status as keyof typeof variants] || variants.present;
  
  return (
    <Badge variant={config.variant} className={config.className}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

export function AttendancePage() {
  const { t } = useApp();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState('October 2025');

  const summaryStats = {
    present: 35,
    absent: 3,
    late: 2,
    total: 40,
    rate: '94.5%',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="m-0">{t('attendance')}</h1>
        <Button variant="outline">
          <Download size={16} className="mr-2" />
          {t('export')}
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Present</p>
          <p className="text-2xl text-green-600 m-0">{summaryStats.present}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Absent</p>
          <p className="text-2xl text-red-600 m-0">{summaryStats.absent}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Late</p>
          <p className="text-2xl text-yellow-600 m-0">{summaryStats.late}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Total Students</p>
          <p className="text-2xl m-0">{summaryStats.total}</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground mb-1">Attendance Rate</p>
          <p className="text-2xl text-primary m-0">{summaryStats.rate}</p>
        </div>
      </div>

      {/* Calendar and Table Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="m-0">{currentMonth}</h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <ChevronLeft size={16} />
              </Button>
              <Button variant="ghost" size="sm">
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md"
          />
          
          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-border space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-muted-foreground">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-muted-foreground">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm text-muted-foreground">Late</span>
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-center">Oct 20</TableHead>
                  <TableHead className="text-center">Oct 21</TableHead>
                  <TableHead className="text-center">Oct 22</TableHead>
                  <TableHead className="text-center">Oct 23</TableHead>
                  <TableHead className="text-center">Oct 24</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell className="text-center">
                      <AttendanceBadge status={student.oct20} />
                    </TableCell>
                    <TableCell className="text-center">
                      <AttendanceBadge status={student.oct21} />
                    </TableCell>
                    <TableCell className="text-center">
                      <AttendanceBadge status={student.oct22} />
                    </TableCell>
                    <TableCell className="text-center">
                      <AttendanceBadge status={student.oct23} />
                    </TableCell>
                    <TableCell className="text-center">
                      <AttendanceBadge status={student.oct24} />
                    </TableCell>
                    <TableCell className="text-right">{student.rate}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
