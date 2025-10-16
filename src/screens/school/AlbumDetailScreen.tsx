import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import SchoolHeader from '../../components/common/SchoolHeader';

const AlbumDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const album = route.params?.album?.fields || route.params?.album || {};

  const photos: any[] = Array.isArray(album['Photos']) ? album['Photos'] : album.photos || [];

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFC' }}>
      <SchoolHeader />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{album['Album Title'] || album.title || 'Album'}</Text>
        <View style={styles.iconBtn} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {!!album['Event Type'] && <DetailRow icon="category" label={album['Event Type']} />}        
        {!!album['Date'] && <DetailRow icon="event" label={new Date(album['Date']).toLocaleDateString()} />}
        {!!album['Description'] && (
          <View style={styles.card}><Text style={styles.paragraph}>{album['Description']}</Text></View>
        )}
        <View style={styles.grid}>
          {photos.map((p: any, idx: number) => (
            <Image key={idx} source={{ uri: p.url || p }} style={styles.photo} />
          ))}
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 8 },
  photo: { width: '48%', aspectRatio: 1, borderRadius: 12, backgroundColor: '#EEE' },
});

export default AlbumDetailScreen;













