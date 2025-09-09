import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAirtable } from '../../hooks/useAirtable';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import SchoolHeader from '../../components/common/SchoolHeader';

type SchoolClass = {
  id: string;
  name: string;
  grade?: string;
  teacherName?: string;
  schedule?: string;
  studentsCount?: number;
};

const TABLE = 'TutoSchoolClasses';

const ClassItem = ({ item }: { item: SchoolClass }) => {
  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.meta}>{item.grade || '—'}</Text>
      </View>
      {!!item.teacherName && (
        <View style={styles.row}>
          <MaterialIcons name="person" size={16} color="#888888" />
          <Text style={styles.meta} numberOfLines={1}>{item.teacherName}</Text>
        </View>
      )}
      {!!item.schedule && (
        <View style={styles.row}>
          <MaterialIcons name="schedule" size={16} color="#888888" />
          <Text style={styles.meta} numberOfLines={1}>{item.schedule}</Text>
        </View>
      )}
      <View style={styles.row}>
        <MaterialIcons name="people" size={16} color="#888888" />
        <Text style={styles.meta}>{item.studentsCount ?? 0}</Text>
      </View>
    </View>
  );
};

const ClassesScreen: React.FC = () => {
  const { t } = useLanguage();
  const { currentSchool } = useSchool();
  const { fetchRecords, loading } = useAirtable();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SchoolClass[]>([]);

  const load = useCallback(async () => {
    if (!currentSchool) return;
    const records = await fetchRecords(TABLE, {
      filterByFormula: `{School ID} = '${currentSchool.id}'`,
      sort: [{ field: 'name', direction: 'asc' }],
      pageSize: 50,
    });
    const mapped = (records || []).map((r) => {
      const f = r.fields || {};
      const teacherName = Array.isArray(f.teacherName) ? f.teacherName[0] : (f.teacherName || f['Teacher Name'] || '');
      return {
        id: r.id,
        name: f.name || f['Class Name'] || '—',
        grade: f.grade || f.Grade,
        teacherName,
        schedule: f.schedule || f.Schedule,
        studentsCount: typeof f.studentsCount === 'number' ? f.studentsCount : (Array.isArray(f.students) ? f.students.length : undefined),
      } as SchoolClass;
    });
    setItems(mapped);
  }, [currentSchool, fetchRecords]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => [it.name, it.grade, it.teacherName, it.schedule].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [items, query]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFC' }}>
      <SchoolHeader />
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color="#888888" />
        <TextInput
          placeholder={t('school.classes.searchPlaceholder')}
          placeholderTextColor="#888888"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#0B5FFF" />
          <Text style={styles.loadingText}>{t('school.common.loading')}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ClassItem item={item} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <MaterialIcons name="class" size={48} color="#D0D4DA" />
              <Text style={styles.emptyTitle}>{t('school.classes.noClasses')}</Text>
              <Text style={styles.emptySubtitle}>{t('school.classes.noClassesSubtitle')}</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default ClassesScreen;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  title: { fontSize: 16, fontWeight: '600', color: '#333333' },
  meta: { fontSize: 12, color: '#888888', marginLeft: 6 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  searchInput: { flex: 1, paddingHorizontal: 8, paddingVertical: 6, fontSize: 16 },
  loadingText: { fontSize: 12, color: '#888888', marginTop: 8 },
  emptyWrap: { alignItems: 'center', marginTop: 48, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 16, color: '#333333', marginTop: 12 },
  emptySubtitle: { fontSize: 12, color: '#888888', marginTop: 4, textAlign: 'center' },
});


