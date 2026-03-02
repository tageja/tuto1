'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Copy, Trash2, Plus, MapPin, Pencil, Check, X } from 'lucide-react';
import { Card } from '../../../../../../../components/ui/Card';
import { Button } from '../../../../../../../components/ui/Button';
import { useI18n } from '../../../../../../../contexts/I18nContext';
import { getSlotColors, formatTime } from '../../../../../../../lib/timetableColors';

const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

const WEEKDAYS = DAYS.filter((d) => d.value >= 1 && d.value <= 5);

export default function AdminClassTimetablePage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useI18n();
  const schoolId = decodeURIComponent(params.schoolId as string);
  const classId = params.classId as string;
  const encodedSchoolId = encodeURIComponent(schoolId);

  const [classData, setClassData] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSlot, setNewSlot] = useState({
    day_of_week: 1,
    start_time: '09:00',
    end_time: '10:00',
    subject_or_slot_name: '',
    room_number: '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    day_of_week: number; start_time: string; end_time: string;
    subject_or_slot_name: string; room_number: string;
  } | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  // Copy-day state
  const [copySource, setCopySource] = useState(1); // default: Monday
  const [copyTargets, setCopyTargets] = useState<number[]>([]);
  const [copying, setCopying] = useState(false);
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/school/classes/${classId}`).then((r) => r.json()),
      fetch(`/api/school/classes/${classId}/schedules`).then((r) => r.json()),
    ])
      .then(([classRes, schedRes]) => {
        setClassData(classRes);
        setSchedules(schedRes?.data ?? []);
      })
      .finally(() => setLoading(false));
  }, [classId]);

  useEffect(() => { load(); }, [load]);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classData?.school_id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/school/classes/${classId}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          school_id: classData.school_id,
          day_of_week: newSlot.day_of_week,
          start_time: newSlot.start_time,
          end_time: newSlot.end_time,
          subject_or_slot_name: newSlot.subject_or_slot_name || null,
          room_number: newSlot.room_number || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSchedules((prev) => [...prev, data.data].sort((a, b) =>
        a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time)
      ));
      setNewSlot({ ...newSlot, subject_or_slot_name: '', room_number: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (s: any) => {
    setEditingId(s.id);
    setEditDraft({
      day_of_week: s.day_of_week,
      start_time: s.start_time?.slice(0, 5) ?? '',
      end_time: s.end_time?.slice(0, 5) ?? '',
      subject_or_slot_name: s.subject_or_slot_name ?? '',
      room_number: s.room_number ?? '',
    });
  };

  const cancelEdit = () => { setEditingId(null); setEditDraft(null); };

  const saveEdit = async (slotId: string) => {
    if (!editDraft) return;
    setEditSaving(true);
    try {
      const res = await fetch(`/api/school/classes/${classId}/schedules/${slotId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day_of_week: editDraft.day_of_week,
          start_time: editDraft.start_time,
          end_time: editDraft.end_time,
          subject_or_slot_name: editDraft.subject_or_slot_name || null,
          room_number: editDraft.room_number || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSchedules((prev) =>
        prev
          .map((s) => (s.id === slotId ? { ...s, ...data.data } : s))
          .sort((a, b) => a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time))
      );
      cancelEdit();
    } catch (err) {
      console.error(err);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async (slotId: string) => {
    if (!confirm(lang === 'vi' ? 'Xóa tiết học này?' : 'Remove this slot?')) return;
    setDeleting(slotId);
    try {
      await fetch(`/api/school/classes/${classId}/schedules/${slotId}`, { method: 'DELETE' });
      setSchedules((prev) => prev.filter((s) => s.id !== slotId));
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const handleCopy = async () => {
    if (!classData?.school_id || copyTargets.length === 0) return;
    const sourceSlots = schedules.filter((s) => s.day_of_week === copySource);
    if (sourceSlots.length === 0) {
      setCopyMsg(lang === 'vi' ? 'Không có tiết học nào trong ngày nguồn.' : 'No slots found for source day.');
      return;
    }
    setCopying(true);
    setCopyMsg(null);
    let created = 0;
    for (const day of copyTargets) {
      for (const slot of sourceSlots) {
        try {
          const res = await fetch(`/api/school/classes/${classId}/schedules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              school_id: classData.school_id,
              day_of_week: day,
              start_time: slot.start_time,
              end_time: slot.end_time,
              subject_or_slot_name: slot.subject_or_slot_name || null,
              room_number: slot.room_number || null,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.data) {
              setSchedules((prev) => [...prev, data.data]);
              created++;
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
    }
    setCopying(false);
    setCopyTargets([]);
    const dayNames = copyTargets.map(d => DAYS.find(x => x.value === d)?.label).join(', ');
    setCopyMsg(lang === 'vi'
      ? `✓ Đã sao chép ${created} tiết sang ${dayNames}.`
      : `✓ Copied ${created} slot${created !== 1 ? 's' : ''} to ${dayNames}.`);
    // re-sort
    setSchedules((prev) => [...prev].sort((a, b) =>
      a.day_of_week - b.day_of_week || a.start_time.localeCompare(b.start_time)
    ));
  };

  const toggleCopyTarget = (day: number) => {
    setCopyTargets((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  if (loading && !classData) {
    return <div className="p-6"><div className="animate-pulse h-8 bg-gray-200 rounded w-1/3" /></div>;
  }

  const className = classData?.name || (lang === 'vi' ? 'Lớp học' : 'Class');

  // Group schedules by day
  const byDay: Record<number, any[]> = {};
  schedules.forEach((s) => {
    if (!byDay[s.day_of_week]) byDay[s.day_of_week] = [];
    byDay[s.day_of_week].push(s);
  });
  DAYS.forEach((d) => { if (!byDay[d.value]) byDay[d.value] = []; });

  const activeDays = DAYS.filter((d) => (byDay[d.value] ?? []).length > 0 || d.value === newSlot.day_of_week);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Button variant="outline" size="sm" className="mb-4" onClick={() => router.push(`/school/${encodedSchoolId}/admin/classes`)}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        {lang === 'vi' ? 'Quay lại lớp' : 'Back to classes'}
      </Button>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        {lang === 'vi' ? 'Thời khóa biểu' : 'Timetable'}: {className}
      </h1>
      <p className="text-gray-500 mb-6 text-sm">
        {lang === 'vi' ? 'Quản lý lịch học theo ngày và màu sắc.' : 'Manage weekly schedule with colour-coded periods.'}
      </p>

      {/* ── ADD SLOT ── */}
      <Card className="p-5 mb-5">
        <h2 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" />
          {lang === 'vi' ? 'Thêm tiết' : 'Add slot'}
        </h2>
        <form onSubmit={handleAddSlot} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{lang === 'vi' ? 'Ngày' : 'Day'}</label>
            <select value={newSlot.day_of_week} onChange={(e) => setNewSlot({ ...newSlot, day_of_week: Number(e.target.value) })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
              {DAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{lang === 'vi' ? 'Bắt đầu' : 'Start'}</label>
            <input type="time" value={newSlot.start_time} onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{lang === 'vi' ? 'Kết thúc' : 'End'}</label>
            <input type="time" value={newSlot.end_time} onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{lang === 'vi' ? 'Môn / Tiết' : 'Subject / Slot'}</label>
            <input type="text" value={newSlot.subject_or_slot_name} onChange={(e) => setNewSlot({ ...newSlot, subject_or_slot_name: e.target.value })}
              placeholder="e.g. Math, Breakfast…" className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-44" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">{lang === 'vi' ? 'Phòng' : 'Room'}</label>
            <input type="text" value={newSlot.room_number} onChange={(e) => setNewSlot({ ...newSlot, room_number: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28" />
          </div>
          <Button type="submit" disabled={saving} size="sm">
            {saving ? '…' : (lang === 'vi' ? 'Thêm' : 'Add')}
          </Button>
        </form>
      </Card>

      {/* ── COPY DAY ── */}
      <Card className="p-5 mb-5 bg-indigo-50 border border-indigo-100">
        <h2 className="text-base font-semibold text-indigo-900 mb-3 flex items-center gap-2">
          <Copy className="w-4 h-4 text-indigo-600" />
          {lang === 'vi' ? 'Sao chép ngày' : 'Copy day to other days'}
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-xs font-medium text-indigo-700 mb-1">{lang === 'vi' ? 'Nguồn' : 'Copy from'}</label>
            <select value={copySource} onChange={(e) => setCopySource(Number(e.target.value))}
              className="border border-indigo-300 rounded-lg px-3 py-2 text-sm bg-white">
              {DAYS.map((d) => <option key={d.value} value={d.value}>{d.label} {(byDay[d.value]?.length ?? 0) > 0 ? `(${byDay[d.value].length} slots)` : ''}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs font-medium text-indigo-700 mb-1">{lang === 'vi' ? 'Copy đến' : 'Copy to'}</p>
            <div className="flex gap-2 flex-wrap">
              {DAYS.filter((d) => d.value !== copySource).map((d) => (
                <button key={d.value} type="button" onClick={() => toggleCopyTarget(d.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    copyTargets.includes(d.value)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-100'
                  }`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
          <Button onClick={handleCopy} disabled={copying || copyTargets.length === 0} size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {copying ? '…' : (lang === 'vi' ? 'Sao chép' : 'Copy')}
          </Button>
        </div>
        {copyMsg && (
          <p className={`mt-2 text-sm font-medium ${copyMsg.startsWith('✓') ? 'text-green-700' : 'text-red-600'}`}>
            {copyMsg}
          </p>
        )}
        <p className="mt-2 text-xs text-indigo-500">
          {lang === 'vi'
            ? 'Chọn ngày nguồn → chọn các ngày đích → nhấn Sao chép. Bạn có thể chỉnh sửa từng tiết sau khi sao chép.'
            : 'Pick a source day → select target days → press Copy. You can edit individual slots after copying.'}
        </p>
      </Card>

      {/* ── WEEKLY SCHEDULE ── */}
      <div className="space-y-4">
        {DAYS.map((day) => {
          const slots = (byDay[day.value] ?? []).sort((a: any, b: any) => a.start_time.localeCompare(b.start_time));
          return (
            <Card key={day.value} className="overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800 text-sm">{day.label}</h3>
                <span className="text-xs text-gray-400">{slots.length} {lang === 'vi' ? 'tiết' : (slots.length === 1 ? 'slot' : 'slots')}</span>
              </div>
              {slots.length === 0 ? (
                <p className="px-5 py-4 text-xs text-gray-400 italic">
                  {lang === 'vi' ? 'Chưa có tiết nào.' : 'No slots yet.'}
                </p>
              ) : (
                <ul className="divide-y divide-gray-50">
                  {slots.map((s: any) => {
                    const c = getSlotColors(s.subject_or_slot_name);
                    const isEditing = editingId === s.id;

                    if (isEditing && editDraft) {
                      return (
                        <li key={s.id} className={`px-4 py-3 ${c.bg} border-l-4 ${c.border}`}>
                          <div className="flex flex-wrap gap-2 items-end">
                            <div>
                              <label className="block text-xs text-gray-500 mb-0.5">{lang === 'vi' ? 'Ngày' : 'Day'}</label>
                              <select value={editDraft.day_of_week}
                                onChange={(e) => setEditDraft({ ...editDraft, day_of_week: Number(e.target.value) })}
                                className="border border-gray-300 rounded px-2 py-1 text-sm bg-white">
                                {DAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-0.5">{lang === 'vi' ? 'Bắt đầu' : 'Start'}</label>
                              <input type="time" value={editDraft.start_time}
                                onChange={(e) => setEditDraft({ ...editDraft, start_time: e.target.value })}
                                className="border border-gray-300 rounded px-2 py-1 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-0.5">{lang === 'vi' ? 'Kết thúc' : 'End'}</label>
                              <input type="time" value={editDraft.end_time}
                                onChange={(e) => setEditDraft({ ...editDraft, end_time: e.target.value })}
                                className="border border-gray-300 rounded px-2 py-1 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-0.5">{lang === 'vi' ? 'Môn / Tiết' : 'Subject'}</label>
                              <input type="text" value={editDraft.subject_or_slot_name}
                                onChange={(e) => setEditDraft({ ...editDraft, subject_or_slot_name: e.target.value })}
                                className="border border-gray-300 rounded px-2 py-1 text-sm w-36" />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500 mb-0.5">{lang === 'vi' ? 'Phòng' : 'Room'}</label>
                              <input type="text" value={editDraft.room_number}
                                onChange={(e) => setEditDraft({ ...editDraft, room_number: e.target.value })}
                                className="border border-gray-300 rounded px-2 py-1 text-sm w-24" />
                            </div>
                            <div className="flex gap-1">
                              <button type="button" onClick={() => saveEdit(s.id)} disabled={editSaving}
                                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 disabled:opacity-50">
                                {editSaving ? '…' : <><Check className="w-3.5 h-3.5" />{lang === 'vi' ? 'Lưu' : 'Save'}</>}
                              </button>
                              <button type="button" onClick={cancelEdit}
                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200">
                                <X className="w-3.5 h-3.5" />{lang === 'vi' ? 'Hủy' : 'Cancel'}
                              </button>
                            </div>
                          </div>
                        </li>
                      );
                    }

                    return (
                      <li key={s.id} className={`flex items-center gap-3 px-4 py-3 ${c.bg} border-l-4 ${c.border} group`}>
                        <div className={`flex-shrink-0 text-center min-w-[80px] rounded-lg px-2 py-1 ${c.badge}`}>
                          <p className={`text-xs font-semibold ${c.badgeText}`}>{formatTime(s.start_time)}</p>
                          <p className={`text-xs ${c.badgeText} opacity-70`}>{formatTime(s.end_time)}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold text-sm ${c.text}`}>
                            {s.subject_or_slot_name || (lang === 'vi' ? 'Tiết học' : 'Period')}
                          </p>
                          {s.room_number && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" /> {s.room_number}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button type="button" onClick={() => startEdit(s)}
                            className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-400 hover:text-blue-600"
                            title={lang === 'vi' ? 'Chỉnh sửa' : 'Edit'}>
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button type="button" onClick={() => handleDelete(s.id)} disabled={deleting === s.id}
                            className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 hover:text-red-600"
                            title={lang === 'vi' ? 'Xóa' : 'Delete'}>
                            {deleting === s.id ? '…' : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
