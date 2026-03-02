'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Card } from '../../../../../components/ui/Card';
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { useI18n } from '../../../../../contexts/I18nContext';
import { useAuth } from '../../../../../contexts/AuthContext';
import { getSlotColors, formatTime } from '../../../../../lib/timetableColors';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_LABELS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

interface ScheduleSlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  subject_or_slot_name: string | null;
  room_number: string | null;
  class_name: string;
  class_id: string;
}

export default function TeacherCalendarPage() {
  const params = useParams();
  const { lang } = useI18n();
  const { accessToken } = useAuth();
  const schoolId = decodeURIComponent(params.schoolId as string);
  const encodedSchoolId = encodeURIComponent(schoolId);

  const [view, setView] = useState<'week' | 'month'>('week');
  const [current, setCurrent] = useState(() => {
    const d = new Date();
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay());
    return start.toISOString().split('T')[0];
  });
  const [selectedDay, setSelectedDay] = useState(() => new Date().toISOString().split('T')[0]);
  const [schedules, setSchedules] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const weekStart = new Date(current);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const fetchSchedules = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Get teacher's classes
      const classesRes = await fetch(
        `/api/school/teacher/classes?schoolId=${encodeURIComponent(schoolId)}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const classesData = await classesRes.json();
      if (!classesData.success) throw new Error(classesData.error || (lang === 'vi' ? 'Không tải được danh sách lớp' : 'Failed to fetch classes'));

      const classes: { id: string; name: string }[] = classesData.data?.records ?? [];
      if (classes.length === 0) {
        setSchedules([]);
        return;
      }

      // 2. Fetch schedule for each class in parallel
      const results = await Promise.all(
        classes.map((cls) =>
          fetch(`/api/school/classes/${cls.id}/schedules`)
            .then((r) => r.json())
            .then((d) =>
              (d.data ?? []).map((s: any) => ({
                ...s,
                class_name: cls.name,
                class_id: cls.id,
              }))
            )
            .catch(() => [])
        )
      );

      setSchedules(results.flat());
    } catch (err: any) {
      setError(err?.message || (lang === 'vi' ? 'Không tải được thời khóa biểu' : 'Failed to load schedules'));
    } finally {
      setLoading(false);
    }
  }, [accessToken, schoolId]);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const goPrev = () => {
    const d = new Date(current);
    if (view === 'week') d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setCurrent(d.toISOString().split('T')[0]);
  };

  const goNext = () => {
    const d = new Date(current);
    if (view === 'week') d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setCurrent(d.toISOString().split('T')[0]);
  };

  const selectDay = (date: Date) => {
    setSelectedDay(date.toISOString().split('T')[0]);
    setCurrent(date.toISOString().split('T')[0]);
  };

  const selectedDayOfWeek = new Date(selectedDay + 'T12:00:00').getDay();
  const slotsForDay = schedules
    .filter((s) => s.day_of_week === selectedDayOfWeek)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));

  const dayLabels = lang === 'vi' ? DAY_LABELS_VI : DAY_LABELS;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {lang === 'vi' ? 'Lịch & Thời khóa biểu' : 'Calendar & Timetable'}
      </h1>
      <p className="text-gray-600 mb-6">
        {lang === 'vi' ? 'Xem tuần/tháng, bấm vào ngày để xem thời khóa biểu' : 'View week/month, click a day to see timetable'}
      </p>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          <button
            type="button"
            onClick={() => setView('week')}
            className={`px-4 py-2 text-sm font-medium ${view === 'week' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
          >
            {lang === 'vi' ? 'Tuần' : 'Week'}
          </button>
          <button
            type="button"
            onClick={() => setView('month')}
            className={`px-4 py-2 text-sm font-medium ${view === 'month' ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
          >
            {lang === 'vi' ? 'Tháng' : 'Month'}
          </button>
        </div>
        <button type="button" onClick={goPrev} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button type="button" onClick={goNext} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <ChevronRight className="w-5 h-5" />
        </button>
        <span className="text-sm text-gray-600">
          {view === 'week'
            ? `${weekDays[0].toLocaleDateString()} – ${weekDays[6].toLocaleDateString()}`
            : new Date(current + 'T12:00:00').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </span>
      </div>

      {view === 'week' && (
        <div className="grid grid-cols-7 gap-2 mb-6">
          {weekDays.map((d) => {
            const dateStr = d.toISOString().split('T')[0];
            const isSelected = dateStr === selectedDay;
            const dow = d.getDay();
            const hasSlots = schedules.some((s) => s.day_of_week === dow);
            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => selectDay(d)}
                className={`p-4 rounded-lg border text-center transition-colors relative ${
                  isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="text-xs text-gray-500">{dayLabels[dow]}</div>
                <div className="text-lg font-semibold">{d.getDate()}</div>
                {hasSlots && (
                  <div className={`w-1.5 h-1.5 rounded-full mx-auto mt-1 ${isSelected ? 'bg-primary' : 'bg-blue-400'}`} />
                )}
              </button>
            );
          })}
        </div>
      )}

      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          {lang === 'vi' ? 'Thời khóa biểu ngày' : 'Timetable for'}{' '}
          <span className="text-primary">
            {dayLabels[selectedDayOfWeek]}, {new Date(selectedDay + 'T12:00:00').toLocaleDateString()}
          </span>
        </h3>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <p className="text-red-500 text-sm">{error}</p>
        ) : slotsForDay.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">
              {lang === 'vi'
                ? 'Không có tiết học nào vào ngày này.'
                : 'No periods scheduled for this day.'}
            </p>
            {schedules.length === 0 && (
              <p className="text-xs text-gray-400 mt-2">
                {lang === 'vi'
                  ? 'Quản trị viên có thể thêm thời khóa biểu trong phần Quản lý lớp.'
                  : 'The admin can add schedule slots under Class Management.'}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {slotsForDay.map((slot) => {
              const c = getSlotColors(slot.subject_or_slot_name);
              return (
                <div key={slot.id} className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${c.bg} ${c.border}`}>
                  <div className={`flex-shrink-0 text-center min-w-[72px] rounded-lg px-2 py-1 ${c.badge}`}>
                    <p className={`text-xs font-semibold ${c.badgeText}`}>{formatTime(slot.start_time)}</p>
                    <p className={`text-xs ${c.badgeText} opacity-70`}>{formatTime(slot.end_time)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${c.text}`}>
                      {slot.subject_or_slot_name || (lang === 'vi' ? 'Tiết học' : 'Period')}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{slot.class_name}</p>
                    {slot.room_number && (
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                        <MapPin className="w-3 h-3" />
                        {lang === 'vi' ? 'Phòng' : 'Room'} {slot.room_number}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {schedules.length === 0 && !loading && !error && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700">
              {lang === 'vi'
                ? 'Thời khóa biểu chưa được thiết lập. Quản trị viên có thể thêm từ trang Quản lý lớp → Thời khóa biểu.'
                : 'No timetable set up yet. Ask your admin to add schedule slots via Class Management → Timetable.'}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
