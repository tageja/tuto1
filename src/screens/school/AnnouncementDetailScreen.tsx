import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import SchoolHeader from '../../components/common/SchoolHeader';
import { useTheme } from '../../contexts/ThemeContext';

const AnnouncementDetailScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const announcement = route.params?.announcement?.fields || route.params?.announcement || {};

  const styles = StyleSheet.create({
    topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.background.primary, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 18, fontWeight: '700', color: colors.text.primary, flex: 1, textAlign: 'center' },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: colors.surface, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.border.light },
    rowText: { marginLeft: 8, color: colors.text.primary },
    card: { backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border.light },
    paragraph: { color: colors.text.secondary, lineHeight: 20 },
  });

  const DetailRow = ({ icon, label }: { icon: any; label: string }) => (
    <View style={styles.row}>
      <MaterialIcons name={icon} size={20} color={colors.text.secondary} />
      <Text style={styles.rowText}>{label}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.secondary }}>
      <SchoolHeader />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{announcement['Announcement Title'] || announcement.title || 'Announcement'}</Text>
        <View style={styles.iconBtn} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {!!announcement['Category'] && <DetailRow icon="category" label={announcement['Category']} />}
        {!!announcement['Author'] && <DetailRow icon="person" label={announcement['Author']} />}
        {!!announcement['Publish Date'] && <DetailRow icon="event" label={`Published ${new Date(announcement['Publish Date']).toLocaleDateString()}`} />}
        {!!announcement['Expiry Date'] && <DetailRow icon="schedule" label={`Expires ${new Date(announcement['Expiry Date']).toLocaleDateString()}`} />}
        <View style={styles.card}>
          <Text style={styles.paragraph}>{announcement['Content'] || ''}</Text>
        </View>
      </ScrollView>
    </View>
  );
};


export default AnnouncementDetailScreen;




