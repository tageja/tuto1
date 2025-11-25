'use client';

import { AlertTriangle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { isDueSoon, isOverdue } from '../../lib/homework';
import type { HomeworkListProps } from './types';

export function HomeworkList({
  items,
  onViewAssignment,
  loading = false,
  isParentView = false,
  showChildPerformance = false,
}: HomeworkListProps) {
  if (loading) {
    return (
      <Card className="overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          Loading assignments...
        </div>
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          No assignments found for the selected filters.
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              {showChildPerformance && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Your Child
                </th>
              )}
              {!isParentView && (
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => {
              const dueSoon = isDueSoon(item.due_date);
              const overdueFlag = isOverdue(item.due_date);
              const rowBgColor = overdueFlag ? 'bg-red-50' : '';

              return (
                <tr
                  key={item.assignment_id}
                  className={`hover:bg-gray-50 ${rowBgColor}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      {item.subject}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {item.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.class_name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <span className={dueSoon ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                        {new Date(item.due_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      {dueSoon && (
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium ${
                        item.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {item.status === 'completed' ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden min-w-[100px]">
                        <div
                          className={`h-full ${
                            item.progress_percent === 100
                              ? 'bg-green-600'
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${item.progress_percent}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 font-medium min-w-[45px] text-right">
                        {item.submitted}/{item.total}
                      </span>
                    </div>
                  </td>
                  {showChildPerformance && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {item.child_status ? (
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-medium ${
                              item.child_status === 'graded'
                                ? 'bg-green-100 text-green-700'
                                : item.child_status === 'late'
                                ? 'bg-red-100 text-red-700'
                                : item.child_status === 'submitted'
                                ? 'bg-blue-100 text-blue-700'
                                : item.child_status === 'incomplete'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {item.child_status.charAt(0).toUpperCase() + item.child_status.slice(1)}
                          </span>
                          <span className="text-sm font-medium text-blue-600">
                            {item.child_score !== null && item.child_score !== undefined
                              ? `${Number(item.child_score).toFixed(1)}/10`
                              : '--'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-500">--</span>
                      )}
                    </td>
                  )}
                  {!isParentView && (
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewAssignment(item.assignment_id)}
                      >
                        View
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

