'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Loader2, Mail } from 'lucide-react';
import type { ThreadCounts, ThreadSummary } from '../../lib/types/messages';

type Option = {
  id: string;
  name: string;
  grade?: string | null;
};

type ThreadListProps = {
  threads: ThreadSummary[];
  totalCount: number;
  unreadCount: number;
  selectedThreadId?: string | null;
  onSelectThread: (threadId: string) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  loading?: boolean;
  onCompose?: () => void;
  variant: 'admin' | 'parent';
  showFilters?: boolean;
  classOptions?: Option[];
  gradeOptions?: string[];
  selectedClassId?: string | null;
  selectedGrade?: string | null;
  onClassFilterChange?: (value: string | null) => void;
  onGradeFilterChange?: (value: string | null) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  composeLabel?: string;
  searchPlaceholder?: string;
  filterLabelClass?: string;
  filterLabelGrade?: string;
  allClassesLabel?: string;
  allGradesLabel?: string;
  noPreviewLabel?: string;
  conversationsLabel?: string;
};

const formatAbsolute = (date: string) => {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  return formatter.format(new Date(date));
};

const formatRelative = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const priorityClasses: Record<string, string> = {
  High: 'bg-red-50 text-red-700',
  Normal: 'bg-blue-50 text-blue-700',
  'N/A': 'bg-gray-50 text-gray-500',
};

export function ThreadList({
  threads,
  totalCount,
  unreadCount,
  selectedThreadId,
  onSelectThread,
  searchValue,
  onSearchChange,
  loading,
  onCompose,
  variant,
  showFilters = false,
  classOptions = [],
  gradeOptions = [],
  selectedClassId,
  selectedGrade,
  onClassFilterChange,
  onGradeFilterChange,
  emptyTitle = 'No conversations yet',
  emptyDescription = 'Start a conversation to see it here.',
  composeLabel = 'New',
  searchPlaceholder = 'Search messages...',
  filterLabelClass = 'Class',
  filterLabelGrade = 'Grade',
  allClassesLabel = 'All classes',
  allGradesLabel = 'All grades',
  noPreviewLabel = 'No message preview yet',
  conversationsLabel = 'Messages',
}: ThreadListProps) {
  const [localSearch, setLocalSearch] = useState(searchValue);

  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  useEffect(() => {
    const handle = setTimeout(() => {
      if (localSearch !== searchValue) {
        onSearchChange(localSearch);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [localSearch, onSearchChange, searchValue]);

  const sortedThreads = useMemo(() => {
    return [...threads].sort((a, b) => {
      return new Date(b.thread.updated_at).getTime() - new Date(a.thread.updated_at).getTime();
    });
  }, [threads]);

  return (
    <div className="flex flex-col border-r border-gray-200 bg-white w-full max-w-md h-full">
      <div className="p-4 border-b border-gray-200 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{conversationsLabel || 'Messages'}</h2>
            {unreadCount > 0 && (
              <p className="text-xs text-gray-500">{unreadCount} unread</p>
            )}
          </div>
          {onCompose && (
            <button
              onClick={onCompose}
              className="whitespace-nowrap px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              {composeLabel}
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="search"
            value={localSearch}
            onChange={(event) => setLocalSearch(event.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">{filterLabelClass}</label>
              <select
                value={selectedClassId || ''}
                onChange={(event) => onClassFilterChange?.(event.target.value || null)}
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{allClassesLabel}</option>
                {classOptions.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">{filterLabelGrade}</label>
              <select
                value={selectedGrade || ''}
                onChange={(event) => onGradeFilterChange?.(event.target.value || null)}
                className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{allGradesLabel}</option>
                {gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : sortedThreads.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center px-6 py-12 text-gray-500">
            <Mail className="w-10 h-10 mb-3 text-gray-400" />
            <p className="text-sm font-semibold text-gray-700">{emptyTitle}</p>
            <p className="text-xs text-gray-500">{emptyDescription}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {sortedThreads.map((item) => {
              const isActive = selectedThreadId === item.thread.id;
              const timestamp = item.thread.updated_at || item.lastMessage?.sent_at;
              const priorityClass = priorityClasses[item.thread.priority] || priorityClasses['Normal'];

              return (
                <li key={item.thread.id}>
                  <button
                    onClick={() => onSelectThread(item.thread.id)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      isActive ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold ${item.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                          {item.thread.subject}
                        </p>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${priorityClass}`}>
                          {item.thread.priority}
                        </span>
                      </div>
                      {timestamp && (
                        <span
                          className="text-xs text-gray-500"
                          title={formatRelative(timestamp)}
                        >
                          {formatAbsolute(timestamp)}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <p
                        className={`text-xs line-clamp-1 ${
                          item.unreadCount > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'
                        }`}
                      >
                        {item.lastMessage?.body || noPreviewLabel}
                      </p>
                      {item.unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[11px]">
                          {item.unreadCount}
                        </span>
                      )}
                    </div>
                    {item.thread.grade && (
                      <p className="mt-1 text-[11px] text-gray-500">
                        {item.thread.grade}
                        {item.thread.class_id && variant === 'admin'
                          ? ` • ${classOptions.find((cls) => cls.id === item.thread.class_id)?.name || ''}`
                          : ''}
                      </p>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

