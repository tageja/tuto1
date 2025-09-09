import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import SchoolHeader from '../../components/common/SchoolHeader';
import { useAirtable } from '../../hooks/useAirtable';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';

type HealthRecordItem = {
  id: string;
  studentName?: string;
  recordType?: string;
  date?: string;
  description?: string;
};

const TABLE = 'TutoHealthRecords';

const HealthCard = ({ item }: { item: HealthRecordItem }) => (
  <View style={styles.card}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={styles.title} numberOfLines={1}>{item.studentName || '—'}</Text>
      {item.recordType && (
        <View style={{ backgroundColor: '#E8F2FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
          <Text style={{ color: '#0B5FFF', fontWeight: '600', fontSize: 12 }}>{item.recordType}</Text>
        </View>
      )}
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
      <MaterialIcons name="event" size={16} color="#888888" />
      <Text style={styles.meta}> {item.date ? new Date(item.date).toLocaleDateString() : '—'}</Text>
    </View>
    {!!item.description && <Text style={[styles.meta, { marginTop: 6 }]} numberOfLines={2}>{item.description}</Text>}
  </View>
);

const HealthScreen: React.FC = () => {
  const { t } = useLanguage();
  const { currentSchool } = useSchool();
  const { fetchRecords, loading } = useAirtable();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<HealthRecordItem[]>([]);

  const load = useCallback(async () => {
    if (!currentSchool) return;
    const recs = await fetchRecords(TABLE, {
      filterByFormula: `{School Name} = '${currentSchool.name}'`,
      sort: [{ field: 'Date', direction: 'desc' }],
      pageSize: 50,
    });
    const mapped = (recs || []).map((r: any) => {
      const f = r.fields || {};
      return {
        id: r.id,
        studentName: f['Student Name'] || f.studentName,
        recordType: f['Record Type'] || f.recordType,
        date: f['Date'] || f.date,
        description: f['Description'] || f.description,
      } as HealthRecordItem;
    });
    setItems(mapped);
  }, [currentSchool, fetchRecords]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => [i.studentName, i.recordType, i.description].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [items, query]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFC' }}>
      <SchoolHeader />
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color="#888888" />
        <TextInput
          placeholder={t('school.health.searchPlaceholder')}
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
          contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 16 }}
          data={filtered}
          keyExtractor={(it) => it.id}
          renderItem={({ item }) => <HealthCard item={item} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <MaterialIcons name="medical-services" size={48} color="#D0D4DA" />
              <Text style={styles.emptyTitle}>{t('school.health.noRecords')}</Text>
              <Text style={styles.emptySubtitle}>{t('school.health.noRecordsSubtitle')}</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default HealthScreen;

const styles = StyleSheet.create({
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#EEF2F7' },
  title: { fontSize: 16, fontWeight: '600', color: '#333333' },
  meta: { fontSize: 12, color: '#888888' },
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, marginBottom: 8, backgroundColor: '#FFFFFF', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: '#EEF2F7' },
  searchInput: { flex: 1, paddingHorizontal: 8, paddingVertical: 6, fontSize: 16 },
  loadingText: { fontSize: 12, color: '#888888', marginTop: 8 },
  emptyWrap: { alignItems: 'center', marginTop: 48, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 16, color: '#333333', marginTop: 12 },
  emptySubtitle: { fontSize: 12, color: '#888888', marginTop: 4, textAlign: 'center' },
});


