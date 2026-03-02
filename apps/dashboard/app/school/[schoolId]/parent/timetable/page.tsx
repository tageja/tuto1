'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card } from '../../../../../components/ui/Card';
import { useI18n } from '../../../../../contexts/I18nContext';
import supabase from '../../../../../lib/supabase';
import { getSlotColors, formatTime } from '../../../../../lib/timetableColors';
import { MapPin } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export default function ParentTimetablePage() {
  const params = useParams();
  const { lang } = useI18n();
  const schoolId = decodeURIComponent(params.schoolId as string);

  const [childClasses, setChildClasses] = useState<{ classId: string; className: string }[]>([]);
  const [schedulesByClass, setSchedulesByClass] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    // Default selected day to today
    setSelectedDay(new Date().getDay());
  }, []);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: userProfile } = await supabase
        .from('users').select('id').eq('auth_user_id', user.id).single();
      if (!userProfile) { setLoading(false); return; }
      const { data: mappings } = await supabase
        .from('school_parent_students')
        .select('student:school_students(class_id, school_classes(id, name))')
        .eq('school_id', schoolId)
        .eq('parent_user_id', userProfile.id);
      const seen = new Set<string>();
      const classes: { classId: string; className: string }[] = [];
      (mappings || []).forEach((m: any) => {
        const st = m.student;
        const classId = st?.class_id ?? st?.school_classes?.id;
        const className = st?.school_classes?.name;
        if (classId && !seen.has(classId)) {
          seen.add(classId);
          classes.push({ classId, className: className || 'Class' });
        }
      });
      setChildClasses(classes);
      const byClass: Record<string, any[]> = {};
      await Promise.all(
        classes.map(async ({ classId }) => {
          const res = await fetch(`/api/school/classes/${classId}/schedules`);
          const data = await res.json();
          byClass[classId] = (data?.data ?? []).sort((a: any, b: any) =>
            a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time)
          );
        })
      );
      setSchedulesByClass(byClass);
      setLoading(false);
    }
    load();
  }, [schoolId]);

  if (loading) {
    return <div className="p-6"><div className="animate-pulse space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-gray-100 rounded-lg"/>)}</div></div>;
  }

  const dayLabels = lang === 'vi' ? DAYS_VI : DAYS;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        {lang === 'vi' ? 'Thời khóa biểu lớp' : 'Class Timetable'}
      </h1>
      <p className="text-gray-500 mb-5 text-sm">
        {lang === 'vi' ? 'Lịch học theo tuần của lớp con bạn' : "Weekly schedule for your child's class"}
      </p>

      {/* Day filter pills */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button type="button" onClick={() => setSelectedDay(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedDay === null ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
          {lang === 'vi' ? 'Tất cả' : 'All days'}
        </button>
        {DAYS.map((d, i) => (
          <button key={i} type="button" onClick={() => setSelectedDay(i)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selectedDay === i ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
            {dayLabels[i]}
          </button>
        ))}
      </div>

      {childClasses.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          {lang === 'vi' ? 'Chưa có thông tin lớp.' : 'No class information available.'}
        </Card>
      ) : (
        childClasses.map(({ classId, className }) => {
          const allSlots = schedulesByClass[classId] ?? [];
          const slots = selectedDay !== null
            ? allSlots.filter((s: any) => s.day_of_week === selectedDay)
            : allSlots;

          return (
            <div key={classId} className="mb-6">
              <h2 className="text-base font-semibold text-gray-700 mb-3">{className}</h2>
              {slots.length === 0 ? (
                <Card className="p-4 text-center text-gray-400 text-sm">
                  {lang === 'vi' ? 'Không có tiết học cho ngày này.' : 'No periods for this day.'}
                </Card>
              ) : (
                <div className="space-y-2">
                  {slots.map((s: any) => {
                    const c = getSlotColors(s.subject_or_slot_name);
                    return (
                      <div key={s.id} className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${c.bg} ${c.border}`}>
                        <div className="flex-shrink-0 text-xs font-semibold text-gray-500 w-10 text-center">
                          {dayLabels[s.day_of_week]}
                        </div>
                        <div className={`flex-shrink-0 text-center min-w-[72px] rounded-lg px-2 py-1 ${c.badge}`}>
                          <p className={`text-xs font-semibold ${c.badgeText}`}>{formatTime(s.start_time)}</p>
                          <p className={`text-xs ${c.badgeText} opacity-70`}>{formatTime(s.end_time)}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${c.text}`}>
                            {s.subject_or_slot_name || (lang === 'vi' ? 'Tiết học' : 'Period')}
                          </p>
                          {s.room_number && (
                            <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                              <MapPin className="w-3 h-3" /> {s.room_number}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
