import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAirtable } from '../../hooks/useAirtable';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import SchoolHeader from '../../components/common/SchoolHeader';

type SchoolHomework = {
  id: string;
  title: string;
  subject?: string;
  className?: string;
  dueDate?: string;
  status?: string;
};

const TABLE = 'TutoSchoolHomework';

const HomeworkItem = ({ item }: { item: SchoolHomework }) => {
  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        {!!item.dueDate && (
          <View style={styles.duePill}>
            <MaterialIcons name="event" size={14} color="#0B5FFF" />
            <Text style={styles.dueText}>{new Date(item.dueDate).toLocaleDateString()}</Text>
          </View>
        )}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
        {!!item.subject && (
          <View style={styles.metaRow}>
            <MaterialIcons name="menu-book" size={16} color="#888888" />
            <Text style={styles.meta}>{item.subject}</Text>
          </View>
        )}
        {!!item.className && (
          <View style={[styles.metaRow, { marginLeft: 12 }]}>
            <MaterialIcons name="class" size={16} color="#888888" />
            <Text style={styles.meta}>{item.className}</Text>
          </View>
        )}
        {!!item.status && (
          <View style={[styles.statusPill, { marginLeft: 'auto' }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const HomeworkScreen: React.FC = () => {
  const { t } = useLanguage();
  const { currentSchool } = useSchool();
  const { fetchRecords, loading } = useAirtable();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SchoolHomework[]>([]);

  const load = useCallback(async () => {
    if (!currentSchool) return;
    const records = await fetchRecords(TABLE, {
      filterByFormula: `{School Name} = '${currentSchool.name}'`,
      sort: [{ field: 'Due Date', direction: 'asc' }],
      pageSize: 50,
    });
    const mapped = (records || []).map((r) => {
      const f = r.fields || {};
      return {
        id: r.id,
        title: f['Title'] || f['Homework Title'] || f.title || '—',
        subject: f['Subject'] || f.subject,
        className: f['Class Name'] || f.className,
        dueDate: f['Due Date'] || f.dueDate,
        status: f['Status'] || f.status,
      } as SchoolHomework;
    });
    setItems(mapped);
  }, [currentSchool, fetchRecords]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => [it.title, it.subject, it.className, it.status].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [items, query]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFC' }}>
      <SchoolHeader />
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color="#888888" />
        <TextInput
          placeholder={t('school.homework.searchPlaceholder')}
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
          contentContainerStyle={{ paddingVertical: 8 }}
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <HomeworkItem item={item} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <MaterialIcons name="assignment" size={48} color="#D0D4DA" />
              <Text style={styles.emptyTitle}>{t('school.homework.noHomework')}</Text>
              <Text style={styles.emptySubtitle}>{t('school.homework.noHomeworkSubtitle')}</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default HomeworkScreen;

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
  title: { fontSize: 16, fontWeight: '600', color: '#333333', flex: 1, marginRight: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  meta: { fontSize: 12, color: '#888888', marginLeft: 6 },
  statusPill: { backgroundColor: '#F0F4FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: '600', color: '#0B5FFF' },
  duePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F2FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  dueText: { color: '#0B5FFF', fontSize: 12, marginLeft: 4, fontWeight: '600' },
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


