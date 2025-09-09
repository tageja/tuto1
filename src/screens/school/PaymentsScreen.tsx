import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import SchoolHeader from '../../components/common/SchoolHeader';
import { useAirtable } from '../../hooks/useAirtable';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';

type SchoolPaymentItem = {
  id: string;
  paymentType?: string;
  amount?: number;
  status?: string;
  dueDate?: string;
  paymentDate?: string;
};

const TABLE = 'TutoSchoolPayments';

const StatusPill = ({ text, color }: { text: string; color: string }) => (
  <View style={{ backgroundColor: `${color}1A`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
    <Text style={{ color, fontWeight: '600', fontSize: 12 }}>{text}</Text>
  </View>
);

const PaymentCard = ({ item }: { item: SchoolPaymentItem }) => {
  const color = item.status === 'Paid' ? '#16A34A' : item.status === 'Overdue' ? '#DC2626' : '#0B5FFF';
  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.title} numberOfLines={1}>{item.paymentType || '—'}</Text>
        {item.status && <StatusPill text={item.status} color={color} />}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
        <MaterialIcons name="payments" size={16} color="#888888" />
        <Text style={styles.meta}> {typeof item.amount === 'number' ? item.amount.toLocaleString() : '--'}</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
        <MaterialIcons name="event" size={16} color="#888888" />
        <Text style={styles.meta}> {item.dueDate ? `Due ${new Date(item.dueDate).toLocaleDateString()}` : '—'}</Text>
        {item.paymentDate && (
          <Text style={[styles.meta, { marginLeft: 8 }]}>• {`Paid ${new Date(item.paymentDate).toLocaleDateString()}`}</Text>
        )}
      </View>
    </View>
  );
};

const PaymentsScreen: React.FC = () => {
  const { t } = useLanguage();
  const { currentSchool } = useSchool();
  const { fetchRecords, loading } = useAirtable();
  const [query, setQuery] = useState('');
  const [items, setItems] = useState<SchoolPaymentItem[]>([]);

  const load = useCallback(async () => {
    if (!currentSchool) return;
    const recs = await fetchRecords(TABLE, {
      filterByFormula: `{School Name} = '${currentSchool.name}'`,
      sort: [{ field: 'Due Date', direction: 'asc' }],
      pageSize: 50,
    });
    const mapped = (recs || []).map((r: any) => {
      const f = r.fields || {};
      return {
        id: r.id,
        paymentType: f['Payment Type'] || f['Type'] || f.paymentType,
        amount: typeof f['Amount'] === 'number' ? f['Amount'] : undefined,
        status: f['Status'] || f.status,
        dueDate: f['Due Date'] || f.dueDate,
        paymentDate: f['Payment Date'] || f.paymentDate,
      } as SchoolPaymentItem;
    });
    setItems(mapped);
  }, [currentSchool, fetchRecords]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => [i.paymentType, i.status].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [items, query]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFC' }}>
      <SchoolHeader />
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color="#888888" />
        <TextInput
          placeholder={t('school.payments.searchPlaceholder')}
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
          renderItem={({ item }) => <PaymentCard item={item} />}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <MaterialIcons name="credit-card" size={48} color="#D0D4DA" />
              <Text style={styles.emptyTitle}>{t('school.payments.noPayments')}</Text>
              <Text style={styles.emptySubtitle}>{t('school.payments.noPaymentsSubtitle')}</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

export default PaymentsScreen;

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


