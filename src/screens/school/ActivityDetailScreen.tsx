import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import SchoolHeader from '../../components/common/SchoolHeader';
import { useLanguage } from '../../contexts/LanguageContext';

const ActivityDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const activity = route.params?.activity?.fields || route.params?.activity || {};

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFC' }}>
      <SchoolHeader />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.title}>{activity['Activity Title'] || activity.title || t('school.dailyActivities.title')}</Text>
        <View style={styles.iconBtn} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <DetailRow icon="event" label={new Date(activity['Date'] || activity.date || Date.now()).toLocaleDateString()} />
        {(activity['Start Time'] || activity['End Time']) && (
          <DetailRow icon="schedule" label={`${activity['Start Time'] || ''} ${activity['End Time'] ? `- ${activity['End Time']}` : ''}`} />
        )}
        {!!activity['Location'] && <DetailRow icon="place" label={activity['Location']} />}
        {!!activity['Activity Type'] && <DetailRow icon="category" label={activity['Activity Type']} />}
        {!!activity['Status'] && <DetailRow icon="info" label={activity['Status']} />}
        {!!activity['Description'] && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('common.info')}</Text>
            <Text style={styles.paragraph}>{activity['Description']}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const DetailRow = ({ icon, label }: { icon: any; label: string }) => (
  <View style={styles.row}>
    <MaterialIcons name={icon} size={20} color="#888888" />
    <Text style={styles.rowText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#333333' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#EEF2F7' },
  rowText: { marginLeft: 8, color: '#333333' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#EEF2F7' },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#333333', marginBottom: 6 },
  paragraph: { color: '#666666', lineHeight: 20 },
});

export default ActivityDetailScreen;




