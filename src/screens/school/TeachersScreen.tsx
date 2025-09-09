import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAirtable } from '../../hooks/useAirtable';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import SchoolHeader from '../../components/common/SchoolHeader';

type SchoolTeacher = {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  subjects?: string[];
  rating?: number;
};

const TABLE = 'TutoSchoolTeachers';

const TeacherItem = ({ teacher }: { teacher: SchoolTeacher }) => {
  return (
    <View style={styles.card}>
      <Image
        source={teacher.avatarUrl ? { uri: teacher.avatarUrl } : require('../../../assets/images/default-teacher.png.png')}
        style={styles.avatar}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>{teacher.fullName || '—'}</Text>
        {!!teacher.subjects?.length && (
          <Text style={styles.subtitle} numberOfLines={1}>{teacher.subjects.join(', ')}</Text>
        )}
        {typeof teacher.rating === 'number' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <MaterialIcons name="star" size={16} color="#F5A524" />
            <Text style={styles.meta}>{teacher.rating?.toFixed(1)}</Text>
          </View>
        )}
      </View>
      <MaterialIcons name="chevron-right" size={24} color="#888888" />
    </View>
  );
};

const TeachersScreen: React.FC = () => {
  const { t } = useLanguage();
  const { currentSchool } = useSchool();
  const { fetchRecords, loading } = useAirtable();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SchoolTeacher[]>([]);

  const load = useCallback(async () => {
    if (!currentSchool) return;
    const records = await fetchRecords(TABLE, {
      filterByFormula: `{School ID} = '${currentSchool.id}'`,
      sort: [{ field: 'fullName', direction: 'asc' }],
      pageSize: 50,
    });
    const mapped = (records || []).map((r) => {
      const f = r.fields || {};
      return {
        id: r.id,
        fullName: f.fullName || f['Full Name'] || f.name || '',
        email: f.email || f.Email,
        phone: f.phone || f.Phone,
        avatarUrl: (Array.isArray(f.avatar) && f.avatar[0]?.url) || f.avatarUrl || f.Avatar || undefined,
        subjects: f.subjects || f.Subjects || [],
        rating: typeof f.rating === 'number' ? f.rating : typeof f.Rating === 'number' ? f.Rating : undefined,
      } as SchoolTeacher;
    });
    setItems(mapped);
  }, [currentSchool, fetchRecords]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      [it.fullName, it.email, ...(it.subjects || [])]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q)),
    );
  }, [items, query]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFC' }}>
      <SchoolHeader />
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color="#888888" />
        <TextInput
          placeholder={t('school.teachers.searchPlaceholder')}
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
          renderItem={({ item }) => <TeacherItem teacher={item} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <MaterialIcons name="group" size={48} color="#D0D4DA" />
              <Text style={styles.emptyTitle}>{t('school.teachers.noTeachers')}</Text>
              <Text style={styles.emptySubtitle}>{t('school.teachers.noTeachersSubtitle')}</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default TeachersScreen;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    backgroundColor: '#F0F2F5',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  subtitle: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },
  meta: {
    fontSize: 12,
    color: '#888888',
    marginLeft: 6,
  },
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
  searchInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 16,
  },
  loadingText: { fontSize: 12, color: '#888888', marginTop: 8 },
  emptyWrap: { alignItems: 'center', marginTop: 48, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 16, color: '#333333', marginTop: 12 },
  emptySubtitle: { fontSize: 12, color: '#888888', marginTop: 4, textAlign: 'center' },
});


