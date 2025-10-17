import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import SchoolHeader from '../../components/common/SchoolHeader';

const AnnouncementDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const announcement = route.params?.announcement?.fields || route.params?.announcement || {};

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFC' }}>
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

const DetailRow = ({ icon, label }: { icon: any; label: string }) => (
  <View style={styles.row}>
    <MaterialIcons name={icon} size={20} color="#888888" />
    <Text style={styles.rowText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#333333', flex: 1, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#EEF2F7' },
  rowText: { marginLeft: 8, color: '#333333' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#EEF2F7' },
  paragraph: { color: '#666666', lineHeight: 20 },
});

export default AnnouncementDetailScreen;




