import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { CalendarList } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';
import { useAirtable } from '../../hooks/useAirtable';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import SchoolHeader from '../../components/common/SchoolHeader';

type AttendanceRecord = {
  id: string;
  studentName: string;
  status: 'present' | 'absent' | 'late';
  date: string; // YYYY-MM-DD
  notes?: string;
};

const TABLE = 'TutoSchoolAttendance';

const StatusPill = ({ status }: { status: AttendanceRecord['status'] }) => {
  const styleMap: Record<AttendanceRecord['status'], { bg: string; fg: string; icon: any }> = {
    present: { bg: '#E8F2FF', fg: '#0B5FFF', icon: 'check-circle' },
    absent: { bg: '#FEECEC', fg: '#D14343', icon: 'cancel' },
    late: { bg: '#FFF6E5', fg: '#D97706', icon: 'access-time' },
  };
  const m = styleMap[status];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: m.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
      <MaterialIcons name={m.icon as any} size={16} color={m.fg} />
      <Text style={{ color: m.fg, marginLeft: 6, fontSize: 12, fontWeight: '600' }}>{status}</Text>
    </View>
  );
};

const AttendanceItem = ({ item }: { item: AttendanceRecord }) => {
  return (
    <View style={styles.cardRow}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.title} numberOfLines={1}>{item.studentName}</Text>
        {!!item.notes && <Text style={styles.meta} numberOfLines={1}>{item.notes}</Text>}
      </View>
      <StatusPill status={item.status} />
    </View>
  );
};

const AttendanceScreen: React.FC = () => {
  const { t } = useLanguage();
  const { currentSchool } = useSchool();
  const { fetchRecords, loading } = useAirtable();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<AttendanceRecord[]>([]);

  const load = useCallback(async () => {
    if (!currentSchool) return;
    const records = await fetchRecords(TABLE, {
      filterByFormula: `AND({School ID} = '${currentSchool.id}', {date} = '${selectedDate}')`,
      pageSize: 200,
    });
    const mapped = (records || []).map((r) => {
      const f = r.fields || {};
      const studentName = f.studentName || f['Student Name'] || f.fullName || '—';
      return {
        id: r.id,
        studentName,
        status: (f.status || 'present') as AttendanceRecord['status'],
        date: f.date || selectedDate,
        notes: f.notes,
      } as AttendanceRecord;
    });
    setItems(mapped);
  }, [currentSchool, fetchRecords, selectedDate]);

  useEffect(() => {
    load();
  }, [load]);

  const marked = useMemo(() => ({
    [selectedDate]: { selected: true, selectedColor: '#0B5FFF' },
  }), [selectedDate]);

  const onDayPress = (day: { dateString: string }) => {
    setSelectedDate(day.dateString);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFC' }}>
      <SchoolHeader />
      <CalendarList
        onDayPress={onDayPress}
        pastScrollRange={1}
        futureScrollRange={2}
        horizontal
        pagingEnabled
        markedDates={marked}
        theme={{
          todayTextColor: '#0B5FFF',
          selectedDayBackgroundColor: '#0B5FFF',
          textDayFontFamily: 'Inter-Regular',
          textMonthFontFamily: 'Inter-SemiBold',
          textDayHeaderFontFamily: 'Inter-Medium',
        }}
      />
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#0B5FFF" />
          <Text style={styles.loadingText}>{t('school.common.loading')}</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 16 }}
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <AttendanceItem item={item} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <MaterialIcons name="event-busy" size={48} color="#D0D4DA" />
              <Text style={styles.emptyTitle}>{t('school.attendance.noRecords')}</Text>
              <Text style={styles.emptySubtitle}>{t('school.attendance.noRecordsSubtitle')}</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  title: { fontSize: 16, fontWeight: '600', color: '#333333' },
  meta: { fontSize: 12, color: '#888888', marginTop: 4 },
  loadingText: { fontSize: 12, color: '#888888', marginTop: 8 },
  emptyWrap: { alignItems: 'center', marginTop: 48, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 16, color: '#333333', marginTop: 12 },
  emptySubtitle: { fontSize: 12, color: '#888888', marginTop: 4, textAlign: 'center' },
});


