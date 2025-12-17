import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import SchoolHeader from '../../components/common/SchoolHeader';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

const ActivityDetailScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { t } = useLanguage();
  const activity = route.params?.activity?.fields || route.params?.activity || {};

  const styles = StyleSheet.create({
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.background.primary, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 18, fontWeight: '700', color: colors.text.primary },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: colors.surface, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border.light },
    rowText: { marginLeft: 8, color: colors.text.primary },
    card: { backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border.light },
    cardTitle: { fontSize: 14, fontWeight: '600', color: colors.text.primary, marginBottom: 6 },
    paragraph: { color: colors.text.secondary, lineHeight: 20 },
  });

  const DetailRow = ({ icon, label }: { icon: any; label: string }) => (
    <View style={styles.row}>
      <MaterialIcons name={icon} size={20} color={colors.text.secondary} />
      <Text style={styles.rowText}>{label}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
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


export default ActivityDetailScreen;




