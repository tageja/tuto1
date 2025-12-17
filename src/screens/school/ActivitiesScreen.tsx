import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import SchoolHeader from '../../components/common/SchoolHeader';
import { useAirtable } from '../../hooks/useAirtable';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

type ActivityItem = {
  id: string;
  name?: string;
  activityType?: string;
  schedule?: string;
  location?: string;
  status?: string;
};

const TABLE = 'TutoExtracurricularActivities';

const ActivityCard = ({ item }: { item: ActivityItem }) => (
  <View style={styles.card}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={styles.title} numberOfLines={1}>{item.name || '—'}</Text>
      {item.status && (
        <View style={{ backgroundColor: '#E8F2FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 }}>
          <Text style={{ color: '#0B5FFF', fontWeight: '600', fontSize: 12 }}>{item.status}</Text>
        </View>
      )}
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
      <MaterialIcons name="category" size={16} color="#888888" />
      <Text style={styles.meta}> {item.activityType || '—'}</Text>
    </View>
    {!!item.schedule && (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
        <MaterialIcons name="schedule" size={16} color="#888888" />
        <Text style={styles.meta}> {item.schedule}</Text>
      </View>
    )}
    {!!item.location && (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
        <MaterialIcons name="place" size={16} color="#888888" />
        <Text style={styles.meta} numberOfLines={1}> {item.location}</Text>
      </View>
    )}
  </View>
);

const ActivitiesScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    card: { backgroundColor: colors.background.secondary, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border.light },
    title: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
    meta: { fontSize: 12, color: colors.text.secondary },
    searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, marginBottom: 8, backgroundColor: colors.background.secondary, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.border.light },
    searchInput: { flex: 1, paddingHorizontal: 8, paddingVertical: 6, fontSize: 16 },
    loadingText: { fontSize: 12, color: colors.text.secondary, marginTop: 8 },
    emptyWrap: { alignItems: 'center', marginTop: 48, paddingHorizontal: 24 },
    emptyTitle: { fontSize: 16, color: colors.text.primary, marginTop: 12 },
    emptySubtitle: { fontSize: 12, color: colors.text.secondary, marginTop: 4, textAlign: 'center' },
  });
  const { t } = useLanguage();
  const { currentSchool } = useSchool();
  const { fetchRecords, loading } = useAirtable();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<ActivityItem[]>([]);

  const load = useCallback(async () => {
    if (!currentSchool) return;
    const recs = await fetchRecords(TABLE, {
      filterByFormula: `{School Name} = '${currentSchool.name}'`,
      sort: [{ field: 'Name', direction: 'asc' }],
      pageSize: 50,
    });
    const mapped = (recs || []).map((r: any) => {
      const f = r.fields || {};
      return {
        id: r.id,
        name: f['Name'] || f.name,
        activityType: f['Activity Type'] || f.activityType,
        schedule: f['Schedule'] || f.schedule,
        location: f['Location'] || f.location,
        status: f['Status'] || f.status,
      } as ActivityItem;
    });
    setItems(mapped);
  }, [currentSchool, fetchRecords]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => [i.name, i.activityType, i.location, i.status].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [items, query]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.secondary }}>
      <SchoolHeader />
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color="#888888" />
        <TextInput
          placeholder={t('school.activities.searchPlaceholder')}
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
          renderItem={({ item }) => <ActivityCard item={item} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <MaterialIcons name="emoji-events" size={48} color="#D0D4DA" />
              <Text style={styles.emptyTitle}>{t('school.activities.noActivities')}</Text>
              <Text style={styles.emptySubtitle}>{t('school.activities.noActivitiesSubtitle')}</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default ActivitiesScreen;



