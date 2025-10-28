import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import SchoolHeader from '../../components/common/SchoolHeader';

const MessageDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const message = route.params?.message?.fields || route.params?.message || {};

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFC' }}>
      <SchoolHeader />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{message['Message Subject'] || message.subject || 'Message'}</Text>
        <View style={styles.iconBtn} />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.row}><MaterialIcons name="person" size={20} color="#888888" /><Text style={styles.rowText}> From: {message['From User'] || message.fromUser || '—'}</Text></View>
        <View style={styles.row}><MaterialIcons name="person" size={20} color="#888888" /><Text style={styles.rowText}> To: {message['To User'] || message.toUser || '—'}</Text></View>
        {!!message['Sent Date'] && <View style={styles.row}><MaterialIcons name="event" size={20} color="#888888" /><Text style={styles.rowText}> {new Date(message['Sent Date']).toLocaleString()}</Text></View>}
        <View style={styles.card}>
          <Text style={styles.paragraph}>{message['Message Content'] || message.content || ''}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  iconBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: '#333333', flex: 1, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#FFFFFF', borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: '#EEF2F7' },
  rowText: { marginLeft: 8, color: '#333333' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#EEF2F7' },
  paragraph: { color: '#666666', lineHeight: 20 },
});

export default MessageDetailScreen;





















